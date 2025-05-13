import Constants from 'expo-constants';

// Lấy các biến môi trường từ app.config.js hoặc app.json
const extra = Constants.expoConfig?.extra || {};

export const API_CONFIG = {
    BASE_URL: 'http://192.168.1.198:8000/api',
    GEOAPIFY_URL: 'https://api.geoapify.com/v1',
    API_KEYS: {
        WEATHER: extra.WEATHERAPI_KEY || 'YOUR_WEATHER_API_KEY',
        GEOAPIFY: extra.GEOAPIFY_KEY || '4d8e69d77ca943a7b1f0c2b137983440' // Fallback key
    }
};

// Log để debug
console.log('API Config:', {
    BASE_URL: API_CONFIG.BASE_URL,
    WEATHER_KEY: API_CONFIG.API_KEYS.WEATHER ? 'Set' : 'Not Set',
    GEOAPIFY_KEY: API_CONFIG.API_KEYS.GEOAPIFY ? 'Set' : 'Not Set'
});

export const ENDPOINTS = {
    WEATHER: {
        CURRENT: '/weather/current',
        FORECAST: '/weather/forecast',
        FORECAST_7DAYS: '/weather/forecast/7days',
        FUTURE: '/weather/future',
        MARINE: '/weather/marine',
        ASTRONOMY: '/weather/astronomy',
        TIMEZONE: '/weather/timezone',
        ALERTS: '/weather/alerts',
        AIR_QUALITY: '/weather/air-quality'
    },
    CHAT: {
        SEND: '/chat',
        HISTORY: '/chat/history'
    },
    GEOAPIFY: {
        SEARCH: '/geocode/search',
        REVERSE: '/geocode/reverse'
    }
}; 