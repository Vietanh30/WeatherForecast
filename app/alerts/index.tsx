import React from 'react';
import { View, Text, FlatList } from 'react-native';
import tw from 'tailwind-react-native-classnames';

const alerts = [
    { id: 1, type: 'rain', title: 'Cảnh báo mưa', desc: 'Dự báo có mưa to trong 2 giờ tới', time: '10:00' },
    { id: 2, type: 'storm', title: 'Cảnh báo bão', desc: 'Có khả năng xảy ra bão trong 24h', time: '15:30' },
];

export default function AlertsScreen() {
    return (
        <View style={[tw`flex-1 bg-purple-900 px-4 pt-8`]}>
            <Text style={tw`text-white text-2xl font-bold mb-6`}>Cảnh báo</Text>
            <FlatList
                data={alerts}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={[tw`bg-purple-700 rounded-xl p-4 mb-3`]}>
                        <Text style={tw`text-white text-lg font-bold`}>{item.title}</Text>
                        <Text style={tw`text-white`}>{item.desc}</Text>
                        <Text style={tw`text-purple-300 mt-2`}>{item.time}</Text>
                    </View>
                )}
            />
        </View>
    );
} 