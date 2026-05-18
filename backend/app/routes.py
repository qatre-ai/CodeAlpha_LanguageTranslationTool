"""
============================================================
API Route Handlers
============================================================
Contains the /api/translate and /api/languages endpoints.
Separates business logic from the app configuration for
clean architecture and easy testing.
============================================================
"""

from fastapi import APIRouter, HTTPException

from deep_translator import GoogleTranslator

from app.models import (
    TranslationRequest,
    TranslationResponse,
    LanguagesResponse,
    ErrorResponse,
)

# Create a dedicated router for API endpoints
router = APIRouter(prefix="/api", tags=["Translation"])


@router.get(
    "/languages",
    response_model=LanguagesResponse,
    summary="Get supported languages",
    description="Returns a dictionary of all languages supported by GoogleTranslator.",
    responses={500: {"model": ErrorResponse}},
)
async def get_languages() -> LanguagesResponse:
    """
    Fetch the dictionary of supported languages from deep-translator.

    Returns:
        LanguagesResponse: A mapping of language codes (e.g., 'en')
        to their display names (e.g., 'english').

    Raises:
        HTTPException: 500 if the language list cannot be fetched.
    """
    try:
        # GoogleTranslator.get_supported_languages() returns a dict
        # like {'english': 'en', 'spanish': 'es', ...}
        # We want the inverse: code -> name for easy lookup in the frontend
        # Must instantiate GoogleTranslator first, then call get_supported_languages
        raw_languages = GoogleTranslator().get_supported_languages(as_dict=True)

        # Reformat: { "en": "English", "es": "Spanish", ... }
        languages = {
            code: name.capitalize()
            for name, code in raw_languages.items()
        }

        return LanguagesResponse(languages=languages)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch supported languages: {str(exc)}",
        )


@router.post(
    "/translate",
    response_model=TranslationResponse,
    summary="Translate text",
    description="Translates the given text from source_lang to target_lang using Google Translate.",
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def translate_text(request: TranslationRequest) -> TranslationResponse:
    """
    Translate text from the source language to the target language.

    Args:
        request: A TranslationRequest with text, source_lang, and target_lang.

    Returns:
        TranslationResponse: Contains the translated text and metadata.

    Raises:
        HTTPException: 400 if source and target languages are the same.
        HTTPException: 500 if the translation engine fails.
    """
    # Guard: don't translate to the same language
    if request.source_lang == request.target_lang:
        raise HTTPException(
            status_code=400,
            detail="Source and target languages must be different.",
        )

    try:
        # Initialize the GoogleTranslator with source and target codes
        translator = GoogleTranslator(
            source=request.source_lang,
            target=request.target_lang,
        )

        # Perform the translation
        translated_text = translator.translate(text=request.text)

        # Handle edge case where translator might return None
        if translated_text is None:
            raise HTTPException(
                status_code=500,
                detail="Translation returned no result. Please try again.",
            )

        return TranslationResponse(
            translated_text=translated_text,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
            original_text=request.text,
        )

    except HTTPException:
        # Re-raise our own HTTPExceptions
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(exc)}",
        )