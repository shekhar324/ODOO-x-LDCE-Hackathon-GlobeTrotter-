import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from gemini_service import get_gemini_response

load_dotenv()

app = Flask(__name__)

# CORS configuration — allow frontend origins during development
cors_origins = os.getenv("CORS_ORIGINS", "*")
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=False)

# Maximum message length to prevent abuse
MAX_MESSAGE_LENGTH = 4000


@app.route("/")
def index():
    return jsonify({"status": "ok", "message": "GlobeTrotter Travel Assistant API is running."})


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Handle chat messages from the frontend.

    Expects JSON:
        {
            "message": "user's travel question",
            "history": [
                {"role": "user", "content": "..."},
                {"role": "assistant", "content": "..."}
            ]
        }

    Returns JSON:
        {"reply": "assistant response text"}
        or
        {"error": "error description"} with appropriate HTTP status
    """
    # Validate content type
    if not request.is_json:
        return jsonify({"error": "Request must be JSON."}), 400

    data = request.get_json(silent=True) or {}
    message = data.get("message", "")
    history = data.get("history", [])

    # Validate message
    if not isinstance(message, str):
        return jsonify({"error": "Message must be a string."}), 400

    message = message.strip()

    if not message:
        return jsonify({"error": "Please enter a message."}), 400

    if len(message) > MAX_MESSAGE_LENGTH:
        return jsonify({"error": f"Message is too long. Please keep it under {MAX_MESSAGE_LENGTH} characters."}), 400

    # Validate history format
    if not isinstance(history, list):
        history = []
    else:
        # Sanitize history — only keep valid entries
        sanitized_history = []
        for entry in history:
            if isinstance(entry, dict) and entry.get("role") in ("user", "assistant") and isinstance(entry.get("content"), str):
                sanitized_history.append({
                    "role": entry["role"],
                    "content": entry["content"][:MAX_MESSAGE_LENGTH]
                })
        history = sanitized_history[-40:]  # Keep last 40 messages max for context window

    # Get response from Gemini
    reply = get_gemini_response(message, history)
    return jsonify({"reply": reply})


@app.route("/api/generate-itinerary", methods=["POST"])
def generate_itinerary_route():
    """
    Handle AI itinerary generation requests.
    Expects JSON with destination, dates, budget, currency, interests, travel_style, travelers, custom_instructions.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON."}), 400

    try:
        data = request.get_json(silent=True) or {}
        destination = data.get("destination", "")
        if not destination or not isinstance(destination, str):
            return jsonify({"error": "Destination is required."}), 400

        start_date = data.get("start_date", "")
        end_date = data.get("end_date", "")
        budget = float(data.get("budget", 0))
        currency = data.get("currency", "USD")
        interests = data.get("interests", [])
        travel_style = data.get("travel_style", "Balanced")
        travelers = int(data.get("travelers", 1))
        custom_instructions = data.get("custom_instructions", "")

        from gemini_service import generate_ai_itinerary
        result = generate_ai_itinerary(
            destination=destination,
            start_date=start_date,
            end_date=end_date,
            budget=budget,
            currency=currency,
            interests=interests,
            travel_style=travel_style,
            travelers=travelers,
            custom_instructions=custom_instructions
        )

        return jsonify(result)
    except Exception as err:
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Internal server error generating itinerary: {str(err)}",
            "stops": []
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)