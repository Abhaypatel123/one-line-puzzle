import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type SettingsModalProps = {
  musicEnabled: boolean;
  onClose: () => void;
  onPrivacyPress: () => void;
  onToggleMusic: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  visible: boolean;
};

const SettingIconBadge = ({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) => (
  <View style={[styles.iconBadge, compact && styles.compactIconBadge]}>
    {children}
  </View>
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
        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.settingInfo}>
              <SettingIconBadge>
                <MaterialCommunityIcons color="#ffffff" name="music-note" size={28} />
              </SettingIconBadge>
              <Text numberOfLines={1} style={styles.settingLabel}>
                Music
              </Text>
            </View>
            <Toggle enabled={musicEnabled} onPress={onToggleMusic} />
          </View>
          <View style={styles.row}>
            <View style={styles.settingInfo}>
              <SettingIconBadge>
                <Ionicons color="#ffffff" name="volume-high" size={26} />
              </SettingIconBadge>
              <Text numberOfLines={1} style={styles.settingLabel}>
                Sound
              </Text>
            </View>
            <Toggle enabled={soundEnabled} onPress={onToggleSound} />
          </View>
          <Pressable onPress={onPrivacyPress} style={styles.privacyRow}>
            <View style={styles.settingInfo}>
              <SettingIconBadge compact>
                <Ionicons color="#ffffff" name="shield-checkmark" size={22} />
              </SettingIconBadge>
              <Text numberOfLines={1} style={styles.privacyText}>
                Privacy Policy
              </Text>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(3, 4, 18, 0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '88%', maxWidth: 380, minWidth: 300, backgroundColor: '#9dd7f3', borderColor: '#1d6f9b', borderWidth: 3, borderRadius: 20, paddingVertical: 24, paddingHorizontal: 20 },
  content: { gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 14 },
  iconBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#63c8ee', borderWidth: 2, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  compactIconBadge: { width: 38, height: 38, borderRadius: 19 },
  settingLabel: { flexShrink: 1, color: '#ffffff', fontSize: 18, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.18)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  toggle: { width: 86, height: 38, borderRadius: 22, backgroundColor: '#1f5c84', borderColor: '#ffffff', borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  toggleOn: { backgroundColor: '#1d5f8d' },
  toggleLabel: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#8a9caf' },
  toggleKnobOn: { backgroundColor: '#18e25d' },
  privacyRow: { minHeight: 48, justifyContent: 'center' },
  privacyText: { flexShrink: 1, color: '#ffffff', fontSize: 16, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
});
