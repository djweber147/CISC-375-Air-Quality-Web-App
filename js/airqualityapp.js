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
        dateFrom: "",
        dateTo: "",
        filters: [],
        location: "",
        lat: "",
        lng: "",
        markerData: [],
        mode: "Latest"
    },
    methods: {
        updateFromMap: function () {
            this.lat = mymap.getCenter().lat;
            this.lng = mymap.getCenter().lng;
            this.findNearestLocation();
        },
        findNearestLocation: function () {
            $.getJSON("https://api.openaq.org/v1/locations?nearest=1&coordinates=" + app.lat + "," + app.lng, function (data) {
                app.location = data.results[0].location;
                app.cityRequest = app.location;
                getAQData();
            });
        },
        updateFromForm: function () {
            mymap.panTo([this.lat, this.lng]);
            this.findNearestLocation();
        },
        citySearch: function () {
            $.getJSON("https://us1.locationiq.com/v1/search.php?key=2a8033e9254767&city=" + this.cityRequest + "&format=json", function (data) {
                    app.lat = data[0].lat;
                    app.lng = data[0].lon;
                    mymap.panTo([app.lat, app.lng]);
                    app.findNearestLocation();
                })
                .fail(function () {
                    alert("Requested city not found!");
                });
        },
        addMarker: function () {
            var marker;
            var popupContent
            markerLayer.clearLayers();
            this.markerData.forEach(function (item) {
                marker = L.marker([item.coordinates.latitude, item.coordinates.longitude]);
                markerLayer.addLayer(marker);
                popupContent = "Latitude: " + item.coordinates.latitude + "\nLongitude: " + item.coordinates.longitude + '<br/>';
                if (item.pm25 !== null) {
                    popupContent = popupContent + 'pm25' + ': ' + item.pm25.value + ' ' + item.pm25.unit + '<br/>';
                }
                if (item.pm10 !== null) {
                    popupContent = popupContent + 'pm10' + ': ' + item.pm10.value + ' ' + item.pm10.unit + '<br/>';
                }
                if (item.co !== null) {
                    popupContent = popupContent + 'co' + ': ' + item.co.value + ' ' + item.co.unit + '<br/>';
                }
                if (item.so2 !== null) {
                    popupContent = popupContent + 'so2' + ': ' + item.so2.value + ' ' + item.so2.unit + '<br/>';
                }
                if (item.no2 !== null) {
                    popupContent = popupContent + 'no2' + ': ' + item.no2.value + ' ' + item.no2.unit + '<br/>';
                }
                if (item.o3 !== null) {
                    popupContent = popupContent + 'o3' + ': ' + item.o3.value + ' ' + item.o3.unit; + '<br/>'
                }
                marker.bindPopup(popupContent);
            });
        },
        filterParticles: function (){
            var hasParameter = false;
            if(this.filters.length == 0)
            {
                this.addMarker();
                return;
            }
            for(var j = 0; j < this.markerData.length; j++)
            {
                hasParameter = false
                for(var i = 0; i < this.filters.length; i++)
                {
                    if(markerData[j][filters[i]] !== null)
                    {
                        hasParameter = true;
                    }
                }
                if(!hasParameter)
                {
                    markerData.splice(j,1);
                }
            }
            this.addMarker();
        },
        indexColor: function (value, unit, parameter) {
            var color;
            var index = this.findAQIndex(value, unit, parameter);
            if (index == null) {
                color = "white";
            } else if (index == 0) {
                color = "rgb(0,228,0)";
            } else if (index == 1) {
                color = "rgb(255,255,0)";
            } else if (index == 2) {
                color = "rgb(255,126,0)";
            } else if (index == 3) {
                color = "rgb(255,0,0)";
            } else if (index == 4) {
                color = "rgb(143,63,151)";
            } else if (index == 5) {
                color = "rgb(126,0,35)";
            }
            return {
                'background-color': color
            }
        },
        minimumDate: function () {
            var current = Date.now();
            var minDate = current - 7776000000;
            return Date(minDate).toISOString();
        },
        //Emailed Prof Marrinan about this. The values come back in different units.
        //If you look at page 4 in the pdf he linked on the assignment page,
        //the units should match the table. we may need to handle conversions
        //between units. Thats what this function will be for.
        findAQIndex: function (value, unit, parameter) {
            if (value == null) {
                return null;
            }
            if (parameter === "so2") {
                if (unit == "µg/m³") {
                    value = (value * 0.000000001);
                }
                if (unit == "ppm") {
                    value = value / 1000;
                }
                if (value <= 35) { return 0; }
                if (value <= 75) { return 1; }
                if (value <= 185) { return 2; }
                if (value <= 304) { return 3; }
                if (value <= 604) { return 4; }
                if (value > 604) { return 5; }
            }
            if (parameter === "no2") {
                if (unit == "µg/m³") {
                    value = (value * 0.000000001);
                }
                if (unit == "ppm") {
                    value = value / 1000;
                }
                if (value <= 53) { return 0; }
                if (value <= 100) { return 1; }
                if (value <= 360) { return 2; }
                if (value <= 304) { return 3; }
                if (value <= 649) { return 4; }
                if (value > 649) { return 5; }
            }
            if (parameter === "co") {
                if (unit == "µg/m³") {
                    value = (value * 0.000001);
                }
                if (value <= 4.4) { return 0; }
                if (value <= 9.4) { return 1; }
                if (value <= 12.4) { return 2; }
                if (value <= 15.4) { return 3; }
                if (value <= 30.4) { return 4; }
                if (value > 30.4) { return 5; }
            }
            if (parameter === "o3") {
                if (unit == "µg/m³") {
                    value = (value * 0.000001);
                }
                if (value <= .054) { return 0; }
                if (value <= .070) { return 1; }
                if (value <= .085) { return 2; }
                if (value <= .105) { return 3; }
                if (value <= .2) { return 4; }
                if (value > .2) { return 5; }
            }
            if (parameter === "pm25") {
                if (value <= 12) { return 0; }
                if (value <= 35.4) { return 1; }
                if (value <= 55.4) { return 2; }
                if (value <= 150.4) { return 3; }
                if (value <= 250.4) { return 4; }
                if (value > 250.4) { return 5; }
            }
            if (parameter === "pm10") {
                if (value <= 54) { return 0; }
                if (value <= 154) { return 1; }
                if (value <= 254) { return 2; }
                if (value <= 354) { return 3; }
                if (value <= 424) { return 4; }
                if (value > 424) { return 5; }
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
mymap.on('moveend', app.updateFromMap);
mymap.on('zoomend', app.updateFromMap);
app.updateFromMap();

function getAQData() {
    // Find radius for request - Based on https://gis.stackexchange.com/a/198444
    // Get the y,x dimensions of the map
    var y = mymap.getSize().y,
        x = mymap.getSize().x;
    // calculate the dimensions of the map in meters using the haversine formula
    var width = mymap.containerPointToLatLng([0, y]).distanceTo(mymap.containerPointToLatLng([x, y]));
    var height = mymap.containerPointToLatLng([0, 0]).distanceTo(mymap.containerPointToLatLng([0, y]));
    // Radius is half of the min dimension
    var radius = Math.min(width, height) / 2;

    if (app.mode == "Latest") {
        $.getJSON("https://api.openaq.org/v1/latest?coordinates=" 
        + app.lat + "," + app.lng + "&radius=" + radius,
            function (response) {
                app.markerData = [];
                response.results.forEach(function (location) {
                    var entry = {
                        location: location.location,
                        coordinates: location.coordinates,
                        pm25: null,
                        pm10: null,
                        co: null,
                        so2: null,
                        no2: null,
                        o3: null,
                        date: null
                    }
                    location.measurements.forEach(function (item) {
                        if (item.parameter === "pm25") {
                            entry.pm25 = item;
                        }
                        if (item.parameter === "pm10") {
                            entry.pm10 = item;
                        }
                        if (item.parameter === "co") {
                            entry.co = item;
                        }
                        if (item.parameter === "so2") {
                            entry.so2 = item;
                        }
                        if (item.parameter === "no2") {
                            entry.no2 = item;
                        }
                        if (item.parameter === "o3") {
                            entry.o3 = item;
                        }
                    })
                    app.markerData.push(entry);
                })

                console.log(response.results);
            }).then(function () {
            app.addMarker();
        });
    } else if (app.mode == "Date") {
        $.getJSON("https://api.openaq.org/v1/measurements?coordinates=" +
            app.lat + "," + app.lng + "&radius=" + radius +
            "&date_from=" + app.dateFrom + "&date_to=" + app.dateTo,
            function (response) {
                app.markerData = [];
                response.results.forEach(function (item) {
                    var entry = {
                        location: item.location,
                        coordinates: item.coordinates,
                        pm25: null,
                        pm10: null,
                        co: null,
                        so2: null,
                        no2: null,
                        o3: null,
                        date: item.date.local
                    }
                    if (item.parameter === "pm25") {
                        entry.pm25 = item;
                    }
                    if (item.parameter === "pm10") {
                        entry.pm10 = item;
                    }
                    if (item.parameter === "co") {
                        entry.co = item;
                    }
                    if (item.parameter === "so2") {
                        entry.so2 = item;
                    }
                    if (item.parameter === "no2") {
                        entry.no2 = item;
                    }
                    if (item.parameter === "o3") {
                        entry.o3 = item;
                    }
                    app.markerData.push(entry);
                })
            }).then(function () {
            app.addMarker();
        });
    }
}