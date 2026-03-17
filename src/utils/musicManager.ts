import { NativeModules } from 'react-native';

type SoundRef = {
  loadAsync: (source: { uri: string }, options?: { isLooping?: boolean; shouldPlay?: boolean }) => Promise<unknown>;
  playAsync: () => Promise<unknown>;
  pauseAsync: () => Promise<unknown>;
  getStatusAsync: () => Promise<{ isLoaded?: boolean; isPlaying?: boolean }>;
  unloadAsync: () => Promise<unknown>;
} | null;

const BACKGROUND_SOURCE = { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' };
const hasNativeAV = Boolean((NativeModules as Record<string, unknown>).ExponentAV);

class MusicManager {
  private sound: SoundRef = null;
  private audio: null | typeof import('expo-av') = null;

  isAvailable() {
    return hasNativeAV;
  }

  private async ensureLoaded() {
    if (!hasNativeAV) return null;
    if (this.sound) return this.sound;
    const av = this.audio ?? (await import('expo-av').catch(() => null));
    if (!av) return null;
    this.audio = av;
    try {
      await av.Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });
    } catch (error) {
      // Silently ignore audio mode errors (e.g., when activity is unavailable)
    }
    const sound = new av.Audio.Sound();
    await sound.loadAsync(BACKGROUND_SOURCE, { isLooping: true, shouldPlay: false, volume: 0.6 }).catch(() => null);
    this.sound = sound;
    return sound;
  }

  async play() {
    const sound = await this.ensureLoaded();
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if ('isLoaded' in status && status.isLoaded && !status.isPlaying) await sound.playAsync();
  }

  async pause() {
    const sound = await this.ensureLoaded();
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if ('isLoaded' in status && status.isLoaded && status.isPlaying) await sound.pauseAsync();
  }

  async sync(enabled: boolean) { return enabled ? this.play() : this.pause(); }

  async unload() {
    if (!this.sound) return;
    await this.sound.unloadAsync().catch(() => null);
    this.sound = null;
  }
}

export const musicManager = new MusicManager();
