import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import tw from 'tailwind-react-native-classnames';

export default function ForecastTabs({ tab, setTab }: { tab: string, setTab: (t: string) => void }) {
    return (
        <View style={tw`flex-row mb-2 pb-2`}>
            <TouchableOpacity style={[tw`flex-1 py-2`, tab === 'hourly' && tw`border-b border-b-2 border-white pb-2`]} onPress={() => setTab('hourly')}>
                <Text style={tw`text-white text-center font-semibold`}>Dự báo theo giờ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[tw`flex-1 py-2`, tab === 'weekly' && tw`border-b border-b-2 border-white pb-2`]} onPress={() => setTab('weekly')}>
                <Text style={tw`text-white text-center font-semibold`}>Dự báo theo tuần</Text>
            </TouchableOpacity>
        </View>
    );
} 