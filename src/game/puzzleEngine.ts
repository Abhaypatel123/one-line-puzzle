import { PuzzleLevel } from '@game/levelData';
import { Point, edgeKey, findNearestNode, getValidStartIds, hasEdge } from '@utils/graphUtils';

export type GameProgress = {
  activeNodeId: number | null;
  currentPoint: Point | null;
  visitedEdges: string[];
  path: number[];
  solved: boolean;
};
export type MoveResult = { failed: boolean; progress: GameProgress };

export const createProgress = (): GameProgress => ({ activeNodeId: null, currentPoint: null, visitedEdges: [], path: [], solved: false });
export const resetProgress = () => createProgress();
const isValidPoint = (point: Point) => Number.isFinite(point.x) && Number.isFinite(point.y);
const SNAP = 0.06;

export const beginPath = (level: PuzzleLevel, progress: GameProgress, point: Point) => {
  if (!isValidPoint(point)) return progress;
  if (progress.path.length > 0) return { ...progress, currentPoint: point };
  const start = findNearestNode(level.nodes, point, SNAP);
  if (!start || !getValidStartIds(level).includes(start.id)) return progress;
  return { ...progress, activeNodeId: start.id, currentPoint: { x: start.x, y: start.y }, path: [start.id] };
};

export const extendPath = (level: PuzzleLevel, progress: GameProgress, point: Point): MoveResult => {
  if (!isValidPoint(point)) return { failed: false, progress };
  if (!progress.activeNodeId || progress.solved) return { failed: false, progress };
  const next = findNearestNode(level.nodes, point, SNAP);
  if (!next || next.id === progress.activeNodeId) return { failed: false, progress };
  const key = edgeKey([progress.activeNodeId, next.id]);
  if (!hasEdge(level, progress.activeNodeId, next.id) || progress.visitedEdges.includes(key)) {
    return { failed: true, progress: { ...progress, currentPoint: { x: next.x, y: next.y } } };
  }
  const visitedEdges = [...progress.visitedEdges, key];
  return {
    failed: false,
    progress: { activeNodeId: next.id, currentPoint: { x: next.x, y: next.y }, visitedEdges, path: [...progress.path, next.id], solved: visitedEdges.length === level.edges.length },
  };
};

export const finishPath = (progress: GameProgress) => progress.solved ? progress : { ...progress, currentPoint: null };

export const getHintEdge = (level: PuzzleLevel, progress: GameProgress) => {
  if (progress.solved) return null;
  const edges = progress.activeNodeId
    ? level.edges.filter(([a, b]) => (a === progress.activeNodeId || b === progress.activeNodeId) && !progress.visitedEdges.includes(edgeKey([a, b])))
    : level.edges.filter(([a, b]) => !progress.visitedEdges.includes(edgeKey([a, b])));
  return edges[0] ? edgeKey(edges[0]) : null;
};
