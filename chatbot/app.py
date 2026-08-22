from flask import Flask, render_template, request, jsonify
from gemini_service import get_gemini_response

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Empty prompt"}), 400

    reply = get_gemini_response(message, history)
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(port=5000, debug=True)