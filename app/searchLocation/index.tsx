import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { locationApi } from '../../services/api';

function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    function debouncedFunction(...args: Parameters<T>) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }

    // Optional: clear timeout on unmount
    debouncedFunction.cancel = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    return debouncedFunction;
}

const STORAGE_KEY = 'saved_locations';
const POPULAR_CITIES = [

    "Định vị", "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Nha Trang", "Nam Định", "Hà Giang",
];

export default function SearchLocationScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [savedLocations, setSavedLocations] = useState<any[]>([]);
    const [currentCity, setCurrentCity] = useState<string | null>(null);
    const [previewLocation, setPreviewLocation] = useState<any>(null);

    // Load saved locations on mount
    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) setSavedLocations(JSON.parse(saved));
            // Lấy thành phố hiện tại (nếu có)
            const current = await AsyncStorage.getItem('current_city');
            if (current) setCurrentCity(current);
        })();
    }, []);

    // Gọi API search location
    const handleSearch = async (query: string) => {
        setSearch(query);
        if (query.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const data = await locationApi.searchLocation(query);
            // console.log(data);
            setResults(data.features.map((f: any) => ({
                place_id: f.properties.place_id,
                display_name: f.properties.formatted,
                ...f.properties
            })));
        } catch (e) {
            setResults([]);
        }
        setLoading(false);
    };

    const debouncedSearch = useDebounce(handleSearch, 500);

    useEffect(() => {
        debouncedSearch(search);
        return () => debouncedSearch.cancel();
    }, [search]);

    const navigateToPreview = (data: any) => {
        try {
            router.navigate({
                pathname: '/(tabs)/locationPreview',
                params: data
            });
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    const handleAddLocation = async (item: any) => {
        navigateToPreview({
            place_id: item.place_id,
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon
        });
    };

    // Chọn thành phố phổ biến
    const handlePopularCity = async (city: string) => {
        if (city === "Định vị") {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Thông báo', 'Không thể lấy vị trí vì chưa được cấp quyền!');
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                const data = await locationApi.getLocationFromCoords(
                    location.coords.latitude,
                    location.coords.longitude
                );

                if (data.features && data.features.length > 0) {
                    const locationData = {
                        place_id: data.features[0].properties.place_id,
                        display_name: data.features[0].properties.formatted,
                        lat: data.features[0].properties.lat,
                        lon: data.features[0].properties.lon
                    };
                    navigateToPreview(locationData);
                }
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại!');
            }
        } else {
            setSearch(city);
        }
    };

    // Đặt thành phố hiện tại và về Home
    const handleSetCurrent = async (item: any) => {
        await AsyncStorage.setItem('current_city', item.display_name);
        await AsyncStorage.setItem('latitude', item.lat.toString());
        await AsyncStorage.setItem('longitude', item.lon.toString());
        setCurrentCity(item.display_name);
        setSelected(item.place_id);
        const newList = [item, ...savedLocations.filter(loc => loc.place_id !== item.place_id)];
        setSavedLocations(newList);
        router.push('/');
    };

    // Xóa một thành phố đã lưu
    const handleDeleteLocation = async (place_id: string) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn xóa thành phố này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Lọc ra danh sách mới không có địa điểm bị xóa
                            const newList = savedLocations.filter(loc => loc.place_id !== place_id);

                            // Lấy thông tin địa điểm bị xóa
                            const deletedLocation = savedLocations.find(loc => loc.place_id === place_id);
                            const currentCity = await AsyncStorage.getItem('current_city');

                            // Nếu xóa địa điểm hiện tại
                            if (deletedLocation && currentCity === deletedLocation.display_name) {
                                if (newList.length > 0) {
                                    // Nếu còn địa điểm khác, chuyển đến địa điểm đầu tiên
                                    const nextLocation = newList[0];
                                    await AsyncStorage.setItem('current_city', nextLocation.display_name);
                                    await AsyncStorage.setItem('latitude', nextLocation.lat.toString());
                                    await AsyncStorage.setItem('longitude', nextLocation.lon.toString());
                                    setCurrentCity(nextLocation.display_name);
                                } else {
                                    // Nếu không còn địa điểm nào, chuyển về vị trí hiện tại
                                    try {
                                        let { status } = await Location.requestForegroundPermissionsAsync();
                                        if (status === 'granted') {
                                            let location = await Location.getCurrentPositionAsync({});
                                            await AsyncStorage.setItem('latitude', location.coords.latitude.toString());
                                            await AsyncStorage.setItem('longitude', location.coords.longitude.toString());
                                            await AsyncStorage.setItem('current_city', 'Vị trí hiện tại');
                                            setCurrentCity('Vị trí hiện tại');
                                            // Nếu đã xóa location cuối cùng, chuyển về màn hình chính
                                            router.push('/');
                                        } else {
                                            Alert.alert('Thông báo', 'Vui lòng cấp quyền truy cập vị trí để tiếp tục');
                                        }
                                    } catch (error) {
                                        console.error('Error getting current location:', error);
                                        Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
                                    }
                                }
                            }

                            // Cập nhật danh sách đã lưu
                            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
                            setSavedLocations(newList);
                            if (selected === place_id) setSelected(null);

                            // Nếu đã xóa location cuối cùng, chuyển về màn hình chính
                            if (newList.length === 0) {
                                router.push('/');
                            }
                        } catch (err) {
                            console.error('Error deleting location:', err);
                            Alert.alert('Lỗi', 'Không thể xóa địa điểm');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#101223", paddingHorizontal: 16, paddingTop: 32 }}>
            {/* Nút back */}
            <TouchableOpacity onPress={() => router.push('/')} style={{ position: 'absolute', top: 36, left: 16, zIndex: 10 }}>
                <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' }}>Quản lý thành phố</Text>

            {/* Thanh tìm kiếm */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#23243a',
                borderRadius: 24,
                paddingHorizontal: 16,
                marginBottom: 20,
            }}>
                <Ionicons name="search" size={22} color="#888" />
                <TextInput
                    style={{
                        flex: 1,
                        color: "#fff",
                        fontSize: 16,
                        paddingVertical: 12,
                        marginLeft: 8,
                    }}
                    placeholder="Nhập vị trí"
                    placeholderTextColor="#888"
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearch(''); setResults([]); }}>
                        <Ionicons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Thành phố phổ biến */}
            <Text style={{ color: "#888", marginBottom: 8, fontWeight: 'bold' }}>Thành phố phổ biến</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 }}>
                {POPULAR_CITIES.map(city => (
                    <TouchableOpacity
                        key={city}
                        style={{
                            backgroundColor: search === city ? "#223366" : "#23243a",
                            borderRadius: 20,
                            paddingVertical: 10,
                            paddingHorizontal: 18,
                            marginRight: 10,
                            marginBottom: 10,
                        }}
                        onPress={() => handlePopularCity(city)}
                    >
                        <Text style={{ color: "#fff", fontWeight: '500' }}>{city}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Danh sách địa chỉ đã lưu */}
            {(!search || search.length <= 1) && savedLocations.length > 0 && (
                <FlatList
                    data={savedLocations}
                    keyExtractor={item => item.place_id?.toString() || item.display_name}
                    renderItem={({ item }) => (
                        <View
                            style={{
                                backgroundColor: currentCity === item.display_name ? "#223366" : "#23243a",
                                borderRadius: 24,
                                padding: 20,
                                marginBottom: 18,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() => handleSetCurrent(item)}
                                activeOpacity={0.8}
                            >
                                <View>
                                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: 'bold' }}>
                                        {item.display_name.split(',')[0]}
                                    </Text>
                                    <Text style={{ color: "#ccc", fontSize: 14, marginTop: 2 }}>
                                        {item.display_name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteLocation(item.place_id)} style={{ marginLeft: 16 }}>
                                <Ionicons name="trash-outline" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            {/* Kết quả tìm kiếm */}
            {search.length > 1 && (
                <View style={{
                    position: 'absolute',
                    top: 170,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "#101223",
                    zIndex: 100,
                    paddingHorizontal: 16,
                }}>
                    <FlatList
                        data={results}
                        keyExtractor={item => item.place_id?.toString() || item.display_name}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: selected === item.place_id ? "#223366" : "#23243a",
                                    borderRadius: 24,
                                    padding: 20,
                                    marginBottom: 18,
                                }}
                                onPress={() => handleAddLocation(item)}
                                activeOpacity={0.8}
                            >
                                <View>
                                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: 'bold' }}>
                                        {item.display_name.split(',')[0]}
                                    </Text>
                                    <Text style={{ color: "#ccc", fontSize: 14, marginTop: 2 }}>
                                        {item.display_name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={!loading && search.length > 1 ? (
                            <Text style={{ color: "#888", textAlign: 'center', marginTop: 32 }}>Không tìm thấy kết quả</Text>
                        ) : null}
                    />
                </View>
            )}

            {loading && <ActivityIndicator color="#fff" style={{ marginBottom: 16 }} />}
        </View>
    );
} 