import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { weatherApi, WeatherNotification } from '../../services/api/weatherApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'alert_severity_setting';

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<WeatherNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeverity, setSelectedSeverity] = useState<string>('moderate');

    useEffect(() => {
        loadAlertSetting();
        fetchNotifications();
    }, []);

    const loadAlertSetting = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                setSelectedSeverity(saved);
            }
        } catch (error) {
            console.error('Error loading alert setting:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const currentCity = await AsyncStorage.getItem('current_city');
            const latitude = await AsyncStorage.getItem('latitude');
            const longitude = await AsyncStorage.getItem('longitude');

            if (!currentCity && !latitude && !longitude) {
                setError('Vui lòng chọn địa điểm để xem thông báo');
                return;
            }

            const response = await weatherApi.getWeatherNotifications(
                currentCity || undefined,
                latitude ? parseFloat(latitude) : undefined,
                longitude ? parseFloat(longitude) : undefined
            );

            // Lọc thông báo theo mức độ đã chọn
            const severityLevels = ['minor', 'moderate', 'severe', 'extreme'];
            const selectedIndex = severityLevels.indexOf(selectedSeverity);

            const filteredAlerts = response.data.alerts.filter(alert => {
                const alertIndex = severityLevels.indexOf(alert.severity.toLowerCase());
                // Chỉ lấy các thông báo có mức độ từ mức đã chọn trở lên
                return alertIndex >= selectedIndex;
            });

            // Sắp xếp thông báo theo mức độ nghiêm trọng (từ cao xuống thấp)
            filteredAlerts.sort((a, b) => {
                const aIndex = severityLevels.indexOf(a.severity.toLowerCase());
                const bIndex = severityLevels.indexOf(b.severity.toLowerCase());
                return bIndex - aIndex;
            });

            setNotifications(filteredAlerts);
            setError(null);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationPress = (notification: WeatherNotification) => {
        router.push({
            pathname: '/(tabs)/notification-detail',
            params: { id: notification.id }
        });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
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

    const getSeverityLabel = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'extreme':
                return 'Cực kỳ nghiêm trọng';
            case 'severe':
                return 'Nghiêm trọng';
            case 'moderate':
                return 'Trung bình';
            case 'minor':
                return 'Nhẹ';
            default:
                return severity;
        }
    };

    const renderNotification = ({ item }: { item: WeatherNotification }) => (
        <TouchableOpacity
            style={[styles.notificationItem]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={[styles.iconContainer, { backgroundColor: getSeverityColor(item.severity) + '20' }]}>
                <Ionicons
                    name="notifications"
                    size={24}
                    color={getSeverityColor(item.severity)}
                />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.title, { color: getSeverityColor(item.severity) }]}>{item.title}</Text>

                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {item.description}
                </Text>
                <Text style={styles.time}>
                    {new Date(item.startTime).toLocaleString('vi-VN')}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Thông báo</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Thông báo</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông báo</Text>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={fetchNotifications}
                >
                    <Ionicons name="refresh" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item, index) => `notification-${item.id}-${index}`}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Không có thông báo nào</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: COLORS.secondary,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    clearButton: {
        padding: 8,
    },
    listContainer: {
        padding: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    contentContainer: {
        flex: 1,
        marginRight: 8,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    severity: {
        fontSize: 10,
        fontWeight: '600',
    },
    message: {
        fontSize: 14,
        color: COLORS.text.secondary,
        lineHeight: 20,
    },
    time: {
        fontSize: 10,
        color: COLORS.text.secondary,
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 16,
        textAlign: 'center',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.text.secondary,
        fontSize: 16,
    },
}); 