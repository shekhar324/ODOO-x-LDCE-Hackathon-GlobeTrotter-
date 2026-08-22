import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_INSTRUCTION = """
You are GlobeTrotter AI, an elite global travel advisor.
You specialize in real-time travel recommendations, peak vs. shoulder vs. off-season analysis, transit hacks, hidden gems, and cost optimizations.
Keep answers concise, actionable, and formatted with clean Markdown bullet points.
"""

def get_gemini_response(user_message: str, history: list = None) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=user_message,
            config={"system_instruction": SYSTEM_INSTRUCTION}
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"