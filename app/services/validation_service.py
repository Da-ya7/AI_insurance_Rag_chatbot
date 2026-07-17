FALLBACK_MSG = "I don't have that information in the available documents."


def validate_response(answer: str, chunks: list[dict]) -> str:
    """Basic guardrail: if no context was retrieved, force fallback regardless of LLM output."""
    if not chunks:
        return FALLBACK_MSG
    if not answer or not answer.strip():
        return FALLBACK_MSG
    return answer
