import { API_CONFIG } from './config';

export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
}

export interface ChatResponse {
    message: ChatMessage;
}

export interface ChatHistoryResponse {
    messages: ChatMessage[];
}

export const chatApi = {
    handleChat: async (message: string): Promise<ChatResponse> => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
            if (!response.ok) {
                throw new Error('Chat API request failed');
            }
            return await response.json();
        } catch (error) {
            throw new Error('Failed to send chat message');
        }
    },

    getChatHistory: async (): Promise<ChatHistoryResponse> => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/chat/history`);
            if (!response.ok) {
                throw new Error('Chat history API request failed');
            }
            return await response.json();
        } catch (error) {
            throw new Error('Failed to fetch chat history');
        }
    }
}; 