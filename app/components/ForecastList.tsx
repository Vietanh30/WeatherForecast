import React from 'react';
import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { COLORS } from '../../constants/theme';

interface ForecastItem {
    time?: string;
    date?: string;
    temp_c?: number;
    maxtemp_c?: number;
    mintemp_c?: number;
    chance_of_rain?: number;
    daily_chance_of_rain?: number;
    condition?: {
        text: string;
        icon: string;
        code: number;
    };
    day?: {
        maxtemp_c: number;
        mintemp_c: number;
        daily_chance_of_rain: number;
        condition: {
            text: string;
            icon: string;
            code: number;
        };
    };
    wind_kph?: number;
    humidity?: number;
    feelslike_c?: number;
    is_current?: boolean;
}

interface Props {
    data: ForecastItem[];
    type: 'hourly' | 'weekly';
}

const ForecastList: React.FC<Props> = ({ data, type }) => {


    const getWeatherIcon = (item: ForecastItem) => {
        const condition = type === 'hourly' ? item.condition?.text : item.day?.condition.text;
        if (!condition) return 'weather-cloudy';

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

    const getTimeLabel = (item: ForecastItem) => {
        if (type === 'hourly' && item.time) {
            const date = new Date(item.time);
            return `${date.getHours().toString().padStart(2, '0')}:00`;
        } else if (type === 'weekly' && item.date) {
            const date = new Date(item.date);
            return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
        }
        return '';
    };

    const getTempLabel = (item: ForecastItem) => {
        if (type === 'hourly' && item.temp_c !== undefined) {
            return `${Math.round(item.temp_c)}°`;
        } else if (type === 'weekly' && item.day?.maxtemp_c !== undefined) {
            return `${Math.round(item.day.maxtemp_c)}°`;
        }
        return '';
    };

    const getMinTempLabel = (item: ForecastItem) => {
        if (type === 'hourly' && item.feelslike_c !== undefined) {
            return `${Math.round(item.feelslike_c)}°`;
        } else if (type === 'weekly' && item.day?.mintemp_c !== undefined) {
            return `${Math.round(item.day.mintemp_c)}°`;
        }
        return '';
    };

    const getRainChance = (item: ForecastItem) => {
        if (type === 'hourly' && item.chance_of_rain !== undefined) {
            return `${item.chance_of_rain}%`;
        } else if (type === 'weekly' && item.day?.daily_chance_of_rain !== undefined) {
            return `${item.day.daily_chance_of_rain}%`;
        }
        return '';
    };

    return (
        <View style={tw`mt-4`}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`pb-2 px-2`}

            >
                {data.map((item, idx) => (
                    <View
                        key={idx}
                        style={[
                            tw`mr-4 items-center`,
                            { minWidth: 80 },
                            { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12 }
                        ]}
                    >
                        <Text style={[tw`text-sm mb-1`, { color: COLORS.text.primary }]}>
                            {getTimeLabel(item)}
                        </Text>
                        <MaterialCommunityIcons
                            name={getWeatherIcon(item)}
                            size={24}
                            color={COLORS.icon.primary}
                        />
                        <Text style={[tw`text-lg font-semibold mt-1`, { color: COLORS.text.primary }]}>
                            {getTempLabel(item)}
                        </Text>
                        <Text style={[tw`text-xs mt-1`, { color: COLORS.text.secondary }]}>
                            {getMinTempLabel(item)}
                        </Text>
                        <Text style={[tw`text-xs mt-1`, { color: COLORS.text.secondary }]}>
                            {getRainChance(item)}
                        </Text>
                        {type === 'hourly' && item.wind_kph && (
                            <Text style={[tw`text-xs mt-1`, { color: COLORS.text.secondary }]}>
                                {Math.round(item.wind_kph)} km/h
                            </Text>
                        )}
                        {type === 'hourly' && item.humidity && (
                            <Text style={[tw`text-xs mt-1`, { color: COLORS.text.secondary }]}>
                                {item.humidity}%
                            </Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default ForecastList; 