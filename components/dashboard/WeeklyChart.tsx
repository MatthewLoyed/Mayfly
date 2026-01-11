import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { format, parseISO } from 'date-fns';
import { StyleSheet, View } from 'react-native';

interface WeeklyDataPoint {
    date: string;
    count: number;
}

interface WeeklyChartProps {
    data: WeeklyDataPoint[];
    colors: typeof Colors.light;
}

export function WeeklyChart({ data, colors }: WeeklyChartProps) {
    if (data.length === 0) return null;

    return (
        <View style={styles.chartContainer}>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Last 7 Days
            </ThemedText>
            <View style={styles.chart}>
                {data.map((dataPoint) => {
                    const maxCount = Math.max(...data.map(d => d.count), 1);
                    const height = maxCount > 0 ? (dataPoint.count / maxCount) * 100 : 0;
                    const date = parseISO(dataPoint.date);
                    const dayLabel = format(date, 'EEE');
                    const dayNumber = format(date, 'd');

                    return (
                        <View key={dataPoint.date} style={styles.barContainer}>
                            <View style={styles.barWrapper}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: Math.max(height, dataPoint.count > 0 ? 4 : 0),
                                            backgroundColor: dataPoint.count > 0 ? colors.habitComplete : colors.habitIncomplete,
                                        },
                                    ]}
                                />
                                <ThemedText style={styles.barValue} darkColor="#999">
                                    {dataPoint.count}
                                </ThemedText>
                            </View>
                            <ThemedText style={styles.barLabel} darkColor="#666">
                                {dayLabel}
                            </ThemedText>
                            <ThemedText style={styles.barDayNumber} darkColor="#999">
                                {dayNumber}
                            </ThemedText>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    chartContainer: {
        marginTop: 8,
    },
    chartTitle: {
        marginBottom: 16,
        fontSize: 16,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 140,
        paddingHorizontal: 8,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    barWrapper: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 8,
    },
    bar: {
        width: '80%',
        minHeight: 4,
        borderRadius: 4,
        marginBottom: 4,
    },
    barValue: {
        fontSize: 11,
        fontWeight: '600',
    },
    barLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    barDayNumber: {
        fontSize: 9,
        marginTop: 2,
    },
});
