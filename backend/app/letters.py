"""Refund message templates (English and Russian)."""

ISSUES = {
    "wrong_item": {"en": "I received the wrong item", "ru": "Я получил(а) не тот товар"},
    "damaged": {"en": "The item arrived damaged or defective", "ru": "Товар пришёл повреждённым или с дефектом"},
    "not_delivered": {"en": "My order was not delivered", "ru": "Мой заказ не был доставлен"},
    "not_as_described": {"en": "The item does not match the description", "ru": "Товар не соответствует описанию"},
    "change_of_mind": {"en": "I want to return an item I no longer need", "ru": "Я хочу вернуть ненужный товар"},
    "subscription_charge": {"en": "I was charged for a subscription I did not want", "ru": "С меня списали плату за ненужную подписку"},
    "cancelled_booking": {"en": "My flight or booking was cancelled", "ru": "Мой рейс или бронирование было отменено"},
}

DEFECT_ISSUES = {"wrong_item", "damaged", "not_as_described"}
PROTECTION_ISSUES = {"not_delivered", "cancelled_booking", "subscription_charge"}


def build_letter(lang: str, merchant: str, issue: str, order_id: str, amount: int,
                 purchase_date: str, details: str, deadline: str) -> str:
    amount_txt = f"{amount:,}".replace(",", " ") + " KZT"
    order = order_id or ("[order number]" if lang == "en" else "[номер заказа]")
    if lang == "ru":
        extra = f"\n\nПодробности: {details}" if details else ""
        return (
            f"Тема: Требование о возврате денежных средств — заказ {order}\n\n"
            f"Здравствуйте, служба поддержки {merchant}!\n\n"
            f"{purchase_date} я оформил(а) заказ {order} на сумму {amount_txt}. "
            f"{ISSUES[issue]['ru']}.{extra}\n\n"
            f"В соответствии с вашими правилами возврата и законодательством Республики Казахстан "
            f"о защите прав потребителей прошу вернуть {amount_txt} на исходный способ оплаты. "
            f"Срок подачи требования по вашим правилам — до {deadline}, поэтому моё обращение подано вовремя.\n\n"
            f"Прошу ответить в течение 3 рабочих дней. Фотографии и чек прилагаю.\n\n"
            f"С уважением,\n[Ваше имя]"
        )
    extra = f"\n\nDetails: {details}" if details else ""
    return (
        f"Subject: Refund request — order {order}\n\n"
        f"Dear {merchant} Support Team,\n\n"
        f"On {purchase_date} I placed order {order} for {amount_txt}. "
        f"{ISSUES[issue]['en']}.{extra}\n\n"
        f"Under your return policy and the consumer protection law of the Republic of Kazakhstan, "
        f"I request a refund of {amount_txt} to my original payment method. "
        f"Your policy allows this request until {deadline}, so it is submitted on time.\n\n"
        f"Please reply within 3 business days. Photos and the receipt are attached.\n\n"
        f"Kind regards,\n[Your name]"
    )
