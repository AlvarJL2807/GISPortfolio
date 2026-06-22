const map = L.map('map', {
    center: [52.0907, 5.1214], 
    zoom: 12,
    minZoom: 2,
    maxZoom: 16,
    attributionControl: true
});


L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

map.attributionControl.setPrefix(
    'Map: Alvar Jolin-Lombardini | Data: OpenStreetMap <a href="https://openstreetmap.org" target="_blank">| Basemap: <a href="https://leafletjs.com" target="_blank">Leaflet</a>'
);


L.control.scale({
    metric: true,
    imperial: false,
    position: 'bottomright'
}).addTo(map);


for (let i = 1; i <= 5; i++) {
    const paneName = 'pane-' + i + 'min';
    map.createPane(paneName);
    map.getPane(paneName).style.zIndex = (607 - i).toString();
    map.getPane(paneName).style.pointerEvents = 'auto'; 
}

const colors = {
    fire: ['#b30000', '#e34a33', '#fc8d59', '#fdbb84', '#fdd49e'],
    police: ['#045a8d', '#2b8cbe', '#74a9cf', '#bdc9e1', '#f1eef6']
};

function getStyle(feature, agency) {
    const time = feature.properties.AA_MINS;
    if (!time || time < 1 || time > 5) return { fillColor: '#fff', opacity: 0 };
    
    return {
        pane: 'pane-' + time + 'min', 
        fillColor: colors[agency][time - 1],
        weight: 1.5,
        opacity: 0.7,
        color: '#ffffff',
        fillOpacity: 0.45
    };
}


function forEveryIsochroneCircle(feature, layer, agency) {
    const travelTime = feature.properties.AA_MINS;
    const serviceName = agency === 'police' ? 'Police Department' : 'Fire Department';

    layer.on({
        mouseover: function(e) {
            const activeLayer = e.target;
            activeLayer.setStyle({
                weight: 2.5,
                color: '#ffffff',
                fillOpacity: 0.65
            });
            activeLayer.bringToFront();
        },
        mouseout: function(e) {
            if (agency === 'fire') fireLayer.resetStyle(e.target);
            if (agency === 'police') policeLayer.resetStyle(e.target);
        }
    });

    layer.bindPopup(`
        <div style="font-family: Arial, sans-serif; padding: 2px; color: #ffffff;">
            <strong style="color: #ffffff; font-size: 14px;">${serviceName} Range</strong>
            <hr style="margin: 5px 0; border: 0; border-top: 1px solid #444;"/>
            Response Time: <strong style="color: #ffffff;">Within ${travelTime} minute(s).</strong>
        </div>
    `);
}


let fireLayer = L.layerGroup();
let policeLayer = L.layerGroup();

if (typeof fireData !== 'undefined') {
    fireLayer = L.geoJSON(fireData, {
        style: function(feature) { return getStyle(feature, 'fire'); },
        onEachFeature: function(feature, layer) { forEveryIsochroneCircle(feature, layer, 'fire'); }
    }).addTo(map);
}

if (typeof policeData !== 'undefined') {
    policeLayer = L.geoJSON(policeData, {
        style: function(feature) { return getStyle(feature, 'police'); },
        onEachFeature: function(feature, layer) { forEveryIsochroneCircle(feature, layer, 'police'); }
    }).addTo(map);
}

const overlayMaps = {
    "Fire Isochrones": fireLayer,
    "Police Isochrones": policeLayer
};
L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

const legend = L.control({position: 'bottomleft'});
legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    let htmlContent = '<strong style="color: #ffffff;">Response Intervals</strong><br>';
    
    htmlContent += '<br><small style="color: #f87171; font-weight:bold;">Fire Stations</small><br>';
    for (let i = 0; i < 5; i++) {
        htmlContent += `<i style="background: ${colors.fire[i]}"></i> ${i + 1} min<br>`;
    }
    
    htmlContent += '<br><small style="color: #60a5fa; font-weight:bold;">Police Stations</small><br>';
    for (let i = 0; i < 5; i++) {
        htmlContent += `<i style="background: ${colors.police[i]}"></i> ${i + 1} min<br>`;
    }
    
    div.innerHTML = htmlContent;
    return div;
};
legend.addTo(map);
