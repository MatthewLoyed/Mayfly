import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { ThemedText } from '../themed-text';

interface LivingProgressBarProps {
    progress: number; // 0 to 100
}

export function LivingProgressBar({ progress }: LivingProgressBarProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withTiming(progress, { duration: 1000 });
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${width.value}%`,
    }));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="defaultSemiBold">Cycle of Growth</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: colors.primary }}>
                    {progress.toFixed(0)}%
                </ThemedText>
            </View>
            <View style={[styles.track, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Animated.View
                    style={[
                        styles.fill,
                        { backgroundColor: colors.primary },
                        animatedStyle
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    track: {
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 6,
    },
});
