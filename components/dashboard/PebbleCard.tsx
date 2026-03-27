import { HapticType, TactileButton } from '@/components/ui/TactileButton';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { ThemedText } from '../themed-text';

interface PebbleCardProps {
    label: string;
    value: string;
    icon?: string;
    color?: string;
    style?: ViewStyle;
    onPress?: () => void;
}

export function PebbleCard({ label, value, color, style, onPress }: PebbleCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

    return (
        <TactileButton
            style={[
                styles.card,
                {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.habitStroke + '33',
                },
                style
            ]}
            onPress={onPress}
            hapticType={HapticType.Selection}
            scaleValue={0.96}
        >
            <LinearGradient
                colors={[`${color || colors.primary}33`, `transparent`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <ThemedText style={styles.value} darkColor={color || colors.primary}>
                {value}
            </ThemedText>
            <ThemedText style={styles.label} darkColor={colors.textSecondary}>
                {label}
            </ThemedText>
        </TactileButton>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 24,
        borderRadius: 32,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        minWidth: '45%',
        flex: 1,
    },
    value: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
        fontFamily: 'System',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

