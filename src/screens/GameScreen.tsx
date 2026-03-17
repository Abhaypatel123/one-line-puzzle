import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, NativeModules, Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, Vibration, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

import { PuzzleBoard } from '@components/PuzzleBoard';
import { SettingsModal } from '@components/SettingsModal';
import { useCurrentLevel, useGameStore } from '@store/gameStore';

const HelpIcon = ({ size }: { size: number }) => (
  <Ionicons color="#7c2b17" name="help" size={size} />
);

const GearIcon = ({ size }: { size: number }) => (
  <Ionicons color="#667681" name="settings-sharp" size={size} />
);

const IconButton = ({ icon, onPress, size, tone }: { icon: React.ReactNode; onPress: () => void; size: number; tone: 'gold' | 'blue' }) => (
  <Pressable onPress={onPress} style={[styles.iconButton, { width: size, height: size, borderRadius: size / 2 }, tone === 'gold' ? styles.helpButton : styles.settingsShell]}>
    <View style={[tone === 'gold' ? styles.helpInner : styles.settingsInner, { width: size * 0.82, height: size * 0.82, borderRadius: size * 0.41 }]}>
      {icon}
    </View>
  </Pressable>
);

const ActionIcon = ({ kind, size }: { kind: 'hint' | 'next'; size: number }) => {
  if (kind === 'hint') return <Ionicons color="#9a5b09" name="bulb-outline" size={size} />;
  return <Ionicons color="#2b5f12" name="play-skip-forward" size={size} />;
};

const RoundAction = ({ color, iconKind, onPress, size }: { color: string; iconKind: 'hint' | 'next'; onPress: () => void; size: number }) => (
  <Pressable onPress={onPress} style={[styles.roundActionShell, { width: size, height: size, borderRadius: size / 2 }, iconKind === 'hint' ? styles.hintShell : styles.nextShell]}>
    <View style={[styles.roundActionInner, { width: size * 0.82, height: size * 0.82, borderRadius: size * 0.41, backgroundColor: color }]}>
      <ActionIcon kind={iconKind} size={size * 0.44} />
    </View>
    <View style={[styles.actionBadge, iconKind === 'hint' ? styles.hintBadge : styles.nextBadge]}>
      <Ionicons color="#ffffff" name="play" size={11} style={styles.badgePlayIcon} />
      <Text style={styles.actionBadgeText}>AD</Text>
    </View>
  </Pressable>
);

const SUCCESS_MP3 = 'https://www.soundjay.com/buttons/sounds/button-09.mp3';
const FAIL_MP3 = 'https://www.soundjay.com/buttons/sounds/button-10.mp3';
const CONFETTI_COLORS = ['#ff5f9e', '#ffd447', '#8efc6a', '#5ee6ff', '#b98cff', '#ffffff'];
type SoundRef = { replayAsync: () => Promise<unknown>; unloadAsync: () => Promise<unknown> } | null;
const hasNativeAV = Boolean((NativeModules as Record<string, unknown>).ExponentAV);

export const GameScreen = () => {
  const windowSize = useWindowDimensions();
  const { height, width } = Dimensions.get('window');
  const screenWidth = windowSize.width || width;
  const screenHeight = windowSize.height || height;
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
  const confettiBursts = useMemo(
    () => [
      { count: 42, delay: 0, explosionSpeed: 240, fallSpeed: 5200, origin: { x: -18, y: screenHeight * 0.12 } },
      { count: 38, delay: 140, explosionSpeed: 280, fallSpeed: 5600, origin: { x: screenWidth * 0.1, y: -20 } },
      { count: 42, delay: 220, explosionSpeed: 240, fallSpeed: 5200, origin: { x: screenWidth + 18, y: screenHeight * 0.12 } },
      { count: 36, delay: 320, explosionSpeed: 300, fallSpeed: 5800, origin: { x: screenWidth * 0.22, y: -36 } },
      { count: 36, delay: 420, explosionSpeed: 300, fallSpeed: 5800, origin: { x: screenWidth * 0.78, y: -36 } },
      { count: 40, delay: 520, explosionSpeed: 260, fallSpeed: 6100, origin: { x: -12, y: screenHeight * 0.3 } },
      { count: 40, delay: 620, explosionSpeed: 260, fallSpeed: 6100, origin: { x: screenWidth + 12, y: screenHeight * 0.3 } },
    ],
    [screenHeight, screenWidth]
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

  const visitedEdges = progress.visitedEdges.length;
  const totalEdges = level.edges.length;
  const remainingEdges = Math.max(totalEdges - visitedEdges, 0);
  const progressRatio = totalEdges ? visitedEdges / totalEdges : 0;
  const canGoNext = progress.solved && selectedLevelIndex < unlockedLevelIndex;
  const fill = `${Math.max(8, progressRatio * 100)}%` as const;
  const iconSize = Math.max(50, Math.min(screenWidth * 0.14, 62));
  const titleSize = Math.max(24, Math.min(screenWidth * 0.075, 34));
  const captionSize = Math.max(12, Math.min(screenWidth * 0.034, 15));
  const actionSize = Math.max(58, Math.min(screenWidth * 0.16, 74));
  const progressHeight = Math.max(10, screenWidth * 0.03);
  const progressEmojiSize = Math.max(16, progressHeight * 1.5);
  const boardMaxWidth = Math.min(screenWidth - 32, 680);
  const boardSize = Math.max(220, Math.min(boardMaxWidth, screenHeight * 0.55));
  const progressEmoji = gameStatus === 'failed'
    ? '😵'
    : progress.solved
      ? '🥳'
      : progressRatio < 0.2
        ? '🙂'
        : progressRatio < 0.45
          ? '😊'
          : progressRatio < 0.75
            ? '😄'
            : remainingEdges > 1
              ? '😁'
              : '🤩';
  const captionText = gameStatus === 'failed'
    ? 'Oops! Try a new path 😵'
    : progress.solved
      ? 'All edges done! You nailed it 🥳'
      : `${remainingEdges} edge${remainingEdges === 1 ? '' : 's'} left ${progressEmoji}`;
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
      <View style={styles.mainContainer}>
        <View style={styles.topBar}>
          <IconButton icon={<HelpIcon size={iconSize * 0.46} />} onPress={openHowToPlay} size={iconSize} tone="gold" />
          <View style={styles.topBarCenter}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.kicker, { fontSize: titleSize }]}>
              Level {level.id}
            </Text>
            <View style={[styles.progressTrack, { height: progressHeight }]}>
              <View style={[styles.progressFill, { width: fill }]} />
              <View
                pointerEvents="none"
                style={[
                  styles.progressEmojiWrap,
                  {
                    width: progressEmojiSize,
                    height: progressEmojiSize,
                    borderRadius: progressEmojiSize / 2,
                    left: fill,
                    marginLeft: -progressEmojiSize * 0.35,
                    top: -(progressEmojiSize - progressHeight) / 2 - 1,
                  },
                ]}
              >
                <Text style={[styles.progressEmoji, { fontSize: progressEmojiSize * 0.82 }]}>{progressEmoji}</Text>
              </View>
            </View>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.caption, { fontSize: captionSize }]}>
              {captionText}
            </Text>
          </View>
          <IconButton icon={<GearIcon size={iconSize * 0.5} />} onPress={openSettings} size={iconSize} tone="blue" />
        </View>
        <View style={styles.gameContainer}>
          <View style={[styles.boardWrap, { width: boardSize, maxWidth: boardMaxWidth }]}>
            <PuzzleBoard boardSize={boardSize} gameStatus={gameStatus} hintEdge={hintEdge} level={level} onEnd={touchEnd} onMove={touchMove} onStart={touchStart} progress={progress} />
            {showConfetti ? (
              <View pointerEvents="none" style={styles.confettiLayer}>
                {confettiBursts.map(({ count, delay, explosionSpeed, fallSpeed, origin }, index) => (
                  <ConfettiCannon
                    autoStart
                    autoStartDelay={delay}
                    count={count}
                    colors={CONFETTI_COLORS}
                    explosionSpeed={explosionSpeed}
                    fadeOut
                    fallSpeed={fallSpeed}
                    key={`confetti-${index}`}
                    origin={origin}
                  />
                ))}
              </View>
            ) : null}
            {gameStatus === 'completed' ? (
              <View style={styles.completeOverlay}>
                <View style={styles.completeCard}>
                  <View style={styles.bannerWrap}>
                    <View style={[styles.ribbonTail, styles.ribbonLeft]} />
                    <View style={styles.banner}>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.bannerText}>
                        CONGRATULATIONS
                      </Text>
                    </View>
                    <View style={[styles.ribbonTail, styles.ribbonRight]} />
                  </View>
                  <Text style={styles.completeCaption}>{canGoNext ? 'Level cleared! Ready for the next challenge?' : 'Level cleared! Tap replay to enjoy it again.'}</Text>
                  <View style={styles.completeActions}>
                    <Pressable onPress={resetLevel} style={styles.restartButton}>
                      <Text style={styles.restartIcon}>↻</Text>
                    </Pressable>
                    <Pressable onPress={canGoNext ? nextLevel : resetLevel} style={styles.nextButton}>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.nextButtonText}>
                        {canGoNext ? 'NEXT' : 'REPLAY'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : null}
            {gameStatus === 'failed' ? (
              <View pointerEvents="none" style={styles.failedOverlay}>
                <Text style={styles.failedText}>FAILED</Text>
              </View>
            ) : null}
          </View>
        </View>
        {gameStatus !== 'completed' ? (
          <View style={styles.bottomActions}>
            <RoundAction color="#ffe47a" iconKind="hint" onPress={showHint} size={actionSize} />
            <RoundAction color="#87eb48" iconKind="next" onPress={canGoNext ? nextLevel : resetLevel} size={actionSize} />
          </View>
        ) : (
          <View style={styles.bottomActionsSpacer} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05051d' },
  mainContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2, paddingBottom: 8, gap: 10 },
  topBarCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', minWidth: 0, paddingHorizontal: 4 },
  kicker: { color: '#f2f5ff', fontWeight: '800', textAlign: 'center' },
  caption: { color: '#aeb5d8', marginTop: 8, textAlign: 'center' },
  progressTrack: { width: '100%', backgroundColor: '#090b14', borderRadius: 999, marginTop: 10, overflow: 'visible', borderWidth: 1.5, borderColor: '#202432' },
  progressFill: { height: '100%', backgroundColor: '#53f000', borderRadius: 999, shadowColor: '#53f000', shadowOpacity: 0.35, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  progressEmojiWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  progressEmoji: { textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  iconButton: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5, flexShrink: 0 },
  helpButton: { backgroundColor: '#f6c44b', borderColor: '#8a4b12' },
  helpInner: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffd96b' },
  settingsShell: { backgroundColor: '#2790be', borderColor: '#0f4f76', shadowColor: '#48c8ff', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  settingsInner: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#84e1f6', borderWidth: 2.2, borderColor: '#d8fbff' },
  gameContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 0, paddingVertical: 8 },
  boardWrap: { alignItems: 'center', justifyContent: 'center', flexShrink: 1, alignSelf: 'center' },
  confettiLayer: { ...StyleSheet.absoluteFillObject, top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' },
  completeOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  completeCard: { width: '100%', maxWidth: 320, alignItems: 'center', backgroundColor: 'rgba(9, 11, 24, 0.78)', borderRadius: 28, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', paddingVertical: 22, paddingHorizontal: 14 },
  bannerWrap: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', width: '100%' },
  banner: { flexShrink: 1, backgroundColor: '#46e62e', borderColor: '#1fa818', borderRadius: 10, borderWidth: 3, paddingHorizontal: 18, paddingVertical: 10, maxWidth: '82%' },
  bannerText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 1, textAlign: 'center' },
  completeCaption: { color: '#dce4ff', fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 14, marginBottom: 18, paddingHorizontal: 8 },
  ribbonTail: { borderBottomWidth: 14, borderTopWidth: 14, height: 0, width: 0 },
  ribbonLeft: { borderBottomColor: '#2dc51d', borderLeftWidth: 18, borderLeftColor: 'transparent', borderRightWidth: 18, borderRightColor: '#46e62e', borderTopColor: '#2dc51d', marginRight: -4 },
  ribbonRight: { borderBottomColor: '#2dc51d', borderLeftWidth: 18, borderLeftColor: '#46e62e', borderRightWidth: 18, borderRightColor: 'transparent', borderTopColor: '#2dc51d', marginLeft: -4 },
  completeActions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 18, width: '100%' },
  restartButton: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#58bdf5', borderColor: '#1b6f9e', borderWidth: 3, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
  restartIcon: { color: '#fff', fontSize: 38, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  nextButton: { minWidth: 148, maxWidth: 220, paddingHorizontal: 24, height: 68, borderRadius: 14, backgroundColor: '#77f433', borderColor: '#2f9d16', borderWidth: 3, alignItems: 'center', justifyContent: 'center', shadowColor: '#77f433', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 10, elevation: 5 },
  nextButtonText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 1, textAlign: 'center' },
  failedOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  failedText: { color: '#ff4d67', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  bottomActions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 30, paddingTop: 6, paddingBottom: 8 },
  bottomActionsSpacer: { height: 84 },
  roundActionShell: { alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
  roundActionInner: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  hintShell: { backgroundColor: '#ffca4d', borderColor: '#8a4b12' },
  nextShell: { backgroundColor: '#54c923', borderColor: '#1e7a0d' },
  hintBadge: { borderColor: '#ffffff' },
  nextBadge: { borderColor: '#ffffff' },
  actionBadge: { position: 'absolute', right: -4, top: -4, minWidth: 24, height: 24, borderRadius: 12, backgroundColor: '#ff4b53', borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3.5 },
  badgePlayIcon: { marginTop: 1 },
  actionBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900', lineHeight: 9, marginTop: -1 },
});
