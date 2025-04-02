import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Sử dụng icon từ expo-vector-icons

// Định nghĩa kiểu dữ liệu cho TypeScript (nếu bạn dùng TypeScript)
interface SettingItem {
  id: string;
  title: string;
  hasSwitch?: boolean;
  hasArrow?: boolean;
  isDanger?: boolean;
  icon: string;
}

const settingsData: SettingItem[] = [
  { id: '1', title: 'Nguồn dữ liệu', hasArrow: true, icon: 'earth-outline' },
  { id: '2', title: 'Cảnh báo', hasArrow: true, icon: 'notifications-outline' },
  { id: '3', title: 'Dark mode', hasSwitch: true, icon: 'moon-outline' },
  { id: '4', title: 'Chính sách', hasArrow: true, icon: 'document-text-outline' },
  { id: '5', title: 'Chia sẻ vị trí', hasSwitch: true, icon: 'location-outline' },
  { id: '6', title: 'Xóa dữ liệu', isDanger: true, icon: 'trash-outline' },
];

export default function SettingScreen() {
  // State để quản lý trạng thái của các switch
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Cài đặt</Text>

      {/* Danh sách các mục cài đặt */}
      {settingsData.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.settingItem, item.isDanger && styles.dangerItem]}
          onPress={() => {
            // Xử lý khi nhấn vào mục (có thể điều hướng hoặc hiển thị thông báo)
            console.log(`Pressed: ${item.title}`);
          }}
        >
          <View style={styles.itemContent}>
            <Ionicons
              name={item.icon}
              size={24}
              color={item.isDanger ? '#FF3B30' : '#fff'}
              style={styles.icon}
            />
            <Text style={[styles.itemText, item.isDanger && styles.dangerText]}>
              {item.title}
            </Text>
          </View>

          {/* Hiển thị switch hoặc mũi tên tùy theo mục */}
          {item.hasSwitch && item.title === 'Dark mode' && (
            <Switch
              value={darkMode}
              onValueChange={(value) => setDarkMode(value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          )}
          {item.hasSwitch && item.title === 'Chia sẻ vị trí' && (
            <Switch
              value={locationSharing}
              onValueChange={(value) => setLocationSharing(value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={locationSharing ? '#fff' : '#f4f3f4'}
            />
          )}
          {item.hasArrow && (
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          )}
          {item.isDanger && (
            <View style={styles.dangerBadge}>
              <Text style={styles.dangerBadgeText}>!</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2D3E', // Màu nền giống trong hình
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3A3F5A', // Màu nền của mỗi mục
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  itemText: {
    fontSize: 18,
    color: '#fff',
  },
  dangerItem: {
    backgroundColor: '#3A3F5A',
  },
  dangerText: {
    color: '#FF3B30', // Màu đỏ cho mục "Xóa dữ liệu"
  },
  dangerBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});