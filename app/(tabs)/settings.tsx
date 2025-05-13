// app/(tabs)/settings.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';

const STORAGE_KEYS = {
    darkMode: 'setting_dark_mode',
    darkMute: 'setting_dark_mute',
    shareLocation: 'setting_share_location',
};

const settingsGroups = [
    [
        { type: 'nav', label: 'Ngôn ngữ', value: 'Tiếng Việt', icon: 'language-outline' },
        { type: 'nav', label: 'Cảnh báo', value: '', icon: 'notifications-outline', route: '/alertSetting' },
        { type: 'switch', label: 'Dark mode', key: 'darkMode', icon: 'moon-outline' },
    ],
    [
        { type: 'switch', label: 'Dark mute', key: 'darkMute', icon: 'volume-mute-outline' },
        { type: 'nav', label: 'Chính sách', value: '', icon: 'document-text-outline' },
    ],
    [
        { type: 'switch', label: 'Chia sẻ vị trí', key: 'shareLocation', icon: 'share-social-outline' },
        { type: 'nav', label: 'Xóa dữ liệu', value: '', icon: 'trash-outline', danger: true },
    ],
];

export default function SettingsScreen() {
    const router = useRouter();
    const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>({
        darkMode: false,
        darkMute: false,
        shareLocation: false,
    });

    // Load switch states from AsyncStorage
    useEffect(() => {
        (async () => {
            const darkMode = await AsyncStorage.getItem(STORAGE_KEYS.darkMode);
            const darkMute = await AsyncStorage.getItem(STORAGE_KEYS.darkMute);
            const shareLocation = await AsyncStorage.getItem(STORAGE_KEYS.shareLocation);
            setSwitchStates({
                darkMode: darkMode === 'true',
                darkMute: darkMute === 'true',
                shareLocation: shareLocation === 'true',
            });
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const allKeys = await AsyncStorage.getAllKeys();
            const stores = await AsyncStorage.multiGet(allKeys);
            const dump: { [key: string]: string } = {};
            stores.forEach(([key, value]) => {
                dump[key] = value ?? '';
            });
            console.log('AsyncStorage:', dump);
        })();
    }, [switchStates]);

    // Handle switch toggle
    const handleSwitch = async (key: keyof typeof STORAGE_KEYS, value: boolean) => {
        if (key === 'shareLocation' && value) {
            // Xin quyền vị trí
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Không thể truy cập vị trí', 'Bạn cần cấp quyền vị trí để sử dụng chức năng này.');
                setSwitchStates(prev => ({ ...prev, [key]: false }));
                await AsyncStorage.setItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS], 'false');
                return;
            }
            // Lấy vị trí hiện tại
            let location = await Location.getCurrentPositionAsync({});
            await AsyncStorage.setItem('user_location', JSON.stringify(location));
        }
        if (key === 'darkMute') {
            // Nếu value là true (mute), tắt âm lượng
            await Audio.setIsEnabledAsync(!value);
        }
        setSwitchStates(prev => ({ ...prev, [key]: value }));
        await AsyncStorage.setItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS], value.toString());
        if (key === 'shareLocation' && !value) {
            await AsyncStorage.removeItem('user_location');
        }
    };

    // Handle delete all data
    const handleDeleteData = async () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn xóa toàn bộ dữ liệu?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        setSwitchStates({ darkMode: false, darkMute: false, shareLocation: false });
                        Alert.alert('Đã xóa dữ liệu!');
                    },
                },
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.secondary }}>
            <Text style={tw`text-white text-2xl font-bold text-center my-6`}>Cài đặt</Text>
            {settingsGroups.map((group, idx) => (
                <View
                    key={idx}
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderRadius: 12,
                        marginHorizontal: 20,
                        marginBottom: 20,
                        overflow: 'hidden',
                    }}
                >
                    {group.map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 20,
                                paddingHorizontal: 20,
                                borderBottomWidth: i < group.length - 1 ? 1 : 0,
                                borderBottomColor: 'rgba(255,255,255,0.08)',
                            }}
                            onPress={() => {
                                if ('route' in item && item.route) {
                                    router.push(item.route as any);
                                } else if (item.label === 'Xóa dữ liệu') {
                                    handleDeleteData();
                                }
                            }}
                            activeOpacity={item.type === 'nav' ? 0.7 : 1}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={22}
                                color={'danger' in item && item.danger ? '#F984EE' : COLORS.icon.primary}
                                style={{ marginRight: 20 }}
                            />
                            <Text
                                style={{
                                    color: 'danger' in item && item.danger ? '#F984EE' : COLORS.text.primary,
                                    flex: 1,
                                    fontSize: 16,
                                    fontWeight: '500',
                                }}
                            >
                                {item.label}
                            </Text>
                            {item.type === 'switch' && 'key' in item && item.key ? (
                                <Switch
                                    value={switchStates[item.key]}
                                    onValueChange={v => handleSwitch(item.key as keyof typeof STORAGE_KEYS, v)}
                                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                                    thumbColor={switchStates[item.key] ? COLORS.primary : COLORS.border}
                                />
                            ) : (
                                item.value ? (
                                    <Text style={{ color: COLORS.text.secondary, fontSize: 16 }}>{item.value}</Text>
                                ) : (
                                    <Ionicons name="chevron-forward" size={20} color={'danger' in item && item.danger ? '#F984EE' : COLORS.icon.primary} />
                                )
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
}