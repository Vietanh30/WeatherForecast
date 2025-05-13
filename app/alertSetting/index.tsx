import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';

const alertOptions = [
  'Không', 'Thỉnh thoảng', 'Bình thường', 'Nguy hiểm', 'Thiên tai'
];
const STORAGE_KEY = 'alert_setting';

export default function AlertSettingScreen() {
  const [selected, setSelected] = useState<string>('Không');
  const router = useRouter();

  // Load saved value on mount
  useEffect(() => {
    loadSavedSetting();
  }, []);

  const loadSavedSetting = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved && alertOptions.includes(saved)) {
        setSelected(saved);
      }
    } catch (error) {
      console.error('Error loading alert setting:', error);
    }
  };

  const handleSelect = async (option: string) => {
    try {
      setSelected(option);
      await AsyncStorage.setItem(STORAGE_KEY, option);
    } catch (error) {
      console.error('Error saving alert setting:', error);
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
        <Text style={tw`text-white text-2xl font-bold flex-1 text-center`}>Cảnh báo</Text>
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
              key={opt}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 18,
                paddingHorizontal: 18,
                borderBottomWidth: idx < alertOptions.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(255,255,255,0.08)',
                backgroundColor: selected === opt ? 'rgba(255,255,255,0.05)' : 'transparent',
              }}
              onPress={() => handleSelect(opt)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: COLORS.text.primary,
                  flex: 1,
                  fontSize: 16,
                  fontWeight: '500'
                }}
              >
                {opt}
              </Text>
              {selected === opt && (
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
