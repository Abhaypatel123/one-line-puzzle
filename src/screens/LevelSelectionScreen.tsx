import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { LevelTile } from '@components/LevelTile';
import { ADMIN_MODE } from '@game/adminConfig';
import { LEVELS } from '@game/levelData';
import { useGameStore } from '@store/gameStore';

type LevelSelectionScreenProps = {
  onBack: () => void;
};

export const LevelSelectionScreen = ({ onBack }: LevelSelectionScreenProps) => {
  const completedLevelIds = useGameStore((state) => state.completedLevelIds);
  const { width } = useWindowDimensions();
  const selectedLevelIndex = useGameStore((state) => state.selectedLevelIndex);
  const unlockedLevelIndex = useGameStore((state) => state.unlockedLevelIndex);
  const startLevel = useGameStore((state) => state.startLevel);
  const completedSet = useMemo(() => new Set(completedLevelIds), [completedLevelIds]);

  const columns = width >= 560 ? 4 : 3;
  const horizontalPadding = 24;
  const gap = width >= 560 ? 14 : 12;
  const tileSize = Math.min(104, Math.floor((width - horizontalPadding * 2 - gap * (columns - 1)) / columns));
  const completedCount = useMemo(() => completedLevelIds.length, [completedLevelIds]);

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.bgShapeOne} />
      <View pointerEvents="none" style={styles.bgShapeTwo} />
      <View pointerEvents="none" style={styles.bgGlow} />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons color="#fff8f2" name="arrow-back" size={24} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>SELECT LEVEL</Text>
          <Text style={styles.subtitle}>{completedCount}/{LEVELS.length} completed{ADMIN_MODE ? '  •  ADMIN MODE' : ''}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, paddingBottom: 28 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.grid, { gap }]}>
          {LEVELS.map((level, index) => {
            const locked = ADMIN_MODE ? false : index > unlockedLevelIndex;
            const completed = completedSet.has(level.id);
            return (
              <LevelTile
                completed={completed}
                isCurrent={index === selectedLevelIndex}
                key={level.id}
                levelId={level.id}
                locked={locked}
                onPress={() => startLevel(index)}
                size={tileSize}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05051d',
  },
  bgShapeOne: {
    position: 'absolute',
    top: 70,
    right: -18,
    width: 146,
    height: 146,
    borderWidth: 2,
    borderColor: '#1b2040',
    borderRadius: 28,
    transform: [{ rotate: '38deg' }],
  },
  bgShapeTwo: {
    position: 'absolute',
    bottom: 160,
    left: -36,
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: '#20264a',
    borderRadius: 26,
    transform: [{ rotate: '24deg' }],
  },
  bgGlow: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#1a1d46',
    opacity: 0.38,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#1f2748',
    borderWidth: 2,
    borderColor: '#313c69',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerSpacer: {
    width: 48,
  },
  title: {
    color: '#f2f5ff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ff69e3',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContent: {
    alignItems: 'center',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
