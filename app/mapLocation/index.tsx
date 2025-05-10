import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapLocationScreen() {
    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={StyleSheet.absoluteFill}
                initialRegion={{
                    latitude: 21.0285,
                    longitude: 105.8542,
                    latitudeDelta: 5,
                    longitudeDelta: 5,
                }}
            >
                <Marker
                    coordinate={{ latitude: 21.0285, longitude: 105.8542 }}
                    title="Hà Nội"
                    description="24°"
                />
            </MapView>
        </View>
    );
}
