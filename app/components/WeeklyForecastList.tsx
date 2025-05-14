import React from 'react';
import { View, Text, Dimensions, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';

interface WeeklyForecastItem {
    date: Date;
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    condition: {
        text: string;
        icon: string;
        code: number;
    };
    wind_kph: number;
    wind_dir: number;
    chance_of_rain: number;
    clouds: number;
    visibility: number;
}

interface Props {
    data: WeeklyForecastItem[];
}

const WeeklyForecastList: React.FC<Props> = ({ data }) => {
    console.log(data);
    const ITEM_WIDTH = 70;
    const ITEM_SPACING = 12;



    const getDayLabel = (date: Date) => {
        return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
    };

    const isCurrentDay = (date: Date) => {
        const now = new Date();
        return date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
    };

    return (
        <View style={tw`my-2`}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`pb-2 px-2`}
                decelerationRate="fast"
                snapToInterval={ITEM_WIDTH + ITEM_SPACING}
                snapToAlignment="start"
            >
                {data.map((item, idx) => {
                    const isCurrent = isCurrentDay(item.date);
                    return (
                        <View
                            key={idx}
                            style={[
                                tw`items-center`,
                                {
                                    width: ITEM_WIDTH,
                                    marginRight: ITEM_SPACING,
                                    borderWidth: isCurrent ? 2 : 0,
                                    borderColor: '#fff',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: 16,
                                    paddingVertical: 8,
                                }
                            ]}
                        >
                            <Text style={[
                                tw`text-sm mb-2`,
                                {
                                    color: isCurrent ? '#fff' : 'rgba(255,255,255,0.7)',
                                    fontWeight: isCurrent ? 'bold' : 'normal'
                                }
                            ]}>
                                {getDayLabel(item.date)}
                            </Text>
                            <Image source={{
                                uri: `http://openweathermap.org/img/wn/${item.condition.icon}@2x.png`
                            }} style={{ width: 28, height: 28 }} />

                            <Text style={[
                                tw`text-lg font-semibold mt-2`,
                                { color: isCurrent ? '#fff' : 'rgba(255,255,255,0.9)' }
                            ]}>
                                {Math.round(item.temp_max)}°
                            </Text>
                            <Text style={[
                                tw`text-xs mt-1`,
                                { color: isCurrent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)' }
                            ]}>
                                {Math.round(item.temp_min)}°
                            </Text>
                            {/* <Text style={[
                                tw`text-xs mt-1`,
                                { color: isCurrent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)' }
                            ]}>
                                {Math.round(item.chance_of_rain * 100)}%
                            </Text> */}
                            <Text style={[
                                tw`text-xs mt-1`,
                                { color: isCurrent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)' }
                            ]}>
                                {Math.round(item.wind_kph)} km/h
                            </Text>
                            <Text style={[
                                tw`text-xs mt-1`,
                                { color: isCurrent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)' }
                            ]}>
                                {item.humidity}%
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default WeeklyForecastList; 