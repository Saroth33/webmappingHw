function markerSize(feature) {
  return Math.sqrt(Math.abs(feature.properties.mag)) * 4;
}

var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

var baseMaps = {
  "Outdoors": outdoorsMap
};

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var platesPath = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

var colors = ["#07DF57", "#ABFF57", "#F2FF2F", "#FFBA2F", "#FF535F", "#E1000F"]
function fillColor(feature) {
  var mag = feature.properties.mag;
  if (mag <= 1) {
    return colors[0]
  }
  else if (mag <= 2) {
    return colors[1]
  }
  else if (mag <= 3) {
    return colors[2]
  }
  else if (mag <= 4) {
    return colors[3]
  }
  else if (mag <= 5) {
    return colors[4]
  }
  else {
    return colors[5]
  }
}

d3.json(queryUrl, function (data) {
  console.log(data);

  var earthquakes = L.geoJSON(data, {

    pointToLayer: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius: 3,
        stroke: false,
        radius: markerSize(feature),
        fillColor: fillColor(feature),
        weight: 5,
        opacity: .5,
        fillOpacity: .9
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    },

    onEachFeature: function (feature, layer) {
      return layer.bindPopup(`<strong>Place:</strong> ${feature.properties.place}<br><strong>Magnitude:</strong> ${feature.properties.mag}`);
    }
  });

  var overlayMaps = {
    "Earthquakes": earthquakes,
  };

  var map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [outdoorsMap, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var limits = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
    var labelsColor = [];
    var labelsText = [];

    limits.forEach(function (limit, index) {
      labelsColor.push(`<li style="background-color: ${colors[index]};"></li>`);
      labelsText.push(`<span class="legend-label">${limits[index]}</span>`)
    });

    var labelsColorHtml = "<ul>" + labelsColor.join("") + "</ul>";
    var labelsTextHtml = `<div id="labels-text">${labelsText.join("<br>")}</div>`;

    var legendInfo = "<h4>Earthquake<br>Magnitude</h4>" +
      "<div class=\"labels\">" + labelsColorHtml + labelsTextHtml
    "</div>";
    div.innerHTML = legendInfo;

    return div;
  };

  legend.addTo(map);
})
