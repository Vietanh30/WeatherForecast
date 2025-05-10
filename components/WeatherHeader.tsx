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
}

export default function WeatherHeader({ city, temp_c, condition, maxtemp_c, mintemp_c, onSearch = () => { }, isMini = false }: WeatherHeaderProps) {
    const router = useRouter();
    const fontSize = isMini ? 20 : 96;
    const tempFontSize = isMini ? 32 : 96;

    return (
        <View style={[
            tw`items-center`,
            isMini ? { marginTop: 30, marginBottom: 0 } : { marginTop: 32, marginBottom: 8 }
        ]}>
            {!isMini && (
                <View style={tw`flex-row justify-end w-full px-4`}>
                    <TouchableOpacity onPress={() => router.push('/searchLocation' as any)}>
                        <Ionicons name="add" size={28} color={COLORS.text.primary} />
                    </TouchableOpacity>
                </View>
            )}
            <Text style={[tw`mb-1`, { color: COLORS.text.primary, fontSize: 32, fontWeight: 'medium' }]}>{city}</Text>
            {isMini ? (
                <Text style={[{ color: COLORS.text.primary, fontSize, fontWeight: 'medium' }]}>{temp_c}° {condition}</Text>
            ) : (
                <>
                    <Text style={[{ color: COLORS.text.primary, fontSize: tempFontSize, fontWeight: 'medium' }]}>{temp_c}°</Text>
                    <Text style={[{ color: COLORS.text.secondary, fontSize: 16, fontWeight: '500' }]}>Cao: {maxtemp_c}°   Thấp: {mintemp_c}°</Text>
                </>
            )}
        </View>
    );
} 