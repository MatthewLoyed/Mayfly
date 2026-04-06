import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PursuitsHome } from '@/components/pursuits/PursuitsHome';
import { PursuitDetail } from '@/components/pursuits/PursuitDetail';
import type { Pursuit } from '@/components/pursuits/types';

const initialPursuits: Pursuit[] = [
  {
    id: "1",
    title: "Watercolor Painting",
    category: "Creative",
    startDate: "2026-01-15",
    sessions: [
      { date: "2026-01-15", duration: 45, note: "Practiced basic washes" },
      { date: "2026-01-18", duration: 60, note: "Landscape study" },
      { date: "2026-01-22", duration: 30, note: "Color mixing experiments" },
      { date: "2026-02-01", duration: 75, note: "First complete piece" },
      { date: "2026-02-08", duration: 90, note: "Portrait attempt" },
      { date: "2026-02-15", duration: 60, note: "Botanical studies" },
      { date: "2026-03-01", duration: 120, note: "Large canvas project" },
      { date: "2026-03-10", duration: 45, note: "Abstract experiments" },
      { date: "2026-03-20", duration: 90, note: "Gallery-worthy piece" },
    ],
    totalSessions: 9,
    stage: 2,
    color: "#B5A8D6",
  },
  {
    id: "2",
    title: "Spanish Conversation",
    category: "Language",
    startDate: "2026-02-01",
    sessions: [
      { date: "2026-02-01", duration: 30, note: "Basic greetings" },
      { date: "2026-02-03", duration: 30, note: "Numbers and colors" },
      { date: "2026-02-06", duration: 45, note: "Present tense verbs" },
      { date: "2026-02-10", duration: 30, note: "Conversation practice" },
      { date: "2026-03-15", duration: 60, note: "Video call with tutor" },
    ],
    totalSessions: 5,
    stage: 1,
    color: "#E6B874",
  },
];

export default function HobbiesScreen() {
  const [pursuits, setPursuits] = useState<Pursuit[]>(initialPursuits);
  const [selectedPursuitId, setSelectedPursuitId] = useState<string | null>(null);

  const handleAddPursuit = (pursuitData: Omit<Pursuit, "id" | "totalSessions" | "stage">) => {
    const newPursuit: Pursuit = {
      ...pursuitData,
      id: Date.now().toString(),
      totalSessions: 0,
      stage: 0,
      sessions: [],
    };
    setPursuits(prev => [...prev, newPursuit]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleUpdatePursuit = (updatedPursuit: Pursuit) => {
    setPursuits(prev => prev.map(p => p.id === updatedPursuit.id ? updatedPursuit : p));
  };

  if (selectedPursuitId) {
    return (
      <View style={styles.container}>
        <PursuitDetail 
          pursuitId={selectedPursuitId} 
          pursuits={pursuits}
          onBack={() => setSelectedPursuitId(null)} 
          onUpdatePursuit={handleUpdatePursuit}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PursuitsHome 
        pursuits={pursuits}
        onSelectPursuit={(id) => setSelectedPursuitId(id)} 
        onAddPursuit={handleAddPursuit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
