import asyncio
from abc import ABC, abstractmethod

import httpx
from google.genai import Client, types

from config import GEMINI_API_KEY, GROQ_API_KEY, DEFAULT_PROVIDER
from decorator import timer
from opendota import TIMEOUT


class LLMClient(ABC):
    @abstractmethod
    async def complete(self, prompt: str) -> str:
        pass


class GeminiClient(LLMClient):
    def __init__(self, api_key: str = GEMINI_API_KEY, model: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model = model

    @timer("call_gemini")
    async def complete(self, prompt: str) -> str:
        async with Client(api_key=self.api_key).aio as aclient:
            response = await aclient.models.generate_content(
                model=self.model,
                contents=types.Part.from_text(text=prompt),
                config=types.GenerateContentConfig(
                    max_output_tokens=500,
                    temperature=0.3,
                ),
            )
            print(response.text)
            return response.text


class GroqClient(LLMClient):
    BASE_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self, api_key: str = GROQ_API_KEY, model: str = "openai/gpt-oss-120b"):
        self.api_key = api_key
        self.model = model

    @timer("call_groq")
    async def complete(self, prompt: str) -> str:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                self.BASE_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 3000,
                    "temperature": 0.3,
                },
            )
            result = response.json()["choices"][0]["message"]
            content = result.get("content") or result.get("reasoning", "")
            print(content)
            return content


# ── Provider registry ────────────────────────────────────────────────────────
# To add a new LLM: define a class above, then add it here.


class LLMQuotaExceeded(Exception):
    pass


def _check_quota_error(e: Exception):
    msg = str(e).lower()
    if any(k in msg for k in ("quota", "429", "resource_exhausted", "rate limit")):
        raise LLMQuotaExceeded(str(e)) from e


async def _groq(prompt: str, model: str | None = None) -> str:
    try:
        return await GroqClient(**({"model": model} if model else {})).complete(prompt)
    except Exception as e:
        _check_quota_error(e)
        raise


async def _gemini(prompt: str, model: str | None = None) -> str:
    try:
        return await GeminiClient(**({"model": model} if model else {})).complete(
            prompt
        )
    except Exception as e:
        _check_quota_error(e)
        raise


_PROVIDERS: dict[str, callable] = {
    "groq": _groq,
    "gemini": _gemini,
}



async def call_llm(
    prompt: str, provider: str = DEFAULT_PROVIDER, model: str | None = None
) -> str:
    fn = _PROVIDERS.get(provider.lower())
    if fn is None:
        raise ValueError(
            f"Unknown provider '{provider}'. Choose from: {list(_PROVIDERS)}"
        )
    return await fn(prompt, model=model)


if __name__ == "__main__":
    asyncio.run(call_llm("What is the latest patch of dota 2 you know?"))
