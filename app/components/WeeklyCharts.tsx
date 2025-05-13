import React from 'react';
import { View, ScrollView, Dimensions, Text } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS } from '../../constants/theme';

interface DayData {
    date: Date;
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    weather: {
        main: string;
        description: string;
        icon: string;
    };
    wind: {
        speed: number;
        deg: number;
    };
    pop: number;
    clouds: number;
    visibility: number;
}

export default function WeeklyCharts({ forecastday }: { forecastday: DayData[] }) {
    if (!forecastday || !Array.isArray(forecastday) || forecastday.length === 0) {
        return (
            <View style={{ gap: 16 }}>
                <Text style={{ color: COLORS.text.secondary, textAlign: 'center' }}>
                    Không có dữ liệu biểu đồ
                </Text>
            </View>
        );
    }

    const chartWidth = Dimensions.get('window').width - 40;
    const labels = forecastday.map(d => {
        if (!d || !d.date) return '';
        const date = d.date instanceof Date ? d.date : new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    }).filter(Boolean);

    const tempData = forecastday.map(d => d?.temp || 0);
    const rainData = forecastday.map(d => (d?.pop || 0) * 100); // Convert probability to percentage

    return (
        <View style={{ gap: 16 }}>
            {/* LineChart nhiệt độ */}
            <View style={{ backgroundColor: COLORS.backgroundCard, borderRadius: 20, padding: 8 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8, paddingHorizontal: 8 }}>Nhiệt độ (°C)</Text>
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
                            color: () => '#ff9e00',
                            labelColor: () => '#fff',
                            propsForDots: { r: '4', strokeWidth: '2', stroke: '#fff' },
                            propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.2)' },
                            decimalPlaces: 0,
                        }}
                        bezier
                        style={{ borderRadius: 20 }}
                    />
                </ScrollView>
            </View>
            {/* BarChart lượng mưa */}
            <View style={{ backgroundColor: COLORS.backgroundCard, borderRadius: 20, padding: 8, marginBottom: 16 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8, paddingHorizontal: 8 }}>Xác suất mưa (%)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                        data={{
                            labels,
                            datasets: [{ data: rainData }],
                        }}
                        width={chartWidth}
                        height={120}
                        yAxisLabel=""
                        yAxisSuffix="%"
                        chartConfig={{
                            backgroundGradientFrom: COLORS.secondary,
                            backgroundGradientTo: COLORS.secondary,
                            color: () => '#4cc9f0',
                            labelColor: () => '#fff',
                            propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.2)' },
                            decimalPlaces: 0,
                        }}
                        style={{ borderRadius: 20 }}
                    />
                </ScrollView>
            </View>
        </View>
    );
} 