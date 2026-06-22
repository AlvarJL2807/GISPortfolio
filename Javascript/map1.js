const map = L.map('map', {
    center: [15, 5],
    zoom: 2,
    minZoom: 2,
    maxZoom: 7,
    attributionControl: true
});

map.attributionControl.setPrefix(
    'Map: Alvar Jolin-Lombardini | Data: <a href="https://unstats.un.org/" target="_blank">UN SDG Indicators</a> | Basemap: <a href="https://leafletjs.com" target="_blank" title="A JavaScript library for interactive maps">Leaflet</a>'
);


let isColorblindMode = false;

function getColor(val) {
    if (val === null || val === undefined) return '#ffffff';
    
    if (isColorblindMode) {

        if (val >= 0.5)  return '#25fd2c';  
        if (val >= 0.1)  return '#83c95e';  
        if (val > -0.1 && val < 0.1) return '#919121'; 
        if (val <= -0.5) return '#540101'; 
        if (val <= -0.1) return '#8b3b3b'; 
    } else {

        if (val >= 0.5)  return '#2ca25f';  
        if (val >= 0.1)  return '#99d8c9';  
        if (val > -0.1 && val < 0.1) return '#fffbd1'; 
        if (val <= -0.5) return '#de2d26'; 
        if (val <= -0.1) return '#fcae91'; 
    }
    
    return '#f7f4f0'; 
}

function style(feature) {
    const value = feature.properties["2015"]; 
    const noData = (value === null || value === undefined);
    return {
        fillColor: getColor(value),
        weight: 1,
        opacity: 1,
        color: '#12161a',
        fillOpacity: noData ? 0.5 : 0.85
    };
}

const info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    let countryName = props ? (props.nam_en || props.name || props.COUNTRY || props.NAME) : '';
    let dataValue = props ? props["2015"] : null;
    
    this._div.innerHTML = '<h4>Annual Forest Area Change Rate (2015)</h4>' + (props ?
        '<b>' + countryName + '</b><br />' + 
        (dataValue !== undefined && dataValue !== null ? dataValue.toFixed(2) + '%' : 'No Data Available')
        : `<small style="color: var(--text-muted); display: block; line-height: 1.4;">
            Hover over a country region to see its data.<br />
            Click to see historical trends.
        </small>`);
};

info.addTo(map);

let geojson;

function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 2,
        color: '#ffffff',
        fillOpacity: 0.95
    });
    layer.bringToFront();
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function featureClickAction(e) {
    const layer = e.target;
    const props = layer.feature.properties;
    
    let countryName = props.nam_en || props.name || props.COUNTRY || props.NAME || "Selected Country";
    let val2000 = props["2000"];
    let val2015 = props["2015"];
    
    let popupContent = `<h3>${countryName}</h3>`;
    
    if (val2000 === undefined || val2000 === null || val2015 === undefined || val2015 === null) {
        popupContent += `<p>Missing or incomplete historical data.</p>`;
    } else {
        let changeTrend = val2015 - val2000;
        let trendText = "";
        let trendClass = "";
        
        if (changeTrend > 0.01) {
            trendClass = "trend-better";
            if (val2000 >= 0) {
                trendText = "Reforestation acceleration";
            } else { 
                trendText = "Reduced forest loss";
            }
        } else if (changeTrend < -0.01) {
            trendClass = "trend-worse";
            if (val2000 >= 0) {
                trendText = "Reforestation deceleration";
            } else {
                trendText = "Increased forest loss";
            }
        } else {
            trendText = "Remained Stable";
            trendClass = "trend-stable";
        }
        
        popupContent += `
            <p><b>2000 Rate:</b> ${val2000.toFixed(2)}%</p>
            <p><b>2015 Rate:</b> ${val2015.toFixed(2)}%</p>
            <p><b>15-Year Trend:</b> <span class="${trendClass}">${trendText}</span></p>
        `;
    }
    
    map.fitBounds(layer.getBounds());
    
    L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: featureClickAction
    });
}

geojson = L.geoJson(worldForestData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);


const legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info legend');
    this.update();
    return this._div;
};


legend.update = function () {
    const sampleValues = [0.6, 0.3, 0, -0.3, -0.6],
        labels = [
            '> 0.5% (High Forest Gain)', 
            '0.1% to 0.5% (Net Gain)', 
            '-0.1% to 0.1% (Stable)', 
            '-0.5% to -0.1% (Net Loss)', 
            '< -0.5% (High Forest Loss)'
        ];

    let htmlContent = '';
    for (let i = 0; i < sampleValues.length; i++) {
        htmlContent +=
            '<i style="background:' + getColor(sampleValues[i]) + '"></i> ' + labels[i] + '<br>';
    }
    htmlContent += '<i style="background: #ffffff; opacity: 0.7;"></i> No Data Available';
    this._div.innerHTML = htmlContent;
};

legend.addTo(map);

document.getElementById('colorblindToggle').addEventListener('click', function(e) {
    isColorblindMode = !isColorblindMode;
    

    if(isColorblindMode) {
        this.classList.add('active');
        this.innerText = "Original Colors";
    } else {
        this.classList.remove('active');
        this.innerText = "High Contrast Mode";
    }
    

    geojson.setStyle(style);
    

    legend.update();
});