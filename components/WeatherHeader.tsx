import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/theme';

interface WeatherHeaderProps {
    city: string;
    temp_c: number;
    condition: string;
    maxtemp_c: number;
    mintemp_c: number;
    onSearch?: () => void;
    isMini?: boolean;
    conditionCode?: string | number;
}

export default function WeatherHeader({
    city,
    temp_c,
    condition,
    maxtemp_c,
    mintemp_c,
    onSearch = () => { },
    isMini = false,
    conditionCode = '1000'
}: WeatherHeaderProps) {
    const router = useRouter();
    const fontSize = isMini ? 20 : 96;
    const tempFontSize = isMini ? 32 : 96;

    // Function to determine text color based on weather condition
    const getTextColor = (code: string | number) => {
        const codeStr = code.toString();
        // Dark conditions (rain, thunder, snow, fog) - use light text
        if (['1063', '1180', '1186', '1189', '1192', '1195', // Rain
            '1066', '1210', '1213', '1216', '1219', // Snow
            '1087', '1273', '1276', // Thunder
            '1030', '1135', '1147', // Fog
            '1006', '1009' // Cloudy
        ].includes(codeStr)) {
            return '#ffffff';
        }
        // Light conditions (clear, partly cloudy) - use dark text
        return '#1a1a1a';
    };

    const textColor = getTextColor(conditionCode);
    const secondaryTextColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';

    return (
        <View style={[
            tw`items-center`,
            isMini ? { marginTop: 30, marginBottom: 0 } : { marginTop: 32, marginBottom: 8 }
        ]}>
            <View style={[
                tw`items-center px-6 py-4 rounded-2xl`,
                { backgroundColor: 'rgba(0,0,0,0.2)' }
            ]}>
                <Text style={[tw`mb-1`, { color: textColor, fontSize: 32, fontWeight: 'medium' }]}>{city}</Text>
                {isMini ? (
                    <Text style={[{ color: textColor, fontSize, fontWeight: 'medium' }]}>
                        {Math.round(temp_c)}° {condition}
                    </Text>
                ) : (
                    <>
                        <Text style={[{ color: textColor, fontSize: tempFontSize, fontWeight: 'medium' }]}>{Math.round(temp_c)}°</Text>
                        <Text style={[{ color: secondaryTextColor, fontSize: 16, fontWeight: '500' }]}>Cao: {Math.round(maxtemp_c)}°   Thấp: {Math.round(mintemp_c)}°</Text>
                    </>
                )}
            </View>
        </View>
    );
} 