"""Backend translations (English, Russian, Kazakh)."""

LANGS = ("en", "ru", "kk")


def pick_lang(header: str | None) -> str:
    """Reads an Accept-Language value such as 'kk', 'ru-RU,ru;q=0.9' or 'kz'."""
    if not header:
        return "en"
    code = header.split(",")[0].strip().lower()[:2]
    if code == "kz":
        code = "kk"
    return code if code in LANGS else "en"


def tr(value, lang: str):
    """Returns the translation from a {'en','ru','kk'} dict (or the value itself)."""
    if isinstance(value, dict) and "en" in value:
        return value.get(lang) or value["en"]
    if isinstance(value, list):
        return [tr(v, lang) for v in value]
    return value


def money(n: int | float) -> str:
    return f"{round(n):,}".replace(",", " ") + " ₸"


CATEGORIES = {
    "Marketplace": {"en": "Marketplace", "ru": "Маркетплейс", "kk": "Маркетплейс"},
    "International store": {"en": "International store", "ru": "Международный магазин", "kk": "Халықаралық дүкен"},
    "Electronics": {"en": "Electronics", "ru": "Электроника", "kk": "Электроника"},
    "Fashion": {"en": "Fashion", "ru": "Одежда и обувь", "kk": "Киім мен аяқ киім"},
    "Airline": {"en": "Airline", "ru": "Авиакомпания", "kk": "Әуекомпания"},
    "Hotel": {"en": "Hotel", "ru": "Отель", "kk": "Қонақүй"},
    "Subscription": {"en": "Subscription", "ru": "Подписка", "kk": "Жазылым"},
}

RULE_BASIS = {
    "defect": {"en": "defect / wrong item rule", "ru": "правило о браке / неверном товаре", "kk": "ақау / қате тауар ережесі"},
    "protection": {"en": "buyer protection / cancellation rule", "ru": "правило защиты покупателя / отмены", "kk": "сатып алушыны қорғау / бас тарту ережесі"},
    "standard": {"en": "standard return rule", "ru": "стандартное правило возврата", "kk": "стандартты қайтару ережесі"},
}

MESSAGES = {
    "self_service": {
        "en": "You are inside the deadline. Send the message below yourself — most cases like this are solved without a specialist.",
        "ru": "Вы укладываетесь в срок. Отправьте сообщение ниже сами — большинство таких случаев решаются без специалиста.",
        "kk": "Сіз мерзімге үлгеріп тұрсыз. Төмендегі хатты өзіңіз жіберіңіз — мұндай жағдайлардың көбі маманның көмегінсіз шешіледі.",
    },
    "self_service_then_specialist": {
        "en": "You are inside the deadline, but this company often delays or refuses. Send the message first; escalate if there is no answer in 3 business days.",
        "ru": "Вы укладываетесь в срок, но эта компания часто затягивает или отказывает. Сначала отправьте сообщение; если ответа нет 3 рабочих дня — передайте дело специалисту.",
        "kk": "Сіз мерзімге үлгеріп тұрсыз, бірақ бұл компания жиі созбалайды немесе бас тартады. Алдымен хатты жіберіңіз; 3 жұмыс күні ішінде жауап болмаса, істі маманға беріңіз.",
    },
    "specialist": {
        "en": "The standard deadline has passed. A specialist may still recover the money using consumer law or a card chargeback.",
        "ru": "Стандартный срок истёк. Специалист всё ещё может вернуть деньги на основании закона о защите прав потребителей или через chargeback по карте.",
        "kk": "Стандартты мерзім өтіп кетті. Маман тұтынушылар құқықтарын қорғау заңы немесе карта бойынша chargeback арқылы ақшаны әлі де қайтара алады.",
    },
}

ERRORS = {
    "future_date": {"en": "Purchase date cannot be in the future", "ru": "Дата покупки не может быть в будущем", "kk": "Сатып алу күні болашақта болмауы керек"},
    "merchant": {"en": "Merchant not found", "ru": "Магазин не найден", "kk": "Дүкен табылмады"},
    "case": {"en": "Case not found", "ru": "Дело не найдено", "kk": "Іс табылмады"},
    "closed": {"en": "Case is already closed", "ru": "Дело уже закрыто", "kk": "Іс жабылып қойған"},
    "min_order": {
        "en": "Specialist Service is available for orders above 20 000 ₸. Please use the free self-service tools.",
        "ru": "Услуга специалиста доступна для заказов от 20 000 ₸. Пожалуйста, воспользуйтесь бесплатными инструментами.",
        "kk": "Маман қызметі 20 000 ₸-ден асатын тапсырыстарға қолжетімді. Тегін құралдарды пайдаланыңыз.",
    },
    "authorise": {
        "en": "You must authorise RefundHelp to contact the company on your behalf.",
        "ru": "Необходимо разрешить RefundHelp связываться с компанией от вашего имени.",
        "kk": "RefundHelp-ке компаниямен сіздің атыңыздан байланысуға рұқсат беру қажет.",
    },
}

STEPS = {
    "submitted": (
        {"en": "Case submitted", "ru": "Дело создано", "kk": "Іс жіберілді"},
        {"en": "We received your case and documents.", "ru": "Мы получили ваше дело и документы.", "kk": "Сіздің ісіңіз бен құжаттарыңыз қабылданды."},
    ),
    "authorised": (
        {"en": "Authorisation signed", "ru": "Доверенность подписана", "kk": "Өкілеттікке қол қойылды"},
        {"en": "You allowed RefundHelp to contact the company on your behalf.", "ru": "Вы разрешили RefundHelp связаться с компанией от вашего имени.", "kk": "Сіз RefundHelp-ке компаниямен сіздің атыңыздан байланысуға рұқсат бердіңіз."},
    ),
    "contacted": (
        {"en": "Company contacted", "ru": "Связались с компанией", "kk": "Компаниямен байланыс орнатылды"},
        {"en": "A Refund Specialist sent a formal request citing the exact rule.", "ru": "Специалист отправил официальный запрос со ссылкой на конкретное правило.", "kk": "Маман нақты ережеге сілтеме жасап, ресми сұрау жіберді."},
    ),
    "negotiating": (
        {"en": "Negotiating", "ru": "Переговоры", "kk": "Келіссөздер"},
        {"en": "The specialist is following up and escalating where needed.", "ru": "Специалист контролирует ответ и при необходимости эскалирует спор.", "kk": "Маман жауапты қадағалап, қажет болса дауды жоғары деңгейге көтереді."},
    ),
}

RESULT = {
    "full_title": {"en": "Refund received", "ru": "Деньги возвращены", "kk": "Ақша қайтарылды"},
    "partial_title": {"en": "Partial refund received", "ru": "Получен частичный возврат", "kk": "Ақшаның бір бөлігі қайтарылды"},
    "refunded": {
        "en": "{amount} returned to your original payment method. {fee}",
        "ru": "{amount} возвращено на исходный способ оплаты. {fee}",
        "kk": "{amount} бастапқы төлем тәсіліне қайтарылды. {fee}",
    },
    "fee_plus": {"en": "Covered by RefundHelp Plus — no fee.", "ru": "Покрыто RefundHelp Plus — без комиссии.", "kk": "RefundHelp Plus арқылы өтелді — комиссия жоқ."},
    "fee": {"en": "Success fee {pct}%: {fee}.", "ru": "Комиссия за успех {pct}%: {fee}.", "kk": "Нәтиже үшін комиссия {pct}%: {fee}."},
    "closed_title": {"en": "Closed without refund", "ru": "Закрыто без возврата", "kk": "Қайтарусыз жабылды"},
    "closed_text": {
        "en": "The company refused after all escalation steps. No Refund, No Fee — you pay nothing.",
        "ru": "Компания отказала после всех этапов эскалации. Нет возврата — нет оплаты: вы ничего не платите.",
        "kk": "Компания барлық кезеңнен кейін бас тартты. Қайтару болмаса — төлем жоқ: сіз ештеңе төлемейсіз.",
    },
}

PLANS = [
    {
        "id": "free",
        "name": {"en": "Free Self-Service", "ru": "Бесплатный самосервис", "kk": "Тегін өз бетінше қызмет"},
        "price": {"en": "Free", "ru": "Бесплатно", "kk": "Тегін"},
        "highlight": False,
        "features": [
            {"en": "Search the return-policy database", "ru": "Поиск по базе правил возврата", "kk": "Қайтару ережелері базасынан іздеу"},
            {"en": "Check your return deadline", "ru": "Проверка срока возврата", "kk": "Қайтару мерзімін тексеру"},
            {"en": "Generate a personalised refund message (EN / RU / KZ)", "ru": "Персональное письмо о возврате (EN / RU / KZ)", "kk": "Жеке қайтару хаты (EN / RU / KZ)"},
        ],
    },
    {
        "id": "specialist",
        "name": {"en": "Specialist Service", "ru": "Услуга специалиста", "kk": "Маман қызметі"},
        "price": {"en": "15%–20% of the recovered amount", "ru": "15–20% от возвращённой суммы", "kk": "Қайтарылған соманың 15–20%-ы"},
        "note": {
            "en": "Charged only after a successful refund. Orders above 20 000 ₸.",
            "ru": "Взимается только после успешного возврата. Для заказов от 20 000 ₸.",
            "kk": "Тек сәтті қайтарудан кейін алынады. 20 000 ₸-ден асатын тапсырыстар үшін.",
        },
        "highlight": True,
        "features": [
            {"en": "A Refund Specialist contacts the company for you", "ru": "Специалист по возвратам связывается с компанией за вас", "kk": "Қайтару жөніндегі маман компаниямен сіздің атыңыздан байланысады"},
            {"en": "Escalation with platform rules, consumer law or chargeback", "ru": "Эскалация по правилам платформы, закону о защите прав потребителей или через chargeback", "kk": "Платформа ережелері, тұтынушылар құқығы заңы немесе chargeback арқылы дауды күшейту"},
            {"en": "Live case tracking", "ru": "Отслеживание дела в реальном времени", "kk": "Істі нақты уақытта бақылау"},
            {"en": "No Refund, No Fee", "ru": "Нет возврата — нет оплаты", "kk": "Қайтару болмаса — төлем жоқ"},
        ],
    },
    {
        "id": "plus",
        "name": {"en": "RefundHelp Plus", "ru": "RefundHelp Plus", "kk": "RefundHelp Plus"},
        "price": {"en": "2 990 ₸ / month or 24 990 ₸ / year", "ru": "2 990 ₸ в месяц или 24 990 ₸ в год", "kk": "Айына 2 990 ₸ немесе жылына 24 990 ₸"},
        "highlight": False,
        "features": [
            {"en": "Up to 2 specialist cases per month with no success fee", "ru": "До 2 дел со специалистом в месяц без комиссии", "kk": "Айына 2 іске дейін маман көмегі комиссиясыз"},
            {"en": "Priority handling", "ru": "Приоритетная обработка", "kk": "Басым тәртіпте қарау"},
            {"en": "Return-deadline reminders", "ru": "Напоминания о сроках возврата", "kk": "Қайтару мерзімі туралы еске салғыштар"},
        ],
    },
]
