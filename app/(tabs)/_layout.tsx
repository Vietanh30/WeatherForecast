import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter, usePathname } from 'expo-router';
import tw from 'tailwind-react-native-classnames';
import { COLORS } from '@/constants/theme';
import { Stack } from 'expo-router';
import { weatherApi } from '@/services/api/weatherApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Cập nhật mỗi 5 phút
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const currentCity = await AsyncStorage.getItem('current_city');
      const latitude = await AsyncStorage.getItem('latitude');
      const longitude = await AsyncStorage.getItem('longitude');
      const selectedSeverity = await AsyncStorage.getItem('alert_severity_setting') || 'moderate';

      if (!currentCity && !latitude && !longitude) return;

      const response = await weatherApi.getWeatherNotifications(
        currentCity || undefined,
        latitude ? parseFloat(latitude) : undefined,
        longitude ? parseFloat(longitude) : undefined
      );

      const severityLevels = ['minor', 'moderate', 'severe', 'extreme'];
      const selectedIndex = severityLevels.indexOf(selectedSeverity);

      const filteredAlerts = response.data.alerts.filter(alert => {
        const alertIndex = severityLevels.indexOf(alert.severity.toLowerCase());
        return alertIndex >= selectedIndex;
      });

      setNotificationCount(filteredAlerts.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          borderTopWidth: 1,
          elevation: 0,
          position: 'absolute',
          bottom: 0,
          height: 80,
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: COLORS.secondary,
          borderTopColor: 'white',
        },
        tabBarItemStyle: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 20,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <View style={tw`items-center justify-center`}>
              <MaterialCommunityIcons
                name="home"
                size={24}
                color={pathname === '/index' ? '#fff' : 'rgba(255,255,255,0.6)'}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="mapLocation"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <View style={tw`items-center justify-center`}>
              <MaterialCommunityIcons
                name="map-marker-radius-outline"
                size={24}
                color={pathname === '/mapLocation' ? '#fff' : 'rgba(255,255,255,0.6)'}
              />
            </View>
          ),
          tabBarStyle: { display: 'none' },
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <View style={tw`items-center justify-center`}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={pathname === '/settings' ? '#fff' : 'rgba(255,255,255,0.6)'}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <View style={tw`items-center justify-center`}>
              <View style={{ position: 'relative' }}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={pathname === '/notifications' ? '#fff' : 'rgba(255,255,255,0.6)'}
                />
                {notificationCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: '#FF3B30',
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="locationPreview"
        options={{
          tabBarStyle: { display: 'none' },
          href: null,
        }}
      />

      <Tabs.Screen
        name="notification-detail"
        options={{
          tabBarStyle: { display: 'none' },
          href: null,
        }}
      />

      <Tabs.Screen
        name="chatbox"
        options={{
          tabBarStyle: { display: 'none' },
          href: null,
        }}
      />
    </Tabs>
  );
}
