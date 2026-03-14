import { useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, NativeModules, Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, Vibration, View } from 'react-native';

import { PuzzleBoard } from '@components/PuzzleBoard';
import { useCurrentLevel, useGameStore } from '@store/gameStore';

const IconButton = ({ label, onPress, size, tone }: { label: string; onPress: () => void; size: number; tone: 'gold' | 'blue' }) => (
  <Pressable onPress={onPress} style={[styles.iconButton, { width: size, height: size, borderRadius: size / 2 }, tone === 'gold' ? styles.helpButton : styles.settingsShell]}>
    <View style={[tone === 'gold' ? styles.helpInner : styles.settingsInner, { width: size * 0.82, height: size * 0.82, borderRadius: size * 0.41 }]}>
      <Text style={[styles.iconText, { fontSize: size * 0.46 }, tone === 'gold' ? styles.helpText : styles.settingsText]}>{label}</Text>
    </View>
  </Pressable>
);

const SUCCESS_MP3 = 'https://www.soundjay.com/buttons/sounds/button-09.mp3';
const FAIL_MP3 = 'https://www.soundjay.com/buttons/sounds/button-10.mp3';
type SoundRef = { replayAsync: () => Promise<unknown>; unloadAsync: () => Promise<unknown> } | null;
const hasNativeAV = Boolean((NativeModules as Record<string, unknown>).ExponentAV);

export const GameScreen = () => {
  const windowSize = useWindowDimensions();
  const { width } = Dimensions.get('window');
  const screenWidth = windowSize.width || width;
  const gameStatus = useGameStore((state) => state.gameStatus);
  const level = useCurrentLevel();
  const hintEdge = useGameStore((state) => state.hintEdge);
  const progress = useGameStore((state) => state.progress);
  const selectedLevelIndex = useGameStore((state) => state.selectedLevelIndex);
  const unlockedLevelIndex = useGameStore((state) => state.unlockedLevelIndex);
  const goHome = useGameStore((state) => state.goHome);
  const nextLevel = useGameStore((state) => state.nextLevel);
  const resetLevel = useGameStore((state) => state.resetLevel);
  const showHint = useGameStore((state) => state.showHint);
  const touchEnd = useGameStore((state) => state.touchEnd);
  const touchMove = useGameStore((state) => state.touchMove);
  const touchStart = useGameStore((state) => state.touchStart);
  const completeAnim = useRef(new Animated.Value(0)).current;
  const previousStatus = useRef(gameStatus);
  const successSound = useRef<SoundRef>(null);
  const failSound = useRef<SoundRef>(null);

  if (!level) {
    return (
      <View style={styles.container}>
        <Text style={styles.completeText}>No level data available.</Text>
      </View>
    );
  }

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!hasNativeAV) return;
      const av = await import('expo-av').catch(() => null);
      if (!av) return;
      const success = await av.Audio.Sound.createAsync({ uri: SUCCESS_MP3 });
      const fail = await av.Audio.Sound.createAsync({ uri: FAIL_MP3 });
      if (!active) return Promise.all([success.sound.unloadAsync(), fail.sound.unloadAsync()]);
      successSound.current = success.sound;
      failSound.current = fail.sound;
    };
    load().catch(() => null);
    return () => {
      active = false;
      successSound.current?.unloadAsync().catch(() => null);
      failSound.current?.unloadAsync().catch(() => null);
    };
  }, []);

  useEffect(() => {
    Animated.spring(completeAnim, { toValue: progress.solved ? 1 : 0, friction: 8, tension: 60, useNativeDriver: true }).start();
  }, [completeAnim, progress.solved]);

  useEffect(() => {
    if (previousStatus.current === gameStatus) return;
    previousStatus.current = gameStatus;
    if (gameStatus === 'failed') {
      Vibration.vibrate(200);
      failSound.current?.replayAsync().catch(() => null);
    }
    if (gameStatus === 'completed') successSound.current?.replayAsync().catch(() => null);
  }, [gameStatus]);

  const completion = `${progress.visitedEdges.length}/${level.edges.length} edges`;
  const canGoNext = progress.solved && selectedLevelIndex < unlockedLevelIndex;
  const fill = `${Math.max(8, (progress.visitedEdges.length / level.edges.length) * 100)}%` as const;
  const iconSize = Math.max(50, Math.min(screenWidth * 0.14, 62));
  const titleSize = Math.max(24, Math.min(screenWidth * 0.075, 34));
  const captionSize = Math.max(12, Math.min(screenWidth * 0.034, 15));
  const actionPad = Math.max(12, screenWidth * 0.035);
  const actionFont = Math.max(14, Math.min(screenWidth * 0.04, 18));
  const progressHeight = Math.max(10, screenWidth * 0.03);
  const openHowToPlay = () =>
    Alert.alert('How To Play', 'Start from any node, trace connected lines once, and finish every edge without lifting your finger.');
  const openSettings = () => Alert.alert('Settings', 'Use Reset to restart the level or Exit to go back home.');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton label="?" onPress={openHowToPlay} size={iconSize} tone="gold" />
        <View style={styles.headerCenter}>
          <Text style={[styles.kicker, { fontSize: titleSize }]}>Level {level.id}</Text>
          <View style={[styles.progressTrack, { height: progressHeight }]}>
            <View style={[styles.progressFill, { width: fill }]} />
          </View>
          <Text style={[styles.caption, { fontSize: captionSize }]}>{gameStatus === 'failed' ? 'Invalid move' : completion}</Text>
        </View>
        <IconButton label="⚙" onPress={openSettings} size={iconSize} tone="blue" />
      </View>
      <View style={styles.boardWrap}>
        <PuzzleBoard gameStatus={gameStatus} hintEdge={hintEdge} level={level} onEnd={touchEnd} onMove={touchMove} onStart={touchStart} progress={progress} />
        {gameStatus === 'failed' ? (
          <View pointerEvents="none" style={styles.failedOverlay}>
            <Text style={styles.failedText}>FAILED</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.toolbar}>
        <Pressable onPress={showHint} style={[styles.action, { paddingVertical: actionPad }]}><Text style={[styles.actionText, { fontSize: actionFont }]}>Hint</Text></Pressable>
        <Pressable onPress={resetLevel} style={[styles.action, { paddingVertical: actionPad }]}><Text style={[styles.actionText, { fontSize: actionFont }]}>Reset</Text></Pressable>
        <Pressable onPress={goHome} style={[styles.action, { paddingVertical: actionPad }]}><Text style={[styles.actionText, { fontSize: actionFont }]}>Exit</Text></Pressable>
      </View>
      <Animated.View
        pointerEvents="none"
        style={[styles.completeCard, { opacity: completeAnim, transform: [{ scale: completeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}
      >
        <Text style={styles.completeTitle}>Level Complete</Text>
        <Text style={styles.completeText}>Every segment was traced in a single stroke.</Text>
      </Animated.View>
      {progress.solved ? (
        <Pressable onPress={canGoNext ? nextLevel : resetLevel} style={styles.nextButton}>
          <Text style={styles.nextText}>{canGoNext ? 'Next Level' : 'Play Again'}</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05051d', padding: 16 },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  headerCenter: { alignItems: 'center', flex: 1, paddingHorizontal: 12 },
  kicker: { color: '#f2f5ff', fontWeight: '800' },
  caption: { color: '#aeb5d8', marginTop: 8, textAlign: 'center' },
  progressTrack: { width: '100%', backgroundColor: '#3d365d', borderRadius: 999, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#53f000', borderRadius: 999 },
  iconButton: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  helpButton: { backgroundColor: '#f6c44b', borderColor: '#8a4b12' },
  helpInner: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffd96b' },
  settingsShell: { backgroundColor: '#265b80', borderColor: '#14344e' },
  settingsInner: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#6ed1ef', borderWidth: 2, borderColor: '#8fe5ff' },
  iconText: { fontWeight: '900' },
  helpText: { color: '#7c2b17' },
  settingsText: { color: '#215a7f', textShadowColor: 'rgba(255,255,255,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  boardWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  failedOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  failedText: { color: '#ff4d67', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  toolbar: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8 },
  action: { flex: 1, alignItems: 'center', backgroundColor: '#1b1840', borderColor: '#4d4387', borderRadius: 18, borderWidth: 1 },
  actionText: { color: '#f2f5ff', fontWeight: '700' },
  completeCard: { backgroundColor: '#211224', borderColor: '#ff4ecd', borderRadius: 20, borderWidth: 1, marginTop: 8, padding: 18 },
  completeTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  completeText: { color: '#f4d7eb', fontSize: 15, textAlign: 'center' },
  nextButton: { alignItems: 'center', backgroundColor: '#ff4ecd', borderRadius: 18, marginTop: 12, paddingVertical: 16 },
  nextText: { color: '#140914', fontSize: 16, fontWeight: '800' },
});
