export const mapSettings = {
    initial: {
        center: [20, 0],
        zoom: 2,
        bounds: [
            [-90, -180], 
            [90, 180]   
        ]
    },
    style: {
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    },
    tileLayer: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        options: { 
            noWrap: true,
            opacity: 0.5 
        }
    }
};