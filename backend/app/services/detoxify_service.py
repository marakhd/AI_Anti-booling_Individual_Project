from dataclasses import dataclass
from detoxify import Detoxify
from app.core.config import get_settings

settings = get_settings()

# Модель загружается один раз при старте — это важно,
# т.к. загрузка занимает несколько секунд
_model: Detoxify | None = None


def get_model() -> Detoxify:
    global _model
    if _model is None:
        print("⏳ Загружаю модель Detoxify (multilingual)...")
        _model = Detoxify("multilingual")
        print("✅ Модель Detoxify загружена")
    return _model


@dataclass
class AnalysisResult:
    toxicity_score: float
    severe_toxicity: float
    obscene: float
    threat: float
    insult: float
    identity_attack: float
    toxicity_level: str   # safe / warning / toxic
    action: str           # passed / warned / deleted


def analyze_text(text: str) -> AnalysisResult:
    """
    Анализирует текст через Detoxify и возвращает результат с решением.
    Работает синхронно — вызывать через run_in_executor в async-коде.
    """
    model = get_model()
    results = model.predict(text)

    toxicity = float(results["toxicity"])
    severe_toxicity = float(results["severe_toxicity"])
    obscene = float(results["obscene"])
    threat = float(results["threat"])
    insult = float(results["insult"])
    identity_attack = float(results["identity_attack"])

    # Определяем уровень и действие
    if toxicity >= settings.toxicity_threshold:
        level = "toxic"
        action = "deleted"
    elif toxicity >= settings.warning_threshold:
        level = "warning"
        action = "warned"
    else:
        level = "safe"
        action = "passed"

    return AnalysisResult(
        toxicity_score=toxicity,
        severe_toxicity=severe_toxicity,
        obscene=obscene,
        threat=threat,
        insult=insult,
        identity_attack=identity_attack,
        toxicity_level=level,
        action=action,
    )
