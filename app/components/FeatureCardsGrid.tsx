import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { COLORS } from '../../constants/theme';

interface Props {
    data: Array<{
        label: string;
        value: string;
        icon: string;
        color: string;
    }>;
}

const FeatureCardsGrid: React.FC<Props> = ({ data }) => {
    return (
        <View style={tw`flex-row flex-wrap justify-between`}>
            {data.map((card, index) => (
                <View
                    key={index}
                    style={[
                        tw`w-[48%] mb-4 p-4 rounded-2xl`,
                        { backgroundColor: COLORS.card },
                        { minWidth: 64 }
                    ]}
                >
                    <View style={tw`flex-row items-center mb-2`}>
                        <MaterialCommunityIcons
                            name={card.icon as any}
                            size={24}
                            color={card.color}
                        />
                        <Text style={[tw`text-sm ml-2`, { color: COLORS.text.secondary }]}>
                            {card.label}
                        </Text>
                    </View>
                    <Text style={[tw`text-xl font-semibold`, { color: COLORS.text.primary }]}>
                        {card.value}
                    </Text>
                </View>
            ))}
        </View>
    );
};

export default FeatureCardsGrid; 