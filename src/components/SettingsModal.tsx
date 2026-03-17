import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type SettingsModalProps = {
  musicEnabled: boolean;
  onClose: () => void;
  onPrivacyPress: () => void;
  onToggleMusic: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  visible: boolean;
};

const MusicIcon = () => (
  <Svg height={34} viewBox="0 0 24 24" width={34}>
    <Path d="M16 4v9.5a3.5 3.5 0 1 1-2-3.15V8.1l-6 1.5v6.4a3.5 3.5 0 1 1-2-3.15V7.4c0-.91.62-1.7 1.5-1.92L16 4Z" fill="#ffffff" stroke="#2b6d93" strokeWidth={1.3} />
  </Svg>
);

const SpeakerIcon = () => (
  <Svg height={34} viewBox="0 0 24 24" width={34}>
    <Path d="M3 14h4l5 4V6L7 10H3v4Zm12.5-1.96a4 4 0 0 0 0-4.08m2.5 6.54a8 8 0 0 0 0-9" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} />
    <Path d="M3 14h4l5 4V6L7 10H3v4Z" fill="#ffffff" stroke="#2b6d93" strokeLinejoin="round" strokeWidth={1.3} />
  </Svg>
);

const Toggle = ({ enabled, onPress }: { enabled: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[styles.toggle, enabled && styles.toggleOn]}>
    <Text style={styles.toggleLabel}>{enabled ? 'ON' : 'OFF'}</Text>
    <View style={[styles.toggleKnob, enabled && styles.toggleKnobOn]} />
  </Pressable>
);

export const SettingsModal = ({ musicEnabled, onClose, onPrivacyPress, onToggleMusic, onToggleSound, soundEnabled, visible }: SettingsModalProps) => (
  <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
    <Pressable onPress={onClose} style={styles.backdrop}>
      <Pressable onPress={() => null} style={styles.card}>
        <View style={styles.row}>
          <MusicIcon />
          <Toggle enabled={musicEnabled} onPress={onToggleMusic} />
        </View>
        <View style={styles.row}>
          <SpeakerIcon />
          <Toggle enabled={soundEnabled} onPress={onToggleSound} />
        </View>
        <Pressable onPress={onPrivacyPress} style={styles.privacyLink}>
          <Text style={styles.privacyText}>Privacy Policy</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(3, 4, 18, 0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '72%', maxWidth: 320, backgroundColor: '#9dd7f3', borderColor: '#1d6f9b', borderWidth: 3, borderRadius: 20, paddingVertical: 26, paddingHorizontal: 22 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  toggle: { width: 86, height: 38, borderRadius: 22, backgroundColor: '#1f5c84', borderColor: '#ffffff', borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  toggleOn: { backgroundColor: '#1d5f8d' },
  toggleLabel: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#8a9caf' },
  toggleKnobOn: { backgroundColor: '#18e25d' },
  privacyLink: { marginTop: 10, alignSelf: 'center' },
  privacyText: { color: '#ffffff', fontSize: 16, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
});
