import { format, parseISO } from 'date-fns';
import { useEffect } from 'react';
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

const SproutBar = ({ height, color, index }: { height: number; color: string; index: number }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(index * 100, withTiming(height, { duration: 1000 }));
    }, [height]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: `${Math.max(progress.value, 4)}%`,
    }));

    return (
        <Animated.View
            entering={FadeIn.delay(index * 50).duration(500)}
            style={[
                styles.bar,
                { 
                    backgroundColor: color,
                    // Subtle "stem" gradient effect via shadow or border
                    borderTopColor: 'rgba(255,255,255,0.2)',
                    borderTopWidth: 1,
                },
                animatedStyle,
            ]}
        />
    );
};

export function GrowthForestChart({ data, colors }: GrowthForestChartProps) {
    if (data.length === 0) return null;

    return (
        <Animated.View layout={LinearTransition} style={styles.chartContainer}>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Growth Forest
            </ThemedText>
            <View style={styles.chart}>
                {data.map((dataPoint, index) => {
                    const maxCount = Math.max(...data.map(d => d.count), 1);
                    const height = maxCount > 0 ? (dataPoint.count / maxCount) * 100 : 0;
                    const date = parseISO(dataPoint.date);
                    const dayLabel = format(date, 'EEE');

                    return (
                        <View key={dataPoint.date} style={styles.barContainer}>
                            <View style={styles.barWrapper}>
                                <SproutBar
                                    height={height}
                                    color={dataPoint.count > 0 ? colors.habitComplete : colors.habitIncomplete}
                                    index={index}
                                />
                                {dataPoint.count > 0 && (
                                    <Animated.View 
                                        entering={FadeIn.delay(index * 100 + 800)}
                                        style={styles.valueContainer}
                                    >
                                        <ThemedText style={styles.barValue} darkColor={colors.textSecondary}>
                                            {dataPoint.count}
                                        </ThemedText>
                                    </Animated.View>
                                )}
                            </View>
                            <ThemedText style={styles.barLabel} darkColor={colors.textSecondary}>
                                {dayLabel}
                            </ThemedText>
                        </View>
                    );
                })}
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
    },
    chartTitle: {
        marginBottom: 24,
        fontSize: 18,
        fontFamily: 'System',
        letterSpacing: 0.5,
        opacity: 0.9,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 160,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
    },
    barWrapper: {
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    bar: {
        width: 14,
        borderRadius: 7, // Fully rounded top/bottom like a stem
        marginBottom: 4,
    },
    valueContainer: {
        position: 'absolute',
        top: -24,
        alignItems: 'center',
    },
    barValue: {
        fontSize: 10,
        fontWeight: '700',
    },
    barLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        opacity: 0.6,
    },
});

