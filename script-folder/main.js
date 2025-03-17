import { mapSettings } from './mapConfig.js';
import { mapData, updateMapDataFromUnesco } from './data.js';
import { infrastructureConfig, educationConfig } from './particles-config.js';

let map;
let geojsonLayer;

function getColor(value) {
    if (value === null || value === undefined) return '#808080'; 
    if (value > 4.5) return '#d7191c';
    if (value > 3.5) return '#fdae61';  
    if (value > 2.5) return '#ffffbf';  
    if (value > 1.5) return '#a6d96a';  
    return '#1a9641';                    
}

function initMap() {
    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        setTimeout(initMap, 100);
        return;
    }

    try {
        // Initialize map with print-optimized settings
        map = L.map('map', {
            ...mapSettings.initial,
            preferCanvas: true,
            renderer: L.canvas({
                padding: 0.5,
                tolerance: 10
            }),
            printable: true,
            scrollWheelZoom: false,
            attributionControl: true,
            zoomControl: true
        });

        // Create print-optimized tile layer
        const tileLayer = L.tileLayer(mapSettings.tileLayer.url, {
            ...mapSettings.tileLayer.options,
            subdomains: 'abc',
            detectRetina: true,
            printable: true,
            crossOrigin: true
        });

        tileLayer.addTo(map);

        // Load GeoJSON data immediately
        fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
            .then(response => response.json())
            .then(data => {
                window.geoJsonData = data;
                updateAndDisplayData();
            })
            .catch(error => {
                console.error('Error loading GeoJSON:', error);
                displayMarkers();
            });

    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

async function updateAndDisplayData() {
    try {
        await updateMapDataFromUnesco();
        const geojsonData = window.geoJsonData || await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson').then(r => r.json());
        displayCountries(geojsonData);
        hideLoading();
    } catch (error) {
        console.error('Error updating map data:', error);
        hideLoading();
        showError();
        displayMarkers();
    }
}

function displayCountries(geojsonData) {
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }

    geojsonLayer = L.geoJSON(geojsonData, {
        style: function(feature) {
            const countryName = feature.properties.ADMIN;
            const countryData = mapData.find(d => d[2] === countryName);
            const value = countryData ? countryData[3] : null;

            return {
                fillColor: getColor(value),
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            };
        },
        onEachFeature: function(feature, layer) {
            const countryName = feature.properties.ADMIN;
            const countryData = mapData.find(d => d[2] === countryName);
            
            if (countryData) {
                const popupContent = `
                    <strong>${countryName}</strong><br>
                    Need Level: ${countryData[3].toFixed(1)}<br>
                    ${countryData[4]}
                `;
                layer.bindPopup(popupContent);
            }
        }
    }).addTo(map);
}

function initParticles(isEducation = false) {
    if (typeof particlesJS === 'undefined') {
        console.error('Particles.js not loaded');
        return;
    }

    const color = isEducation ? '#3498db' : '#0078d4';
    
    particlesJS('particles-infrastructure', {
        particles: {
            number: { 
                value: window.innerWidth < 768 ? 50 : 100, 
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: { value: color },
            shape: { type: 'circle' },
            opacity: {
                value: 0.2,
                random: true,
                anim: {
                    enable: false
                }
            },
            size: {
                value: 2,
                random: true,
                anim: {
                    enable: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: color,
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: false
                },
                onclick: {
                    enable: false
                },
                resize: true
            }
        },
        retina_detect: true
    });
}

function displayMarkers() {
    // Clear existing markers if any
    map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    // Add new markers
    mapData.forEach(([lat, lon, country, value, description]) => {
        const marker = L.circleMarker([lat, lon], {
            radius: 8,
            fillColor: getColor(value),
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`
            <strong>${country}</strong><br>
            Need Level: ${value.toFixed(1)}<br>
            ${description}
        `);
    });
}

function showLoading() {
    const mapContainer = document.querySelector('.map-container');
    if (!document.getElementById('map-loader')) {
        const loader = document.createElement('div');
        loader.id = 'map-loader';
        loader.innerHTML = 'Loading UNESCO data...';
        loader.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.9);
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
        `;
        mapContainer.appendChild(loader);
    }
}

function hideLoading() {
    const loader = document.getElementById('map-loader');
    if (loader) {
        loader.remove();
    }
}

function showError() {
    const mapContainer = document.querySelector('.map-container');
    const error = document.createElement('div');
    error.innerHTML = 'Error loading UNESCO data. Showing fallback data.';
    error.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
    `;
    mapContainer.appendChild(error);
    setTimeout(() => error.remove(), 5000);
}

// Update the initializeParticles function
function initializeParticles() {
    if (typeof particlesJS === 'undefined') {
        console.error('Particles.js not loaded');
        return;
    }

    particlesJS('particles-infrastructure', infrastructureConfig);

    const statsSwitch = document.getElementById('stats-switch');
    const switchLabels = document.querySelectorAll('.switch-label');
    const infrastructureStats = document.querySelector('.infrastructure-stats');
    const educationStats = document.querySelector('.education-stats');
    const particlesContainer = document.getElementById('particles-infrastructure');

    // Set initial state
    infrastructureStats.style.display = 'block';
    educationStats.style.display = 'none';
    infrastructureStats.classList.add('active');
    statsSwitch.checked = false;
    switchLabels[0].classList.add('active');
    switchLabels[1].classList.remove('active');

    let isAnimating = false;

    statsSwitch.addEventListener('change', function() {
        if (isAnimating) return;
        isAnimating = true;

        switchLabels.forEach(label => label.classList.toggle('active'));
        particlesContainer.classList.add('transitioning');

        const currentStats = this.checked ? infrastructureStats : educationStats;
        const newStats = this.checked ? educationStats : infrastructureStats;
        const newConfig = this.checked ? educationConfig : infrastructureConfig;

        // Start transition
        currentStats.classList.remove('active');
        
        setTimeout(() => {
            // After fade out
            currentStats.style.display = 'none';
            newStats.style.display = 'block';
            
            // Force browser reflow
            void newStats.offsetWidth;
            
            // Update particles and show new content
            particlesJS('particles-infrastructure', newConfig);
            newStats.classList.add('active');
            
            setTimeout(() => {
                particlesContainer.classList.remove('transitioning');
                isAnimating = false;
            }, 500);
        }, 500);
    });
}

// Update the DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', () => {
    initializeParticles();
    setTimeout(initMap, 100);
});

// Ensure DOM is loaded before initializing
window.addEventListener('load', () => {
    setTimeout(initMap, 500); 
});
