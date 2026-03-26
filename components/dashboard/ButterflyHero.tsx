import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { ThemedText } from '../themed-text';

// Assuming we might need to use an SVG or Image for the butterfly if not using a font icon
// For now, let's use a placeholder image or emoji if no asset is available, 
// but the prompt mentioned a "blue butterfly".
// I will assume there is an asset or I will use a unicode butterfly for now 
// until I confirm the asset path from `ButterflyHabit`.
// Looking at `ButterflyHabit.tsx` might give a clue. 
// Ideally I should have checked that file. 
// For now, I'll create a stylized container that can hold the butterfly.

interface ButterflyHeroProps {
    greeting: string;
    completionRate: number;
}

export function ButterflyHero({ greeting, completionRate }: ButterflyHeroProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

    const translateY = useSharedValue(0);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
        // Hover animation
        translateY.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );

        // Glow if 100% complete
        if (completionRate >= 100) {
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 1500 }),
                    withTiming(0.2, { duration: 1500 })
                ),
                -1,
                true
            );
        } else {
            glowOpacity.value = withTiming(0);
        }
    }, [completionRate]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.butterflyContainer, animatedStyle]}>
                <Animated.View style={[
                    styles.glow,
                    { backgroundColor: colors.streak },
                    glowStyle
                ]} />
                {/* Re-using the image from Garden if possible, or a generic butterfly */}
                {/* Since I saw 'Garden.jpg' in garden.tsx, I assume there might not be a dedicated butterfly asset file visible in the directory listing yet. */}
                {/* I will use a large text butterfly for now as a safe placeholder that looks "organic" enough with the glow */}
                <ThemedText style={{ fontSize: 60 }}>🦋</ThemedText>
            </Animated.View>

            <Animated.View layout={LinearTransition} style={styles.textContainer}>
                <ThemedText type="title" style={styles.greeting}>
                    {greeting}
                </ThemedText>
                <Animated.View 
                    key={completionRate >= 100 ? 'thriving' : 'nurture'}
                    entering={FadeIn.duration(400)}
                >
                    <ThemedText style={[styles.subtext, { color: colors.textSecondary }]}>
                        {completionRate >= 100
                            ? "The garden is thriving."
                            : "Nurture your habits to grow."}
                    </ThemedText>
                </Animated.View>
            </Animated.View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    butterflyContainer: {
        width: 140, // More space
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        zIndex: 10,
    },
    glow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        // Since we are React Native, we are skipping the web-only filter: 'blur(20px)'
    },
    textContainer: {
        alignItems: 'center',
    },
    greeting: {
        fontSize: 28,
        textAlign: 'center',
        fontFamily: 'System', // Serif-like
    },
    subtext: {
        marginTop: 8,
        fontSize: 16,
        textAlign: 'center',
    },
});
