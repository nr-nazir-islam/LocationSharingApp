# Location Sharing App

A minimal web application that automatically requests the user's GPS coordinates on page load using the browser Geolocation API. Locations are sent to a Flask backend and stored in a SQLite database.

## Features

- Automatic geolocation permission request on page load
- Plain HTML page with no styling or interactive UI
- Send latitude, longitude, and accuracy to the Flask API
- Persist locations in SQLite

## Project Structure

```
LocationSharingApp/
├── app.py                  # Flask backend & API routes
├── requirements.txt        # Python dependencies
├── README.md               # This file
├── database/
│   └── locations.db        # SQLite database (auto-created)
└── templates/
    └── index.html          # Plain HTML page with inline geolocation script
```

## Prerequisites

- Python 3.8 or newer
- A modern web browser with Geolocation support (Chrome, Firefox, Safari, Edge)
- HTTPS or `localhost` (browsers require a secure context for Geolocation)

## Setup Instructions

### 1. Clone or download the project

```bash
cd LocationSharingApp
```

### 2. Create a virtual environment (recommended)

**Windows (PowerShell):**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the application

```bash
python app.py
```

The server starts at **http://127.0.0.1:5000**.

### 5. Open in your browser

Navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000). The page automatically requests location permission; allow access when prompted and coordinates are sent to the server.

## API Endpoints

| Method | Endpoint          | Description                    |
|--------|-------------------|--------------------------------|
| GET    | `/`               | Serves the web UI              |
| POST   | `/api/locations`  | Save a new location            |
| GET    | `/api/locations`  | List all saved locations       |

### POST `/api/locations`

**Request body (JSON):**

```json
{
  "latitude": 23.8103,
  "longitude": 90.4125,
  "accuracy": 12.5
}
```

**Response (201):**

```json
{
  "id": 1,
  "latitude": 23.8103,
  "longitude": 90.4125,
  "accuracy": 12.5,
  "created_at": "2026-07-22T14:00:00+00:00"
}
```

## Troubleshooting

- **Permission denied:** Check your browser's site settings and allow location access for `localhost`.
- **Location unavailable:** Ensure GPS/location services are enabled on your device.
- **Geolocation blocked:** Browsers only expose Geolocation on secure origins (`https://` or `http://localhost`).

## License

MIT
