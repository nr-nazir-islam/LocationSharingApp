(function () {
    "use strict";

    var errorEl = document.getElementById("error");

    function showError(message) {
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    function isValidCoordinate(value) {
        return typeof value === "number" && Number.isFinite(value);
    }

    function sendLocation(latitude, longitude, accuracy) {
        if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
            showError("Invalid coordinates received from the browser.");
            return;
        }

        fetch("/api/locations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
                accuracy: isValidCoordinate(accuracy) ? accuracy : null,
            }),
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    if (!response.ok) {
                        throw new Error(data.error || "Failed to save location.");
                    }
                    return data;
                });
            })
            .catch(function (err) {
                showError(err.message);
            });
    }

    function handleGeolocationError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                showError("Location permission denied. No coordinates were sent.");
                break;
            case error.POSITION_UNAVAILABLE:
                showError("Location information is unavailable. No coordinates were sent.");
                break;
            case error.TIMEOUT:
                showError("Location request timed out. No coordinates were sent.");
                break;
            default:
                showError("Unable to retrieve location. No coordinates were sent.");
        }
    }

    if (!navigator.geolocation) {
        showError("Geolocation is not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            sendLocation(
                position.coords.latitude,
                position.coords.longitude,
                position.coords.accuracy
            );
        },
        handleGeolocationError,
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
        }
    );
})();
