from groq import Groq
from app.config import settings

client = Groq(api_key=settings.groq_api_key)
MODEL = "openai/gpt-oss-20b"


def generate_answer(prompt: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.choices[0].message.content
    if not text:
        return "I don't have that information in the available documents."
    return text.strip()