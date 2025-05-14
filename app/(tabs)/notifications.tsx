import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

// Mock data for notifications
const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        title: 'Cảnh báo thời tiết',
        message: 'Dự báo mưa lớn tại Hà Nội trong 2 giờ tới',
        time: '10 phút trước',
        type: 'warning',
        read: false
    },
    {
        id: '2',
        title: 'Cập nhật thời tiết',
        message: 'Nhiệt độ tại TP.HCM đã tăng lên 35°C',
        time: '30 phút trước',
        type: 'info',
        read: true
    },
    {
        id: '3',
        title: 'Thông báo mới',
        message: 'Bạn có thể xem dự báo thời tiết 7 ngày tới',
        time: '1 giờ trước',
        type: 'info',
        read: true
    },
    {
        id: '4',
        title: 'Cảnh báo bão',
        message: 'Bão số 5 đang tiến gần đến vùng biển miền Trung',
        time: '2 giờ trước',
        type: 'warning',
        read: false
    }
];

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return 'warning';
            case 'info':
                return 'information-circle';
            default:
                return 'notifications';
        }
    };

    const handleNotificationPress = (notification: any) => {
        // Mark as read
        setNotifications(prev =>
            prev.map(item =>
                item.id === notification.id ? { ...item, read: true } : item
            )
        );
        // Navigate to detail
        router.push({
            pathname: '/(tabs)/notification-detail',
            params: { id: notification.id }
        });
    };

    const renderNotification = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.read && styles.unreadItem]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.iconContainer}>
                <Ionicons
                    name={getNotificationIcon(item.type)}
                    size={24}
                    color={item.type === 'warning' ? COLORS.warning : COLORS.primary}
                />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông báo</Text>
                <TouchableOpacity style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Xóa tất cả</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
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
    clearButtonText: {
        color: COLORS.primary,
        fontSize: 14,
    },
    listContainer: {
        padding: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    unreadItem: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
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
    time: {
        fontSize: 12,
        color: COLORS.text.secondary,
    },
    message: {
        fontSize: 14,
        color: COLORS.text.secondary,
        lineHeight: 20,
    },
}); 