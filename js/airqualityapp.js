var app;
var mymap;

Vue.component('aq-map', {
    props: {},
    template: '<div id="mapid" class="one-half column" style="margin-top: 10%; height:300px"></div>'
})

app = new Vue({
    el: "#app",
    data: {
        city: "",
        location: "",
        lat: "",
        lng: "",
        markerData: [],
        measurements: null
    },
    methods:{
        updateFromMap: function () {
            this.lat = mymap.getCenter().lat;
            this.lng = mymap.getCenter().lng;
            this.findNearestLocation();
        },
        findNearestLocation: function () {
            $.getJSON("https://api.openaq.org/v1/locations?nearest=1&coordinates=" + app.lat + "," + app.lng, function(data){
                app.location = data.results[0].location; 
                getAQData(data);
            });
        },
        updateFromForm: function () {
            mymap.panTo([this.lat,this.lng]);
            this.findNearestLocation();
        },
        addMarker: function() {
            var marker = L.marker([this.lat, this.lng]).addTo(mymap);
            var popupContent = "Latitude: " + this.lat + "\nLongitude: " + this.lng +'<br/>';
            this.measurements.forEach(function(item){
                popupContent = popupContent + item.parameter + ': ';
                popupContent = popupContent + item.value + ' µg/m³<br/>';
            })
            marker.bindPopup(popupContent);
        }
    }
});

// Map functions

mymap = L.map('mapid').setView([51.505, -0.09], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoid2ViZTAxMTkiLCJhIjoiY2pucGlndjJsMDY1bzN3bGthbHFkeW1yYyJ9.Bi-5WN5V7KN__SJGK-v9TQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1Ijoid2ViZTAxMTkiLCJhIjoiY2pucGlndjJsMDY1bzN3bGthbHFkeW1yYyJ9.Bi-5WN5V7KN__SJGK-v9TQ'
            }).addTo(mymap);
mymap.on('mouseup', app.updateFromMap);
mymap.on('zoomend', app.updateFromMap);
app.updateFromMap();

function getAQData(data) {
    app.city = data.results.location;
    $.getJSON("https://api.openaq.org/v1/latest?location=" + app.location, function (response) {
        app.measurements = response.results[0].measurements;
        console.log(app.measurements);
    }).then(function(){
        app.addMarker();
    })
}
