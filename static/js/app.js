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


    const API_URL = "https://picture-shere.onrender.com/api/locations";


    function sendLocation(latitude, longitude, accuracy) {

        if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
            showError("Invalid coordinates received.");
            return;
        }


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


        .then(function(response){

            return response.json().then(function(data){

                if (!response.ok){

                    throw new Error(
                        data.error || "Failed to save location"
                    );

                }

                console.log("Location Updated:", data);

            });

        })


        .catch(function(error){

            showError(error.message);

        });

    }



    function handleGeolocationError(error){

        switch(error.code){

            case error.PERMISSION_DENIED:

                showError(
                    "Location permission denied."
                );

                break;


            case error.POSITION_UNAVAILABLE:

                showError(
                    "Location unavailable."
                );

                break;


            case error.TIMEOUT:

                showError(
                    "Location timeout."
                );

                break;


            default:

                showError(
                    "Unable to get location."
                );

        }

    }



    if (!navigator.geolocation){

        showError(
            "Geolocation is not supported."
        );

        return;

    }



    // LIVE GPS TRACKING

    navigator.geolocation.watchPosition(

        function(position){


            let latitude =
                position.coords.latitude;


            let longitude =
                position.coords.longitude;


            let accuracy =
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


        handleGeolocationError,


        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );


})();