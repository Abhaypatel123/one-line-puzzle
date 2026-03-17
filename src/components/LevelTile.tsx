import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type LevelTileProps = {
  completed: boolean;
  isCurrent: boolean;
  levelId: number;
  locked: boolean;
  onPress: () => void;
  size: number;
};

export const LevelTile = memo(({ completed, isCurrent, levelId, locked, onPress, size }: LevelTileProps) => {
  const disabled = locked;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height: size, opacity: pressed && !disabled ? 0.9 : 1 },
        completed ? styles.completedTile : locked ? styles.lockedTile : styles.unlockedTile,
        isCurrent && !locked ? styles.currentTile : null,
      ]}
    >
      <View style={styles.iconWrap}>
        {locked ? (
          <Ionicons color="#93a0bf" name="lock-closed" size={18} />
        ) : completed ? (
          <Ionicons color="#f7fff2" name="checkmark" size={20} />
        ) : (
          <Ionicons color="#b7c3ff" name="play" size={16} />
        )}
      </View>
      <Text style={[styles.levelLabel, locked ? styles.lockedText : null]}>LEVEL</Text>
      <Text style={[styles.levelNumber, locked ? styles.lockedText : null]}>{levelId}</Text>
      {isCurrent && !locked ? <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>NOW</Text></View> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  unlockedTile: {
    backgroundColor: '#1f2748',
    borderColor: '#39457c',
  },
  completedTile: {
    backgroundColor: '#1d6f32',
    borderColor: '#7cff5a',
    shadowColor: '#7cff5a',
    shadowOpacity: 0.22,
  },
  lockedTile: {
    backgroundColor: '#121729',
    borderColor: '#232b4b',
  },
  currentTile: {
    borderColor: '#ff79e6',
    shadowColor: '#ff4ecd',
    shadowOpacity: 0.28,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  levelLabel: {
    color: '#dfe6ff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  levelNumber: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  lockedText: {
    color: '#93a0bf',
  },
  currentBadge: {
    position: 'absolute',
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  currentBadgeText: {
    color: '#fff7df',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});
