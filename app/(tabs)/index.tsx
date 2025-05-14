import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { ImageBackground, View, Platform, StyleSheet, Text, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import WeatherHeader from '../../components/WeatherHeader';
import ForecastTabs from '../../components/ForecastTabs';
import ForecastList from '../components/ForecastList';
import WeeklyForecastList from '../components/WeeklyForecastList';
import FeatureCardsGrid from '../../components/FeatureCardsGrid';
import { COLORS } from '../../constants/theme';
import WeeklyCharts from '../components/WeeklyCharts';
import HourlyCharts from '../components/HourlyCharts';
import { weatherApi } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'saved_locations';

export default function HomeScreen() {
  const [tab, setTab] = useState('hourly');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [deviceId, setDeviceId] = useState<string>('');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();

  // Sử dụng giá trị tuyệt đối thay vì phần trăm cho Android
  const snapPoints = useMemo(() => Platform.OS === 'android'
    ? ['45%', '83%']
    : ['45%', '83%'], []);

  // Get or generate device ID
  useEffect(() => {
    const getOrCreateDeviceId = async () => {
      try {
        // Try to get existing device ID from secure storage
        let storedId = await SecureStore.getItemAsync('device_id');

        if (!storedId) {
          // If no stored ID, generate a new one using device info
          const deviceType = await Device.getDeviceTypeAsync();
          const brand = Device.brand;
          const modelName = Device.modelName;

          // Create a unique ID using device info
          storedId = `${brand}-${modelName}-${deviceType}-${Date.now()}`;

          // Store the new ID securely
          await SecureStore.setItemAsync('device_id', storedId);
        }

        setDeviceId(storedId);
        console.log('Final Device ID:', storedId);
        await AsyncStorage.setItem('device_id', storedId);
      } catch (err) {
        console.error('Error managing device ID:', err);
      }
    };

    getOrCreateDeviceId();
  }, []);

  // Log stored device ID
  useEffect(() => {
    const logStoredId = async () => {
      const id = await AsyncStorage.getItem('device_id');
      console.log('Stored Device ID:', id);
    };
    logStoredId();
  }, []);

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

  const CACHE_DURATION = 10; // 5 phút

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

      // Lấy tọa độ từ AsyncStorage hoặc dùng mặc định là Hà Nội
      const latitude = await AsyncStorage.getItem('latitude') || '21.0285';
      const longitude = await AsyncStorage.getItem('longitude') || '105.8542';

      // First get current weather using coordinates
      const currentWeather = await weatherApi.getCurrentWeather(
        'Hà Nội', // location name as fallback
        parseFloat(latitude),
        parseFloat(longitude)
      );
      const currentWeatherData = currentWeather.data;
      if (!currentWeatherData || !currentWeatherData.current || !currentWeatherData.location) {
        throw new Error('Invalid current weather data received');
      }

      // Then get forecast and astronomy using coordinates
      const [forecast, weeklyForecast, astronomy] = await Promise.all([
        weatherApi.getForecast(
          'Hà Nội',
          1,
          currentWeatherData.location.lat,
          currentWeatherData.location.lon
        ),
        weatherApi.getSevenDayForecast(
          'Hà Nội',
          currentWeatherData.location.lat,
          currentWeatherData.location.lon
        ),
        weatherApi.getAstronomy(
          'Hà Nội',
          new Date().toISOString().split('T')[0],
          currentWeatherData.location.lat,
          currentWeatherData.location.lon
        )
      ]);

      const forecastData = forecast.data;
      const weeklyForecastData = weeklyForecast.data;
      const astronomyData = astronomy.data;

      if (!forecastData || !forecastData.forecast || !forecastData.forecast.forecastday) {
        throw new Error('Invalid forecast data received');
      }

      if (!weeklyForecastData || !weeklyForecastData.forecast) {
        throw new Error('Invalid weekly forecast data received');
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
          description: currentWeatherData.current.condition?.text || 'Unknown',
          conditionCode: currentWeatherData.current.condition?.code || '1000',
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
        hourlyForecast: forecastData.forecast.forecastday[0].hour.map((hour: any) => ({
          time: new Date(hour.time_epoch * 1000),
          temp_c: hour.temp_c,
          condition: {
            text: hour.condition?.text || 'Unknown',
            icon: hour.condition?.icon || '',
            code: hour.condition?.code || 0
          },
          wind_kph: hour.wind_kph || 0,
          humidity: hour.humidity || 0,
          feelslike_c: hour.feelslike_c || 0,
          chance_of_rain: hour.chance_of_rain || 0,
          chance_of_snow: hour.chance_of_snow || 0,
          air_quality: hour.air_quality || {}
        })),
        weeklyForecast: weeklyForecastData.forecast.map((day: any) => ({
          date: new Date(day.dt * 1000),
          temp: day.main.temp,
          feels_like: day.main.feels_like,
          temp_min: day.main.temp_min,
          temp_max: day.main.temp_max,
          humidity: day.main.humidity,
          condition: {
            text: day.weather[0].description,
            icon: day.weather[0].icon || '',
            code: day.weather[0].id || 0
          },
          wind_kph: day.wind.speed,
          wind_dir: day.wind.deg,
          chance_of_rain: day.pop,
          clouds: day.clouds.all,
          visibility: day.visibility
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

  const getWeatherBackground = (conditionCode: string | number) => {
    // Map weather conditions to background images
    const weatherBackgrounds: { [key: string]: string } = {
      // Clear sky
      '1000': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', // Clear

      // Partly cloudy
      '1003': 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=800&q=80', // Partly cloudy

      // Cloudy
      '1006': 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&w=800&q=80', // Cloudy
      '1009': 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&w=800&q=80', // Overcast

      // Rain
      '1063': 'https://images.unsplash.com/photo-1501691223387-dd05029ec4a6?auto=format&fit=crop&w=800&q=80', // Patchy rain
      '1180': 'https://images.unsplash.com/photo-1501691223387-dd05029ec4a6?auto=format&fit=crop&w=800&q=80', // Light rain
      '1186': 'https://images.unsplash.com/photo-1501691223387-dd05029ec4a6?auto=format&fit=crop&w=800&q=80', // Moderate rain
      '1189': 'https://images.unsplash.com/photo-1501691223387-dd05029ec4a6?auto=format&fit=crop&w=800&q=80', // Heavy rain
      '1192': 'https://images.unsplash.com/photo-1501691223387-dd05029ec4a6?auto=format&fit=crop&w=800&q=80', // Very heavy rain
      '1195': 'https://images.unsplash.com/photo-1501691223387-dd05029ec4a6?auto=format&fit=crop&w=800&q=80', // Extreme rain

      // Snow
      '1066': 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=800&q=80', // Patchy snow
      '1210': 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=800&q=80', // Light snow
      '1213': 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=800&q=80', // Moderate snow
      '1216': 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=800&q=80', // Heavy snow
      '1219': 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=800&q=80', // Very heavy snow

      // Thunder
      '1087': 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?auto=format&fit=crop&w=800&q=80', // Thunder
      '1273': 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?auto=format&fit=crop&w=800&q=80', // Patchy light rain with thunder
      '1276': 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?auto=format&fit=crop&w=800&q=80', // Moderate or heavy rain with thunder

      // Fog
      '1030': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=800&q=80', // Mist
      '1135': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=800&q=80', // Fog
      '1147': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=800&q=80', // Freezing fog
    };

    // Convert condition code to string and ensure it exists in our mapping
    const code = conditionCode?.toString() || '1000';
    return weatherBackgrounds[code] || weatherBackgrounds['1000'];
  };

  const getIconColor = (conditionCode: string | number) => {
    const codeStr = conditionCode.toString();
    // Dark conditions (rain, thunder, snow, fog) - use light icons
    if (['1063', '1180', '1186', '1189', '1192', '1195', // Rain
      '1066', '1210', '1213', '1216', '1219', // Snow
      '1087', '1273', '1276', // Thunder
      '1030', '1135', '1147', // Fog
      '1006', '1009' // Cloudy
    ].includes(codeStr)) {
      return '#000000';
    }
    // Light conditions (clear, partly cloudy) - use dark icons
    return '#1a1a1a';
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={{ uri: getWeatherBackground(weatherData?.current?.conditionCode) }}
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {savedLocations.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      const nextIndex = (currentLocationIndex + 1) % savedLocations.length;
                      setCurrentLocationIndex(nextIndex);
                      handleLocationChange(savedLocations[nextIndex]);
                    }}
                    style={{ padding: 8, marginRight: 8 }}
                  >
                    <Ionicons
                      name="swap-horizontal"
                      size={24}
                      color={getIconColor(weatherData?.current?.conditionCode)}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => router.push('/chatbox')}
                  style={{ padding: 8, marginRight: 8 }}
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={24}
                    color={getIconColor(weatherData?.current?.conditionCode)}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/searchLocation')}
                  style={{ padding: 8 }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={getIconColor(weatherData?.current?.conditionCode)}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <WeatherHeader
          city={weatherData.location.name}
          temp_c={weatherData.current.temperature}
          condition={weatherData.current.description}
          maxtemp_c={weatherData.weeklyForecast[0].temp_max}
          mintemp_c={weatherData.weeklyForecast[0].temp_min}
          feelslike_c={weatherData.current.feelsLike}
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
                <ForecastList data={weatherData.hourlyForecast} />
                {isExpanded && (
                  <>
                    <View style={{ marginTop: 16 }}>
                      <FeatureCardsGrid data={featureCards} />
                    </View>
                    <View style={{ marginTop: 16 }}>
                      <HourlyCharts data={weatherData.hourlyForecast} />
                    </View>
                  </>
                )}
              </>
            ) : (
              <>
                <WeeklyForecastList data={weatherData.weeklyForecast} />
                {isExpanded && (
                  <View style={{ marginTop: 16 }}>
                    <WeeklyCharts forecastday={weatherData.weeklyForecast} />
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
