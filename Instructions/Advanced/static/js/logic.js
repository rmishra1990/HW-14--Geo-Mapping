// API endpoints
var earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicplatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Grab the earthquake data with d3
d3.json(earthquakeLink, function(earthquakeData) {

  // Call createFeatures on the data
  createFeatures(earthquakeData);

});

function createFeatures(earthquakeData) {

  // Grab the 'features' from the data
  var features = earthquakeData.features;

  // Create an array to hold earthquake data markers
  var earthquakeMarkers = [];

  // Grab the titles of the locations
  var titles = []; 
  features.forEach(function(d) {
    var title = d.properties.title;
    var words = title.split("of");
    titles.push(words[1]);
  });

  // Loop through each feature and add a marker using the latitude/longitude values
  for(var i = 0; i < features.length; i++) {
      
    // Add the circles to the earthquakeMarkers array
    earthquakeMarkers.push(
      L.circle([features[i].geometry.coordinates[1], features[i].geometry.coordinates[0]], {
        fillOpacity: 0.75,
        color: "#404040",
        weight: 0.5,
        // Adjust fill color
        fillColor: chooseColor(features[i].properties.mag),
        // Adjust radius
        radius: markerSize(features[i].properties.mag)
      }).bindPopup("<h3>" + titles[i] + "</h3><hr><h3><center>" + features[i].properties.mag + " ML</center></h3>")
    );
  }

  // Call createMap on earthquakes
  createMap(earthquakeMarkers)
}

function createMap(earthquakeMarkers) {

  // Define a grayscale tile layer to the map
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define an outdoors tile layer to the map
  var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a satellite tile layer 
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Create a basemaps object containing all tile layers
  var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": lightmap,
    "Outdoors": outdoormap 
  };

  // Create layer groups for earthquakes and tectonic plates
  var earthquakes = L.layerGroup(earthquakeMarkers);
  var tectonicplates = new L.LayerGroup();

  // Create an overlays object contaning the earthquakes and tectonic plates layer groups
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonicplates
  };

  // Create a map object and pass in the earthquakes and tectonic plates layers along with the satellite basemap
  var myMap = L.map("map", {
    center: [12.001712, -32.730358],
    zoom: 3,
    layers: [satellitemap, earthquakes, tectonicplates]
  });

  // Grab the tectonic plates data with d3
  d3.json(tectonicplatesLink, function(tectonicplatesData) {
    
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
    L.geoJson(tectonicplatesData, {
      onEachFeature: onEachFeature
    }).addTo(tectonicplates);
    
  });

  // Create a legend for the map
  var legend = L.control({position: "bottomright"});

  // Legend will be called once map is displayed
  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];

    // Loop through our magnitude intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +  chooseColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  
  // Add the legend to the map
  legend.addTo(myMap);

  // Create a layer control, pass in both baseMaps and overlayMaps objects and add it to the map
  L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
  }).addTo(myMap);
}

// Function to choose marker color based on earthquake magnitude 
function chooseColor(magnitude) {
  if (magnitude > 5) {
    return '#FF4500';
  }
  else if (magnitude >= 4 && magnitude <= 5) {
    return '#FF8C00';
  }
  else if (magnitude >= 3 && magnitude <= 4) {
    return '#FFA500';
  }
  else if (magnitude >= 2 && magnitude <= 3) {
    return '#FFD700';
  }
  else if (magnitude >= 1 && magnitude <= 2) {
    return '#ADFF2F';
  }
  else if (magnitude >= 0 && magnitude <= 1) {
    return '#7FFF00';
  }
  else {
    return '#fff';
  }
}

// Function to adjust marker radius based on earthquake magnitude
function markerSize(magnitude) {
  return magnitude * 20000;
}

