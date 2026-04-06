import { format, parseISO } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withDelay, 
    withTiming,
    FadeIn,
    LinearTransition
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';
import { ThemedText } from '../themed-text';

interface WeeklyDataPoint {
    date: string;
    count: number;
}

interface GrowthForestChartProps {
    data: WeeklyDataPoint[];
    colors: typeof Colors.light;
}

/**
 * A single bar in the growth forest chart.
 * Represents habit completion count for a single day.
 */
const SproutBar = ({ height, color, index }: { height: number; color: string; index: number }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(index * 100, withTiming(height, { duration: 1000 }));
    }, [height]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: `${Math.max(progress.value, 2)}%`,
    }));

    return (
        <Animated.View
            entering={FadeIn.delay(index * 50).duration(500)}
            style={[
                styles.bar,
                { 
                    backgroundColor: color,
                    borderTopColor: 'rgba(255,255,255,0.2)',
                    borderTopWidth: 1,
                },
                animatedStyle,
            ]}
        />
    );
};

/**
 * GrowthForestChart component.
 * Displays a weekly overview of habit completions with Y-axis and grid lines.
 * Isolated to prevent layout overlap and ensure clear readability.
 */
export function GrowthForestChart({ data, colors }: GrowthForestChartProps) {
    if (!data || data.length === 0) return null;

    const maxCount = useMemo(() => {
        const counts = data.map(d => d.count);
        return Math.max(...counts, 4);
    }, [data]);

    // Generate Y axis labels (aligned with 5 grid lines)
    const yAxisLabels = useMemo(() => {
        const labels = [];
        for (let i = 0; i < 5; i++) {
            labels.push(Math.round((maxCount / 4) * (4 - i)));
        }
        return labels;
    }, [maxCount]);

    return (
        <Animated.View layout={LinearTransition} style={styles.chartContainer}>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Growth Forest
            </ThemedText>

            <View style={styles.chartArea}>
                {/* Y-Axis Column */}
                <View style={styles.yAxis}>
                    {yAxisLabels.map((label, i) => (
                        <ThemedText key={i} style={styles.yAxisLabel}>
                            {label}
                        </ThemedText>
                    ))}
                </View>

                {/* Plot Area */}
                <View style={styles.plotArea}>
                    {/* Grid Lines - Background Layer */}
                    <View style={styles.gridLinesContainer}>
                        {yAxisLabels.map((_, i) => (
                            <View key={i} style={styles.gridLine} />
                        ))}
                    </View>

                    {/* Bars Container - Interactive Layer */}
                    <View style={styles.barsContainer}>
                        {data.map((dataPoint, index) => {
                            const barHeightRatio = (dataPoint.count / maxCount) * 100;
                            const date = parseISO(dataPoint.date);
                            const dayLabel = format(date, 'EEE');

                            return (
                                <View key={dataPoint.date} style={styles.barColumn}>
                                    <View style={styles.barWrapper}>
                                        <SproutBar
                                            height={barHeightRatio}
                                            color={dataPoint.count > 0 ? colors.habitComplete : colors.habitIncomplete}
                                            index={index}
                                        />
                                    </View>
                                    <ThemedText style={styles.xAxisLabel}>
                                        {dayLabel}
                                    </ThemedText>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    chartContainer: {
        marginTop: 24,
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    chartTitle: {
        marginBottom: 24,
        fontSize: 18,
        letterSpacing: 0.5,
    },
    chartArea: {
        flexDirection: 'row',
        height: 180, // Fixed height for consistency
    },
    yAxis: {
        width: 32,
        height: 140, // Height of bar plot area
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    yAxisLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'right',
        paddingRight: 8,
        fontWeight: '600',
    },
    plotArea: {
        flex: 1,
        position: 'relative',
    },
    gridLinesContainer: {
        ...StyleSheet.absoluteFillObject,
        height: 140,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    gridLine: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        width: '100%',
    },
    barsContainer: {
        flexDirection: 'row',
        height: 180, // Full height including X-axis labels
        alignItems: 'flex-start',
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
    },
    barWrapper: {
        height: 140, 
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 4,
    },
    bar: {
        width: 14,
        borderRadius: 7,
    },
    xAxisLabel: {
        marginTop: 12,
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});

