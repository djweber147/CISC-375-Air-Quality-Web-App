var app;
var mymap;
var markerLayer;

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
            var marker;
            var popupContent
            markerLayer.clearLayers();
            this.markerData.forEach(function(item){
                marker = L.marker([item.coordinates.latitude, item.coordinates.longitude]);
                markerLayer.addLayer(marker);
                popupContent = "Latitude: " + item.coordinates.latitude + "\nLongitude: " + item.coordinates.longitude +'<br/>';
                if(item.pm25 !== null){popupContent = popupContent + 'pm25' + ': ' + item.pm25 + ' µg/m³<br/>';}
                if(item.pm10 !== null){popupContent = popupContent + 'pm10' + ': ' + item.pm10 + ' µg/m³<br/>';}
                if(item.co !== null){popupContent = popupContent + 'co' + ': ' + item.co + ' µg/m³<br/>';}
                if(item.so2 !== null){popupContent = popupContent + 'so2' + ': ' + item.so2 + ' µg/m³<br/>';}
                if(item.no2 !== null){popupContent = popupContent + 'no2' + ': ' + item.no2 + ' µg/m³<br/>';}
                if(item.o3 !== null){popupContent = popupContent + 'o3' + ': ' + item.o3 + ' µg/m³<br/>';}
                marker.bindPopup(popupContent);
            });
        },
        indexColor: function (value){
            var color;
            if(value == null){color = "white";}
            else if(value <= 50){color = "green";}
            else if(value <= 100){color = "yellow";}
            else if(value <= 150){color = "orange";}
            else if(value <= 200){color = "red";}
            else if(value <= 300){color = "purple";}
            else if(value <= 500){color = "maroon";}
            return {
                'background-color': color
            }
        }
    }
});

// Map functions

mymap = L.map('mapid').setView([51.505, -0.09], 11);
markerLayer = L.layerGroup().addTo(mymap);

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
    // Find radius for request - Based on https://gis.stackexchange.com/a/198444
    // Get the y,x dimensions of the map
    var y = mymap.getSize().y,
        x = mymap.getSize().x;
    // calculate the dimensions of the map in meters using the haversine formula
    var width = mymap.containerPointToLatLng([0, y]).distanceTo( mymap.containerPointToLatLng([x,y]));
    var height = mymap.containerPointToLatLng([0, 0]).distanceTo( mymap.containerPointToLatLng([0,y]));
    // Radius is half of the min dimension
    var radius = Math.min(width,height)/2;
    
    
    $.getJSON("https://api.openaq.org/v1/latest?coordinates=" + app.lat + "," + app.lng + "&radius=" + radius,
    function(response){
        app.markerData = [];
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
