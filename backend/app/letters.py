"""Refund message templates (English, Russian, Kazakh)."""

ISSUES = {
    "wrong_item": {"en": "I received the wrong item", "ru": "Я получил(а) не тот товар", "kk": "Маған басқа тауар келді"},
    "damaged": {"en": "The item arrived damaged or defective", "ru": "Товар пришёл повреждённым или с дефектом", "kk": "Тауар бүлінген немесе ақаулы болып келді"},
    "not_delivered": {"en": "My order was not delivered", "ru": "Мой заказ не был доставлен", "kk": "Тапсырысым жеткізілмеді"},
    "not_as_described": {"en": "The item does not match the description", "ru": "Товар не соответствует описанию", "kk": "Тауар сипаттамаға сәйкес келмейді"},
    "change_of_mind": {"en": "I want to return an item I no longer need", "ru": "Я хочу вернуть ненужный товар", "kk": "Қажет емес тауарды қайтарғым келеді"},
    "subscription_charge": {"en": "I was charged for a subscription I did not want", "ru": "С меня списали плату за ненужную подписку", "kk": "Қажет емес жазылым үшін ақша алынды"},
    "cancelled_booking": {"en": "My flight or booking was cancelled", "ru": "Мой рейс или бронирование было отменено", "kk": "Рейсім немесе брондауым тоқтатылды"},
}

DEFECT_ISSUES = {"wrong_item", "damaged", "not_as_described"}
PROTECTION_ISSUES = {"not_delivered", "cancelled_booking", "subscription_charge"}

TEMPLATES = {
    "en": (
        "Subject: Refund request — order {order}\n\n"
        "Dear {merchant} Support Team,\n\n"
        "On {date} I placed order {order} for {amount}. {issue}.{extra}\n\n"
        "Under your return policy and the consumer protection law of the Republic of Kazakhstan, "
        "I request a refund of {amount} to my original payment method. "
        "Your policy allows this request until {deadline}, so it is submitted on time.\n\n"
        "Please reply within 3 business days. Photos and the receipt are attached.\n\n"
        "Kind regards,\n[Your name]"
    ),
    "ru": (
        "Тема: Требование о возврате денежных средств — заказ {order}\n\n"
        "Здравствуйте, служба поддержки {merchant}!\n\n"
        "{date} я оформил(а) заказ {order} на сумму {amount}. {issue}.{extra}\n\n"
        "В соответствии с вашими правилами возврата и законодательством Республики Казахстан "
        "о защите прав потребителей прошу вернуть {amount} на исходный способ оплаты. "
        "Срок подачи требования по вашим правилам — до {deadline}, поэтому моё обращение подано вовремя.\n\n"
        "Прошу ответить в течение 3 рабочих дней. Фотографии и чек прилагаю.\n\n"
        "С уважением,\n[Ваше имя]"
    ),
    "kk": (
        "Тақырыбы: Ақшаны қайтару туралы талап — {order} тапсырысы\n\n"
        "Құрметті {merchant} қолдау қызметі!\n\n"
        "{date} күні {amount} сомасына {order} тапсырысын рәсімдедім. {issue}.{extra}\n\n"
        "Сіздердің қайтару ережелеріңізге және Қазақстан Республикасының тұтынушылардың "
        "құқықтарын қорғау туралы заңнамасына сәйкес {amount} соманы бастапқы төлем тәсіліне қайтаруды сұраймын. "
        "Ережелеріңіз бойынша талап беру мерзімі — {deadline} дейін, сондықтан өтінішім уақытында берілді.\n\n"
        "3 жұмыс күні ішінде жауап беруіңізді сұраймын. Фотосуреттер мен чек қоса беріледі.\n\n"
        "Құрметпен,\n[Атыңыз]"
    ),
}
ORDER_PLACEHOLDER = {"en": "[order number]", "ru": "[номер заказа]", "kk": "[тапсырыс нөмірі]"}
DETAILS = {"en": "Details: {d}", "ru": "Подробности: {d}", "kk": "Толығырақ: {d}"}


def build_letter(lang: str, merchant: str, issue: str, order_id: str, amount: int,
                 purchase_date: str, details: str, deadline: str) -> str:
    amount_txt = f"{amount:,}".replace(",", " ") + " ₸"
    extra = "\n\n" + DETAILS[lang].format(d=details) if details else ""
    return TEMPLATES[lang].format(
        order=order_id or ORDER_PLACEHOLDER[lang], merchant=merchant, date=purchase_date,
        amount=amount_txt, issue=ISSUES[issue][lang], extra=extra, deadline=deadline,
    )
