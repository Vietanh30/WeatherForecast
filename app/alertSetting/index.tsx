import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { COLORS } from '../../constants/theme';

const alertOptions = [
  'Không', 'Thỉnh thoảng', 'Bình thường', 'Nguy hiểm', 'Thiên tai'
];
const STORAGE_KEY = 'alert_setting';

export default function AlertSettingScreen() {
  const [selected, setSelected] = useState<string>('Không');

  // Load saved value on mount
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved && alertOptions.includes(saved)) setSelected(saved);
    })();
  }, []);

  // Save to storage when selected changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, selected);
  }, [selected]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.secondary, paddingHorizontal: 16, paddingTop: 32 }}>
      <Text style={tw`text-white text-2xl font-bold mb-6 text-center`}>Cảnh báo</Text>
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 20,
          paddingVertical: 8,
          paddingHorizontal: 0,
          marginBottom: 20,
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
            }}
            onPress={() => setSelected(opt)}
            activeOpacity={0.7}
          >
            <Text style={{ color: COLORS.text.primary, flex: 1, fontSize: 16, fontWeight: '500' }}>{opt}</Text>
            {selected === opt && (
              <Ionicons name="checkmark" size={22} color={COLORS.primary || '#F984EE'} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
