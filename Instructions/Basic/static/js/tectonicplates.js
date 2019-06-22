// Create a map object and pass in the earthquakes and tectonic plates layers along with the satellite basemap
var myMap = L.map("map", {
  center: [27.561852, -54.662326],
  zoom: 3
});

// Define an outdoors tile layer for the map
var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
}).addTo(myMap);

// API endpoint
var tectonicplatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Grab the tectonic plates data with d3
d3.json(tectonicplatesLink, function(data) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the name of the plate
    function onEachFeature(feature, layer) {
        layer.setStyle({
            color: '#FFA500'
        });
        layer.bindPopup("<h3>" + feature.properties.PlateName + "</h3>")
    }

    // Create a GeoJSON array containing the features array grabbed from the tectonic plates data
    // Run the onEachFeature function once for each piece of data in the array
    var tectonicplates = L.geoJson(data, {
        onEachFeature: onEachFeature
    }).addTo(myMap);
});

