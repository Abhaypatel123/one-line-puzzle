import { generateLevels } from '@game/levelGenerator';

export type { Difficulty, PuzzleEdge, PuzzleLevel, PuzzleNode } from '@game/levelGenerator';

export const LEVELS = generateLevels(10);
