import React, { useRef, useMemo, useState, useCallback } from 'react';
import { ImageBackground, View, Platform, StyleSheet, Text, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import WeatherHeader from '../../components/WeatherHeader';
import ForecastTabs from '../../components/ForecastTabs';
import ForecastList from '../components/ForecastList';
import FeatureCardsGrid from '../../components/FeatureCardsGrid';
import { COLORS } from '../../constants/theme';
import WeeklyCharts from '../components/WeeklyCharts';

const weatherData = {
  location: { name: 'Hà Nội' },
  current: {
    temp_c: 19,
    condition: { text: 'Không mưa' },
    wind_kph: 12,
    wind_dir: 'NE',
    pressure_mb: 1013,
    precip_mm: 0,
    humidity: 75,
    feelslike_c: 20,
    uv: 4,
    vis_km: 10
  },
  forecast: {
    forecastday: [
      {
        date: '2024-02-20',
        day: {
          maxtemp_c: 24,
          mintemp_c: 18,
          daily_chance_of_rain: 20,
          maxwind_kph: 15,
          avghumidity: 80,
          totalprecip_mm: 1.2,
          condition: { text: 'Sunny', icon: '', code: 0 },
          uv: 6
        },
        astro: {
          sunrise: '05:28 AM',
          sunset: '06:15 PM'
        },
        hour: [
          { time: '2024-06-01 00:00', temp_c: 19, chance_of_rain: 30, condition: { text: 'Light rain', icon: '', code: 0 }, wind_kph: 10, humidity: 85, feelslike_c: 18 },
          { time: '2024-06-01 01:00', temp_c: 19, chance_of_rain: 0, condition: { text: 'Partly cloudy', icon: '', code: 0 }, wind_kph: 12, humidity: 82, feelslike_c: 18, is_current: true },
          { time: '2024-06-01 02:00', temp_c: 18, chance_of_rain: 0, condition: { text: 'Cloudy', icon: '', code: 0 }, wind_kph: 11, humidity: 80, feelslike_c: 17 },
          { time: '2024-06-01 03:00', temp_c: 18, chance_of_rain: 0, condition: { text: 'Clear', icon: '', code: 0 }, wind_kph: 10, humidity: 78, feelslike_c: 17 },
          { time: '2024-06-01 04:00', temp_c: 19, chance_of_rain: 0, condition: { text: 'Light rain', icon: '', code: 0 }, wind_kph: 9, humidity: 75, feelslike_c: 18 },
          { time: '2024-06-01 05:00', temp_c: 19, chance_of_rain: 0, condition: { text: 'Light rain', icon: '', code: 0 }, wind_kph: 8, humidity: 72, feelslike_c: 18 },
          { time: '2024-06-01 06:00', temp_c: 20, chance_of_rain: 0, condition: { text: 'Sunny', icon: '', code: 0 }, wind_kph: 7, humidity: 70, feelslike_c: 19 },
          { time: '2024-06-01 07:00', temp_c: 21, chance_of_rain: 0, condition: { text: 'Sunny', icon: '', code: 0 }, wind_kph: 6, humidity: 68, feelslike_c: 20 },
          { time: '2024-06-01 08:00', temp_c: 22, chance_of_rain: 0, condition: { text: 'Sunny', icon: '', code: 0 }, wind_kph: 5, humidity: 65, feelslike_c: 21 },
          { time: '2024-06-01 09:00', temp_c: 23, chance_of_rain: 0, condition: { text: 'Sunny', icon: '', code: 0 }, wind_kph: 4, humidity: 62, feelslike_c: 22 },
          { time: '2024-06-01 10:00', temp_c: 24, chance_of_rain: 0, condition: { text: 'Sunny', icon: '', code: 0 }, wind_kph: 3, humidity: 60, feelslike_c: 23 },
          { time: '2024-06-01 11:00', temp_c: 24, chance_of_rain: 0, condition: { text: 'Sunny', icon: '', code: 0 }, wind_kph: 2, humidity: 58, feelslike_c: 24 },
        ],
      },
      {
        date: '2024-02-21',
        day: {
          maxtemp_c: 25,
          mintemp_c: 19,
          daily_chance_of_rain: 30,
          maxwind_kph: 12,
          avghumidity: 75,
          totalprecip_mm: 2.5,
          condition: { text: 'Partly cloudy', icon: '', code: 0 },
          uv: 5
        },
        astro: {
          sunrise: '05:27 AM',
          sunset: '06:16 PM'
        },
        hour: []
      },
      {
        date: '2024-02-22',
        day: {
          maxtemp_c: 23,
          mintemp_c: 17,
          daily_chance_of_rain: 40,
          maxwind_kph: 14,
          avghumidity: 82,
          totalprecip_mm: 3.8,
          condition: { text: 'Light rain', icon: '', code: 0 },
          uv: 4
        },
        astro: {
          sunrise: '05:26 AM',
          sunset: '06:17 PM'
        },
        hour: []
      },
      {
        date: '2024-02-23',
        day: {
          maxtemp_c: 22,
          mintemp_c: 16,
          daily_chance_of_rain: 50,
          maxwind_kph: 16,
          avghumidity: 85,
          totalprecip_mm: 5.2,
          condition: { text: 'Cloudy', icon: '', code: 0 },
          uv: 3
        },
        astro: {
          sunrise: '05:25 AM',
          sunset: '06:18 PM'
        },
        hour: []
      },
      {
        date: '2024-02-24',
        day: {
          maxtemp_c: 21,
          mintemp_c: 15,
          daily_chance_of_rain: 60,
          maxwind_kph: 18,
          avghumidity: 88,
          totalprecip_mm: 6.5,
          condition: { text: 'Light rain', icon: '', code: 0 },
          uv: 2
        },
        astro: {
          sunrise: '05:24 AM',
          sunset: '06:19 PM'
        },
        hour: []
      },
      {
        date: '2024-02-25',
        day: {
          maxtemp_c: 20,
          mintemp_c: 14,
          daily_chance_of_rain: 70,
          maxwind_kph: 20,
          avghumidity: 90,
          totalprecip_mm: 8.0,
          condition: { text: 'Light rain', icon: '', code: 0 },
          uv: 1
        },
        astro: {
          sunrise: '05:23 AM',
          sunset: '06:20 PM'
        },
        hour: []
      }
    ],
  },
};
const rainData = [30, 80, 60, 36, 28, 50];
const tempData = [19, 18, 19, 19, 18, 19];
const labels = ['20/2', '21/2', '22/2', '23/2', '24/2', '25/2'];
const featureCards = [
  { label: 'Chất lượng không khí', value: 'Tốt', icon: 'weather-windy', color: '#4ade80' },
  { label: 'Chỉ số UV', value: '4', icon: 'weather-sunny-alert', color: '#fbbf24' },
  { label: 'Mặt trời mọc', value: '5:28 AM', icon: 'weather-sunset-up', color: '#f97316' },
  { label: 'Sức gió', value: '12 km/h', icon: 'weather-windy', color: '#60a5fa' },
  { label: 'Lượng mưa', value: '1.2 mm', icon: 'weather-pouring', color: '#818cf8' },
  { label: 'Nhiệt độ cảm nhận', value: '20°C', icon: 'thermometer', color: '#fb7185' },
  { label: 'Độ ẩm', value: '75%', icon: 'water-percent', color: '#38bdf8' },
  { label: 'Tầm nhìn', value: '10 km', icon: 'eye', color: '#a78bfa' },
  { label: 'Áp lực', value: '1013 mb', icon: 'gauge', color: '#34d399' },
];

export default function HomeScreen() {
  const [tab, setTab] = useState('hourly');
  const [isExpanded, setIsExpanded] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Sử dụng giá trị tuyệt đối thay vì phần trăm cho Android
  const snapPoints = useMemo(() => Platform.OS === 'android'
    ? ['45%', '83%']
    : ['45%', '83%'], []);

  // callbacks
  const handleSheetChange = useCallback((index: number) => {
    console.log("handleSheetChange", index);
    // Hiển thị biểu đồ khi index > 0 (đang vuốt lên)
    setIsExpanded(index > 0);
  }, []);

  const chartWidth = Dimensions.get('window').width - 40;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <WeatherHeader
          city={weatherData.location.name}
          temp_c={weatherData.current.temp_c}
          condition={weatherData.current.condition.text}
          maxtemp_c={weatherData.forecast.forecastday[0].day.maxtemp_c}
          mintemp_c={weatherData.forecast.forecastday[0].day.mintemp_c}
          isMini={isExpanded}
        />

        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
          enablePanDownToClose={false}
          enableOverDrag={false}
          enableDynamicSizing={false}
          backgroundStyle={{
            backgroundColor: COLORS.secondary,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          }}
          handleIndicatorStyle={{
            backgroundColor: COLORS.text.primary,
            width: 50,
            height: 5,
          }}
          android_keyboardInputMode="adjustResize"
        >
          <BottomSheetScrollView
            contentContainerStyle={{
              paddingHorizontal: 8,
              paddingTop: 8,
              paddingBottom: 80,
              backgroundColor: COLORS.secondary,
            }}
            showsVerticalScrollIndicator={false}
          >
            <ForecastTabs tab={tab} setTab={setTab} />

            {tab === 'hourly' ? (
              <>
                <ForecastList data={weatherData.forecast.forecastday[0].hour} type="hourly" />
                {isExpanded && (
                  <View style={{ marginTop: 16 }}>
                    <FeatureCardsGrid data={featureCards} />
                  </View>
                )}
              </>
            ) : (
              <>
                <ForecastList data={weatherData.forecast.forecastday} type="weekly" />
                {isExpanded && (
                  <View style={{ marginTop: 16 }}>
                    <WeeklyCharts forecastday={weatherData.forecast.forecastday} />
                  </View>
                )}
              </>
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
});
