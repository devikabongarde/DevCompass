# Historical Intelligence Engine - Backend Setup

## Installation

1. Install Python 3.10+ if not already installed
2. Create virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate virtual environment:
   ```bash
   # Windows
   .\venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

## Running the Server

```bash
python app.py
```

Server will run on `http://localhost:5000`

## API Endpoints

- `GET /api/analyze?url=<hackathon_url>` - Analyze a hackathon
- `GET /api/health` - Health check
