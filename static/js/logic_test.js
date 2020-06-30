// Add console.log to check to see if our code is working:
console.log("working");

// Create the tile layer that will be the default background of our map:
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Create the satellite view tile layer that will be an option for our map:
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Create the dark view tile layer that will be an option for our map:
let dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Create a base layer that holds all maps.
let baseMaps = {
    "Streets": streets,
    "Satellite": satelliteStreets,
    "Dark": dark
};

// Set the Tectonic plates access url:
platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
    
// Create the earthquake and tectonic layers for our map:
let earthquakes = new L.layerGroup();
let tectonic = new L.layerGroup();
let zeroOne = new L.layerGroup();
let oneTwo = new L.layerGroup();
let twoThree = new L.layerGroup();
let threeFour = new L.layerGroup();
let fourFive = new L.layerGroup();
let fivePlus = new L.layerGroup();

// Define an object that contains the overlays:
let overlays = {
    "All Earthquakes": earthquakes,
    "Tectonic Plates" : tectonic
   // "0-1 Magnitude" : zeroOne,
   // "1-2 Magnitude" : oneTwo,
   // "2-3 Magnitude" : twoThree,
   // "3-4 Magnitude" : threeFour,
   // "4-5 Magnitude" : fourFive,
   // "5+ Magnitude" : fivePlus
  };

// Create the map object with center, zoom level and set the default layer:
let map = L.map('mapid', {
	center: [39.5, -98.5],
	zoom: 3,
	layers: [streets]
});

// Add a control to the map that will allow the user to change which layers are visible:
L.control.layers(baseMaps, overlays, {
  collapsed: false
}).addTo(map);

// Retrieve the earthquake GeoJSON data:
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

// Return the style data for each of the earthquakes we plot on the map. 
// Pass the magnitude of the earthquake into two separate functions to calculate the color and radius:
function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }
// Determine the color of the circle based on the magnitude of the earthquake:
function getColor(magnitude) {
    if (magnitude > 5) {
      return "#ea2c2c";
    }
    if (magnitude > 4) {
      return "#ea822c";
    }
    if (magnitude > 3) {
      return "#ee9c00";
    }
    if (magnitude > 2) {
      return "#eecc00";
    }
    if (magnitude > 1) {
      return "#d4ee00";
    }
    return "#98ee00";
  }

// Determine the radius of the earthquake marker based on its magnitude.
// Earthquakes with a magnitude of 0 will be plotted with a radius of 1:
function getRadius(magnitude) {
	if (magnitude === 0) {
	  return 1;
	}
	return magnitude * 4;
  }

// Create a GeoJSON layer with the retrieved data:
L.geoJson(data, {
// Turn each feature into a circleMarker on the map:
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
      },
// Set the style for each circleMarker using the styleInfo function:
  style: styleInfo,
// Create a popup for each circleMarker to display the magnitude and
// location of the earthquake after the marker has been created and styled:
    onEachFeature: function(feature, layer) {
    layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
  }
}).addTo(earthquakes);

// Add the earthquake layer to the map:
    earthquakes.addTo(map);
});
// Create a legend control object.
let legend = L.control({
    position: "bottomright"
  });

// Add all the details for the legend:
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    const magnitudes = [0, 1, 2, 3, 4, 5];
    const colors = [
    "#98ee00",
    "#d4ee00",
    "#eecc00",
    "#ee9c00",
    "#ea822c",
    "#ea2c2c"
    ];
            
// Loop through the intervals to generate a label with a colored square for each interval:
    for (var i = 0; i < magnitudes.length; i++) {
        console.log(colors[i]);
        div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
      magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
    }
    return div;
    };

// Add the legend to the map:
    legend.addTo(map);

// Grab, parse, and add tectonic plates GeoJSON data(FeatureCollection) on map object as geoJSON layer:
d3.json(platesURL).then((data) =>{
    L.geoJSON(data,{
        style: {
                opacity: 1,
                color: "pink",  
                weight: 2.7
        }
    }).addTo(tectonic);  
});
tectonic.addTo(map);