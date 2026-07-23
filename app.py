import math
import os
import sqlite3
from datetime import datetime, timezone

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATABASE = os.path.join(os.path.dirname(__file__), "database", "locations.db")


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DATABASE), exist_ok=True)
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            accuracy REAL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def parse_coordinate(value, name):
    if value is None or value == "":
        return None, jsonify({"error": f"{name} is required"}), 400

    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return None, jsonify({"error": f"Invalid {name} value"}), 400

    if not math.isfinite(parsed):
        return None, jsonify({"error": f"Invalid {name} value"}), 400

    return parsed, None, None


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/locations", methods=["POST"])
def save_location():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Invalid JSON payload"}), 400

    latitude, error_response, status_code = parse_coordinate(data.get("latitude"), "latitude")
    if error_response is not None:
        return error_response, status_code

    longitude, error_response, status_code = parse_coordinate(data.get("longitude"), "longitude")
    if error_response is not None:
        return error_response, status_code

    if not (-90 <= latitude <= 90):
        return jsonify({"error": "latitude must be between -90 and 90"}), 400

    if not (-180 <= longitude <= 180):
        return jsonify({"error": "longitude must be between -180 and 180"}), 400

    accuracy = data.get("accuracy")
    if accuracy is not None and accuracy != "":
        accuracy, error_response, status_code = parse_coordinate(accuracy, "accuracy")
        if error_response is not None:
            return error_response, status_code
        if accuracy < 0:
            return jsonify({"error": "accuracy must be a non-negative number"}), 400
    else:
        accuracy = None

    created_at = datetime.now(timezone.utc).isoformat()

    conn = get_db()
    cursor = conn.execute(
        """
        INSERT INTO locations (latitude, longitude, accuracy, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (latitude, longitude, accuracy, created_at),
    )
    conn.commit()
    location_id = cursor.lastrowid
    conn.close()

    return jsonify(
        {
            "id": location_id,
            "latitude": latitude,
            "longitude": longitude,
            "accuracy": accuracy,
            "created_at": created_at,
        }
    ), 201


@app.route("/api/locations", methods=["GET"])
def list_locations():
    conn = get_db()
    rows = conn.execute(
        """
        SELECT id, latitude, longitude, accuracy, created_at
        FROM locations
        ORDER BY created_at DESC
        """
    ).fetchall()
    conn.close()

    locations = [dict(row) for row in rows]
    return jsonify({"locations": locations})


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)
