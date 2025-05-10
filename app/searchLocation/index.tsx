import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Nha Trang", "Nam Định", "Hà Đông"
];

export default function SearchLocationScreen() {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [savedLocations, setSavedLocations] = useState<any[]>([]);
    const [currentCity, setCurrentCity] = useState<string | null>(null);

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
            const res = await fetch(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&lang=vi&limit=10&apiKey=4d8e69d77ca943a7b1f0c2b137983440`
            );
            const data = await res.json();
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

    // Thêm địa chỉ vào danh sách đã lưu
    const handleAddLocation = async (item: any) => {
        if (savedLocations.some(loc => loc.place_id === item.place_id)) {
            Alert.alert('Địa chỉ đã có trong danh sách!');
            return;
        }
        const newList = [item, ...savedLocations];
        setSavedLocations(newList);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
        setSelected(item.place_id);
    };

    // Chọn thành phố phổ biến
    const handlePopularCity = async (city: string) => {
        setSearch(city);
        // Optionally: fetch weather for this city, or add to saved
    };

    // Đặt thành phố hiện tại
    const handleSetCurrent = async (item: any) => {
        await AsyncStorage.setItem('current_city', item.display_name);
        setCurrentCity(item.display_name);
        setSelected(item.place_id);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#000", paddingHorizontal: 16, paddingTop: 32 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: 'bold', marginBottom: 24, textAlign: 'left' }}>Quản lý thành phố</Text>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#222',
                borderRadius: 20,
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
            </View>

            {/* Thành phố phổ biến */}
            <Text style={{ color: "#888", marginBottom: 8, fontWeight: 'bold' }}>Thành phố phổ biến</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 }}>
                {POPULAR_CITIES.map(city => (
                    <TouchableOpacity
                        key={city}
                        style={{
                            backgroundColor: search === city ? "#223366" : "#222",
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
            {savedLocations.length > 0 && (
                <FlatList
                    data={savedLocations}
                    keyExtractor={item => item.place_id?.toString() || item.display_name}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={{
                                backgroundColor: selected === item.place_id
                                    ? "#223366"
                                    : "#222e5c",
                                borderRadius: 20,
                                padding: 20,
                                marginBottom: 18,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                            onPress={() => handleSetCurrent(item)}
                            activeOpacity={0.8}
                        >
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: 'bold', marginRight: 6 }}>
                                        {item.display_name.split(',')[0]}
                                    </Text>
                                    {currentCity === item.display_name && (
                                        <Ionicons name="location-sharp" size={18} color="#fff" />
                                    )}
                                </View>
                                <Text style={{ color: "#ccc", marginTop: 2 }}>
                                    {/* Bạn có thể fetch và hiển thị trạng thái thời tiết, nhiệt độ ở đây */}
                                    Nhiều mây   32° / 20°
                                </Text>
                            </View>
                            <Text style={{ color: "#fff", fontSize: 16, fontWeight: 'bold' }}>28°</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            {loading && <ActivityIndicator color="#fff" style={{ marginBottom: 16 }} />}
            <FlatList
                data={results}
                keyExtractor={item => item.place_id?.toString() || item.display_name}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={{
                            backgroundColor: selected === item.place_id
                                ? "#223366"
                                : "#222e5c",
                            borderRadius: 20,
                            padding: 20,
                            marginBottom: 18,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                        onPress={() => handleAddLocation(item)}
                        activeOpacity={0.8}
                    >
                        <View>
                            <Text style={{ color: "#fff", fontSize: 16, fontWeight: 'bold' }}>
                                {item.display_name.split(',')[0]}
                            </Text>
                            <Text style={{ color: "#ccc", marginTop: 2 }}>
                                {/* Bạn có thể fetch và hiển thị trạng thái thời tiết, nhiệt độ ở đây */}
                                Nhiều mây   32° / 20°
                            </Text>
                        </View>
                        <Text style={{ color: "#fff", fontSize: 16, fontWeight: 'bold' }}>28°</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={!loading && search.length > 1 ? (
                    <Text style={{ color: "#888", textAlign: 'center', marginTop: 32 }}>Không tìm thấy kết quả</Text>
                ) : null}
            />
        </View>
    );
} 