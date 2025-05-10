import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { COLORS } from '../constants/theme';

export default function FeatureCard({ icon, value, label, width }: { icon: string, value: string, label: string, width: number }) {
    return (
        <View
            style={[
                tw`rounded-2xl p-4 m-1`,
                {
                    width,
                    backgroundColor: 'rgba(255,255,255,0.1)'
                }
            ]}
        >
            <MaterialCommunityIcons
                name={icon as any}
                size={28}
                color={COLORS.icon.primary}
                style={tw`mb-2`}
            />
            <Text style={[tw`text-lg font-bold`, { color: COLORS.text.primary }]}>{value}</Text>
            <Text style={[tw`text-xs`, { color: COLORS.text.secondary }]}>{label}</Text>
        </View>
    );
} 