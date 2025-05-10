import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { COLORS } from '../../constants/theme';

interface HourlyForecast {
    time: string;
    temp_c: number;
    chance_of_rain: number;
    condition: {
        text: string;
        icon: string;
        code: number;
    };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    is_current?: boolean;
}

interface Props {
    data: HourlyForecast[];
}

const HourlyForecastList: React.FC<Props> = ({ data }) => {
    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'sunny':
                return 'weather-sunny';
            case 'partly cloudy':
                return 'weather-partly-cloudy';
            case 'cloudy':
                return 'weather-cloudy';
            case 'light rain':
                return 'weather-rainy';
            case 'clear':
                return 'weather-night';
            default:
                return 'weather-cloudy';
        }
    };

    return (
        <View style={tw`mt-4`}>
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item }) => (
                    <View
                        style={[
                            tw`mr-4 items-center`,
                            { minWidth: 72 },
                            { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingVertical: 8 }
                        ]}
                    >
                        <Text style={[tw`text-sm mb-1`, { color: COLORS.text.primary }]}>
                            {new Date(item.time).getHours()}:00
                        </Text>
                        <MaterialCommunityIcons
                            name={getWeatherIcon(item.condition.text)}
                            size={24}
                            color={COLORS.icon.primary}
                        />
                        <Text style={[tw`text-lg font-semibold mt-1`, { color: COLORS.text.primary }]}>
                            {item.temp_c}°
                        </Text>
                        <Text style={[tw`text-xs mt-1`, { color: COLORS.text.secondary }]}>
                            {item.chance_of_rain}%
                        </Text>
                        <Text style={[tw`text-xs mt-1`, { color: COLORS.text.secondary }]}>
                            {item.wind_kph} km/h
                        </Text>
                        <Text style={[tw`text-xs mt-1`, { color: COLORS.text.secondary }]}>
                            {item.humidity}%
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

export default HourlyForecastList; 