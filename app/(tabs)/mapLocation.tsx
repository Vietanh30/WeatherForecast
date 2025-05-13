import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Location {
    latitude: number;
    longitude: number;
    name: string;
}

const DEFAULT_LOCATION: Location = {
    latitude: 21.0285,
    longitude: 105.8542,
    name: 'Hà Nội'
};

export default function WeatherMapScreen() {
    const [currentLocation, setCurrentLocation] = useState<Location>(DEFAULT_LOCATION);
    const webViewRef = useRef<WebView>(null);
    const router = useRouter();

    useEffect(() => {
        loadSavedLocation();
    }, []);

    const loadSavedLocation = async () => {
        try {
            const savedLocation = await AsyncStorage.getItem('currentLocation');
            if (savedLocation) {
                const parsedLocation = JSON.parse(savedLocation);
                setCurrentLocation({
                    latitude: parsedLocation.latitude || DEFAULT_LOCATION.latitude,
                    longitude: parsedLocation.longitude || DEFAULT_LOCATION.longitude,
                    name: parsedLocation.name || DEFAULT_LOCATION.name
                });
            }
        } catch (error) {
            console.error('Error loading location:', error);
            setCurrentLocation(DEFAULT_LOCATION);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <WebView
                ref={webViewRef}
                source={{ uri: `https://www.windy.com/?${currentLocation.latitude},${currentLocation.longitude},5` }}
                style={styles.map}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    }
}); 