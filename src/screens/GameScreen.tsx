import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, NativeModules, Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, Vibration, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

import { PuzzleBoard } from '@components/PuzzleBoard';
import { SettingsModal } from '@components/SettingsModal';
import { useCurrentLevel, useGameStore } from '@store/gameStore';

const IconButton = ({ label, onPress, size, tone }: { label: string; onPress: () => void; size: number; tone: 'gold' | 'blue' }) => (
  <Pressable onPress={onPress} style={[styles.iconButton, { width: size, height: size, borderRadius: size / 2 }, tone === 'gold' ? styles.helpButton : styles.settingsShell]}>
    <View style={[tone === 'gold' ? styles.helpInner : styles.settingsInner, { width: size * 0.82, height: size * 0.82, borderRadius: size * 0.41 }]}>
      <Text style={[styles.iconText, { fontSize: size * 0.46 }, tone === 'gold' ? styles.helpText : styles.settingsText]}>{label}</Text>
    </View>
  </Pressable>
);

const RoundAction = ({ badge, color, label, onPress, size }: { badge?: string; color: string; label: string; onPress: () => void; size: number }) => (
  <Pressable onPress={onPress} style={[styles.roundAction, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
    <Text style={[styles.roundIcon, { fontSize: size * 0.46 }]}>{label}</Text>
    {badge ? (
      <View style={styles.actionBadge}>
        <Text style={styles.actionBadgeText}>{badge}</Text>
      </View>
    ) : null}
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
  const musicEnabled = useGameStore((state) => state.musicEnabled);
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
  const toggleMusic = useGameStore((state) => state.toggleMusic);
  const previousStatus = useRef(gameStatus);
  const successSound = useRef<SoundRef>(null);
  const failSound = useRef<SoundRef>(null);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiStreams = useMemo(
    () => [
      { x: 0.06, count: 40, speed: 3600 },
      { x: 0.24, count: 40, speed: 3600 },
      { x: 0.5, count: 40, speed: 3600 },
      { x: 0.76, count: 40, speed: 3600 },
      { x: 0.94, count: 40, speed: 3600 },
    ],
    []
  );

  if (!level) {
    return (
      <View style={styles.container}>
        <Text style={styles.caption}>No level data available.</Text>
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
      if (confettiTimer.current) clearTimeout(confettiTimer.current);
      successSound.current?.unloadAsync().catch(() => null);
      failSound.current?.unloadAsync().catch(() => null);
    };
  }, []);

  useEffect(() => {
    if (previousStatus.current === gameStatus) return;
    previousStatus.current = gameStatus;
    if (gameStatus === 'failed') {
      Vibration.vibrate(200);
      if (soundEnabled) failSound.current?.replayAsync().catch(() => null);
    }
    if (gameStatus === 'completed') {
      if (soundEnabled) successSound.current?.replayAsync().catch(() => null);
      setShowConfetti(true);
      if (confettiTimer.current) clearTimeout(confettiTimer.current);
      confettiTimer.current = setTimeout(() => setShowConfetti(false), 5000);
    }
    if (gameStatus !== 'completed') setShowConfetti(false);
  }, [gameStatus, soundEnabled]);

  const completion = `${progress.visitedEdges.length}/${level.edges.length} edges`;
  const canGoNext = progress.solved && selectedLevelIndex < unlockedLevelIndex;
  const fill = `${Math.max(8, (progress.visitedEdges.length / level.edges.length) * 100)}%` as const;
  const iconSize = Math.max(50, Math.min(screenWidth * 0.14, 62));
  const titleSize = Math.max(24, Math.min(screenWidth * 0.075, 34));
  const captionSize = Math.max(12, Math.min(screenWidth * 0.034, 15));
  const actionSize = Math.max(58, Math.min(screenWidth * 0.16, 74));
  const progressHeight = Math.max(10, screenWidth * 0.03);
  const openHowToPlay = () =>
    Alert.alert('How To Play', 'Start from any node, trace connected lines once, and finish every edge without lifting your finger.');
  const openSettings = () => setSettingsOpen(true);

  return (
    <SafeAreaView style={styles.container}>
      <SettingsModal
        musicEnabled={musicEnabled}
        onClose={() => setSettingsOpen(false)}
        onPrivacyPress={() => Alert.alert('Privacy Policy', 'Privacy policy screen can be added here.')}
        onToggleMusic={toggleMusic}
        onToggleSound={() => setSoundEnabled((value) => !value)}
        soundEnabled={soundEnabled}
        visible={settingsOpen}
      />
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
        {showConfetti ? (
          <View pointerEvents="none" style={styles.confettiLayer}>
            {confettiStreams.map(({ count, speed, x }, index) => (
              <ConfettiCannon
                autoStart
                count={count}
                explosionSpeed={30}
                fadeOut
                fallSpeed={speed}
                key={`confetti-${index}`}
                origin={{ x: screenWidth * x, y: -24 }}
              />
            ))}
          </View>
        ) : null}
        {gameStatus === 'completed' ? (
          <View style={styles.completeOverlay}>
            <View style={styles.bannerWrap}>
              <View style={[styles.ribbonTail, styles.ribbonLeft]} />
              <View style={styles.banner}>
                <Text style={styles.bannerText}>CONGRATULATIONS</Text>
              </View>
              <View style={[styles.ribbonTail, styles.ribbonRight]} />
            </View>
            <View style={styles.completeActions}>
              <Pressable onPress={resetLevel} style={styles.restartButton}>
                <Text style={styles.restartIcon}>↻</Text>
              </Pressable>
              <Pressable onPress={canGoNext ? nextLevel : resetLevel} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>{canGoNext ? 'NEXT' : 'REPLAY'}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        {gameStatus === 'failed' ? (
          <View pointerEvents="none" style={styles.failedOverlay}>
            <Text style={styles.failedText}>FAILED</Text>
          </View>
        ) : null}
      </View>
      {gameStatus !== 'completed' ? (
        <View style={styles.bottomActions}>
          <RoundAction badge="AD" color="#ffd44c" label="💡" onPress={showHint} size={actionSize} />
          <RoundAction badge="AD" color="#7ee539" label="▶" onPress={canGoNext ? nextLevel : resetLevel} size={actionSize} />
        </View>
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
  boardWrap: { alignItems: 'center', justifyContent: 'center', flex: 1, marginVertical: 2 },
  confettiLayer: { ...StyleSheet.absoluteFillObject, top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' },
  completeOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', paddingVertical: 26, paddingHorizontal: 18 },
  bannerWrap: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 6 },
  banner: { backgroundColor: '#46e62e', borderColor: '#1fa818', borderRadius: 10, borderWidth: 3, paddingHorizontal: 18, paddingVertical: 10 },
  bannerText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 1 },
  ribbonTail: { borderBottomWidth: 14, borderTopWidth: 14, height: 0, width: 0 },
  ribbonLeft: { borderBottomColor: '#2dc51d', borderLeftWidth: 18, borderLeftColor: 'transparent', borderRightWidth: 18, borderRightColor: '#46e62e', borderTopColor: '#2dc51d', marginRight: -4 },
  ribbonRight: { borderBottomColor: '#2dc51d', borderLeftWidth: 18, borderLeftColor: '#46e62e', borderRightWidth: 18, borderRightColor: 'transparent', borderTopColor: '#2dc51d', marginLeft: -4 },
  completeActions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 18, marginBottom: 10 },
  restartButton: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#58bdf5', borderColor: '#1b6f9e', borderWidth: 3, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
  restartIcon: { color: '#fff', fontSize: 38, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  nextButton: { minWidth: 148, paddingHorizontal: 24, height: 68, borderRadius: 14, backgroundColor: '#77f433', borderColor: '#2f9d16', borderWidth: 3, alignItems: 'center', justifyContent: 'center', shadowColor: '#77f433', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 10, elevation: 5 },
  nextButtonText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 1 },
  failedOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  failedText: { color: '#ff4d67', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  bottomActions: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: 6, marginBottom: 8 },
  roundAction: { alignItems: 'center', borderColor: '#4d2e00', borderWidth: 2, elevation: 4, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  roundIcon: { color: '#fff', fontWeight: '900' },
  actionBadge: { position: 'absolute', right: -3, top: -3, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: '#ff4b53', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  actionBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
});
