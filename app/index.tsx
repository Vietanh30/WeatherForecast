import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, ImageBackground } from 'react-native';

// Định nghĩa kiểu dữ liệu cho hourlyForecast và dailyForecast
interface HourlyForecast {
  id: string;
  time: string;
  temp: string;
  icon: any; // Thay bằng kiểu cụ thể nếu bạn biết loại hình ảnh
}

interface DailyForecast {
  id: string;
  day: string;
  high: string;
  low: string;
  icon: any; // Thay bằng kiểu cụ thể nếu bạn biết loại hình ảnh
}

// Dữ liệu giả lập
const hourlyForecast: HourlyForecast[] = [
  { id: '1', time: 'Now', temp: '32°C', icon: require('../assets/images/icon.png') },
  { id: '2', time: '12PM', temp: '32°C', icon: require('../assets/images/icon.png') },
  { id: '3', time: '1PM', temp: '32°C', icon: require('../assets/images/icon.png') },
  { id: '4', time: '2PM', temp: '30°C', icon: require('../assets/images/icon.png') },
  { id: '5', time: '3PM', temp: '30°C', icon: require('../assets/images/icon.png') },
  { id: '6', time: '4PM', temp: '28°C', icon: require('../assets/images/icon.png') },
  { id: '7', time: '5PM', temp: '28°C', icon: require('../assets/images/icon.png') },
  { id: '8', time: '6PM', temp: '28°C', icon: require('../assets/images/icon.png') },
  { id: '9', time: '7PM', temp: '28°C', icon: require('../assets/images/icon.png') },
  { id: '10', time: '8PM', temp: '28°C', icon: require('../assets/images/icon.png') },
];

const dailyForecast: DailyForecast[] = [
  { id: '1', day: 'Today', high: '33°C', low: '20°C', icon: require('../assets/images/icon.png') },
  { id: '2', day: 'Thu', high: '27°C', low: '15°C', icon: require('../assets/images/icon.png') },
  { id: '3', day: 'Fri', high: '42°C', low: '23°C', icon: require('../assets/images/icon.png') },
  { id: '4', day: 'Sat', high: '37°C', low: '27°C', icon: require('../assets/images/icon.png') },
  { id: '5', day: 'Sun', high: '38°C', low: '29°C', icon: require('../assets/images/icon.png') },
  { id: '6', day: 'Mon', high: '34°C', low: '22°C', icon: require('../assets/images/icon.png') },
  { id: '7', day: 'Tue', high: '31°C', low: '20°C', icon: require('../assets/images/icon.png') },
  { id: '8', day: 'Wed', high: '29°C', low: '19°C', icon: require('../assets/images/icon.png') },
  { id: '9', day: 'Thu', high: '30°C', low: '21°C', icon: require('../assets/images/icon.png') },
  { id: '10', day: 'Fri', high: '32°C', low: '22°C', icon: require('../assets/images/icon.png') },
];

export default function WeatherScreen() {
  return (
    <ImageBackground
      source={{ uri: 'https://example.com/cloudy-background.jpg' }} // Thay bằng hình nền thực tế
      style={styles.background}
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Current Weather */}
          <View style={styles.currentWeather}>
            <Text style={styles.location}>My Location</Text>
            <Text style={styles.city}>BARRE</Text>
            <Text style={styles.temperature}>32°C</Text>
            <Text style={styles.condition}>Mostly Cloudy</Text>
            <Text style={styles.highLow}>H:33°C L:20°C</Text>
            <Text style={styles.alert}>Partly cloudy conditions expected around 4PM.</Text>
          </View>

          {/* Hourly Forecast */}
          <View style={styles.hourlyContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyScroll}
            >
              {hourlyForecast.map((item) => (
                <View key={item.id} style={styles.hourlyItem}>
                  <Text style={styles.hourlyText}>{item.time}</Text>
                  <Image source={item.icon} style={styles.hourlyIcon} />
                  <Text style={styles.hourlyText}>{item.temp}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Daily Forecast */}
          <View style={styles.dailyContainer}>
            <Text style={styles.sectionTitle}>10-DAY FORECAST</Text>
            <FlatList
              data={dailyForecast}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.dailyItem}>
                  <Text style={styles.day}>{item.day}</Text>
                  <Image source={item.icon} style={styles.dailyIcon} />
                  <Text style={styles.dailyLow}>{item.low}</Text>
                  <View style={styles.tempBar}>
                    <View
                      style={{
                        ...styles.tempRange,
                        width: `${((parseInt(item.high) - parseInt(item.low)) / 50) * 100}%`,
                      }}
                    />
                  </View>
                  <Text style={styles.dailyHigh}>{item.high}</Text>
                </View>
              )}
              contentContainerStyle={styles.dailyList}
            />
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Thay thế LinearGradient bằng một lớp overlay mờ
  },
  container: {
    padding: 20,
    paddingTop: 40,
  },
  currentWeather: {
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  city: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
  },
  temperature: {
    fontSize: 100,
    fontWeight: '200',
    color: '#fff',
  },
  condition: {
    fontSize: 20,
    color: '#fff',
    marginVertical: 5,
  },
  highLow: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  alert: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  hourlyContainer: {
    marginVertical: 20,
  },
  hourlyScroll: {
    paddingHorizontal: 10,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  hourlyText: {
    color: '#fff',
    fontSize: 16,
  },
  hourlyIcon: {
    width: 40,
    height: 40,
    marginVertical: 5,
  },
  dailyContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 10,
  },
  dailyList: {
    paddingBottom: 20,
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  day: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  dailyIcon: {
    width: 40,
    height: 40,
    flex: 1,
    alignSelf: 'center',
  },
  dailyLow: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    textAlign: 'right',
  },
  tempBar: {
    flex: 2,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  tempRange: {
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  dailyHigh: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    textAlign: 'left',
  },
});