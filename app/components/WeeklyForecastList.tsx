import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { COLORS } from '../../constants/theme';

interface WeeklyForecast {
    date: string;
    day: {
        maxtemp_c: number;
        mintemp_c: number;
        daily_chance_of_rain: number;
        condition: {
            text: string;
            icon: string;
            code: number;
        };
    };
}

interface Props {
    data: WeeklyForecast[];
}

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

const WeeklyForecastList: React.FC<Props> = ({ data }) => {
    return (
        <View style={tw`mt-4`}>
            <Text style={[tw`text-lg font-semibold mb-2`, { color: COLORS.text.primary }]}>Dự báo theo tuần</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`pb-2`}
            >
                {data.map((item, idx) => (
                    <View
                        key={idx}
                        style={[
                            tw`mr-4 items-center`,
                            { minWidth: 72 },
                            { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingVertical: 8 }
                        ]}
                    >
                        <Text style={[tw`text-sm mb-1`, { color: COLORS.text.primary }]}>
                            {new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                        </Text>
                        <MaterialCommunityIcons
                            name={getWeatherIcon(item.day.condition.text)}
                            size={24}
                            color={COLORS.icon.primary}
                        />
                        <Text style={[tw`text-lg font-semibold mt-1`, { color: COLORS.text.primary }]}>
                            {item.day.maxtemp_c}°
                        </Text>
                        <Text style={[tw`text-xs mt-1`, { color: COLORS.text.secondary }]}>
                            {item.day.mintemp_c}°
                        </Text>
                        <Text style={[tw`text-xs mt-1`, { color: COLORS.text.secondary }]}>
                            {item.day.daily_chance_of_rain}%
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default WeeklyForecastList; 