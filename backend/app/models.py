"""
============================================================
Pydantic Models for Request/Response Validation
============================================================
Defines the data schemas used across the API endpoints.
Uses Pydantic v2 for strict validation and auto-docs.
============================================================
"""

from pydantic import BaseModel, Field


class TranslationRequest(BaseModel):
    """
    Schema for incoming translation requests.
    Validates that text is provided and language codes are strings.
    """

    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="The text to be translated",
    )
    source_lang: str = Field(
        ...,
        min_length=2,
        description="ISO language code for the source language (e.g., 'en')",
    )
    target_lang: str = Field(
        ...,
        min_length=2,
        description="ISO language code for the target language (e.g., 'es')",
    )


class TranslationResponse(BaseModel):
    """
    Schema for successful translation responses.
    Returns the translated text along with metadata.
    """

    translated_text: str = Field(
        ...,
        description="The translated output text",
    )
    source_lang: str = Field(
        ...,
        description="The source language code used for translation",
    )
    target_lang: str = Field(
        ...,
        description="The target language code used for translation",
    )
    original_text: str = Field(
        ...,
        description="The original input text for reference",
    )


class ErrorResponse(BaseModel):
    """
    Schema for error responses returned by the API.
    Provides a human-readable error message and a detail field.
    """

    error: str = Field(
        ...,
        description="A short error identifier (e.g., 'translation_failed')",
    )
    detail: str = Field(
        ...,
        description="A human-readable description of what went wrong",
    )


class LanguagesResponse(BaseModel):
    """
    Schema for the /api/languages endpoint response.
    Returns a dictionary mapping language codes to display names.
    """

    languages: dict[str, str] = Field(
        ...,
        description="Dictionary mapping language codes to language names",
    )