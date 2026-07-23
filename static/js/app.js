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
            showError("Invalid coordinates received.");
            return;
        }


        fetch("/api/locations", {
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
                showError("Location permission denied.");
                break;


            case error.POSITION_UNAVAILABLE:
                showError("Location unavailable.");
                break;


            case error.TIMEOUT:
                showError("Location timeout.");
                break;


            default:
                showError("Unknown location error.");
        }

    }



    if (!navigator.geolocation){

        showError("Geolocation not supported.");
        return;

    }



    // LIVE LOCATION TRACKING
    navigator.geolocation.watchPosition(

        function(position){

            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            let accuracy = position.coords.accuracy;


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
            enableHighAccuracy:true,
            timeout:15000,
            maximumAge:0
        }


    );


})();