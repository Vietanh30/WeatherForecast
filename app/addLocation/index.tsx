import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'tailwind-react-native-classnames';

export default function AddLocationScreen() {
    return (
        <View style={[tw`flex-1 bg-purple-900 px-4 pt-8`]}>
            <Text style={tw`text-white text-2xl font-bold mb-6`}>Nha Trang</Text>
            {/* Bạn có thể tái sử dụng các component của Home ở đây */}
            <TouchableOpacity style={[tw`bg-purple-700 rounded-xl p-4 mt-8 items-center`]}>
                <Text style={tw`text-white text-lg`}>Thêm vị trí này</Text>
            </TouchableOpacity>
        </View>
    );
} 