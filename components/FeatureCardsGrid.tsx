import React from 'react';
import { View, Dimensions } from 'react-native';
import FeatureCard from './FeatureCard';

interface FeatureCardData {
    label: string;
    value: string;
    icon: string;
}

export default function FeatureCardsGrid({ data }: { data: FeatureCardData[] }) {
    const width = Dimensions.get('window').width / 2 - 24;
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {data.map((card, idx) => (
                <FeatureCard key={idx} {...card} width={width} />
            ))}
        </View>
    );
} 