// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Define a markerSize() function that will give each city a different radius based on its magnitude.
function markerSize(mag) {
  return mag * 2;
}
// List of colors and color function
var colors = ["#034732","#008148","#C6C013","#EF8A17","#EF2917"]

function sortColor(depth){
    if (depth <20) {
      return colors[0];
    } else if (depth <40) {
        return colors[1];
    } else if (depth <60) {
        return colors[2];
    } else if (depth <80) {
        return colors[3];
    } else {
        return colors[4];
    }
};

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
      //console.log(feature)
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
  pointToLayer: (feature, latlng) => {
      console.log(feature);
      return new L.circleMarker(latlng, {
      fillOpacity: 1,
      color: sortColor(feature.geometry.coordinates[2]),
      fillColor: sortColor(feature.geometry.coordinates[2]),
          // Setting our circle's radius to equal the output of our markerSize() function:
          // This will make our marker's size proportionate to its population.
      radius: markerSize(feature.properties.mag)
      })},
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

    /*Legend specific*/
    var legend = L.control({ position: "bottomleft" });

    legend.onAdd = function(myMap) {
      var div = L.DomUtil.create("div", "legend");
      div.innerHTML += "<h4>Earthquake Depth<br />(in meters)</h4>";
      div.innerHTML += '<i style="background: #034732"></i><span>Less than 20</span><br>';
      div.innerHTML += '<i style="background: #008148"></i><span>20 to 40</span><br>';
      div.innerHTML += '<i style="background: #C6C013"></i><span>40 to 60</span><br>';
      div.innerHTML += '<i style="background: #EF8A17"></i><span>60 to 80</span><br>';
      div.innerHTML += '<i style="background: #EF2917"></i><span>More than 80</span><br>';
      
      //  "#034732","#008148","#C6C013","#EF8A17","#EF2917"
      return div;
    };

    legend.addTo(myMap);
  };



