var app;

function Init()
{
    var request = {
        url: "https://api.openaq.org/v1/cities?country=US&limit=10",
        dataType: "json",
        success: OpenAQData
    };
    $.ajax(request);

    app = new Vue({
        el: "#app",
        data: {
            openaq_search: "",
            openaq_type: "artist",
            openaq_type_options: [
                { value: "album", text: "Album" },
                { value: "artist", text: "Artist" },
                { value: "playlist", text: "Playlist" },
                { value: "track", text: "Track" }
            ],
            search_results: []
        },
    });
    
    // Map functions
    
    var mymap = L.map('mapid').setView([51.505, -0.09], 13);
    
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoid2ViZTAxMTkiLCJhIjoiY2pucGlndjJsMDY1bzN3bGthbHFkeW1yYyJ9.Bi-5WN5V7KN__SJGK-v9TQ', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1Ijoid2ViZTAxMTkiLCJhIjoiY2pucGlndjJsMDY1bzN3bGthbHFkeW1yYyJ9.Bi-5WN5V7KN__SJGK-v9TQ'
                }).addTo(mymap);

}

function OpenAQData(data)
{
    app.search_results = data.results;
    console.log(data);
}



