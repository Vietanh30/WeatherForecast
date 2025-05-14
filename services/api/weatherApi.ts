import { API_CONFIG, ENDPOINTS } from './config';

export interface WeatherResponse {
    message: string;
    data: {
        location: {
            name: string;
            region: string;
            country: string;
            lat: number;
            lon: number;
            tz_id: string;
            localtime_epoch: number;
            localtime: string;
        };
        current: {
            last_updated_epoch: number;
            last_updated: string;
            temp_c: number;
            temp_f: number;
            is_day: number;
            condition: {
                text: string;
                icon: string;
                code: number;
            };
            wind_kph: number;
            wind_dir: string;
            pressure_mb: number;
            precip_mm: number;
            humidity: number;
            cloud: number;
            feelslike_c: number;
            vis_km: number;
            uv: number;
            air_quality: {
                co: number;
                no2: number;
                o3: number;
                so2: number;
                pm2_5: number;
                pm10: number;
                'us-epa-index': number;
                'gb-defra-index': number;
            };
        };
        forecast: {
            forecastday: Array<{
                date: string;
                date_epoch: number;
                day: {
                    maxtemp_c: number;
                    mintemp_c: number;
                    avgtemp_c: number;
                    maxwind_kph: number;
                    totalprecip_mm: number;
                    avghumidity: number;
                    daily_chance_of_rain: number;
                    daily_chance_of_snow: number;
                    condition: {
                        text: string;
                        icon: string;
                        code: number;
                    };
                    uv: number;
                    air_quality?: {
                        co: number;
                        no2: number;
                        o3: number;
                        so2: number;
                        pm2_5: number;
                        pm10: number;
                        'us-epa-index': number;
                        'gb-defra-index': number;
                    };
                };
                astro: {
                    sunrise: string;
                    sunset: string;
                    moonrise: string;
                    moonset: string;
                    moon_phase: string;
                    moon_illumination: number;
                    is_moon_up: number;
                    is_sun_up: number;
                };
                hour: Array<{
                    time: string;
                    time_epoch: number;
                    temp_c: number;
                    condition: {
                        text: string;
                        icon: string;
                        code: number;
                    };
                    wind_kph: number;
                    humidity: number;
                    feelslike_c: number;
                    chance_of_rain: number;
                    chance_of_snow: number;
                    air_quality?: {
                        co: number;
                        no2: number;
                        o3: number;
                        so2: number;
                        pm2_5: number;
                        pm10: number;
                        'us-epa-index': number;
                        'gb-defra-index': number;
                    };
                }>;
            }>;
        };
    };
}

export interface MarineWeatherResponse {
    message: string;
    data: {
        location: {
            name: string;
            region: string;
            country: string;
            lat: number;
            lon: number;
            tz_id: string;
            localtime_epoch: number;
            localtime: string;
        };
        marine: {
            time: string;
            wave_height_m: number;
            wave_period_sec: number;
            wave_direction: string;
            water_temp_c: number;
            wind_speed_kph: number;
            wind_direction: string;
            visibility_km: number;
        };
    };
}

export interface AstronomyResponse {
    message: string;
    data: {
        location: {
            name: string;
            region: string;
            country: string;
            lat: number;
            lon: number;
            tz_id: string;
            localtime_epoch: number;
            localtime: string;
        };
        astronomy: {
            astro: {
                sunrise: string;
                sunset: string;
                moonrise: string;
                moonset: string;
                moon_phase: string;
                moon_illumination: number;
                is_moon_up: number;
                is_sun_up: number;
            }
        }
    }
}

export interface WeatherAlertsResponse {
    message: string;
    data: {
        location: {
            name: string;
            region: string;
            country: string;
            lat: number;
            lon: number;
            tz_id: string;
            localtime_epoch: number;
            localtime: string;
        };
        alerts: {
            alert: Array<{
                headline: string;
                msgtype: string;
                severity: string;
                urgency: string;
                areas: string;
                category: string;
                certainty: string;
                event: string;
                note: string;
                effective: string;
                expires: string;
                desc: string;
                instruction: string;
            }>;
        };
    };
}

export interface AirQualityResponse {
    message: string;
    data: {
        location: {
            name: string;
            region: string;
            country: string;
            lat: number;
            lon: number;
            tz_id: string;
            localtime_epoch: number;
            localtime: string;
        };
        current: {
            air_quality: {
                co: number;
                no2: number;
                o3: number;
                so2: number;
                pm2_5: number;
                pm10: number;
                'us-epa-index': number;
                'gb-defra-index': number;
            };
        };
    };
}

export interface SevenDayForecastResponse {
    message: string;
    data: {
        location: {
            name: string;
            country: string;
            coord: {
                lat: number;
                lon: number;
            };
        };
        forecast: Array<{
            dt: number;
            dt_txt: string;
            main: {
                temp: number;
                feels_like: number;
                temp_min: number;
                temp_max: number;
                humidity: number;
            };
            weather: Array<{
                id?: number;
                main: string;
                description: string;
                icon?: string;
            }>;
            wind: {
                speed: number;
                deg: number;
            };
            pop: number;
            clouds: {
                all: number;
            };
            visibility: number;
        }>;
        notice: string;
    };
}

export interface WeatherNotification {
    id: string;
    type: string;
    severity: string;
    title: string;
    description: string;
    area: string;
    startTime: string;
    endTime: string;
    source: string;
    instructions: string;
}

export interface WeatherNotificationsResponse {
    message: string;
    data: {
        alerts: WeatherNotification[];
        total: number;
        location: {
            name: string;
            country: string;
        };
    };
}

export interface NotificationSubscriptionResponse {
    success: boolean;
    message: string;
    data?: {
        deviceId: string;
        location: string;
        severity: string;
        types: string[];
    };
    error?: string;
}

export interface WeatherNotificationDetail {
    id: string;
    type: string;
    severity: string;
    title: string;
    description: string;
    area: string;
    startTime: string;
    endTime: string;
    source: string;
    instructions: string;
    additional_info: {
        risk_analysis: {
            level: string;
            description: string;
        };
        prevention_measures: string[];
        affected_groups: string[];
        high_risk_areas: string[];
        impact_time: {
            start: string;
            peak: string;
            end: string;
        };
        reliable_sources: string[];
        emergency_contacts: string[];
    };
}

export interface WeatherNotificationDetailResponse {
    message: string;
    data: WeatherNotificationDetail;
}

export const weatherApi = {
    getCurrentWeather: async (location: string, lat?: number, lon?: number): Promise<WeatherResponse> => {
        try {
            const locationParam = `lat=${lat}&lon=${lon}`;
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.CURRENT}?${locationParam}&aqi=yes&lang=vi`;

            // console.log('Fetching current weather from URL:', url);

            const response = await fetch(url);
            // console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Current weather error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText,
                    url: url
                });
                throw new Error(`Failed to fetch current weather data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            // console.log('Current weather data received successfully');
            return data;
        } catch (error) {
            console.error('Current weather error details:', {
                error: error,
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw new Error('Failed to fetch current weather data');
        }
    },

    getForecast: async (location: string, days: number = 3, lat?: number, lon?: number): Promise<WeatherResponse> => {
        try {
            const locationParam = lat && lon ? `${lat},${lon}` : location;
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.FORECAST}?location=${encodeURIComponent(locationParam)}&days=${days}&lang=vi`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Forecast error response:', errorText);
                throw new Error(`Failed to fetch forecast data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Forecast error details:', error);
            throw new Error('Failed to fetch forecast data');
        }
    },

    getFutureWeather: async (location: string, date: string, lat?: number, lon?: number): Promise<WeatherResponse> => {
        try {
            const locationParam = lat && lon ? `${lat},${lon}` : location;
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.FUTURE}?location=${encodeURIComponent(locationParam)}&date=${date}&lang=vi`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Future weather error response:', errorText);
                throw new Error(`Failed to fetch future weather data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Future weather error details:', error);
            throw new Error('Failed to fetch future weather data');
        }
    },

    getMarineWeather: async (location: string, lat?: number, lon?: number): Promise<MarineWeatherResponse> => {
        try {
            const locationParam = lat && lon ? `${lat},${lon}` : location;
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.MARINE}?location=${encodeURIComponent(locationParam)}&lang=vi`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Marine weather error response:', errorText);
                throw new Error(`Failed to fetch marine weather data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Marine weather error details:', error);
            throw new Error('Failed to fetch marine weather data');
        }
    },

    getAstronomy: async (location: string, date?: string, lat?: number, lon?: number): Promise<AstronomyResponse> => {
        try {
            const locationParam = lat && lon ? `${lat},${lon}` : location;
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.ASTRONOMY}?location=${encodeURIComponent(locationParam)}${date ? `&date=${date}` : ''}&lang=vi`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Astronomy error response:', errorText);
                throw new Error(`Failed to fetch astronomy data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Astronomy error details:', error);
            throw new Error('Failed to fetch astronomy data');
        }
    },

    getTimeZone: async (location: string, lat?: number, lon?: number): Promise<any> => {
        try {
            const locationParam = lat && lon ? `${lat},${lon}` : location;
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.TIMEZONE}?location=${encodeURIComponent(locationParam)}&lang=vi`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Time zone error response:', errorText);
                throw new Error(`Failed to fetch time zone data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Time zone error details:', error);
            throw new Error('Failed to fetch time zone data');
        }
    },

    getWeatherAlerts: async (location: string, lat?: number, lon?: number): Promise<WeatherAlertsResponse> => {
        try {
            const locationParam = lat && lon ? `${lat},${lon}` : location;
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.ALERTS}?location=${encodeURIComponent(locationParam)}&lang=vi`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Weather alerts error response:', errorText);
                throw new Error(`Failed to fetch weather alerts data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Weather alerts error details:', error);
            throw new Error('Failed to fetch weather alerts data');
        }
    },

    getAirQuality: async (location: string, lat?: number, lon?: number): Promise<AirQualityResponse> => {
        try {
            const locationParam = lat && lon ? `${lat},${lon}` : location;
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.AIR_QUALITY}?location=${encodeURIComponent(locationParam)}&lang=vi`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Air quality error response:', errorText);
                throw new Error(`Failed to fetch air quality data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Air quality error details:', error);
            throw new Error('Failed to fetch air quality data');
        }
    },

    getSevenDayForecast: async (location: string, lat?: number, lon?: number): Promise<SevenDayForecastResponse> => {
        try {
            const locationParam = `lat=${lat}&lon=${lon}`;
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.FORECAST_7DAYS}?${locationParam}&lang=vi`;
            console
            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('7-day forecast error response:', errorText);
                throw new Error(`Failed to fetch 7-day forecast data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('7-day forecast error details:', error);
            throw new Error('Failed to fetch 7-day forecast data');
        }
    },

    getWeatherNotifications: async (
        location?: string,
        lat?: number,
        lon?: number,
        severity?: string,
        type?: string,
        area?: string
    ): Promise<WeatherNotificationsResponse> => {
        try {
            let url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.NOTIFICATIONS}`;
            const params = new URLSearchParams();

            if (location) params.append('location', location);
            if (lat) params.append('lat', lat.toString());
            if (lon) params.append('lon', lon.toString());
            if (severity) params.append('severity', severity);
            if (type) params.append('type', type);
            if (area) params.append('area', area);

            url += `?${params.toString()}`;
            console.log(url);

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(response);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Weather notifications error response:', errorText);
                throw new Error(`Failed to fetch weather notifications: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Weather notifications error details:', error);
            throw new Error('Failed to fetch weather notifications');
        }
    },

    subscribeToNotifications: async (deviceId: string): Promise<NotificationSubscriptionResponse> => {
        try {
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.NOTIFICATIONS_SUBSCRIBE}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ deviceId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Subscribe error response:', errorText);
                throw new Error(`Failed to subscribe to notifications: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Subscribe error details:', error);
            throw new Error('Failed to subscribe to notifications');
        }
    },

    unsubscribeFromNotifications: async (deviceId: string): Promise<NotificationSubscriptionResponse> => {
        try {
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.NOTIFICATIONS_UNSUBSCRIBE}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ deviceId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Unsubscribe error response:', errorText);
                throw new Error(`Failed to unsubscribe from notifications: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Unsubscribe error details:', error);
            throw new Error('Failed to unsubscribe from notifications');
        }
    },

    getWeatherNotificationDetail: async (id: string): Promise<WeatherNotificationDetailResponse> => {
        try {
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.WEATHER.NOTIFICATIONS}/${id}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Weather notification detail error response:', errorText);
                throw new Error(`Failed to fetch weather notification detail: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Weather notification detail error details:', error);
            throw new Error('Failed to fetch weather notification detail');
        }
    }
};