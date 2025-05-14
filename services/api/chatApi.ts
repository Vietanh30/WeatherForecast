import { API_CONFIG } from './config';

export interface ChatMessage {
    id: string;
    question: string;
    answer: string;
    weatherData?: any;
    sessionId: string;
    timestamp: string;
}

export interface ChatResponse {
    message: string;
    data: ChatMessage;
}

export interface ChatHistoryResponse {
    message: string;
    data: ChatMessage[];
}

export const chatApi = {
    handleChat: async (question: string, city?: string, sessionId?: string): Promise<ChatResponse> => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question, city, sessionId }),
            });
            if (!response.ok) {
                throw new Error('Chat API request failed');
            }
            return await response.json();
        } catch (error) {
            throw new Error('Failed to send chat message');
        }
    },

    getChatHistory: async (sessionId: string): Promise<ChatHistoryResponse> => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/chat/history?sessionId=${sessionId}`);
            if (!response.ok) {
                throw new Error('Chat history API request failed');
            }
            return await response.json();
        } catch (error) {
            throw new Error('Failed to fetch chat history');
        }
    }
}; 