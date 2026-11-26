"""Business rules taken from the RefundHelp business model report (see Appendix).

Every number the app uses lives here, so the demo stays consistent with the report.
"""

CURRENCY = "KZT"

# Pricing (report sections 2.1 and 5.2)
FEE_STANDARD = 0.15          # clear policy violation
FEE_COMPLEX = 0.20           # several negotiation rounds or a card chargeback
FEE_AVERAGE = 0.18           # used in the financial forecast
MIN_SPECIALIST_ORDER = 20_000
PLUS_MONTHLY = 2_990
PLUS_YEARLY = 24_990
PLUS_FREE_CASES_PER_MONTH = 2

# Financial model defaults (report section 8)
AVG_REFUND = 40_000
VARIABLE_COST_PER_CASE = 2_500
FIXED_COSTS_MONTHLY = 3_600_000
PLUS_SUBSCRIBERS = 200
INITIAL_INVESTMENT = 20_000_000
CASH_RESERVE = 5_000_000

# Operational targets (report sections 1.3 and 6.4)
SELF_SERVICE_SHARE = 0.70
SPECIALIST_SUCCESS_RATE = 0.80
MAX_MINUTES_PER_CASE = 35
MAX_CAC = 2_400

# Plan names and features (translated) live in i18n.PLANS.


def success_fee_rate(complexity: str) -> float:
    return FEE_COMPLEX if complexity == "complex" else FEE_STANDARD


def projection(cases: int, avg_refund: float, fee_rate: float, subscribers: int,
               plus_price: float, variable_cost: float, fixed_costs: float) -> dict:
    fee_per_case = avg_refund * fee_rate
    fee_revenue = cases * fee_per_case
    sub_revenue = subscribers * plus_price
    total_revenue = fee_revenue + sub_revenue
    variable = cases * variable_cost
    result = total_revenue - variable - fixed_costs
    contribution = fee_per_case - variable_cost
    break_even = None
    if contribution > 0:
        break_even = max(0.0, (fixed_costs - sub_revenue) / contribution)
    payback_months = INITIAL_INVESTMENT / result if result > 0 else None
    # Funnel needed for this many successful cases (report section 7.3)
    escalated = cases / SPECIALIST_SUCCESS_RATE
    active_users = escalated / (1 - SELF_SERVICE_SHARE)
    specialist_hours = cases * MAX_MINUTES_PER_CASE / 60
    return {
        "fee_per_case": round(fee_per_case),
        "fee_revenue": round(fee_revenue),
        "subscription_revenue": round(sub_revenue),
        "total_revenue": round(total_revenue),
        "variable_costs": round(variable),
        "fixed_costs": round(fixed_costs),
        "operating_result": round(result),
        "contribution_per_case": round(contribution),
        "break_even_cases": round(break_even) if break_even is not None else None,
        "break_even_per_day": round(break_even / 30, 1) if break_even is not None else None,
        "payback_months": round(payback_months, 1) if payback_months else None,
        "funnel": {
            "active_users": round(active_users),
            "escalated_cases": round(escalated),
            "successful_cases": cases,
        },
        "specialist_hours": round(specialist_hours),
        "specialist_fte": round(specialist_hours / 168, 1),
    }
