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
import { Sprout } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { ThemedText } from '../themed-text';

interface ButterflyHeroProps {
    greeting: string;
    quote?: { text: string; author: string };
    completionRate: number;
}

export function ButterflyHero({ greeting, quote, completionRate }: ButterflyHeroProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

    const translateY = useSharedValue(0);
    const glowOpacity = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        // Hover animation
        translateY.value = withRepeat(
            withSequence(
                withTiming(-12, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );

        // Subtle scale pulse
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 3000 }),
                withTiming(1, { duration: 3000 })
            ),
            -1,
            true
        );

        // Glow intensity based on completion
        const targetGlow = completionRate >= 100 ? 0.8 : completionRate > 0 ? 0.3 : 0.1;
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(targetGlow, { duration: 2000 }),
                withTiming(targetGlow * 0.5, { duration: 2000 })
            ),
            -1,
            true
        );
    }, [completionRate]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value }
        ],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <View style={styles.heroWrapper}>
                <Animated.View style={[styles.butterflyContainer, animatedStyle]}>
                    {/* Multi-layered glow for "Premium" feel */}
                    <Animated.View style={[
                        styles.glow,
                        { backgroundColor: colors.streak, transform: [{ scale: 1.2 }] },
                        glowStyle
                    ]} />
                    <Animated.View style={[
                        styles.glow,
                        { backgroundColor: colors.primary, transform: [{ scale: 0.8 }] },
                        { opacity: 0.4 }
                    ]} />
                    
                    <Sprout 
                        size={80} 
                        color={colors.streak} 
                        strokeWidth={1.5}
                    />
                </Animated.View>

                <Animated.View layout={LinearTransition} style={styles.textContainer}>
                    <ThemedText type="titleRounded" style={styles.greeting}>
                        {greeting}
                    </ThemedText>
                    
                    {quote && (
                        <Animated.View 
                            entering={FadeIn.delay(300).duration(800)}
                            style={styles.quoteBlock}
                        >
                            <ThemedText style={styles.quoteText}>
                                "{quote.text}"
                            </ThemedText>
                            <ThemedText style={[styles.quoteAuthor, { color: colors.textSecondary }]}>
                                — {quote.author}
                            </ThemedText>
                        </Animated.View>
                    )}
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
        width: '100%',
    },
    heroWrapper: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    butterflyContainer: {
        width: 160,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        zIndex: 10,
    },
    glow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        // Using opacity instead of blur since expo-blur isn't in package.json
    },
    textContainer: {
        alignItems: 'center',
        width: '100%',
    },
    greeting: {
        fontSize: 34,
        textAlign: 'center',
        fontFamily: 'System',
        letterSpacing: -1,
        fontWeight: '800',
    },
    quoteBlock: {
        marginTop: 16,
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    quoteText: {
        fontSize: 15,
        textAlign: 'center',
        fontFamily: 'System',
        fontStyle: 'italic',
        lineHeight: 20,
        opacity: 0.75,
    },
    quoteAuthor: {
        marginTop: 6,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        fontWeight: '700',
        opacity: 0.6,
    },
});
