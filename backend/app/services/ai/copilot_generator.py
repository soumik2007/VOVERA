class CopilotGenerator:
    def __init__(self):
        # TODO: Load FLAN-T5 model
        pass

    def generate_alert(self, signals: list[str]) -> str:
        if not signals:
            return "This call appears normal. No unusual synthetic patterns detected."
        return "Warning: AI Copilot detected potential synthetic patterns. " + " ".join(signals)
