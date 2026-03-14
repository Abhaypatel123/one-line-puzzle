import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LEVELS } from '@game/levelData';
import { useGameStore } from '@store/gameStore';

const Button = ({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) => (
  <Pressable onPress={onPress} style={[styles.button, secondary && styles.secondaryButton]}>
    <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
  </Pressable>
);

export const HomeScreen = () => {
  const selectedLevelIndex = useGameStore((state) => state.selectedLevelIndex);
  const unlockedLevelIndex = useGameStore((state) => state.unlockedLevelIndex);
  const changeSelectedLevel = useGameStore((state) => state.changeSelectedLevel);
  const startLevel = useGameStore((state) => state.startLevel);

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>One Line Puzzle</Text>
      <Text style={styles.title}>Draw every segment in one stroke.</Text>
      <Text style={styles.subtitle}>Complete {LEVELS.length} compact graph puzzles without lifting your finger.</Text>
      <View style={styles.card}>
        <Text style={styles.levelLabel}>Selected Level</Text>
        <Text style={styles.levelValue}>{selectedLevelIndex + 1}</Text>
        <Text style={styles.progressText}>Unlocked: {unlockedLevelIndex + 1} / {LEVELS.length}</Text>
        <View style={styles.row}>
          <Button label="Previous" onPress={() => changeSelectedLevel(-1)} secondary />
          <Button label="Next" onPress={() => changeSelectedLevel(1)} secondary />
        </View>
        <Button label="Play" onPress={() => startLevel()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#11131b' },
  kicker: { color: '#ff4ecd', fontSize: 14, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase' },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', lineHeight: 38, marginBottom: 12 },
  subtitle: { color: '#a7adc6', fontSize: 16, lineHeight: 24, marginBottom: 32 },
  card: { backgroundColor: '#1b1e2b', borderColor: '#2d3347', borderRadius: 24, borderWidth: 1, padding: 20 },
  levelLabel: { color: '#8f97b2', fontSize: 14, marginBottom: 8 },
  levelValue: { color: '#fff', fontSize: 44, fontWeight: '800', marginBottom: 4 },
  progressText: { color: '#c7cee7', fontSize: 15, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  button: { flex: 1, alignItems: 'center', backgroundColor: '#ff4ecd', borderRadius: 16, paddingVertical: 14 },
  secondaryButton: { backgroundColor: '#252a3b' },
  buttonText: { color: '#140914', fontSize: 16, fontWeight: '800' },
  secondaryButtonText: { color: '#fff' },
});
