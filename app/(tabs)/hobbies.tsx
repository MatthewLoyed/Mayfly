import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PursuitsHome } from '@/components/pursuits/PursuitsHome';
import { PursuitDetail } from '@/components/pursuits/PursuitDetail';

/**
 * Pursuits screen (formerly Hobbies)
 * Integrated from Figma creation
 */
export default function HobbiesScreen() {
  const [selectedPursuitId, setSelectedPursuitId] = useState<string | null>(null);

  if (selectedPursuitId) {
    return (
      <View style={styles.container}>
        <PursuitDetail 
          pursuitId={selectedPursuitId} 
          onBack={() => setSelectedPursuitId(null)} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PursuitsHome 
        onSelectPursuit={(id) => setSelectedPursuitId(id)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
