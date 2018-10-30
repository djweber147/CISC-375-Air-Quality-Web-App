var app;
var mymap;

function Init()
{
    app = new Vue({
        el: "#app",
        data: {
            location: "",
            lat: "",
            lng: "",
            measurements: null
        },
    });
    
    // Map functions
    
    mymap = L.map('mapid').setView([51.505, -0.09], 13);
    
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoid2ViZTAxMTkiLCJhIjoiY2pucGlndjJsMDY1bzN3bGthbHFkeW1yYyJ9.Bi-5WN5V7KN__SJGK-v9TQ', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1Ijoid2ViZTAxMTkiLCJhIjoiY2pucGlndjJsMDY1bzN3bGthbHFkeW1yYyJ9.Bi-5WN5V7KN__SJGK-v9TQ'
                }).addTo(mymap);
    
    updateFromMap();

}

function updateFromMap()
{
    app.lat = mymap.getCenter().lat;
    app.lng = mymap.getCenter().lng;
    findNearestLocation();
}

function updateFromForm() {
    mymap.panTo([app.lat,app.lng]);
    findNearestLocation();
}


function findNearestLocation()
{
    // Find nearest location
    var request = {
        url: "https://api.openaq.org/v1/locations?nearest=1&coordinates=" + app.lat + "," + app.lng,
        dataType: "json",
        success: function (data) { app.location = data.results[0].location; getAQData(data); }
    };
    $.ajax(request);
}

function getAQData(data) {
    app.city = data.results.location;
    var request = {
        url: "https://api.openaq.org/v1/latest?location=" + app.location,
        dataType: "json",
        success: OpenAQData
    };
    $.ajax(request);
}

function OpenAQData(data)
{
    
    app.measurements = data.results[0].measurements;
    console.log(app.measurements);
}