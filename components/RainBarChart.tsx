import React from 'react';
import { View, Text } from 'react-native';
import tw from 'tailwind-react-native-classnames';

export default function RainBarChart({ data }: { data: number[] }) {
    return (
        <View style={tw`bg-purple-800 bg-opacity-60 rounded-2xl p-4 mb-4`}>
            <Text style={tw`text-white mb-2`}>Lượng mưa theo giờ</Text>
            <View style={tw`flex-row justify-between items-end h-20`}>
                {data.map((v, i) => (
                    <View key={i} style={tw`items-center`}>
                        <View style={{ width: 12, height: v * 6, backgroundColor: '#fff', borderRadius: 6, marginBottom: 2 }} />
                        <Text style={tw`text-white text-xs`}>{v}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
} 