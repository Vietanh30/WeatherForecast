import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import tw from 'tailwind-react-native-classnames';
import { COLORS } from '@/constants/theme';
import { Stack } from 'expo-router';

export default function TabLayout() {
  const router = useRouter();

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
              <MaterialCommunityIcons name="home" size={24} color="white" />
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
              <MaterialCommunityIcons name="map-marker-radius-outline" size={24} color="white" />
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
              <Ionicons name="settings-outline" size={24} color="white" />
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
              <Ionicons name="notifications-outline" size={24} color="white" />
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
