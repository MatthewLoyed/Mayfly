import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

interface StatCardProps {
    label: string;
    value: string;
    color: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
    return (
        <ThemedView style={[styles.statCard, { borderLeftColor: color }]}>
            <ThemedText style={styles.statValue} darkColor={color}>
                {value}
            </ThemedText>
            <ThemedText style={styles.statLabel} darkColor="#999">
                {label}
            </ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        backgroundColor: 'rgba(162, 155, 254, 0.1)',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
});
