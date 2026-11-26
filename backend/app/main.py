import os
import random
import threading
from datetime import date, datetime, timedelta, timezone
from typing import Literal, Optional

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import business as biz
from . import i18n
from .i18n import money, pick_lang, tr
from .letters import DEFECT_ISSUES, ISSUES, PROTECTION_ISSUES, build_letter
from .merchants import BY_ID, MERCHANTS

app = FastAPI(title="RefundHelp Demo API", version="1.1.0",
              description="Demo backend for the RefundHelp business model showcase. "
                          "Send Accept-Language: en | ru | kk to choose the language.")


def _normalise_origin(o: str) -> str:
    """Accepts 'my-app.vercel.app', 'https://my-app.vercel.app/' etc. and returns a valid origin."""
    o = o.strip().rstrip("/")
    if o == "*" or not o:
        return o
    if not o.startswith(("http://", "https://")):
        o = ("http://" if o.startswith(("localhost", "127.0.0.1")) else "https://") + o
    return o


origins = [n for n in (_normalise_origin(o) for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")) if n]
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
STEP_ORDER = list(i18n.STEPS.keys())


def _err(status: int, key: str, lang: str):
    raise HTTPException(status, tr(i18n.ERRORS[key], lang))


def _client(client_id: Optional[str]) -> dict:
    if not client_id:
        raise HTTPException(400, "Missing X-Client-Id header")
    with _lock:
        return _clients.setdefault(client_id, {"plus": False})


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _merchant_out(m: dict, lang: str) -> dict:
    out = {k: tr(v, lang) for k, v in m.items()}
    out["category"] = m["category"]
    out["category_label"] = tr(i18n.CATEGORIES[m["category"]], lang)
    return out


def _window(m: dict, issue: str) -> tuple[int, str]:
    if issue in DEFECT_ISSUES:
        return m["defect_days"], "defect"
    if issue in PROTECTION_ISSUES:
        return m["protection_days"], "protection"
    return m["return_days"], "standard"


# ------------------------------------------------------------------ general
@app.get("/")
def root():
    return {"service": "RefundHelp Demo API", "docs": "/docs", "health": "/api/health"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/plans")
def plans(accept_language: Optional[str] = Header(None)):
    lang = pick_lang(accept_language)
    return {"currency": biz.CURRENCY, "min_specialist_order": biz.MIN_SPECIALIST_ORDER,
            "plans": [{k: tr(v, lang) for k, v in p.items()} for p in i18n.PLANS]}


@app.get("/api/issues")
def issues(accept_language: Optional[str] = Header(None)):
    lang = pick_lang(accept_language)
    return [{"id": k, "label": tr(v, lang)} for k, v in ISSUES.items()]


# ------------------------------------------------------------------ policy database
@app.get("/api/merchants")
def list_merchants(q: str = "", category: str = "", accept_language: Optional[str] = Header(None)):
    lang = pick_lang(accept_language)
    ql = q.lower().strip()
    out = []
    for m in MERCHANTS:
        if category and m["category"] != category:
            continue
        cat_names = [v.lower() for v in i18n.CATEGORIES[m["category"]].values()]
        if ql and ql not in m["name"].lower() and not any(ql in c for c in cat_names):
            continue
        out.append(_merchant_out(m, lang))
    cats = sorted({m["category"] for m in MERCHANTS})
    return {"categories": [{"id": c, "label": tr(i18n.CATEGORIES[c], lang)} for c in cats], "items": out}


@app.get("/api/merchants/{merchant_id}")
def get_merchant(merchant_id: str, accept_language: Optional[str] = Header(None)):
    lang = pick_lang(accept_language)
    m = BY_ID.get(merchant_id)
    if not m:
        _err(404, "merchant", lang)
    return _merchant_out(m, lang)


# ------------------------------------------------------------------ self-service check
class CheckIn(BaseModel):
    merchant_id: str
    issue_type: IssueType
    purchase_date: date
    amount: int = Field(gt=0, le=50_000_000)
    order_id: str = ""
    details: str = Field("", max_length=1000)


@app.post("/api/check")
def check(body: CheckIn, x_client_id: Optional[str] = Header(None),
          accept_language: Optional[str] = Header(None)):
    lang = pick_lang(accept_language)
    m = BY_ID.get(body.merchant_id)
    if not m:
        _err(404, "merchant", lang)
    if body.purchase_date > date.today():
        _err(422, "future_date", lang)

    window, basis = _window(m, body.issue_type)
    deadline = body.purchase_date + timedelta(days=window)
    days_left = (deadline - date.today()).days
    within = days_left >= 0

    complexity = "complex" if (m["difficulty"] == "hard" or not within) else "standard"
    fee_rate = biz.success_fee_rate(complexity)
    plus = _client(x_client_id)["plus"] if x_client_id else False

    if within and m["difficulty"] != "hard":
        recommendation = "self_service"
    elif within:
        recommendation = "self_service_then_specialist"
    else:
        recommendation = "specialist"

    args = dict(merchant=m["name"], issue=body.issue_type, order_id=body.order_id,
                amount=body.amount, purchase_date=body.purchase_date.strftime("%d.%m.%Y"),
                details=body.details.strip(), deadline=deadline.strftime("%d.%m.%Y"))
    return {
        "merchant": {"id": m["id"], "name": m["name"], "contact": tr(m["contact"], lang),
                     "refund_time": tr(m["refund_time"], lang), "tips": tr(m["tips"], lang)},
        "within_deadline": within,
        "rule_basis": tr(i18n.RULE_BASIS[basis], lang),
        "window_days": window,
        "deadline": deadline.isoformat(),
        "days_left": days_left,
        "recommendation": recommendation,
        "message": tr(i18n.MESSAGES[recommendation], lang),
        "letters": {code: build_letter(code, **args) for code in i18n.LANGS},
        "specialist": {
            "available": body.amount >= biz.MIN_SPECIALIST_ORDER,
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
    return {"plus": c["plus"], "plus_cases_used": _plus_cases_this_month(x_client_id),
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


def _render_event(e: dict, case: dict, lang: str) -> dict:
    s = e["status"]
    if s in i18n.STEPS:
        title, text = i18n.STEPS[s]
        return {"status": s, "title": tr(title, lang), "text": tr(text, lang), "at": e["at"]}
    if s == "resolved":
        partial = case["outcome"] == "partial_refund"
        fee = (tr(i18n.RESULT["fee_plus"], lang) if case["fee_waived"] else
               tr(i18n.RESULT["fee"], lang).format(pct=round(case["fee_rate"] * 100), fee=money(case["fee_charged"])))
        return {"status": s, "at": e["at"],
                "title": tr(i18n.RESULT["partial_title" if partial else "full_title"], lang),
                "text": tr(i18n.RESULT["refunded"], lang).format(amount=money(case["refunded_amount"]), fee=fee)}
    return {"status": s, "at": e["at"], "title": tr(i18n.RESULT["closed_title"], lang),
            "text": tr(i18n.RESULT["closed_text"], lang)}


def _public(case: dict, lang: str) -> dict:
    out = {k: v for k, v in case.items() if k not in ("client_id", "timeline")}
    out["issue_label"] = tr(ISSUES[case["issue_type"]], lang)
    out["timeline"] = [_render_event(e, case, lang) for e in case["timeline"]]
    return out


@app.post("/api/cases", status_code=201)
def create_case(body: CaseIn, x_client_id: Optional[str] = Header(None),
                accept_language: Optional[str] = Header(None)):
    global _next_id
    lang = pick_lang(accept_language)
    client = _client(x_client_id)
    m = BY_ID.get(body.merchant_id)
    if not m:
        _err(404, "merchant", lang)
    if body.amount < biz.MIN_SPECIALIST_ORDER:
        _err(422, "min_order", lang)
    if not body.authorised:
        _err(422, "authorise", lang)

    window, _ = _window(m, body.issue_type)
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
            "issue_type": body.issue_type,
            "purchase_date": body.purchase_date.isoformat(), "order_id": body.order_id,
            "amount": body.amount, "details": body.details, "customer_name": body.customer_name,
            "complexity": complexity, "fee_rate": 0 if waived else fee_rate, "fee_waived": waived,
            "status": "submitted", "outcome": None, "refunded_amount": 0, "fee_charged": 0,
            "timeline": [{"status": "submitted", "at": now}],
        }
        _cases[cid] = case
    return _public(case, lang)


@app.get("/api/cases")
def list_cases(x_client_id: Optional[str] = Header(None), accept_language: Optional[str] = Header(None)):
    lang = pick_lang(accept_language)
    _client(x_client_id)
    items = [_public(c, lang) for c in _cases.values() if c["client_id"] == x_client_id]
    return sorted(items, key=lambda c: c["created_at"], reverse=True)


def _own_case(case_id: str, client_id: Optional[str], lang: str) -> dict:
    c = _cases.get(case_id)
    if not c or c["client_id"] != client_id:
        _err(404, "case", lang)
    return c


@app.get("/api/cases/{case_id}")
def get_case(case_id: str, x_client_id: Optional[str] = Header(None),
             accept_language: Optional[str] = Header(None)):
    lang = pick_lang(accept_language)
    return _public(_own_case(case_id, x_client_id, lang), lang)


@app.post("/api/cases/{case_id}/advance")
def advance_case(case_id: str, x_client_id: Optional[str] = Header(None),
                 accept_language: Optional[str] = Header(None)):
    """Demo only: simulates the specialist moving the case to the next step."""
    lang = pick_lang(accept_language)
    c = _own_case(case_id, x_client_id, lang)
    if c["outcome"]:
        _err(409, "closed", lang)
    with _lock:
        idx = STEP_ORDER.index(c["status"])
        if idx < len(STEP_ORDER) - 1:
            c["status"] = STEP_ORDER[idx + 1]
        elif random.random() < biz.SPECIALIST_SUCCESS_RATE:
            # Outcome reflects the report's 80% target success rate.
            partial = random.random() < 0.2
            refunded = round(c["amount"] * (0.6 if partial else 1.0))
            c.update(status="resolved", outcome="partial_refund" if partial else "full_refund",
                     refunded_amount=refunded, fee_charged=round(refunded * c["fee_rate"]))
        else:
            c.update(status="closed", outcome="no_refund")
        c["timeline"].append({"status": c["status"], "at": _now()})
    return _public(c, lang)


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
