var app;
var mymap;

Vue.component('aq-map', {
    props: {},
    template: '<div id="mapid" class="one-half column" style="margin-top: 10%; height:300px"></div>'
})

app = new Vue({
    el: "#app",
    data: {
        cityRequest: "",
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
                app.cityRequest = app.location;
                getAQData();
            });
        },
        updateFromForm: function () {
            mymap.panTo([this.lat,this.lng]);
            this.findNearestLocation();
        },
        citySearch: function () {
            $.getJSON("https://us1.locationiq.com/v1/search.php?key=2a8033e9254767&city=" + this.cityRequest + "&format=json", function(data){
                        app.lat = data[0].lat;
                        app.lng = data[0].lon;
                        mymap.panTo([app.lat,app.lng]);
                        app.findNearestLocation();
            })
            .fail(function() { alert("Requested city not found!"); });
        },
        addMarker: function() {
            // var marker;
            // var popupContent
            // this.measurements.forEach(function(item){
            //     marker = L.marker([item.coordinates.latitude, item.coordinates.longitude]).addTo(mymap);
            //     popupContent = "Latitude: " + item.coordinates.latitude + "\nLongitude: " + item.coordinates.longitude +'<br/>';
            //     // this.markerData.push({
            //     //     lat: item.coordinates.latitude,
            //     //     lng: item.coordinates.longitude,
            //     //     measurements: this.measurements
            //     // })
            //     popupContent = popupContent + item.parameter + ': ';
            //     popupContent = popupContent + item.value + ' µg/m³<br/>';
            //     marker.bindPopup(popupContent);
            // });
            
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

function getAQData() {
    $.getJSON("https://api.openaq.org/v1/latest?coordinates=" + app.lat + "," + app.lng + "&radius=10000",
    function(response){
        response.results.forEach(function(location){
            var entry = {
                location: location.location,
                coordinates: location.coordinates,
                pm25: null,
                pm10: null,
                co: null,
                so2: null,
                no2: null,
                o3: null
            }
            location.measurements.forEach(function(item){
                if(item.parameter === "pm25"){entry.pm25 = item.value;}
                if(item.parameter === "pm10"){entry.pm10 = item.value;}
                if(item.parameter === "co"){entry.co = item.value;}
                if(item.parameter === "so2"){entry.so2 = item.value;}
                if(item.parameter === "no2"){entry.no2 = item.value;}
                if(item.parameter === "o3"){entry.o3 = item.value;}
            })
            app.markerData.push(entry);
        })

        console.log(response.results);
    }).then(function(){
        app.addMarker();
    });
}
