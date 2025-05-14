import React from 'react';
import { View, ScrollView, Dimensions, Text } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS } from '../../constants/theme';

interface HourlyData {
    time: string;
    temp_c: number;
    condition: {
        text: string;
        icon: string;
        code: number;
    };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    chance_of_rain: number;
    chance_of_snow: number;
    air_quality: any;
}

interface Props {
    data: HourlyData[];
}

export default function HourlyCharts({ data }: Props) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <View style={{ gap: 16 }}>
                <Text style={{ color: COLORS.text.secondary, textAlign: 'center' }}>
                    Không có dữ liệu biểu đồ
                </Text>
            </View>
        );
    }

    const chartWidth = Dimensions.get('window').width - 40;
    const labels = data.map(item => {
        const date = new Date(item.time);
        return `${date.getHours().toString().padStart(2, '0')}:00`;
    });

    const renderChart = (title: string, data: number[], color: string, suffix: string, isBarChart: boolean = false) => (
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 8, marginBottom: 16 }}>
            <Text style={{ color: COLORS.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 8, paddingHorizontal: 8 }}>{title}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {isBarChart ? (
                    <BarChart
                        data={{
                            labels,
                            datasets: [{ data }],
                        }}
                        width={chartWidth}
                        height={120}
                        yAxisLabel=""
                        yAxisSuffix={suffix}
                        chartConfig={{
                            backgroundGradientFrom: COLORS.secondary,
                            backgroundGradientTo: COLORS.secondary,
                            color: () => color,
                            labelColor: () => COLORS.text.primary,
                            propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.2)' },
                            decimalPlaces: 0,
                        }}
                        style={{ borderRadius: 16 }}
                    />
                ) : (
                    <LineChart
                        data={{
                            labels,
                            datasets: [{ data }],
                        }}
                        width={chartWidth}
                        height={120}
                        yAxisSuffix={suffix}
                        chartConfig={{
                            backgroundGradientFrom: COLORS.secondary,
                            backgroundGradientTo: COLORS.secondary,
                            color: () => color,
                            labelColor: () => COLORS.text.primary,
                            propsForDots: { r: '4', strokeWidth: '2', stroke: '#fff' },
                            propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.2)' },
                            decimalPlaces: 0,
                        }}
                        bezier
                        style={{ borderRadius: 16 }}
                    />
                )}
            </ScrollView>
        </View>
    );

    return (
        <View style={{ gap: 16 }}>
            {renderChart('Nhiệt độ (°C)', data.map(d => Math.round(d.temp_c)), '#ff9e00', '°')}
            {renderChart('Nhiệt độ cảm nhận (°C)', data.map(d => Math.round(d.feelslike_c)), '#fb7185', '°')}
            {renderChart('Xác suất mưa (%)', data.map(d => d.chance_of_rain), '#4cc9f0', '%', true)}
            {renderChart('Tốc độ gió (km/h)', data.map(d => Math.round(d.wind_kph)), '#60a5fa', 'km/h')}
            {renderChart('Độ ẩm (%)', data.map(d => d.humidity), '#38bdf8', '%')}
        </View>
    );
} 