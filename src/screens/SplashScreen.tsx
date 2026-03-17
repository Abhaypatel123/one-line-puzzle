import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

export const SplashScreen = () => {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width * 0.72, height * 0.4);
  const handY = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(handY, { toValue: -8, duration: 650, useNativeDriver: true }),
          Animated.timing(progress, { toValue: 0.82, duration: 1500, useNativeDriver: false }),
        ]),
        Animated.timing(handY, { toValue: 0, duration: 650, useNativeDriver: true }),
      ])
    ).start();
  }, [handY, progress]);

  return (
    <View style={styles.container}>
      <View style={styles.pattern}>
        {[0, 1, 2, 3].map((i) => <View key={i} style={[styles.hex, { left: -40 + i * 92, top: 30 + i * 115 }]} />)}
        {[0, 1, 2].map((i) => <View key={`r-${i}`} style={[styles.hex, { right: -40 + i * 92, top: 80 + i * 115 }]} />)}
      </View>

      <Text style={styles.title}>ONE LINE</Text>
      <Text style={styles.subtitle}>DRAW PUZZLE</Text>

      <View style={[styles.hero, { width: size, height: size * 1.1 }]}>
        <Svg height={size * 0.9} viewBox="0 0 100 120" width={size}>
          <Polygon fill="none" points="24,18 66,18 88,58 57,108 26,57 57,57" stroke="#ff3fd6" strokeLinejoin="round" strokeWidth="4.5" />
        </Svg>
        <Animated.Text style={[styles.hand, { transform: [{ translateY: handY }] }]}>👉</Animated.Text>
      </View>

      <Text style={styles.loading}>Loading</Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['20%', '100%'] }) }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#171717', paddingHorizontal: 24 },
  pattern: { ...StyleSheet.absoluteFillObject, opacity: 0.45 },
  hex: { position: 'absolute', width: 92, height: 160, borderColor: '#2b2b2b', borderWidth: 5, borderRadius: 20, transform: [{ rotate: '28deg' }] },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  subtitle: { color: '#ff69e3', fontSize: 14, fontWeight: '800', letterSpacing: 1.5, marginBottom: 22 },
  hero: { alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  hand: { position: 'absolute', right: 10, bottom: 18, fontSize: 56 },
  loading: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  progressTrack: { width: '72%', maxWidth: 260, height: 12, backgroundColor: '#050505', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ff3fd6', borderRadius: 999 },
});
