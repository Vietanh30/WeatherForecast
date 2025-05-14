import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Clipboard, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { chatApi, ChatMessage } from '../../services/api/chatApi';
import { locationApi } from '../../services/api/locationApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const SUGGESTED_QUESTIONS = [
    "Thời tiết hôm nay thế nào?",
    "Dự báo thời tiết 3 ngày tới?",
    "Nhiệt độ hiện tại là bao nhiêu?",
    "Có mưa ở đâu?",
    "Độ ẩm ở đâu?",
    "Tốc độ gió ở đâu?",
    "Thời tiết cuối tuần này ở đâu?",
    "Có nên mang ô khi đi du lịch đâu?",
    "Nhiệt độ cảm nhận thực tế ở đâu?",
    "Thời tiết có phù hợp để đi du lịch đâu?"
];

const POPULAR_CITIES = [
    "Định vị", "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Nha Trang", "Nam Định", "Hà Giang",
];

function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    function debouncedFunction(...args: Parameters<T>) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }

    debouncedFunction.cancel = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    return debouncedFunction;
}

export default function ChatboxScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [sessionId, setSessionId] = useState<string>(Date.now().toString());
    const [isLoading, setIsLoading] = useState(false);
    const [currentCity, setCurrentCity] = useState<string>('');
    const [showCityModal, setShowCityModal] = useState(false);
    const [searchCity, setSearchCity] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        loadChatHistory();
        loadCurrentCity();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    };

    const loadCurrentCity = async () => {
        try {
            const city = await AsyncStorage.getItem('current_city');
            if (city) {
                setCurrentCity(city);
            }
        } catch (error) {
            console.error('Failed to load current city:', error);
        }
    };

    const loadChatHistory = async () => {
        try {
            const response = await chatApi.getChatHistory(sessionId);
            if (response.data) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };

    const handleSend = async () => {
        if (inputText.trim() === '') return;
        setIsLoading(true);

        try {
            const response = await chatApi.handleChat(inputText, currentCity, sessionId);
            console.log('currentCity', currentCity);
            if (response.data) {
                setMessages(prev => [...prev, response.data]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                question: inputText,
                answer: 'Có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
                sessionId,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setInputText('');
            setIsLoading(false);
        }
    };

    const createNewChat = () => {
        Alert.alert(
            'Tạo cuộc trò chuyện mới',
            'Bạn có chắc chắn muốn tạo cuộc trò chuyện mới?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel'
                },
                {
                    text: 'Tạo mới',
                    onPress: () => {
                        setSessionId(Date.now().toString());
                        setMessages([]);
                    }
                }
            ]
        );
    };

    const copyAnswer = (answer: string) => {
        Clipboard.setString(answer);
        Alert.alert('Thông báo', 'Đã sao chép câu trả lời!');
    };

    const handleSuggestedQuestion = (question: string) => {
        if (!question.includes('ở') && currentCity) {
            const cityName = currentCity.split(',')[0];
            setInputText(question.replace('?', ` ở ${cityName}?`));
        } else {
            setInputText(question);
        }
    };

    const handleCitySearch = async (text: string) => {
        setSearchCity(text);
        if (text.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const data = await locationApi.searchLocation(text);
            setSearchResults(data.features.map((f: any) => ({
                place_id: f.properties.place_id,
                display_name: f.properties.formatted,
                ...f.properties
            })));
        } catch (error) {
            console.error('Search location error:', error);
            Alert.alert('Lỗi', 'Không thể tìm kiếm địa điểm. Vui lòng thử lại sau.');
        } finally {
            setIsSearching(false);
        }
    };

    const debouncedSearch = useDebounce(handleCitySearch, 500);

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
                    const cityName = data.features[0].properties.formatted;
                    await AsyncStorage.setItem('current_city', cityName);
                    setCurrentCity(cityName);
                    setShowCityModal(false);
                }
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại!');
            }
        } else {
            setSearchCity(city);
            debouncedSearch(city);
        }
    };

    const handleCitySelect = async (location: any) => {
        try {
            const cityName = location.display_name;
            await AsyncStorage.setItem('current_city', cityName);
            setCurrentCity(cityName);
            setShowCityModal(false);
            setSearchCity('');
            setSearchResults([]);
        } catch (error) {
            console.error('Failed to save city:', error);
            Alert.alert('Lỗi', 'Không thể lưu địa điểm. Vui lòng thử lại sau.');
        }
    };

    const renderCityModal = () => (
        <Modal
            visible={showCityModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCityModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Tìm kiếm địa điểm</Text>
                        <TouchableOpacity onPress={() => setShowCityModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.text.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Thành phố phổ biến */}
                    <Text style={styles.sectionTitle}>Thành phố phổ biến</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.popularCitiesContainer}
                    >
                        {POPULAR_CITIES.map(city => (
                            <TouchableOpacity
                                key={city}
                                style={[
                                    styles.popularCityButton,
                                    searchCity === city && styles.selectedCityButton
                                ]}
                                onPress={() => handlePopularCity(city)}
                            >
                                <Text style={styles.popularCityText}>{city}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Nhập tên thành phố..."
                        placeholderTextColor={COLORS.text.secondary}
                        value={searchCity}
                        onChangeText={(text) => {
                            setSearchCity(text);
                            debouncedSearch(text);
                        }}
                    />

                    <ScrollView style={styles.cityList}>
                        {isSearching ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                                <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
                            </View>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((location) => (
                                <TouchableOpacity
                                    key={location.place_id}
                                    style={styles.cityItem}
                                    onPress={() => handleCitySelect(location)}
                                >
                                    <View style={styles.locationInfo}>
                                        <Text style={styles.cityText}>
                                            {location.display_name.split(',')[0]}
                                        </Text>
                                        <Text style={styles.locationDetail}>
                                            {location.display_name}
                                        </Text>
                                    </View>
                                    {currentCity === location.display_name && (
                                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            ))
                        ) : searchCity.length >= 2 ? (
                            <Text style={styles.noResultsText}>Không tìm thấy kết quả</Text>
                        ) : null}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderSuggestedQuestions = () => {
        return (
            <View style={styles.suggestedContainer}>
                <View style={styles.suggestedHeader}>
                    <Text style={styles.suggestedTitle}>Bạn có thể hỏi:</Text>
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={() => setShowCityModal(true)}
                    >
                        <Ionicons name="location" size={16} color={COLORS.text.primary} />
                        <Text style={styles.locationText}>
                            {currentCity ? currentCity.split(',')[0] : 'Chọn thành phố'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestedScrollContent}
                >
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestedButton}
                            onPress={() => handleSuggestedQuestion(question)}
                        >
                            <Text style={styles.suggestedText}>{question}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderMessage = (message: ChatMessage) => (
        <View key={message.id} style={styles.messageWrapper}>
            {/* User Question */}
            <View style={[styles.messageBubble, styles.userMessage]}>
                <Text style={styles.messageText}>{message.question}</Text>
                <Text style={styles.timestamp}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            {/* Bot Answer */}
            <View style={[styles.messageBubble, styles.botMessage]}>
                <Text style={styles.messageText}>{message.answer}</Text>
                <View style={styles.answerFooter}>
                    <Text style={styles.timestamp}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <TouchableOpacity
                        onPress={() => copyAnswer(message.answer)}
                        style={styles.copyButton}
                    >
                        <Ionicons name="copy-outline" size={16} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chat với Bot</Text>
                <TouchableOpacity onPress={createNewChat} style={styles.newChatButton}>
                    <Ionicons name="add-circle-outline" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map(renderMessage)}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Đang xử lý...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Suggested Questions */}
            {renderSuggestedQuestions()}

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Nhập tin nhắn..."
                    placeholderTextColor={COLORS.text.secondary}
                    multiline
                    editable={!isLoading}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={COLORS.text.secondary} />
                    ) : (
                        <Ionicons
                            name="send"
                            size={24}
                            color={inputText.trim() ? COLORS.primary : COLORS.text.secondary}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {renderCityModal()}
        </KeyboardAvoidingView>
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
    },
    newChatButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
    },
    messageWrapper: {
        marginBottom: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.secondary,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        color: COLORS.text.primary,
        fontSize: 16,
        lineHeight: 22,
    },
    timestamp: {
        color: COLORS.text.secondary,
        fontSize: 12,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.secondary,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginRight: 8,
        color: COLORS.text.primary,
        maxHeight: 100,
        fontSize: 16,
    },
    sendButton: {
        padding: 8,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    loadingText: {
        color: COLORS.text.secondary,
        marginLeft: 8,
        fontSize: 14,
    },
    answerFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    copyButton: {
        padding: 4,
        marginLeft: 8,
    },
    suggestedContainer: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    suggestedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    suggestedTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.secondary,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    locationText: {
        color: COLORS.text.primary,
        marginLeft: 4,
        fontSize: 14,
    },
    suggestedScrollContent: {
        paddingHorizontal: 16,
    },
    suggestedButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    suggestedText: {
        color: COLORS.text.primary,
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: COLORS.text.primary,
        marginBottom: 16,
    },
    cityList: {
        maxHeight: 400,
    },
    cityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    cityText: {
        color: COLORS.text.primary,
        fontSize: 16,
    },
    locationInfo: {
        flex: 1,
    },
    locationDetail: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    noResultsText: {
        color: COLORS.text.secondary,
        textAlign: 'center',
        padding: 16,
    },
    sectionTitle: {
        color: COLORS.text.secondary,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 16,
    },
    popularCitiesContainer: {
        marginBottom: 16,
    },
    popularCityButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    selectedCityButton: {
        backgroundColor: COLORS.primary,
    },
    popularCityText: {
        color: COLORS.text.primary,
        fontSize: 14,
    },
}); 