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
    wind_kph: number;
    chance_of_rain: number;
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
    const rainData = forecastday.map(d => (d?.chance_of_rain || 0) * 100); // Convert probability to percentage
    const windData = forecastday.map(d => d?.wind_kph || 0);
    const humidityData = forecastday.map(d => d?.humidity || 0);
    const visibilityData = forecastday.map(d => (d?.visibility || 0) / 1000); // Convert to km

    const renderChart = (title: string, data: number[], color: string, suffix: string, isBarChart: boolean = false) => (
        <View style={{ backgroundColor: COLORS.backgroundCard, borderRadius: 20, padding: 8, marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8, paddingHorizontal: 8 }}>{title}</Text>
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
                            labelColor: () => '#fff',
                            propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.2)' },
                            decimalPlaces: 0,
                        }}
                        style={{ borderRadius: 20 }}
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
                            labelColor: () => '#fff',
                            propsForDots: { r: '4', strokeWidth: '2', stroke: '#fff' },
                            propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.2)' },
                            decimalPlaces: 0,
                        }}
                        bezier
                        style={{ borderRadius: 20 }}
                    />
                )}
            </ScrollView>
        </View>
    );

    return (
        <View style={{ gap: 16 }}>
            {renderChart('Nhiệt độ (°C)', tempData, '#ff9e00', '°')}
            {renderChart('Xác suất mưa (%)', rainData, '#4cc9f0', '%', true)}
            {renderChart('Tốc độ gió (m/s)', windData, '#60a5fa', 'm/s')}
            {renderChart('Độ ẩm (%)', humidityData, '#38bdf8', '%')}
            {renderChart('Tầm nhìn (km)', visibilityData, '#a78bfa', 'km')}
        </View>
    );
} 