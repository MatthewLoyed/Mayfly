import { HapticType, TactileButton } from '@/components/ui/TactileButton';
import { StyleSheet, ViewStyle } from 'react-native';
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
                    borderLeftColor: color || colors.primary
                },
                style
            ]}
            onPress={onPress}
            hapticType={HapticType.Selection}
            scaleValue={0.96}
        >
            <ThemedText style={styles.value} darkColor={color || colors.primary}>
                {value}
            </ThemedText>
            <ThemedText style={styles.label} darkColor="#A3B18A">
                {label}
            </ThemedText>
        </TactileButton>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 20,
        borderRadius: 24,
        borderTopLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderLeftWidth: 4, // Re-adding subtle left accent
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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

