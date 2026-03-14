import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GameScreen } from '@screens/GameScreen';
import { HomeScreen } from '@screens/HomeScreen';
import { useGameStore } from '@store/gameStore';

export default function App() {
  const screen = useGameStore((state) => state.screen);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        {screen === 'home' ? <HomeScreen /> : <GameScreen />}
        <StatusBar style="light" />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#11131b' },
  safeArea: { flex: 1, backgroundColor: '#11131b' },
});
