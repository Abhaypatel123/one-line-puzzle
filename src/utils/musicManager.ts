type SoundRef = {
  loadAsync: (source: { uri: string }, options?: { isLooping?: boolean; shouldPlay?: boolean }) => Promise<unknown>;
  playAsync: () => Promise<unknown>;
  pauseAsync: () => Promise<unknown>;
  getStatusAsync: () => Promise<{ isLoaded?: boolean; isPlaying?: boolean }>;
  unloadAsync: () => Promise<unknown>;
} | null;

const BACKGROUND_SOURCE = { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' };

class MusicManager {
  private sound: SoundRef = null;
  private audio: null | typeof import('expo-av') = null;

  private async ensureLoaded() {
    if (this.sound) return this.sound;
    const av = this.audio ?? (await import('expo-av').catch(() => null));
    if (!av) return null;
    this.audio = av;
    await av.Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
    }).catch(() => null);
    const sound = new av.Audio.Sound();
    await sound.loadAsync(BACKGROUND_SOURCE, { isLooping: true, shouldPlay: false, volume: 0.6 });
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
