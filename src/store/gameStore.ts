import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { LEVELS } from '@game/levelData';
import { beginPath, createProgress, extendPath, finishPath, getHintEdge, resetProgress } from '@game/puzzleEngine';
import { Point } from '@utils/graphUtils';
import { persistStorage } from '@utils/persistStorage';

type Screen = 'home' | 'game';
type GameStatus = 'playing' | 'failed' | 'completed';
let failTimer: ReturnType<typeof setTimeout> | null = null;
const clearFailTimer = () => {
  if (failTimer) clearTimeout(failTimer);
  failTimer = null;
};
const scheduleFailReset = (reset: () => void) => {
  clearFailTimer();
  failTimer = setTimeout(reset, 800);
};

type GameState = {
  completedLevelIds: number[];
  gameStatus: GameStatus;
  hintEdge: string | null;
  hydrateProgress: () => Promise<void>;
  musicEnabled: boolean;
  progressLoaded: boolean;
  progress: ReturnType<typeof createProgress>;
  screen: Screen;
  setProgressLoaded: (loaded: boolean) => void;
  selectedLevelIndex: number;
  unlockedLevelIndex: number;
  changeSelectedLevel: (step: number) => void;
  goHome: () => void;
  nextLevel: () => void;
  resetLevel: () => void;
  showHint: () => void;
  startLevel: (index?: number) => void;
  touchEnd: () => void;
  touchMove: (point: Point) => void;
  touchStart: (point: Point) => void;
  toggleMusic: () => void;
};

const getLevel = (index: number) => LEVELS[Math.max(0, Math.min(index, LEVELS.length - 1))] ?? LEVELS[0];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      completedLevelIds: [],
      gameStatus: 'playing',
      hintEdge: null,
      hydrateProgress: async () => {
        if (useGameStore.persist.hasHydrated()) {
          set({ progressLoaded: true });
          return;
        }
        try {
          await useGameStore.persist.rehydrate();
        } finally {
          set({ progressLoaded: true });
        }
      },
      musicEnabled: true,
      progressLoaded: false,
      progress: createProgress(),
      screen: 'home',
      selectedLevelIndex: 0,
      setProgressLoaded: (loaded) => set({ progressLoaded: loaded }),
      unlockedLevelIndex: 0,
      changeSelectedLevel: (step) =>
        set((state) => ({
          selectedLevelIndex: Math.max(0, Math.min(state.selectedLevelIndex + step, state.unlockedLevelIndex)),
        })),
      goHome: () => {
        clearFailTimer();
        set({ gameStatus: 'playing', screen: 'home', hintEdge: null, progress: resetProgress() });
      },
      nextLevel: () =>
        set((state) => {
          const nextIndex = Math.min(state.selectedLevelIndex + 1, LEVELS.length - 1);
          if (nextIndex > state.unlockedLevelIndex) return state;
          clearFailTimer();
          return { gameStatus: 'playing', screen: 'game', selectedLevelIndex: nextIndex, hintEdge: null, progress: resetProgress() };
        }),
      resetLevel: () => {
        clearFailTimer();
        set({ gameStatus: 'playing', hintEdge: null, progress: resetProgress() });
      },
      showHint: () =>
        set((state) => ({
          hintEdge: getHintEdge(getLevel(state.selectedLevelIndex), state.progress),
        })),
      startLevel: (index) => {
        clearFailTimer();
        set((state) => ({
          gameStatus: 'playing',
          screen: 'game',
          selectedLevelIndex: index ?? state.selectedLevelIndex,
          hintEdge: null,
          progress: resetProgress(),
        }));
      },
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
      touchEnd: () =>
        set((state) => {
          if (state.gameStatus !== 'playing') return state;
          if (state.progress.solved || state.progress.path.length === 0) return { hintEdge: null, progress: finishPath(state.progress) };
          scheduleFailReset(() => get().resetLevel());
          return { gameStatus: 'failed', hintEdge: null, progress: finishPath(state.progress) };
        }),
      touchMove: (point) =>
        set((state) => {
          if (state.gameStatus !== 'playing') return state;
          const level = getLevel(state.selectedLevelIndex);
          if (!level) return state;
          const started = state.progress.path.length === 0 ? beginPath(level, state.progress, point) : state.progress;
          const result = extendPath(level, started, point);
          if (result.failed) {
            scheduleFailReset(() => get().resetLevel());
            return { gameStatus: 'failed', hintEdge: null, progress: result.progress };
          }
          if (!result.progress.solved) return { progress: result.progress };

          const completedLevelIds = state.completedLevelIds.includes(level.id) ? state.completedLevelIds : [...state.completedLevelIds, level.id];
          return {
            completedLevelIds,
            gameStatus: 'completed',
            hintEdge: null,
            progress: result.progress,
            unlockedLevelIndex: Math.max(state.unlockedLevelIndex, Math.min(state.selectedLevelIndex + 1, LEVELS.length - 1)),
          };
        }),
      touchStart: (point) =>
        set((state) => (state.gameStatus === 'playing' ? { hintEdge: null, progress: beginPath(getLevel(state.selectedLevelIndex), state.progress, point) } : state)),
    }),
    {
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<GameState> | undefined;
        const maxLevelIndex = LEVELS.length - 1;
        const validCompletedIds = (persisted?.completedLevelIds ?? []).filter((id) => LEVELS.some((level) => level.id === id));
        return {
          ...currentState,
          ...persisted,
          completedLevelIds: validCompletedIds,
          unlockedLevelIndex: Math.max(0, Math.min(persisted?.unlockedLevelIndex ?? currentState.unlockedLevelIndex, maxLevelIndex)),
        };
      },
      name: 'one-line-puzzle-progress',
      onRehydrateStorage: () => (state) => {
        state?.setProgressLoaded(true);
      },
      partialize: (state) => ({
        completedLevelIds: state.completedLevelIds,
        musicEnabled: state.musicEnabled,
        unlockedLevelIndex: state.unlockedLevelIndex,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => persistStorage),
    }
  )
);

export const useCurrentLevel = () => useGameStore((state) => getLevel(state.selectedLevelIndex));
