import { PuzzleEdge, PuzzleLevel, PuzzleNode } from '@game/levelData';

export type Point = { x: number; y: number };

export const edgeKey = ([a, b]: PuzzleEdge | [number, number]) =>
  [Math.min(a, b), Math.max(a, b)].join('-');

export const hasEdge = (level: PuzzleLevel, a: number, b: number) =>
  level.edges.some(([from, to]) => edgeKey([from, to]) === edgeKey([a, b]));

export const getNode = (nodes: PuzzleNode[], id: number) => nodes.find((node) => node.id === id) ?? null;

export const getDegrees = (level: PuzzleLevel) =>
  level.edges.reduce<Record<number, number>>((map, [a, b]) => {
    map[a] = (map[a] ?? 0) + 1;
    map[b] = (map[b] ?? 0) + 1;
    return map;
  }, {});

export const getValidStartIds = (level: PuzzleLevel) => {
  return level.nodes.map((node) => node.id);
};

export const findNearestNode = (nodes: PuzzleNode[], point: Point, threshold = 0.06) =>
  nodes.reduce<{ node: PuzzleNode | null; distance: number }>(
    (best, node) => {
      const distance = Math.hypot(node.x - point.x, node.y - point.y);
      return distance < threshold && distance < best.distance ? { node, distance } : best;
    },
    { node: null, distance: Number.MAX_SAFE_INTEGER }
  ).node;

export const toPointMap = (nodes: PuzzleNode[]) =>
  nodes.reduce<Record<number, Point>>((map, node) => ({ ...map, [node.id]: { x: node.x, y: node.y } }), {});
