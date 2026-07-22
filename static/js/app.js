(function () {
    "use strict";

    function sendLocation(latitude, longitude, accuracy) {
        fetch("/api/locations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
                accuracy: accuracy,
            }),
        });
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                sendLocation(
                    position.coords.latitude,
                    position.coords.longitude,
                    position.coords.accuracy
                );
            },
            function () {},
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }
})();
