from fastapi import APIRouter
from pydantic import BaseModel
from app.services.translation import TranslationService

router = APIRouter()
translator = TranslationService()

class TranslateRequest(BaseModel):
    text: str
    target_lang: str

@router.post("")
def translate_text(request: TranslateRequest):
    result = translator.translate(request.text, request.target_lang)
    return {"translated_text": result}
