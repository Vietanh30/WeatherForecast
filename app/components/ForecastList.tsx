import React, { useRef, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';

/**
 * ForecastItem interface định nghĩa cấu trúc dữ liệu cho một mục dự báo thời tiết
 * @property {string} time - Thời gian dự báo (định dạng ISO)
 * @property {string} date - Ngày dự báo (định dạng ISO)
 * @property {number} temp_c - Nhiệt độ hiện tại (Celsius)
 * @property {number} maxtemp_c - Nhiệt độ cao nhất (Celsius)
 * @property {number} mintemp_c - Nhiệt độ thấp nhất (Celsius)
 * @property {number} chance_of_rain - Xác suất mưa (%)
 * @property {number} daily_chance_of_rain - Xác suất mưa trong ngày (%)
 * @property {Object} condition - Điều kiện thời tiết
 * @property {Object} day - Thông tin thời tiết trong ngày
 * @property {number} wind_kph - Tốc độ gió (km/h)
 * @property {number} humidity - Độ ẩm (%)
 * @property {number} feelslike_c - Nhiệt độ cảm nhận (Celsius)
 * @property {boolean} is_current - Đánh dấu thời điểm hiện tại
 */
interface ForecastItem {
    time: string;
    temp_c: number;
    condition: {
        text: string;
        icon: string;
        code: number;
    };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    chance_of_rain: number;
    chance_of_snow: number;
    air_quality: any;
}

/**
 * Props interface cho component ForecastList
 * @property {ForecastItem[]} data - Mảng dữ liệu dự báo thời tiết
 */
interface Props {
    data: ForecastItem[];
}

/**
 * ForecastList component hiển thị danh sách dự báo thời tiết
 * 
 * Dark Mode:
 * - Sử dụng màu nền tối với độ trong suốt (rgba(255,255,255,0.1))
 * - Text màu trắng với các mức độ opacity khác nhau
 * - Item hiện tại được đánh dấu bằng border trắng
 * 
 * Ngôn ngữ:
 * - Thời gian được hiển thị theo định dạng 24h
 * - Ngày tháng được hiển thị theo định dạng Việt Nam
 * - Đơn vị nhiệt độ: Celsius
 * - Đơn vị tốc độ gió: km/h
 * 
 * Chính sách:
 * - Tự động scroll đến thời điểm hiện tại
 * - Snap scroll để dễ dàng chọn thời điểm
 * - Hiển thị đầy đủ thông tin: nhiệt độ, độ ẩm, tốc độ gió, xác suất mưa
 */
const ForecastList: React.FC<Props> = ({ data }) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const ITEM_WIDTH = 70;
    const ITEM_SPACING = 12;

    useEffect(() => {
        const now = new Date();
        const currentHourIndex = data.findIndex(item => {
            const itemTime = new Date(item.time);
            return itemTime.getHours() === now.getHours() &&
                itemTime.getDate() === now.getDate() &&
                itemTime.getMonth() === now.getMonth();
        });

        if (currentHourIndex !== -1) {
            const scrollToX = currentHourIndex * (ITEM_WIDTH + ITEM_SPACING);
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                    x: scrollToX,
                    animated: false
                });
            }, 100);
        }
    }, [data]);

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

    const getTimeLabel = (time: string) => {
        const date = new Date(time);
        return `${date.getHours().toString().padStart(2, '0')}:00`;
    };

    const isCurrentTime = (time: string) => {
        const itemTime = new Date(time);
        const now = new Date();
        return itemTime.getHours() === now.getHours() &&
            itemTime.getDate() === now.getDate() &&
            itemTime.getMonth() === now.getMonth();
    };

    return (
        <View style={tw`my-2`}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`pb-2 px-2`}
                decelerationRate="fast"
                snapToInterval={ITEM_WIDTH + ITEM_SPACING}
                snapToAlignment="start"
            >
                {data.map((item, idx) => {
                    const isCurrent = isCurrentTime(item.time);
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
                                {getTimeLabel(item.time)}
                            </Text>
                            <MaterialCommunityIcons
                                name={getWeatherIcon(item.condition.text)}
                                size={24}
                                color={isCurrent ? '#fff' : 'rgba(255,255,255,0.7)'}
                            />
                            <Text style={[
                                tw`text-lg font-semibold mt-2`,
                                { color: isCurrent ? '#fff' : 'rgba(255,255,255,0.9)' }
                            ]}>
                                {Math.round(item.temp_c)}°
                            </Text>
                            <Text style={[
                                tw`text-xs mt-1`,
                                { color: isCurrent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)' }
                            ]}>
                                {Math.round(item.feelslike_c)}°
                            </Text>
                            <Text style={[
                                tw`text-xs mt-1`,
                                { color: isCurrent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)' }
                            ]}>
                                {item.chance_of_rain}%
                            </Text>
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

export default ForecastList; 