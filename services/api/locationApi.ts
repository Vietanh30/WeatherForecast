import { API_CONFIG, ENDPOINTS } from './config';

export interface LocationResponse {
    features: Array<{
        properties: {
            place_id: string;
            formatted: string;
            lat: number;
            lon: number;
            city?: string;
            state?: string;
            country?: string;
        };
    }>;
}

export const locationApi = {
    searchLocation: async (query: string): Promise<LocationResponse> => {
        try {
            const response = await fetch(
                `${API_CONFIG.GEOAPIFY_URL}${ENDPOINTS.GEOAPIFY.SEARCH}?text=${encodeURIComponent(query)}&lang=vi&limit=10&apiKey=${API_CONFIG.API_KEYS.GEOAPIFY}`
            );
            if (!response.ok) {
                throw new Error('Location search failed');
            }
            return await response.json();
        } catch (error) {
            throw new Error('Failed to search location');
        }
    },

    getLocationFromCoords: async (lat: number, lon: number): Promise<LocationResponse> => {
        try {
            const response = await fetch(
                `${API_CONFIG.GEOAPIFY_URL}${ENDPOINTS.GEOAPIFY.REVERSE}?lat=${lat}&lon=${lon}&lang=vi&apiKey=${API_CONFIG.API_KEYS.GEOAPIFY}`
            );
            if (!response.ok) {
                throw new Error('Reverse geocoding failed');
            }
            return await response.json();
        } catch (error) {
            throw new Error('Failed to get location from coordinates');
        }
    }
}; 