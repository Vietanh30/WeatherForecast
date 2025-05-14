import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { weatherApi } from '../../services/api';

const STORAGE_KEY = 'saved_locations';

export default function LocationPreviewScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [weatherData, setWeatherData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWeatherData();
    }, []);

    const fetchWeatherData = async () => {
        try {
            setLoading(true);
            const lat = params.lat?.toString() || '21.0285';
            const lon = params.lon?.toString() || '105.8542';
            const locationName = params.display_name?.toString().split(',')[0] || 'Hà Nội';

            // Get current weather
            const currentWeather = await weatherApi.getCurrentWeather(
                locationName,
                parseFloat(lat),
                parseFloat(lon)
            );
            const currentWeatherData = currentWeather.data;
            if (!currentWeatherData || !currentWeatherData.current || !currentWeatherData.location) {
                throw new Error('Invalid current weather data received');
            }

            // Get forecast and astronomy
            const [forecast, weeklyForecast, astronomy] = await Promise.all([
                weatherApi.getForecast(
                    locationName,
                    1,
                    currentWeatherData.location.lat,
                    currentWeatherData.location.lon
                ),
                weatherApi.getSevenDayForecast(
                    locationName,
                    currentWeatherData.location.lat,
                    currentWeatherData.location.lon
                ),
                weatherApi.getAstronomy(
                    locationName,
                    new Date().toISOString().split('T')[0],
                    currentWeatherData.location.lat,
                    currentWeatherData.location.lon
                )
            ]);

            const forecastData = forecast.data;
            const weeklyForecastData = weeklyForecast.data;
            const astronomyData = astronomy.data;

            if (!forecastData || !forecastData.forecast || !forecastData.forecast.forecastday) {
                throw new Error('Invalid forecast data received');
            }

            if (!weeklyForecastData || !weeklyForecastData.forecast) {
                throw new Error('Invalid weekly forecast data received');
            }

            if (!astronomyData || !astronomyData.astronomy) {
                throw new Error('Invalid astronomy data received');
            }

            // Transform data to match backend schema
            const transformedData = {
                location: {
                    name: locationName,
                    latitude: currentWeatherData.location.lat,
                    longitude: currentWeatherData.location.lon
                },
                current: {
                    city: locationName,
                    latitude: currentWeatherData.location.lat,
                    longitude: currentWeatherData.location.lon,
                    temperature: currentWeatherData.current.temp_c,
                    feelsLike: currentWeatherData.current.feelslike_c,
                    description: currentWeatherData.current.condition?.text || 'Unknown',
                    humidity: currentWeatherData.current.humidity,
                    windSpeed: currentWeatherData.current.wind_kph,
                    windDir: currentWeatherData.current.wind_dir,
                    uvIndex: currentWeatherData.current.uv,
                    rain_mm: currentWeatherData.current.precip_mm,
                    pressure_mb: currentWeatherData.current.pressure_mb,
                    visibility_km: currentWeatherData.current.vis_km,
                    time: new Date(currentWeatherData.current.last_updated_epoch * 1000),
                    source: 'current'
                },
                astronomy: {
                    city: locationName,
                    latitude: currentWeatherData.location.lat,
                    longitude: currentWeatherData.location.lon,
                    date: new Date(currentWeatherData.location.localtime_epoch * 1000),
                    sunrise: astronomyData.astronomy.astro.sunrise,
                    sunset: astronomyData.astronomy.astro.sunset,
                    moonrise: astronomyData.astronomy.astro.moonrise,
                    moonset: astronomyData.astronomy.astro.moonset,
                    moon_phase: astronomyData.astronomy.astro.moon_phase,
                    moon_illumination: astronomyData.astronomy.astro.moon_illumination,
                    is_moon_up: astronomyData.astronomy.astro.is_moon_up,
                    is_sun_up: astronomyData.astronomy.astro.is_sun_up
                },
                hourlyForecast: forecastData.forecast.forecastday[0].hour.map((hour: any) => ({
                    time: new Date(hour.time_epoch * 1000),
                    temp_c: hour.temp_c,
                    condition: {
                        text: hour.condition?.text || 'Unknown',
                        icon: hour.condition?.icon || '',
                        code: hour.condition?.code || 0
                    },
                    wind_kph: hour.wind_kph || 0,
                    humidity: hour.humidity || 0,
                    feelslike_c: hour.feelslike_c || 0,
                    chance_of_rain: hour.chance_of_rain || 0,
                    chance_of_snow: hour.chance_of_snow || 0,
                    air_quality: hour.air_quality || {}
                })),
                weeklyForecast: weeklyForecastData.forecast.map((day: any) => ({
                    date: new Date(day.dt * 1000),
                    temp: day.main.temp,
                    feels_like: day.main.feels_like,
                    temp_min: day.main.temp_min,
                    temp_max: day.main.temp_max,
                    humidity: day.main.humidity,
                    condition: {
                        text: day.weather[0].description,
                        icon: day.weather[0].icon || '',
                        code: day.weather[0].id || 0
                    },
                    wind_kph: day.wind.speed,
                    wind_dir: day.wind.deg,
                    chance_of_rain: day.pop,
                    clouds: day.clouds.all,
                    visibility: day.visibility
                }))
            };

            setWeatherData(transformedData);
            setError(null);
        } catch (err) {
            console.error('Error fetching weather data:', err);
            if (err instanceof Error) {
                console.error('Error details:', {
                    message: err.message,
                    stack: err.stack
                });
            }
            setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu thời tiết');
        } finally {
            setLoading(false);
        }
    };

    const handleAddLocation = async () => {
        try {
            const locationData = {
                place_id: params.place_id,
                display_name: params.display_name,
                lat: params.lat,
                lon: params.lon
            };

            const savedLocations = await AsyncStorage.getItem(STORAGE_KEY);
            const locations = savedLocations ? JSON.parse(savedLocations) : [];
            const newLocations = [locationData, ...locations.filter((loc: any) => loc.place_id !== locationData.place_id)];

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLocations));
            router.push('/searchLocation');
        } catch (err) {
            setError('Không thể lưu địa điểm');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/searchLocation')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.cityName}>
                        {params.display_name?.toString().split(',')[0]}
                    </Text>
                    <Text style={styles.fullAddress}>
                        {params.display_name}
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Current Weather */}
                <View style={styles.weatherCard}>
                    <Text style={styles.temperature}>
                        {Math.round(weatherData?.current.temperature)}°
                    </Text>
                    <Text style={styles.weatherDescription}>
                        {weatherData?.current.description}
                    </Text>
                    <View style={styles.weatherDetails}>
                        <View style={styles.weatherDetail}>
                            <Ionicons name="water-outline" size={24} color="#888" />
                            <Text style={styles.detailText}>{weatherData?.current.humidity}%</Text>
                        </View>
                        <View style={styles.weatherDetail}>
                            <Ionicons name="thermometer-outline" size={24} color="#888" />
                            <Text style={styles.detailText}>{Math.round(weatherData?.current.feelsLike)}°</Text>
                        </View>
                        <View style={styles.weatherDetail}>
                            <Ionicons name="speedometer-outline" size={24} color="#888" />
                            <Text style={styles.detailText}>{Math.round(weatherData?.current.windSpeed)} km/h</Text>
                        </View>
                    </View>
                </View>

                {/* Forecast */}
                <View style={styles.forecastCard}>
                    <Text style={styles.forecastTitle}>
                        Dự báo 3 ngày
                    </Text>
                    {weatherData?.weeklyForecast.slice(0, 3).map((day: any, index: number) => (
                        <View key={index} style={styles.forecastItem}>
                            <Text style={styles.forecastDay}>Ngày {index + 1}</Text>
                            <Text style={styles.forecastWeather}>{day.condition.text}</Text>
                            <Text style={styles.forecastTemp}>{Math.round(day.temp_max)}°</Text>
                            <Text style={styles.forecastTempNight}>{Math.round(day.temp_min)}°</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Add Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddLocation}
                >
                    <Text style={styles.buttonText}>
                        Thêm vào danh sách
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#101223",
    },
    header: {
        paddingTop: 48,
        paddingHorizontal: 16,
        paddingBottom: 16,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 48,
        left: 16,
        zIndex: 10,
    },
    headerContent: {
        alignItems: 'center',
    },
    cityName: {
        color: "#fff",
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    fullAddress: {
        color: "#888",
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    weatherCard: {
        padding: 20,
        backgroundColor: '#23243a',
        margin: 16,
        borderRadius: 24,
    },
    temperature: {
        color: "#fff",
        fontSize: 48,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    weatherDescription: {
        color: "#888",
        fontSize: 16,
        textAlign: 'center',
        marginTop: 8,
    },
    weatherDetails: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    weatherDetail: {
        alignItems: 'center',
    },
    detailText: {
        color: "#888",
        marginTop: 4,
    },
    forecastCard: {
        padding: 20,
        backgroundColor: '#23243a',
        margin: 16,
        borderRadius: 24,
    },
    forecastTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    forecastItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    forecastDay: {
        color: "#fff",
        flex: 1,
    },
    forecastWeather: {
        color: "#888",
        marginRight: 16,
    },
    forecastTemp: {
        color: "#fff",
    },
    forecastTempNight: {
        color: "#888",
        marginLeft: 8,
    },
    buttonContainer: {
        padding: 16,
        backgroundColor: '#23243a',
    },
    addButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
}); 