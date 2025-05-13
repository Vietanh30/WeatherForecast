import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            // Gọi API thời tiết ở đây
            // Tạm thời dùng dữ liệu mẫu
            setWeatherData({
                current: {
                    temp: 28,
                    feels_like: 30,
                    humidity: 75,
                    wind_speed: 5,
                    weather: [{ main: 'Clouds', description: 'nhiều mây' }]
                },
                daily: [
                    { temp: { day: 28, night: 24 }, weather: [{ main: 'Clouds' }] },
                    { temp: { day: 29, night: 25 }, weather: [{ main: 'Clear' }] },
                    { temp: { day: 27, night: 23 }, weather: [{ main: 'Rain' }] }
                ]
            });
        } catch (err) {
            setError('Không thể tải dữ liệu thời tiết');
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
            <View style={styles.container}>
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
                        {weatherData?.current.temp}°
                    </Text>
                    <Text style={styles.weatherDescription}>
                        {weatherData?.current.weather[0].description}
                    </Text>
                    <View style={styles.weatherDetails}>
                        <View style={styles.weatherDetail}>
                            <Ionicons name="water-outline" size={24} color="#888" />
                            <Text style={styles.detailText}>{weatherData?.current.humidity}%</Text>
                        </View>
                        <View style={styles.weatherDetail}>
                            <Ionicons name="speedometer-outline" size={24} color="#888" />
                            <Text style={styles.detailText}>{weatherData?.current.feels_like}°</Text>
                        </View>
                        <View style={styles.weatherDetail}>
                            <Ionicons name="airplane-outline" size={24} color="#888" />
                            <Text style={styles.detailText}>{weatherData?.current.wind_speed}m/s</Text>
                        </View>
                    </View>
                </View>

                {/* Forecast */}
                <View style={styles.forecastCard}>
                    <Text style={styles.forecastTitle}>
                        Dự báo 3 ngày
                    </Text>
                    {weatherData?.daily.map((day: any, index: number) => (
                        <View key={index} style={styles.forecastItem}>
                            <Text style={styles.forecastDay}>Ngày {index + 1}</Text>
                            <Text style={styles.forecastWeather}>{day.weather[0].main}</Text>
                            <Text style={styles.forecastTemp}>{day.temp.day}°</Text>
                            <Text style={styles.forecastTempNight}>{day.temp.night}°</Text>
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