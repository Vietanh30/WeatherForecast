import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { weatherApi } from '../../services/api/weatherApi';

interface WeatherNotificationDetail {
    id: string;
    type: string;
    severity: string;
    title: string;
    description: string;
    area: string;
    startTime: string;
    endTime: string;
    source: string;
    instructions: string;
    additional_info: {
        risk_analysis: {
            level: string;
            description: string;
        };
        prevention_measures: string[];
        affected_groups: string[];
        high_risk_areas: string[];
        impact_time: {
            start: string;
            peak: string;
            end: string;
        };
        reliable_sources: string[];
        emergency_contacts: string[];
    };
}

export default function NotificationDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [notification, setNotification] = useState<WeatherNotificationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotificationDetail = async () => {
            try {
                setLoading(true);
                const response = await weatherApi.getWeatherNotificationDetail(id as string);
                if (response.message) {
                    setNotification(response.data);
                } else {
                    setError('Không thể tải thông tin chi tiết');
                }
            } catch (err) {
                console.error('Error fetching notification detail:', err);
                setError('Đã xảy ra lỗi khi tải thông tin chi tiết');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNotificationDetail();
        }
    }, [id]);

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết thông báo</Text>
                    <View style={styles.backButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </View>
        );
    }

    if (error || !notification) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết thông báo</Text>
                    <View style={styles.backButton} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || 'Không tìm thấy thông báo'}</Text>
                </View>
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
                    <View style={[styles.iconContainer, { backgroundColor: getSeverityColor(notification.severity) + '20' }]}>
                        <Ionicons
                            name="warning"
                            size={32}
                            color={getSeverityColor(notification.severity)}
                        />
                    </View>
                    <Text style={styles.title}>{notification.title}</Text>
                    <Text style={styles.time}>{formatDate(notification.startTime)}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Khu vực:</Text>
                        <Text style={styles.infoValue}>{notification.area}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mức độ:</Text>
                        <Text style={[styles.infoValue, { color: getSeverityColor(notification.severity) }]}>
                            {notification.severity}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nguồn:</Text>
                        <Text style={styles.infoValue}>{notification.source}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Thời gian:</Text>
                        <Text style={styles.infoValue}>
                            {formatDate(notification.startTime)} - {formatDate(notification.endTime)}
                        </Text>
                    </View>
                </View>

                <View style={styles.messageContainer}>
                    <Text style={styles.message}>{notification.description}</Text>
                </View>

                <View style={styles.instructionsContainer}>
                    <Text style={styles.sectionTitle}>Hướng dẫn</Text>
                    <Text style={styles.instructions}>{notification.instructions}</Text>
                </View>

                {notification.additional_info && (
                    <>
                        <View style={styles.riskContainer}>
                            <Text style={styles.sectionTitle}>Phân tích rủi ro</Text>
                            <Text style={styles.riskLevel}>Mức độ: {notification.additional_info.risk_analysis.level}</Text>
                            <Text style={styles.riskDescription}>{notification.additional_info.risk_analysis.description}</Text>
                        </View>

                        <View style={styles.measuresContainer}>
                            <Text style={styles.sectionTitle}>Biện pháp phòng tránh</Text>
                            {notification.additional_info.prevention_measures.map((measure, index) => (
                                <View key={index} style={styles.measureItem}>
                                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                    <Text style={styles.measureText}>{measure}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.groupsContainer}>
                            <Text style={styles.sectionTitle}>Nhóm đối tượng bị ảnh hưởng</Text>
                            {notification.additional_info.affected_groups.map((group, index) => (
                                <View key={index} style={styles.groupItem}>
                                    <Ionicons name="people" size={20} color={COLORS.primary} />
                                    <Text style={styles.groupText}>{group}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.areasContainer}>
                            <Text style={styles.sectionTitle}>Khu vực nguy hiểm</Text>
                            {notification.additional_info.high_risk_areas.map((area, index) => (
                                <View key={index} style={styles.areaItem}>
                                    <Ionicons name="location" size={20} color={COLORS.warning} />
                                    <Text style={styles.areaText}>{area}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.impactTimeContainer}>
                            <Text style={styles.sectionTitle}>Thời gian ảnh hưởng</Text>
                            <View style={styles.timeRow}>
                                <Text style={styles.timeLabel}>Bắt đầu:</Text>
                                <Text style={styles.timeValue}>{notification.additional_info.impact_time.start}</Text>
                            </View>
                            <View style={styles.timeRow}>
                                <Text style={styles.timeLabel}>Đỉnh điểm:</Text>
                                <Text style={styles.timeValue}>{notification.additional_info.impact_time.peak}</Text>
                            </View>
                            <View style={styles.timeRow}>
                                <Text style={styles.timeLabel}>Kết thúc:</Text>
                                <Text style={styles.timeValue}>{notification.additional_info.impact_time.end}</Text>
                            </View>
                        </View>

                        <View style={styles.contactsContainer}>
                            <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>
                            {notification.additional_info.emergency_contacts.map((contact, index) => (
                                <View key={index} style={styles.contactItem}>
                                    <Ionicons name="call" size={20} color={COLORS.error} />
                                    <Text style={styles.contactText}>{contact}</Text>
                                </View>
                            ))}
                        </View>
                    </>
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
    notificationHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
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
    instructionsContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 16,
    },
    instructions: {
        fontSize: 16,
        color: COLORS.text.primary,
        lineHeight: 24,
    },
    riskContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    riskLevel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.warning,
        marginBottom: 8,
    },
    riskDescription: {
        fontSize: 16,
        color: COLORS.text.primary,
        lineHeight: 24,
    },
    measuresContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    measureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    measureText: {
        fontSize: 16,
        color: COLORS.text.primary,
        marginLeft: 12,
        flex: 1,
    },
    groupsContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    groupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    groupText: {
        fontSize: 16,
        color: COLORS.text.primary,
        marginLeft: 12,
        flex: 1,
    },
    areasContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    areaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    areaText: {
        fontSize: 16,
        color: COLORS.text.primary,
        marginLeft: 12,
        flex: 1,
    },
    impactTimeContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeLabel: {
        fontSize: 16,
        color: COLORS.text.secondary,
    },
    timeValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    contactsContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    contactText: {
        fontSize: 16,
        color: COLORS.text.primary,
        marginLeft: 12,
        flex: 1,
    },
}); 