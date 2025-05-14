import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

// Mock data for notifications (same as in notifications.tsx)
const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        title: 'Cảnh báo thời tiết',
        message: 'Dự báo mưa lớn tại Hà Nội trong 2 giờ tới. Lượng mưa dự kiến có thể lên đến 50mm. Người dân cần chú ý đề phòng ngập lụt và lũ quét tại các khu vực trũng thấp. Các hoạt động ngoài trời nên được hạn chế trong thời gian này.',
        time: '10 phút trước',
        type: 'warning',
        read: false,
        location: 'Hà Nội',
        severity: 'Cao',
        recommendations: [
            'Hạn chế di chuyển ngoài trời',
            'Chuẩn bị dụng cụ thoát nước',
            'Theo dõi thông tin thời tiết'
        ]
    },
    {
        id: '2',
        title: 'Cập nhật thời tiết',
        message: 'Nhiệt độ tại TP.HCM đã tăng lên 35°C. Đây là mức nhiệt cao nhất trong ngày. Người dân cần chú ý uống đủ nước và hạn chế hoạt động ngoài trời trong khoảng thời gian từ 11h đến 15h.',
        time: '30 phút trước',
        type: 'info',
        read: true,
        location: 'TP.HCM',
        severity: 'Trung bình',
        recommendations: [
            'Uống đủ nước',
            'Hạn chế hoạt động ngoài trời',
            'Sử dụng kem chống nắng'
        ]
    },
    {
        id: '3',
        title: 'Thông báo mới',
        message: 'Bạn có thể xem dự báo thời tiết 7 ngày tới với nhiều tính năng mới. Cập nhật ứng dụng để trải nghiệm các tính năng mới nhất.',
        time: '1 giờ trước',
        type: 'info',
        read: true,
        location: 'Toàn quốc',
        severity: 'Thấp',
        recommendations: [
            'Cập nhật ứng dụng',
            'Khám phá tính năng mới',
            'Đánh giá ứng dụng'
        ]
    },
    {
        id: '4',
        title: 'Cảnh báo bão',
        message: 'Bão số 5 đang tiến gần đến vùng biển miền Trung. Sức gió mạnh nhất vùng gần tâm bão mạnh cấp 12-13, giật cấp 15. Các tỉnh từ Quảng Bình đến Quảng Ngãi cần chủ động phòng chống.',
        time: '2 giờ trước',
        type: 'warning',
        read: false,
        location: 'Miền Trung',
        severity: 'Rất cao',
        recommendations: [
            'Di chuyển đến nơi an toàn',
            'Chuẩn bị lương thực, nước uống',
            'Theo dõi thông tin từ chính quyền'
        ]
    }
];

export default function NotificationDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [notification, setNotification] = useState<any>(null);

    useEffect(() => {
        const foundNotification = MOCK_NOTIFICATIONS.find(n => n.id === id);
        if (foundNotification) {
            setNotification(foundNotification);
        }
    }, [id]);

    if (!notification) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Không tìm thấy thông báo</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết thông báo</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.notificationHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={notification.type === 'warning' ? 'warning' : 'information-circle'}
                            size={32}
                            color={notification.type === 'warning' ? COLORS.warning : COLORS.primary}
                        />
                    </View>
                    <Text style={styles.title}>{notification.title}</Text>
                    <Text style={styles.time}>{notification.time}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Khu vực:</Text>
                        <Text style={styles.infoValue}>{notification.location}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mức độ:</Text>
                        <Text style={[
                            styles.infoValue,
                            { color: notification.severity === 'Rất cao' ? COLORS.warning : COLORS.text.primary }
                        ]}>
                            {notification.severity}
                        </Text>
                    </View>
                </View>

                <View style={styles.messageContainer}>
                    <Text style={styles.message}>{notification.message}</Text>
                </View>

                {notification.recommendations && (
                    <View style={styles.recommendationsContainer}>
                        <Text style={styles.recommendationsTitle}>Khuyến nghị:</Text>
                        {notification.recommendations.map((rec: string, index: number) => (
                            <View key={index} style={styles.recommendationItem}>
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                <Text style={styles.recommendationText}>{rec}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: COLORS.secondary,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 8,
        width: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    notificationHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    time: {
        fontSize: 14,
        color: COLORS.text.secondary,
    },
    infoContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    infoLabel: {
        fontSize: 16,
        color: COLORS.text.secondary,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    messageContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    message: {
        fontSize: 16,
        color: COLORS.text.primary,
        lineHeight: 24,
    },
    recommendationsContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
    },
    recommendationsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 16,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    recommendationText: {
        fontSize: 16,
        color: COLORS.text.primary,
        marginLeft: 12,
        flex: 1,
    },
    errorText: {
        color: COLORS.text.primary,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 32,
    },
}); 