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
  const canGoBack = selectedLevelIndex > 0;
  const canGoForward = selectedLevelIndex < unlockedLevelIndex;

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>One Line Puzzle</Text>
        <Text style={styles.title}>Draw every segment in one stroke.</Text>
        <Text style={styles.subtitle}>Complete {LEVELS.length} handcrafted-style graph puzzles without lifting your finger.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.levelHeader}>
          <View>
            <Text style={styles.levelLabel}>Selected Level</Text>
            <Text style={styles.levelValue}>{selectedLevelIndex + 1}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unlockedLevelIndex + 1} / {LEVELS.length}</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((unlockedLevelIndex + 1) / LEVELS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Unlocked Levels</Text>
        <View style={styles.row}>
          <Pressable disabled={!canGoBack} onPress={() => changeSelectedLevel(-1)} style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}>
            <Text style={[styles.navText, !canGoBack && styles.navTextDisabled]}>Previous</Text>
          </Pressable>
          <Pressable disabled={!canGoForward} onPress={() => changeSelectedLevel(1)} style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}>
            <Text style={[styles.navText, !canGoForward && styles.navTextDisabled]}>Next</Text>
          </Pressable>
        </View>
        <Button label="Play Level" onPress={() => startLevel()} />
        <Text style={styles.footerText}>Trace each edge exactly once to solve the puzzle.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#10131d' },
  hero: { marginBottom: 28 },
  kicker: { color: '#ff4ecd', fontSize: 14, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase' },
  title: { color: '#fff', fontSize: 38, fontWeight: '900', lineHeight: 44, marginBottom: 14 },
  subtitle: { color: '#a8afc8', fontSize: 18, lineHeight: 27 },
  card: { backgroundColor: '#1a1f2d', borderColor: '#2a3147', borderRadius: 28, borderWidth: 1, padding: 22 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  levelLabel: { color: '#8f97b2', fontSize: 15, marginBottom: 8 },
  levelValue: { color: '#fff', fontSize: 52, fontWeight: '900' },
  badge: { backgroundColor: '#252c3f', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  badgeText: { color: '#dce2f6', fontSize: 14, fontWeight: '700' },
  progressTrack: { height: 10, backgroundColor: '#282f43', borderRadius: 999, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: '#ff4ecd', borderRadius: 999 },
  progressText: { color: '#c7cee7', fontSize: 14, marginBottom: 18 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  navButton: { flex: 1, alignItems: 'center', backgroundColor: '#262d40', borderRadius: 16, paddingVertical: 15 },
  navButtonDisabled: { backgroundColor: '#1c2231' },
  navText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  navTextDisabled: { color: '#697089' },
  button: { flex: 1, alignItems: 'center', backgroundColor: '#ff4ecd', borderRadius: 18, paddingVertical: 16 },
  secondaryButton: { backgroundColor: '#252a3b' },
  buttonText: { color: '#19061a', fontSize: 18, fontWeight: '900' },
  secondaryButtonText: { color: '#fff' },
  footerText: { color: '#99a2bf', fontSize: 14, lineHeight: 22, marginTop: 14, textAlign: 'center' },
});
