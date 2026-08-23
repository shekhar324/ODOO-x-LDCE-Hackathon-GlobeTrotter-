import os
from google import genai
from google.genai import types
from dotenv import load_dotenv, find_dotenv

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Lazy client — initialized on first use so the app can start without a key
_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        _client = genai.Client(api_key=api_key)
    return _client

SYSTEM_INSTRUCTION = """You are GlobeTrotter AI — a seasoned, knowledgeable travel consultant with years of practical experience helping travelers plan trips worldwide.

## Your Personality
- Knowledgeable, calm, mature, and practical.
- Concise when the question is simple. Detailed when the question requires planning.
- Friendly without being overly enthusiastic. Confident without pretending certainty.
- Realistic about travel constraints — distances, timings, budgets, seasons.
- Useful rather than conversational for the sake of conversation.

## How You Respond

### Simple factual questions
Give a direct, concise practical answer. No fluff.

### Recommendation questions (e.g. "Bali or Thailand?")
Compare based on relevant factors: budget, travel style, duration, season, activities, nightlife, beaches, culture. Help the user decide rather than listing everything.

### Planning questions (e.g. "Plan a 7-day trip to Italy")
Provide a sensible, realistic itinerary. Consider travel time between locations, pacing, and the number of days. Do not produce an unrealistic list of 20 locations for 7 days.

### Ambiguous requests
Ask a focused clarification question. For example: "I can help plan that. What month are you travelling, and roughly what budget range works for you?"

### Follow-up context
Pay close attention to conversation history. When the user says "there", "that city", "the second option", or refers to prior context, understand what they mean from the conversation flow. If someone says they're planning a trip to Japan and then says "mostly food and culture", understand that refers to the Japan trip.

## Response Format
- Use clean Markdown formatting: headers, bullet points, and bold where helpful.
- Keep formatting practical and readable — not overly decorated.
- Use numbered lists for itinerary days.
- Use bold for key recommendations or place names.

## What You Must NOT Do
- Never start responses with "As an AI language model..." or similar disclaimers.
- Never use phrases like "I'd be happy to help!", "Absolutely!", "That's a fantastic question!", "Here are some amazing options for you! 😊"
- Avoid excessive emojis. One or two contextual ones are fine if natural.
- Never produce generic AI filler text.
- Never fabricate specific prices, flight schedules, hotel availability, or current opening hours as fact.
- Never invent visa requirements, entry restrictions, or government regulations.

## Handling Uncertainty
Travel information changes frequently. When information may be time-sensitive:
- Say so clearly. Use phrasing like: "Entry requirements can change depending on your nationality and current rules — check the relevant government or immigration website before booking."
- Distinguish between general guidance and time-sensitive specifics.
- For prices, say "roughly" or "typically" rather than stating exact current figures.

## Safety & Policy Boundaries

### Harmful content
Do not facilitate: violent wrongdoing, criminal activity, harassment, targeted abuse, extremist activity, instructions for harming people, illegal activities, evasion of law enforcement, or dangerous wrongdoing. If asked, refuse briefly and redirect toward a legitimate travel-related alternative. Do not give a dramatic safety lecture.

### Political neutrality
Remain politically neutral. Do not promote political parties, campaign for candidates, persuade users politically, express partisan opinions, or attempt to influence elections. For political questions directly relevant to travel (e.g. "Is there a protest in this city?"), provide neutral factual travel implications if you have reliable information, but do not take political sides.

### Legal information
For legal/travel-law questions (visas, immigration, border requirements, customs, permits, local laws):
- Provide general informational guidance.
- Do not pretend to be a lawyer.
- Encourage checking official government/immigration sources.
- Clearly distinguish general guidance from authoritative legal advice.
- Do not fabricate laws or requirements.

## Off-Topic Requests
If someone asks about something completely unrelated to travel (e.g. coding, math homework, medical advice), briefly note that you specialize in travel planning and offer to help with any travel questions instead. Keep it brief — one sentence, not a paragraph.
"""


def get_gemini_response(user_message: str, history: list = None) -> str:
    """
    Generate a response from Gemini with full conversation context.

    Args:
        user_message: The current user message.
        history: List of prior messages, each with {"role": "user"|"assistant", "content": "..."}.

    Returns:
        The assistant's reply text, or a user-friendly error message.
    """
    client = _get_client()
    if client is None:
        return "The travel assistant is not configured yet. Please set a GEMINI_API_KEY in the chatbot's .env file."

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

        # Candidate models to try in order of preference (using valid Google GenAI models)
        candidate_models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-pro"]
        
        last_error = None
        for model_name in candidate_models:
            try:
                chat = client.chats.create(
                    model=model_name,
                    history=history_contents,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        temperature=0.7,
                        max_output_tokens=2048,
                    ),
                )

                response = chat.send_message(user_message)
                return response.text
            except Exception as model_err:
                last_error = model_err
                print(f"Model {model_name} failed: {model_err}. Trying fallback model...")

        print("All candidate models failed. Last error:", last_error)
        return "I'm having trouble connecting to my travel knowledge base right now. Please try again in a moment."
    except Exception as e:
        import traceback
        print("Error in get_gemini_response:")
        traceback.print_exc()
        return "I'm having trouble connecting to my travel knowledge base right now. Please try again in a moment."


def generate_ai_itinerary(
    destination: str,
    start_date: str = "",
    end_date: str = "",
    budget: float = 0,
    currency: str = "USD",
    interests: list = None,
    travel_style: str = "Balanced",
    travelers: int = 1,
    custom_instructions: str = ""
) -> dict:
    """
    Generate a context-aware multi-day itinerary JSON using Gemini API.
    Enforces destination specificity, travel style, duration, budget, and currency consistency.
    """
    client = _get_client()
    currency = (currency or "USD").strip().upper() if isinstance(currency, str) else "USD"

    if client is None:
        return {
            "error": "Gemini API key is not configured.",
            "currency": currency,
            "stops": []
        }

    # Calculate trip duration
    days_count = 3
    if start_date and end_date:
        try:
            from datetime import datetime
            d1 = datetime.strptime(start_date, "%Y-%m-%d")
            d2 = datetime.strptime(end_date, "%Y-%m-%d")
            delta = (d2 - d1).days + 1
            if delta > 0:
                days_count = min(14, delta)  # Cap at 14 days max for API response performance
        except Exception:
            days_count = 3

    interests_str = ", ".join(interests) if isinstance(interests, list) and interests else "Sightseeing, Local Cuisine, History, Hidden Gems"

    prompt = f"""You are GlobeTrotter's AI Master Travel Concierge.
Generate an authentic, highly context-aware, day-by-day travel itinerary strictly tailored to the user's input:

TRIP PARAMETERS:
- Primary Destination: {destination}
- Trip Duration: {days_count} Days ({start_date or 'Flexible Start'} to {end_date or 'Flexible End'})
- Target Budget: {budget} {currency}
- Currency Code: {currency}
- Travel Style / Pacing: {travel_style}
- Number of Travelers: {travelers}
- Traveler Interests: {interests_str}
- Additional Custom Instructions: {custom_instructions or 'None'}

CRITICAL GENERATION RULES:
1. DESTINATION AUTHENTICITY: All activity names, landmarks, neighborhood names, local foods, and experiences MUST be real, specific to '{destination}', and accurately themed.
2. DURATION: Create exactly {days_count} day stops (e.g., "Day 1: Arrival & Historic Center", "Day 2: ...").
3. TRAVEL STYLE & PACING: 
   - If style is 'Relaxed', schedule 2 activities/day with light walking.
   - If style is 'Balanced' or 'Adventure', schedule 3-4 activities/day.
   - If style is 'Luxury', recommend upscale venues and fine dining.
4. STRICT CURRENCY & BUDGET:
   - ALL estimated activity costs MUST be in '{currency}'.
   - Do NOT use USD or INR unless requested.
   - Provide realistic estimates (e.g. INR 500-4000/activity, EUR 15-120/activity, USD 20-150/activity).
5. STRUCTURED JSON OUTPUT:
   Return ONLY a raw JSON object with NO markdown formatting, NO backticks, and NO extra text:

{{
  "title": "Bespoke {days_count}-Day Journey in {destination}",
  "description": "Customized {travel_style.lower()} travel experience highlighting {interests_str}.",
  "currency": "{currency}",
  "budget": {budget if budget > 0 else 50000},
  "stops": [
    {{
      "title": "Day 1: Arrival & Iconic Landmarks",
      "city": "{destination}",
      "country": "Local Region",
      "notes": "Exploring the historic heart of {destination}",
      "activities": [
        {{
          "title": "Morning Landmark Exploration",
          "category": "Sightseeing",
          "cost": 50,
          "description": "Visit top authentic historic site in {destination}.",
          "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop"
        }},
        {{
          "title": "Authentic Regional Dining",
          "category": "Dining",
          "cost": 30,
          "description": "Sample renowned local dishes in {destination}.",
          "image": "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?q=80&w=800&auto=format&fit=crop"
        }}
      ]
    }}
  ]
}}
"""

    candidate_models = ["gemini-3.6-flash", "gemini-1.5-flash", "gemini-3.5-flash", "gemini-flash-latest"]
    last_err = None

    for model_name in candidate_models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.4,
                    max_output_tokens=8192,
                    response_mime_type="application/json",
                )
            )
            raw_text = (response.text or "").strip()
            
            # Robustly strip markdown code blocks (e.g. ```json ... ```)
            cleaned = raw_text
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[-1]
            if cleaned.endswith("```"):
                cleaned = cleaned.rsplit("```", 1)[0]
            cleaned = cleaned.strip()

            import json
            data = json.loads(cleaned)

            # Validate and sanitize JSON structure
            if not isinstance(data, dict):
                raise ValueError("AI response root is not a dict")
            
            data["currency"] = currency
            data["title"] = data.get("title") or f"{days_count}-Day Experience in {destination}"
            data["description"] = data.get("description") or f"Curated {travel_style.lower()} trip to {destination}."

            stops = data.get("stops")
            if not isinstance(stops, list) or len(stops) == 0:
                raise ValueError("AI response missing stops array")

            for s_idx, stop in enumerate(stops):
                if not isinstance(stop, dict):
                    continue
                stop["title"] = stop.get("title") or f"Day {s_idx + 1}: {destination} Discovery"
                stop["city"] = stop.get("city") or destination
                stop["country"] = stop.get("country") or "Destination"
                stop["notes"] = stop.get("notes") or f"Day {s_idx + 1} experiences in {destination}"
                
                acts = stop.get("activities")
                if not isinstance(acts, list):
                    stop["activities"] = []
                else:
                    for act in acts:
                        if isinstance(act, dict):
                            act["title"] = act.get("title") or f"Activity in {destination}"
                            act["category"] = act.get("category") or "Sightseeing"
                            act["cost"] = float(act.get("cost") or 0)
                            act["description"] = act.get("description") or f"Enjoy experience in {destination}."

            return data

        except Exception as err:
            last_err = err
            print(f"Itinerary model {model_name} error: {err}. Trying next model...")

    print("All itinerary models failed. Last error:", last_err)
    return {
        "error": f"Failed to generate AI itinerary: {str(last_err)}",
        "currency": currency,
        "stops": []
    }