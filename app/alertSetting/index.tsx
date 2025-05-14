import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';

const alertOptions = [
  { value: 'minor', label: 'Nhẹ' },
  { value: 'moderate', label: 'Trung bình' },
  { value: 'severe', label: 'Nghiêm trọng' },
  { value: 'extreme', label: 'Cực kỳ nghiêm trọng' }
];
const STORAGE_KEY = 'alert_severity_setting';

export default function AlertSettingScreen() {
  const [selected, setSelected] = useState<string>('moderate');
  const router = useRouter();

  // Load saved value on mount
  useEffect(() => {
    loadSavedSetting();
  }, []);

  const loadSavedSetting = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved && alertOptions.some(opt => opt.value === saved)) {
        setSelected(saved);
      }
    } catch (error) {
      console.error('Error loading alert setting:', error);
    }
  };

  const handleSelect = async (value: string) => {
    try {
      setSelected(value);
      await AsyncStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      console.error('Error saving alert setting:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return '#FF0000';
      case 'severe':
        return '#FF6B00';
      case 'moderate':
        return '#FFB800';
      case 'minor':
        return '#4CAF50';
      default:
        return COLORS.text.secondary;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.secondary }}>
      <View style={tw`flex-row items-center p-4`}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={tw`absolute left-4 z-10`}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={tw`text-white text-2xl font-bold flex-1 text-center`}>Mức độ cảnh báo</Text>
      </View>

      <View style={tw`px-4`}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 12,
            paddingHorizontal: 0,
            marginBottom: 20,
            overflow: 'hidden',
          }}
        >
          {alertOptions.map((opt, idx) => (
            <TouchableOpacity
              key={opt.value}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 18,
                paddingHorizontal: 18,
                borderBottomWidth: idx < alertOptions.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(255,255,255,0.08)',
                backgroundColor: selected === opt.value ? 'rgba(255,255,255,0.05)' : 'transparent',
              }}
              onPress={() => handleSelect(opt.value)}
              activeOpacity={0.7}
            >
              <View style={tw`flex-row items-center flex-1`}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: getSeverityColor(opt.value),
                    marginRight: 12
                  }}
                />
                <Text
                  style={{
                    color: COLORS.text.primary,
                    fontSize: 16,
                    fontWeight: '500'
                  }}
                >
                  {opt.label}
                </Text>
              </View>
              {selected === opt.value && (
                <View style={tw`rounded-full p-1`}>
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
