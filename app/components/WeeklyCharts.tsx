import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS } from '../../constants/theme';

interface DayData {
    date: string;
    day: {
        maxtemp_c: number;
        totalprecip_mm: number;
    };
}

export default function WeeklyCharts({ forecastday }: { forecastday: DayData[] }) {
    const chartWidth = Dimensions.get('window').width - 40;
    const labels = forecastday.map(d => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    const tempData = forecastday.map(d => d.day.maxtemp_c);
    const rainData = forecastday.map(d => d.day.totalprecip_mm);

    return (
        <View style={{ gap: 16 }}>
            {/* LineChart nhiệt độ */}
            <View style={{ backgroundColor: COLORS.secondary, borderRadius: 20, padding: 8 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                        data={{
                            labels,
                            datasets: [{ data: tempData }],
                        }}
                        width={chartWidth}
                        height={120}
                        yAxisSuffix="°"
                        chartConfig={{
                            backgroundGradientFrom: COLORS.secondary,
                            backgroundGradientTo: COLORS.secondary,
                            color: () => '#e0aaff',
                            labelColor: () => '#fff',
                            propsForDots: { r: '4', strokeWidth: '2', stroke: '#fff' },
                            propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.08)' },
                            decimalPlaces: 0,
                        }}
                        bezier
                        style={{ borderRadius: 20 }}
                    />
                </ScrollView>
            </View>
            {/* BarChart lượng mưa */}
            <View style={{ backgroundColor: COLORS.secondary, borderRadius: 20, padding: 8 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                        data={{
                            labels,
                            datasets: [{ data: rainData }],
                        }}
                        width={chartWidth}
                        height={120}
                        yAxisLabel=""
                        yAxisSuffix="mm"
                        chartConfig={{
                            backgroundGradientFrom: COLORS.secondary,
                            backgroundGradientTo: COLORS.secondary,
                            color: () => '#e0aaff',
                            labelColor: () => '#fff',
                            propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.08)' },
                            decimalPlaces: 0,
                        }}
                        style={{ borderRadius: 20 }}
                    />
                </ScrollView>
            </View>
        </View>
    );
} 