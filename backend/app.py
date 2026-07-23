import math
import os
import sqlite3
from datetime import datetime, timezone

from flask import Flask, jsonify, render_template, request


app = Flask(__name__)


DATABASE = os.path.join(
    os.path.dirname(__file__),
    "database",
    "locations.db"
)


def get_db():

    os.makedirs(
        os.path.dirname(DATABASE),
        exist_ok=True
    )

    conn = sqlite3.connect(
        DATABASE,
        check_same_thread=False
    )

    conn.row_factory = sqlite3.Row

    return conn



def init_db():

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
        return None, jsonify({
            "error": f"{name} is required"
        }), 400


    try:
        value = float(value)

    except:

        return None, jsonify({
            "error": f"Invalid {name}"
        }), 400


    if not math.isfinite(value):

        return None, jsonify({
            "error": f"Invalid {name}"
        }), 400


    return value, None, None




@app.route("/")
def index():

    return render_template(
        "index.html"
    )




# SAVE LIVE LOCATION
@app.route("/api/locations", methods=["POST"])
def save_location():

    data = request.get_json(
        silent=True
    )


    if data is None:

        return jsonify({
            "error": "Invalid JSON payload"
        }), 400



    latitude, error, code = parse_coordinate(
        data.get("latitude"),
        "latitude"
    )

    if error:
        return error, code



    longitude, error, code = parse_coordinate(
        data.get("longitude"),
        "longitude"
    )

    if error:
        return error, code



    if not (-90 <= latitude <= 90):

        return jsonify({
            "error": "Invalid latitude"
        }), 400



    if not (-180 <= longitude <= 180):

        return jsonify({
            "error": "Invalid longitude"
        }), 400



    accuracy = data.get(
        "accuracy"
    )


    if accuracy is not None:

        try:

            accuracy = float(
                accuracy
            )

        except:

            accuracy = None



    created_at = datetime.now(
        timezone.utc
    ).isoformat()



    conn = get_db()


    # পুরোনো location delete
    conn.execute(
        "DELETE FROM locations"
    )



    # নতুন location save
    conn.execute(
        """
        INSERT INTO locations
        (
            latitude,
            longitude,
            accuracy,
            created_at
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            latitude,
            longitude,
            accuracy,
            created_at
        )
    )


    conn.commit()

    conn.close()



    return jsonify({

        "message": "Live location updated",

        "latitude": latitude,

        "longitude": longitude,

        "accuracy": accuracy,

        "created_at": created_at

    }), 200





# GET LOCATION
@app.route("/api/locations", methods=["GET"])
def get_locations():

    conn = get_db()


    rows = conn.execute(
        """
        SELECT id, latitude, longitude, accuracy, created_at
        FROM locations
        ORDER BY id DESC
        """
    ).fetchall()


    conn.close()



    return jsonify({

        "locations":
        [
            dict(row)
            for row in rows
        ]

    })





# Render start হলে database তৈরি
init_db()



if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )