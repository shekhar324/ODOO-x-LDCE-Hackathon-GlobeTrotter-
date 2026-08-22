# 🌍 Globe Trotter — AI Personalized Travel Planning Web App

Globe Trotter is a full-stack, end-to-end personalized travel planning application built with **Python (Flask)**, **SQLAlchemy (SQLite/PostgreSQL)**, **modern Tailwind CSS**, and Google Gemini AI (**`gemini-2.5-flash`** via the official `google-genai` Python SDK).

---

## 🚀 Key Features

1. **Authentication & Session Security**:
   - Secure login, signup, and session management using `Flask-Login` and `Werkzeug` password hashing.
   - Quick 1-Click **Demo Login** account for testing immediately (`demo@globetrotter.com` / `password123`).

2. **Trip & Multi-City Itinerary Management**:
   - Create, edit, and manage multi-city trips with date ranges, target budgets, currencies, and cover images.
   - Dynamic stop sequencing (reorder stops up/down or drag).

3. **Interactive Itinerary Builder**:
   - Day-by-day scheduler with interactive filtering ("All Days", "Day 1", "Day 2"...).
   - Activity planning with category badges (*Sightseeing*, *Food & Dining*, *Adventure*, *Culture & History*, *Relaxation*, *Transit*).
   - Time slots, durations, estimated and actual costs, notes, and instant completion checkboxes.

4. **Context-Aware AI Travel Concierge (Powered by Gemini 2.5 Flash)**:
   - Floating chat assistant (**Aero**) available on every page.
   - Automatically detects the active trip you are viewing or building, injecting the destination, dates, stops, and budget into Gemini's system instructions.
   - Advises on weather nuances, peak vs. shoulder seasons, visa/entry rules, local transit passes, budget optimization, cultural etiquettes, and hidden food gems.
   - Formats actionable answers in clean Markdown with quick suggestion chips.

5. **Budget & Cost Analytics**:
   - Real-time Chart.js **Donut Chart** for category spending breakdown (*Transport*, *Stay*, *Activities*, *Meals*, *Miscellaneous*).
   - **Daily Spending Bar Chart** tracking expenditures across the trip timeline.
   - Budget threshold alerts and itemized expense logging table.

6. **Social Sharing & 1-Click Forking**:
   - Shareable public URLs for itineraries (clean read-only presentation).
   - 1-Click **"Fork Trip"** action enabling any traveler to copy a public itinerary into their account.

7. **Discovery & Destination Catalog**:
   - Curated global destinations with cost indices ($ to $$$$$), popularity ratings, best seasons, and must-do activities.
   - Filter by continent and search by keyword or tag.
   - Save / bookmark destinations to personal bucket lists.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, Flask 3.0+, Flask-SQLAlchemy, Flask-Login, Werkzeug, python-dotenv
- **AI Engine**: Google Gemini API via official `google-genai` SDK (`gemini-2.5-flash`)
- **Database**: SQLite (default `globetrotter.db`) or PostgreSQL (via `DATABASE_URL`)
- **Frontend**: Jinja2 Templates, Tailwind CSS (CDN), FontAwesome 6, Chart.js, Marked.js, Vanilla JS

---

## ⚡ Quickstart Guide

### 1. Clone & Setup Virtual Environment
```bash
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and optionally add your **Google Gemini API Key**:
```env
SECRET_KEY=globetrotter_super_secret_dev_key
FLASK_ENV=development
PORT=5000
DATABASE_URL=sqlite:///globetrotter.db
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If `GEMINI_API_KEY` is not provided, the app will gracefully run using an intelligent local fallback travel engine).*

### 4. Run the Application
```bash
python app.py
```
Open **`http://localhost:5000`** in your browser.

The database will be automatically created and pre-seeded with 14 iconic world destinations and a sample 10-day Japan itinerary!

---

## 🔑 Demo Account Credentials
- **Email**: `demo@globetrotter.com`
- **Password**: `password123`
- Or simply click the **"1-Click Demo"** button on the Login page.
