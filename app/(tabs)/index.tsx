import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { ImageBackground, View, Platform, StyleSheet, Text, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import WeatherHeader from '../../components/WeatherHeader';
import ForecastTabs from '../../components/ForecastTabs';
import ForecastList from '../components/ForecastList';
import FeatureCardsGrid from '../../components/FeatureCardsGrid';
import { COLORS } from '../../constants/theme';
import WeeklyCharts from '../components/WeeklyCharts';
import { weatherApi } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const STORAGE_KEY = 'saved_locations';

export default function HomeScreen() {
  const [tab, setTab] = useState('hourly');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();

  // Sử dụng giá trị tuyệt đối thay vì phần trăm cho Android
  const snapPoints = useMemo(() => Platform.OS === 'android'
    ? ['45%', '83%']
    : ['45%', '83%'], []);

  // Load saved locations
  useEffect(() => {
    loadSavedLocations();
  }, []);

  const loadSavedLocations = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const locations = JSON.parse(saved);
        setSavedLocations(locations);

        // Tìm index của địa điểm hiện tại trong danh sách
        const currentCity = await AsyncStorage.getItem('current_city');
        if (currentCity) {
          const index = locations.findIndex((loc: any) => loc.display_name === currentCity);
          setCurrentLocationIndex(index >= 0 ? index : 0);
        }
      }
    } catch (err) {
      console.error('Error loading saved locations:', err);
    }
  };

  // Load initial weather data
  useEffect(() => {
    const loadInitialWeatherData = async () => {
      try {
        // First try to get location from lat/lon
        const latitude = await AsyncStorage.getItem('latitude');
        const longitude = await AsyncStorage.getItem('longitude');
        const currentCity = await AsyncStorage.getItem('current_city');

        if (latitude && longitude) {
          // Use coordinates if available
          await fetchWeatherData(`${latitude},${longitude}`);
        } else if (currentCity) {
          // Fallback to current city if no coordinates
          await fetchWeatherData(currentCity);
        } else {
          setError('Vui lòng cho phép truy cập vị trí hoặc chọn một thành phố');
        }
      } catch (err) {
        console.error('Error loading location data:', err);
        setError('Không thể tải thông tin vị trí');
      }
    };

    // Chỉ load dữ liệu thời tiết nếu chưa có
    if (!weatherData) {
      loadInitialWeatherData();
    }
  }, []);

  // callbacks
  const handleSheetChange = useCallback((index: number) => {
    // console.log("handleSheetChange", index);
    setIsExpanded(index > 0);
  }, []);

  const handleLocationChange = async (location: any) => {
    try {
      // Lưu làm địa điểm hiện tại
      await AsyncStorage.setItem('current_city', location.display_name);
      await AsyncStorage.setItem('latitude', location.lat.toString());
      await AsyncStorage.setItem('longitude', location.lon.toString());

      // Cập nhật thời tiết
      await fetchWeatherData(`${location.lat},${location.lon}`);
    } catch (err) {
      console.error('Error changing location:', err);
      setError('Không thể chuyển đổi địa điểm');
    }
  };

  const CACHE_DURATION = 10 * 60 * 1000; // 5 phút

  const fetchWeatherData = async (location: string) => {
    try {
      setLoading(true);

      // Kiểm tra cache
      const cachedData = await AsyncStorage.getItem('weather_cache');
      const lastUpdate = await AsyncStorage.getItem('weather_last_update');
      const now = Date.now();

      if (cachedData && lastUpdate && (now - parseInt(lastUpdate)) < CACHE_DURATION) {
        const parsedData = JSON.parse(cachedData);
        if (parsedData.location.name === location ||
          (parsedData.location.latitude.toString() + ',' + parsedData.location.longitude.toString()) === location) {
          setWeatherData(parsedData);
          setLoading(false);
          return;
        }
      }

      // First get current weather to get coordinates
      const currentWeather = await weatherApi.getCurrentWeather(location);
      const currentWeatherData = currentWeather.data;
      if (!currentWeatherData || !currentWeatherData.current || !currentWeatherData.location) {
        throw new Error('Invalid current weather data received');
      }

      // Then get forecast and astronomy using coordinates
      const [forecast, astronomy] = await Promise.all([
        weatherApi.getForecast(location, 7, currentWeatherData.location.lat, currentWeatherData.location.lon),
        weatherApi.getAstronomy(
          location,
          new Date().toISOString().split('T')[0],
          currentWeatherData.location.lat,
          currentWeatherData.location.lon
        )
      ]);
      console.log("forecast", forecast)

      const forecastData = forecast.data;
      const astronomyData = astronomy.data;

      if (!forecastData || !forecastData.forecast || !forecastData.forecast.forecastday) {
        throw new Error('Invalid forecast data received');
      }

      if (!astronomyData || !astronomyData.astronomy) {
        throw new Error('Invalid astronomy data received');
      }

      // Lấy tên thành phố từ current_city trong AsyncStorage
      const currentCity = await AsyncStorage.getItem('current_city');
      const displayCityName = currentCity ? currentCity.split(',')[0] : currentWeatherData.location.name.split(',')[0];

      // Transform data to match backend schema
      const transformedData = {
        location: {
          name: displayCityName,
          latitude: currentWeatherData.location.lat,
          longitude: currentWeatherData.location.lon
        },
        current: {
          city: displayCityName,
          latitude: currentWeatherData.location.lat,
          longitude: currentWeatherData.location.lon,
          temperature: currentWeatherData.current.temp_c,
          feelsLike: currentWeatherData.current.feelslike_c,
          description: currentWeatherData.current.condition.text,
          humidity: currentWeatherData.current.humidity,
          windSpeed: currentWeatherData.current.wind_kph,
          windDir: currentWeatherData.current.wind_dir,
          uvIndex: currentWeatherData.current.uv,
          rain_mm: currentWeatherData.current.precip_mm,
          pressure_mb: currentWeatherData.current.pressure_mb,
          visibility_km: currentWeatherData.current.vis_km,
          time: new Date(currentWeatherData.current.last_updated_epoch * 1000),
          source: 'current'
        },
        astronomy: {
          city: displayCityName,
          latitude: currentWeatherData.location.lat,
          longitude: currentWeatherData.location.lon,
          date: new Date(currentWeatherData.location.localtime_epoch * 1000),
          sunrise: astronomyData.astronomy.astro.sunrise,
          sunset: astronomyData.astronomy.astro.sunset,
          moonrise: astronomyData.astronomy.astro.moonrise,
          moonset: astronomyData.astronomy.astro.moonset,
          moon_phase: astronomyData.astronomy.astro.moon_phase,
          moon_illumination: astronomyData.astronomy.astro.moon_illumination,
          is_moon_up: astronomyData.astronomy.astro.is_moon_up,
          is_sun_up: astronomyData.astronomy.astro.is_sun_up
        },
        airQuality: {
          city: displayCityName,
          latitude: currentWeatherData.location.lat,
          longitude: currentWeatherData.location.lon,
          time: new Date(currentWeatherData.current.last_updated_epoch * 1000),
          co: currentWeatherData.current.air_quality?.co || 0,
          no2: currentWeatherData.current.air_quality?.no2 || 0,
          o3: currentWeatherData.current.air_quality?.o3 || 0,
          so2: currentWeatherData.current.air_quality?.so2 || 0,
          pm2_5: currentWeatherData.current.air_quality?.pm2_5 || 0,
          pm10: currentWeatherData.current.air_quality?.pm10 || 0,
          us_epa_index: currentWeatherData.current.air_quality?.['us-epa-index'] || 0,
          gb_defra_index: currentWeatherData.current.air_quality?.['gb-defra-index'] || 0
        },
        forecast: forecastData.forecast.forecastday.map((day: any) => ({
          city: displayCityName,
          latitude: currentWeatherData.location.lat,
          longitude: currentWeatherData.location.lon,
          date: new Date(day.date_epoch * 1000),
          maxtemp_c: day.day.maxtemp_c,
          mintemp_c: day.day.mintemp_c,
          avgtemp_c: day.day.avgtemp_c,
          maxwind_kph: day.day.maxwind_kph,
          totalprecip_mm: day.day.totalprecip_mm,
          avghumidity: day.day.avghumidity,
          condition_text: day.day.condition.text,
          condition_icon: day.day.condition.icon,
          condition_code: day.day.condition.code,
          uv: day.day.uv,
          daily_chance_of_rain: day.day.daily_chance_of_rain,
          daily_chance_of_snow: day.day.daily_chance_of_snow,
          astro: day.astro,
          hour: day.hour.map((hour: any) => ({
            time: new Date(hour.time_epoch * 1000),
            temp_c: hour.temp_c,
            condition_text: hour.condition.text,
            condition_icon: hour.condition.icon,
            condition_code: hour.condition.code,
            wind_kph: hour.wind_kph,
            humidity: hour.humidity,
            feelslike_c: hour.feelslike_c,
            chance_of_rain: hour.chance_of_rain,
            chance_of_snow: hour.chance_of_snow,
            air_quality: hour.air_quality
          }))
        }))
      };

      // Lưu cache
      await AsyncStorage.setItem('weather_cache', JSON.stringify(transformedData));
      await AsyncStorage.setItem('weather_last_update', now.toString());

      setWeatherData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
      }
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu thời tiết');
    } finally {
      setLoading(false);
    }
  };

  const chartWidth = Dimensions.get('window').width - 40;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.secondary }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text.primary }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error || !weatherData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.secondary }}>
        <Text style={{ color: COLORS.text.primary, textAlign: 'center', padding: 20 }}>{error || 'Không có dữ liệu thời tiết'}</Text>
      </View>
    );
  }

  const getAirQualityStatus = (index: number) => {
    switch (index) {
      case 1: return 'Tốt';
      case 2: return 'Trung bình';
      case 3: return 'Không tốt cho nhóm nhạy cảm';
      case 4: return 'Không tốt';
      case 5: return 'Rất không tốt';
      case 6: return 'Nguy hiểm';
      default: return 'Không xác định';
    }
  };

  const getAirQualityColor = (index: number) => {
    switch (index) {
      case 1: return '#4ade80'; // Good - Green
      case 2: return '#fbbf24'; // Moderate - Yellow
      case 3: return '#f97316'; // Unhealthy for Sensitive Groups - Orange
      case 4: return '#ef4444'; // Unhealthy - Red
      case 5: return '#7c3aed'; // Very Unhealthy - Purple
      case 6: return '#7f1d1d'; // Hazardous - Dark Red
      default: return '#6b7280'; // Unknown - Gray
    }
  };

  const featureCards = [
    {
      label: 'Chất lượng không khí',
      value: weatherData?.airQuality ? getAirQualityStatus(weatherData.airQuality.us_epa_index) : 'Không có dữ liệu',
      icon: 'weather-windy',
      color: weatherData?.airQuality ? getAirQualityColor(weatherData.airQuality.us_epa_index) : '#6b7280'
    },
    { label: 'Chỉ số UV', value: weatherData?.current?.uvIndex?.toString() || 'N/A', icon: 'weather-sunny-alert', color: '#fbbf24' },
    { label: 'Mặt trời mọc', value: weatherData?.astronomy?.sunrise || 'N/A', icon: 'weather-sunset-up', color: '#fbbf24' },
    { label: 'Mặt trời lặn', value: weatherData?.astronomy?.sunset || 'N/A', icon: 'weather-sunset-down', color: '#f97316' },
    { label: 'Mặt trăng mọc', value: weatherData?.astronomy?.moonrise || 'N/A', icon: 'weather-night', color: '#a78bfa' },
    { label: 'Mặt trăng lặn', value: weatherData?.astronomy?.moonset || 'N/A', icon: 'weather-night', color: '#818cf8' },
    { label: 'Sức gió', value: `${weatherData?.current?.windSpeed || 0} km/h ${weatherData?.current?.windDir || ''}`, icon: 'weather-windy', color: '#60a5fa' },
    { label: 'Lượng mưa', value: `${weatherData?.current?.rain_mm || 0} mm`, icon: 'weather-pouring', color: '#818cf8' },
    { label: 'Nhiệt độ cảm nhận', value: `${weatherData?.current?.feelsLike || 0}°C`, icon: 'thermometer', color: '#fb7185' },
    { label: 'Độ ẩm', value: `${weatherData?.current?.humidity || 0}%`, icon: 'water-percent', color: '#38bdf8' },
    { label: 'Tầm nhìn', value: `${weatherData?.current?.visibility_km || 0} km`, icon: 'eye', color: '#a78bfa' },
    { label: 'Áp lực', value: `${weatherData?.current?.pressure_mb || 0} mb`, icon: 'gauge', color: '#34d399' },
    { label: 'Pha mặt trăng', value: weatherData?.astronomy?.moon_phase || 'N/A', icon: 'moon-waning-crescent', color: '#fbbf24' },
    { label: 'Chiếu sáng trăng', value: weatherData?.astronomy?.moon_illumination ? `${weatherData.astronomy.moon_illumination}%` : 'N/A', icon: 'brightness-5', color: '#a78bfa' },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {!isExpanded && (
          <>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 40,
              paddingBottom: 8
            }}>
              {savedLocations.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    const nextIndex = (currentLocationIndex + 1) % savedLocations.length;
                    setCurrentLocationIndex(nextIndex);
                    handleLocationChange(savedLocations[nextIndex]);
                  }}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="swap-horizontal" size={24} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => router.push('/searchLocation')}
                style={{ padding: 8 }}
              >
                <Ionicons name="add-circle-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <WeatherHeader
          city={weatherData.location.name}
          temp_c={weatherData.current.temperature}
          condition={weatherData.current.description}
          maxtemp_c={weatherData.forecast[0].maxtemp_c}
          mintemp_c={weatherData.forecast[0].mintemp_c}
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
                <ForecastList data={weatherData.forecast[0].hour} type="hourly" />
                {isExpanded && (
                  <View style={{ marginTop: 16 }}>

                    <FeatureCardsGrid data={featureCards} />
                  </View>
                )}
              </>
            ) : (
              <>
                <ForecastList data={weatherData.forecast} type="weekly" />
                {isExpanded && (
                  <View style={{ marginTop: 16 }}>
                    <WeeklyCharts forecastday={weatherData.forecast} />
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
