import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GameScreen } from '@screens/GameScreen';
import { HomeScreen } from '@screens/HomeScreen';
import { SplashScreen } from '@screens/SplashScreen';
import { useGameStore } from '@store/gameStore';
import { musicManager } from '@utils/musicManager';

export default function App() {
  const hydrateProgress = useGameStore((state) => state.hydrateProgress);
  const musicEnabled = useGameStore((state) => state.musicEnabled);
  const progressLoaded = useGameStore((state) => state.progressLoaded);
  const screen = useGameStore((state) => state.screen);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    hydrateProgress().catch(() => null);
  }, [hydrateProgress]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!musicManager.isAvailable()) return;
    musicManager.sync(musicEnabled).catch(() => null);
  }, [musicEnabled]);

  useEffect(() => () => {
    if (!musicManager.isAvailable()) return;
    musicManager.unload().catch(() => null);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        {showSplash || !progressLoaded ? <SplashScreen /> : screen === 'home' ? <HomeScreen /> : <GameScreen />}
        <StatusBar style="light" />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#171717' },
  safeArea: { flex: 1, backgroundColor: '#171717' },
});
