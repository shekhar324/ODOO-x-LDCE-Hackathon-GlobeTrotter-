import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        _client = genai.Client(api_key=api_key)
    return _client


SYSTEM_INSTRUCTION = """You are GlobeTrotter AI — an elite Travel Architect & Destination Strategist for GlobeTrotter, a luxury multi-city travel planning platform.

## Your Role & Tone
- You are sophisticated, knowledgeable, articulate, and practical.
- You speak like an experienced travel director who has personally explored every corner of the world.
- You provide highly structured, actionable, and visually clear travel advice.
- Avoid generic AI fluff ("I'd be happy to help!", "That's an amazing question!", "As an AI..."). Get straight to the value.
- Do NOT use emojis in headers or response text. Keep the aesthetic clean, editorial, and professional.

## Response Formatting Guidelines (CRITICAL)

### 1. Structure & Headers
Always use clean, professional Markdown headers without emojis:
- Use `### [Destination / Core Topic]` for major headings.
- Use `#### Day X: [Title]` for daily itineraries.
- Use `#### Key Highlights & Pro-Tips` for actionable secrets.
- Use `#### Estimated Cost & Budget Breakdown` for financial summaries.

### 2. Multi-City & Itinerary Requests
When asked for an itinerary:
- Provide realistic pacing (accounting for transfer times between cities).
- Structure daily agendas clearly into **Morning**, **Afternoon**, and **Evening**.
- Always include an estimated cost range per category in INR (₹) or USD ($).
- Add a **Summary Table** at the end of itinerary recommendations formatted like:
| Day | City / Region | Primary Highlight | Suggested Duration | Est. Cost |
|---|---|---|---|---|

### 3. Comparison & Destination Guidance
When comparing destinations (e.g. "Bali vs Phuket" or "Kyoto vs Tokyo"):
- Use a clean comparison matrix table:
| Criterion | Option A | Option B | Winner / Recommendation |
|---|---|---|---|
- Follow with a concise, definitive verdict based on travel style (Luxury, Culture, Adventure, Budget).

### 4. Pro-Tips & Logistics
Highlight insider knowledge, travel hacks, or hidden gems in blockquotes:
> **GlobeTrotter Pro-Tip:** Book pre-dawn entry passes for Kinkaku-ji to experience the golden reflections without tourist crowds.

### 5. Platform Call-to-Action
When relevant, invite the traveler to use the platform tools:
*"You can pre-select this destination in your GlobeTrotter Builder to generate an itemized cost breakdown and interactive calendar."*

## Safety & Boundaries
- If asked about time-sensitive rules (visas, entry restrictions), provide general knowledge and advise checking official embassy portals.
- If asked off-topic non-travel questions (e.g. coding, math), politely reply in 1 sentence: "I specialize in travel architecture and destination planning — feel free to ask me anything about your next journey!"
"""


def get_gemini_response(user_message: str, history: list = None) -> str:
    """
    Generate a response from Gemini with full conversation context and structured formatting.

    Args:
        user_message: The current user message.
        history: List of prior messages, each with {"role": "user"|"assistant", "content": "..."}.

    Returns:
        The assistant's reply text formatted in rich Markdown.
    """
    client = _get_client()
    if client is None:
        return "The GlobeTrotter Travel Assistant is not configured yet. Please set a valid `GEMINI_API_KEY` in the chatbot's `.env` file."

    try:
        # Build the conversation history
        history_contents = []

        if history:
            for msg in history:
                role = msg.get("role", "")
                content = msg.get("content", "")
                if not content:
                    continue
                if role == "user":
                    history_contents.append(
                        types.Content(
                            role="user",
                            parts=[types.Part.from_text(text=content)],
                        )
                    )
                elif role == "assistant":
                    history_contents.append(
                        types.Content(
                            role="model",
                            parts=[types.Part.from_text(text=content)],
                        )
                    )

        # Candidate models supported by Gemini API
        models_to_try = [
            "gemini-3.6-flash",
            "gemini-3.1-pro-preview",
            "gemini-3.5-flash",
            "gemini-2.5-flash",
        ]

        last_exception = None
        for model_name in models_to_try:
            try:
                chat = client.chats.create(
                    model=model_name,
                    history=history_contents,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        temperature=0.7,
                        max_output_tokens=2500,
                    ),
                )
                response = chat.send_message(user_message)
                if response and response.text:
                    return response.text
            except Exception as ex:
                last_exception = ex
                continue

        if last_exception:
            raise last_exception

        return "I encountered an issue generating your travel itinerary. Please try asking again."

    except Exception as e:
        import traceback
        print("Error in get_gemini_response:")
        traceback.print_exc()
        return "I am currently updating my travel knowledge base. Please try rephrasing your travel question or try again in a moment."