import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { SettingsModal } from '@components/SettingsModal';
import { LEVELS } from '@game/levelData';
import { useGameStore } from '@store/gameStore';

const PRIMARY_PINK = '#ff4ecd';
const DEEP_PINK = '#c81d68';

const MenuButton = ({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.menuButton}>
    <View style={styles.menuIconWrap}>{icon}</View>
    <Text style={styles.menuLabel}>{label}</Text>
  </Pressable>
);

export const HomeScreen = () => {
  const selectedLevelIndex = useGameStore((state) => state.selectedLevelIndex);
  const musicEnabled = useGameStore((state) => state.musicEnabled);
  const changeSelectedLevel = useGameStore((state) => state.changeSelectedLevel);
  const toggleMusic = useGameStore((state) => state.toggleMusic);
  const unlockedLevelIndex = useGameStore((state) => state.unlockedLevelIndex);
  const startLevel = useGameStore((state) => state.startLevel);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const canGoBack = selectedLevelIndex > 0;
  const canGoForward = selectedLevelIndex < unlockedLevelIndex;

  return (
    <SafeAreaView style={styles.container}>
      <SettingsModal
        musicEnabled={musicEnabled}
        onClose={() => setSettingsOpen(false)}
        onPrivacyPress={() => null}
        onToggleMusic={toggleMusic}
        onToggleSound={() => setSoundEnabled((value) => !value)}
        soundEnabled={soundEnabled}
        visible={settingsOpen}
      />

      <View pointerEvents="none" style={styles.bgShapeOne} />
      <View pointerEvents="none" style={styles.bgShapeTwo} />
      <View pointerEvents="none" style={styles.bgShapeThree} />
      <View pointerEvents="none" style={styles.bgGlow} />

      <View style={styles.mainContent}>
        <View style={styles.hero}>
          <Text style={styles.title}>ONE LINE</Text>
          <Text style={styles.subtitle}>PUZZLE ADVENTURE</Text>
        </View>

        <View style={styles.playWrap}>
          <Pressable onPress={() => startLevel()} style={styles.playButton}>
            <View style={styles.playTriangleWrap}>
              <Ionicons color={DEEP_PINK} name="play" size={64} style={styles.playTriangle} />
            </View>
            <Text style={styles.playText}>PLAY</Text>
          </Pressable>
        </View>

        <View style={styles.bottomTray}>
          <MenuButton
            icon={<Ionicons color="#fff8f2" name="map-outline" size={30} />}
            label="LEVELS"
            onPress={() => changeSelectedLevel(canGoForward ? 1 : canGoBack ? -1 : 0)}
          />
          <MenuButton
            icon={<MaterialCommunityIcons color="#fff8f2" name="cog" size={30} />}
            label="SETTINGS"
            onPress={() => setSettingsOpen(true)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05051d', paddingHorizontal: 24, paddingTop: 18, paddingBottom: 16 },
  bgShapeOne: { position: 'absolute', top: 58, right: -10, width: 150, height: 150, borderWidth: 2, borderColor: '#1b2040', borderRadius: 30, transform: [{ rotate: '44deg' }] },
  bgShapeTwo: { position: 'absolute', top: 250, left: -52, width: 170, height: 170, borderWidth: 2, borderColor: '#22284c', borderRadius: 24, transform: [{ rotate: '35deg' }] },
  bgShapeThree: { position: 'absolute', bottom: 160, right: 8, width: 120, height: 120, borderWidth: 2, borderColor: '#171c37', borderRadius: 20, transform: [{ rotate: '16deg' }] },
  bgGlow: { position: 'absolute', top: 160, alignSelf: 'center', width: 280, height: 280, borderRadius: 140, backgroundColor: '#1a1d46', opacity: 0.4 },
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 14 },
  title: { color: '#f2f5ff', fontSize: 42, fontWeight: '900', letterSpacing: 1.6, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6, textAlign: 'center' },
  subtitle: { color: '#ff69e3', fontSize: 15, fontWeight: '900', letterSpacing: 0.8, marginTop: 2, textAlign: 'center' },
  playWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  playButton: { width: 188, height: 188, borderRadius: 38, backgroundColor: PRIMARY_PINK, borderWidth: 3, borderColor: '#8a174d', alignItems: 'center', justifyContent: 'center', shadowColor: '#ff4ecd', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  playTriangleWrap: { width: 88, height: 88, borderRadius: 26, backgroundColor: '#fff7df', borderWidth: 2, borderColor: '#ffd96b', alignItems: 'center', justifyContent: 'center', marginBottom: 10, shadowColor: '#ffffff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.18, shadowRadius: 8 },
  playTriangle: { marginLeft: 8, textShadowColor: 'rgba(255,255,255,0.18)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  playText: { color: '#fff7df', fontSize: 26, fontWeight: '900', letterSpacing: 1.1 },
  bottomTray: { flexDirection: 'row', width: '100%', maxWidth: 380, backgroundColor: '#141933', borderRadius: 24, borderWidth: 3, borderColor: '#283257', padding: 12, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 5, marginTop: 0, alignSelf: 'center' },
  menuButton: { flex: 1, backgroundColor: '#1f2748', borderRadius: 18, borderWidth: 2, borderColor: '#313c69', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, minHeight: 88, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 6, elevation: 3 },
  menuIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2a3156', marginBottom: 6 },
  menuLabel: { color: '#f2f5ff', fontSize: 15, fontWeight: '900', letterSpacing: 0.4 },
});
