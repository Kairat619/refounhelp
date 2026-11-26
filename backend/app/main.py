import os
import random
import threading
from datetime import date, datetime, timedelta, timezone
from typing import Literal, Optional

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import business as biz
from .letters import DEFECT_ISSUES, ISSUES, PROTECTION_ISSUES, build_letter
from .merchants import BY_ID, MERCHANTS

app = FastAPI(title="RefundHelp Demo API", version="1.0.0",
              description="Demo backend for the RefundHelp business model showcase.")

origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=os.getenv("ALLOWED_ORIGIN_REGEX") or None,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory demo storage: resets on every restart, which is fine for a showcase.
_lock = threading.Lock()
_cases: dict[str, dict] = {}
_clients: dict[str, dict] = {}
_next_id = 1001

IssueType = Literal[tuple(ISSUES.keys())]  # type: ignore[valid-type]

STEPS = [
    ("submitted", "Case submitted", "We received your case and documents."),
    ("authorised", "Authorisation signed", "You allowed RefundHelp to contact the company on your behalf."),
    ("contacted", "Company contacted", "A Refund Specialist sent a formal request citing the exact rule."),
    ("negotiating", "Negotiating", "The specialist is following up and escalating where needed."),
]


def _client(client_id: Optional[str]) -> dict:
    if not client_id:
        raise HTTPException(400, "Missing X-Client-Id header")
    with _lock:
        return _clients.setdefault(client_id, {"plus": False})


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ------------------------------------------------------------------ general
@app.get("/")
def root():
    return {"service": "RefundHelp Demo API", "docs": "/docs", "health": "/api/health"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/plans")
def plans():
    return {"currency": biz.CURRENCY, "plans": biz.PLANS,
            "min_specialist_order": biz.MIN_SPECIALIST_ORDER}


@app.get("/api/issues")
def issues():
    return [{"id": k, "label": v["en"]} for k, v in ISSUES.items()]


# ------------------------------------------------------------------ policy database
@app.get("/api/merchants")
def list_merchants(q: str = "", category: str = ""):
    ql = q.lower().strip()
    out = []
    for m in MERCHANTS:
        if category and m["category"] != category:
            continue
        if ql and ql not in m["name"].lower() and ql not in m["category"].lower():
            continue
        out.append(m)
    return {"categories": sorted({m["category"] for m in MERCHANTS}), "items": out}


@app.get("/api/merchants/{merchant_id}")
def get_merchant(merchant_id: str):
    m = BY_ID.get(merchant_id)
    if not m:
        raise HTTPException(404, "Merchant not found")
    return m


# ------------------------------------------------------------------ self-service check
class CheckIn(BaseModel):
    merchant_id: str
    issue_type: IssueType
    purchase_date: date
    amount: int = Field(gt=0, le=50_000_000)
    order_id: str = ""
    details: str = Field("", max_length=1000)


@app.post("/api/check")
def check(body: CheckIn, x_client_id: Optional[str] = Header(None)):
    m = BY_ID.get(body.merchant_id)
    if not m:
        raise HTTPException(404, "Merchant not found")
    if body.purchase_date > date.today():
        raise HTTPException(422, "Purchase date cannot be in the future")

    if body.issue_type in DEFECT_ISSUES:
        window, basis = m["defect_days"], "defect / wrong item rule"
    elif body.issue_type in PROTECTION_ISSUES:
        window, basis = m["protection_days"], "buyer protection / cancellation rule"
    else:
        window, basis = m["return_days"], "standard return rule"

    deadline = body.purchase_date + timedelta(days=window)
    days_left = (deadline - date.today()).days
    within = days_left >= 0

    complexity = "complex" if (m["difficulty"] == "hard" or not within) else "standard"
    fee_rate = biz.success_fee_rate(complexity)
    specialist_available = body.amount >= biz.MIN_SPECIALIST_ORDER
    plus = _client(x_client_id)["plus"] if x_client_id else False

    if within and m["difficulty"] != "hard":
        recommendation = "self_service"
        message = "You are inside the deadline. Send the message below yourself — most cases like this are solved without a specialist."
    elif within:
        recommendation = "self_service_then_specialist"
        message = "You are inside the deadline, but this company often delays or refuses. Send the message first; escalate if there is no answer in 3 business days."
    else:
        recommendation = "specialist"
        message = "The standard deadline has passed. A specialist may still recover the money using consumer law or a card chargeback."

    args = dict(merchant=m["name"], issue=body.issue_type, order_id=body.order_id,
                amount=body.amount, purchase_date=body.purchase_date.strftime("%d.%m.%Y"),
                details=body.details.strip(), deadline=deadline.strftime("%d.%m.%Y"))
    return {
        "merchant": {"id": m["id"], "name": m["name"], "contact": m["contact"],
                     "refund_time": m["refund_time"], "tips": m["tips"]},
        "within_deadline": within,
        "rule_basis": basis,
        "window_days": window,
        "deadline": deadline.isoformat(),
        "days_left": days_left,
        "recommendation": recommendation,
        "message": message,
        "letters": {"en": build_letter("en", **args), "ru": build_letter("ru", **args)},
        "specialist": {
            "available": specialist_available,
            "min_order": biz.MIN_SPECIALIST_ORDER,
            "complexity": complexity,
            "fee_rate": fee_rate,
            "estimated_fee": 0 if plus else round(body.amount * fee_rate),
            "covered_by_plus": plus,
        },
    }


# ------------------------------------------------------------------ RefundHelp Plus (demo)
class PlusIn(BaseModel):
    active: bool


@app.get("/api/me")
def me(x_client_id: Optional[str] = Header(None)):
    c = _client(x_client_id)
    used = _plus_cases_this_month(x_client_id)
    return {"plus": c["plus"], "plus_cases_used": used,
            "plus_cases_limit": biz.PLUS_FREE_CASES_PER_MONTH}


@app.post("/api/me/plus")
def set_plus(body: PlusIn, x_client_id: Optional[str] = Header(None)):
    c = _client(x_client_id)
    with _lock:
        c["plus"] = body.active
    return me(x_client_id)


def _plus_cases_this_month(client_id: str) -> int:
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    return sum(1 for c in _cases.values()
               if c["client_id"] == client_id and c["fee_waived"] and c["created_at"].startswith(month))


# ------------------------------------------------------------------ specialist cases
class CaseIn(BaseModel):
    merchant_id: str
    issue_type: IssueType
    purchase_date: date
    amount: int = Field(gt=0, le=50_000_000)
    order_id: str = ""
    details: str = Field("", max_length=1000)
    customer_name: str = Field(min_length=1, max_length=80)
    authorised: bool


def _public(case: dict) -> dict:
    return {k: v for k, v in case.items() if k != "client_id"}


@app.post("/api/cases", status_code=201)
def create_case(body: CaseIn, x_client_id: Optional[str] = Header(None)):
    global _next_id
    client = _client(x_client_id)
    m = BY_ID.get(body.merchant_id)
    if not m:
        raise HTTPException(404, "Merchant not found")
    if body.amount < biz.MIN_SPECIALIST_ORDER:
        raise HTTPException(422, f"Specialist Service is available for orders above "
                                 f"{biz.MIN_SPECIALIST_ORDER:,} KZT. Please use the free self-service tools.")
    if not body.authorised:
        raise HTTPException(422, "You must authorise RefundHelp to contact the company on your behalf.")

    window = m["defect_days"] if body.issue_type in DEFECT_ISSUES else (
        m["protection_days"] if body.issue_type in PROTECTION_ISSUES else m["return_days"])
    late = (body.purchase_date + timedelta(days=window)) < date.today()
    complexity = "complex" if (m["difficulty"] == "hard" or late) else "standard"
    fee_rate = biz.success_fee_rate(complexity)
    waived = client["plus"] and _plus_cases_this_month(x_client_id) < biz.PLUS_FREE_CASES_PER_MONTH

    with _lock:
        cid = f"RH-{_next_id}"
        _next_id += 1
        now = _now()
        case = {
            "id": cid, "client_id": x_client_id, "created_at": now,
            "merchant_id": m["id"], "merchant_name": m["name"], "merchant_logo": m["logo"],
            "issue_type": body.issue_type, "issue_label": ISSUES[body.issue_type]["en"],
            "purchase_date": body.purchase_date.isoformat(), "order_id": body.order_id,
            "amount": body.amount, "details": body.details, "customer_name": body.customer_name,
            "complexity": complexity, "fee_rate": 0 if waived else fee_rate, "fee_waived": waived,
            "status": "submitted", "outcome": None, "refunded_amount": 0, "fee_charged": 0,
            "timeline": [{"status": "submitted", "title": STEPS[0][1], "text": STEPS[0][2], "at": now}],
        }
        _cases[cid] = case
    return _public(case)


@app.get("/api/cases")
def list_cases(x_client_id: Optional[str] = Header(None)):
    _client(x_client_id)
    items = [_public(c) for c in _cases.values() if c["client_id"] == x_client_id]
    return sorted(items, key=lambda c: c["created_at"], reverse=True)


@app.get("/api/cases/{case_id}")
def get_case(case_id: str, x_client_id: Optional[str] = Header(None)):
    c = _cases.get(case_id)
    if not c or c["client_id"] != x_client_id:
        raise HTTPException(404, "Case not found")
    return _public(c)


@app.post("/api/cases/{case_id}/advance")
def advance_case(case_id: str, x_client_id: Optional[str] = Header(None)):
    """Demo only: simulates the specialist moving the case to the next step."""
    c = _cases.get(case_id)
    if not c or c["client_id"] != x_client_id:
        raise HTTPException(404, "Case not found")
    if c["outcome"]:
        raise HTTPException(409, "Case is already closed")
    order = [s[0] for s in STEPS]
    with _lock:
        idx = order.index(c["status"])
        if idx < len(STEPS) - 1:
            key, title, text = STEPS[idx + 1]
            c["status"] = key
            c["timeline"].append({"status": key, "title": title, "text": text, "at": _now()})
        else:
            # Outcome reflects the report's 80% target success rate.
            if random.random() < biz.SPECIALIST_SUCCESS_RATE:
                partial = random.random() < 0.2
                refunded = round(c["amount"] * (0.6 if partial else 1.0))
                fee = round(refunded * c["fee_rate"])
                c.update(status="resolved", outcome="partial_refund" if partial else "full_refund",
                         refunded_amount=refunded, fee_charged=fee)
                fee_txt = ("Covered by RefundHelp Plus — no fee." if c["fee_waived"]
                           else f"Success fee {round(c['fee_rate'] * 100)}%: {fee:,} KZT.")
                c["timeline"].append({"status": "resolved",
                                      "title": "Partial refund received" if partial else "Refund received",
                                      "text": f"{refunded:,} KZT returned to your original payment method. {fee_txt}",
                                      "at": _now()})
            else:
                c.update(status="closed", outcome="no_refund")
                c["timeline"].append({"status": "closed", "title": "Closed without refund",
                                      "text": "The company refused after all escalation steps. No Refund, No Fee — you pay nothing.",
                                      "at": _now()})
    return _public(c)


# ------------------------------------------------------------------ business model
@app.get("/api/finance/defaults")
def finance_defaults():
    return {
        "cases": 700, "avg_refund": biz.AVG_REFUND, "fee_rate": biz.FEE_AVERAGE,
        "subscribers": biz.PLUS_SUBSCRIBERS, "plus_price": biz.PLUS_MONTHLY,
        "variable_cost": biz.VARIABLE_COST_PER_CASE, "fixed_costs": biz.FIXED_COSTS_MONTHLY,
        "initial_investment": biz.INITIAL_INVESTMENT, "cash_reserve": biz.CASH_RESERVE,
        "targets": {"self_service_share": biz.SELF_SERVICE_SHARE,
                    "success_rate": biz.SPECIALIST_SUCCESS_RATE,
                    "max_minutes_per_case": biz.MAX_MINUTES_PER_CASE, "max_cac": biz.MAX_CAC},
    }


@app.get("/api/finance/projection")
def finance_projection(
    cases: int = Query(700, ge=0, le=100_000),
    avg_refund: float = Query(biz.AVG_REFUND, gt=0),
    fee_rate: float = Query(biz.FEE_AVERAGE, ge=0, le=1),
    subscribers: int = Query(biz.PLUS_SUBSCRIBERS, ge=0),
    plus_price: float = Query(biz.PLUS_MONTHLY, ge=0),
    variable_cost: float = Query(biz.VARIABLE_COST_PER_CASE, ge=0),
    fixed_costs: float = Query(biz.FIXED_COSTS_MONTHLY, ge=0),
):
    args = dict(avg_refund=avg_refund, fee_rate=fee_rate, subscribers=subscribers,
                plus_price=plus_price, variable_cost=variable_cost, fixed_costs=fixed_costs)
    current = biz.projection(cases, **args)
    curve = [{"cases": n, "result": biz.projection(n, **args)["operating_result"]}
             for n in range(0, max(1500, cases + 300) + 1, 50)]
    scenarios = [{"cases": n, **biz.projection(n, **args)} for n in (300, 500, 700)]
    return {"current": current, "curve": curve, "scenarios": scenarios}
