export type Difficulty = 'easy' | 'medium' | 'hard';
export type PuzzleNode = { id: number; x: number; y: number };
export type PuzzleEdge = [number, number];
export type PuzzleLevel = { id: number; title: string; difficulty: Difficulty; nodes: PuzzleNode[]; edges: PuzzleEdge[] };

type Template = { difficulty: Difficulty; nodes: [number, number][]; edges: PuzzleEdge[] };

const templates: Template[] = [
  { difficulty: 'easy', nodes: [[0, 0], [100, 0], [100, 100], [0, 100]], edges: [[1, 2], [2, 3], [3, 4], [4, 1]] },
  { difficulty: 'easy', nodes: [[0, 50], [35, 0], [70, 50], [35, 100]], edges: [[1, 2], [2, 3], [3, 4], [4, 1]] },
  { difficulty: 'easy', nodes: [[0, 50], [40, 10], [100, 10], [140, 50], [70, 110]], edges: [[1, 2], [2, 3], [3, 4], [4, 5], [5, 1]] },
  { difficulty: 'medium', nodes: [[0, 0], [100, 0], [100, 100], [0, 100]], edges: [[1, 2], [2, 3], [3, 4], [4, 1], [1, 3]] },
  { difficulty: 'medium', nodes: [[0, 50], [50, 0], [100, 50], [50, 100], [50, 145]], edges: [[1, 2], [2, 3], [3, 4], [4, 1], [2, 4], [4, 5]] },
  { difficulty: 'medium', nodes: [[0, 0], [50, 0], [100, 0], [0, 100], [50, 100], [100, 100]], edges: [[1, 2], [2, 3], [3, 6], [6, 5], [5, 4], [4, 1], [2, 5]] },
  { difficulty: 'hard', nodes: [[0, 0], [45, 0], [90, 0], [0, 60], [45, 60], [90, 60], [0, 120], [45, 120], [90, 120]], edges: [[1, 2], [2, 3], [1, 4], [2, 5], [3, 6], [4, 5], [5, 6], [4, 7], [5, 8], [6, 9], [7, 8], [8, 9], [2, 4]] },
  { difficulty: 'hard', nodes: [[0, 60], [35, 15], [85, 0], [130, 30], [145, 90], [110, 135], [55, 145], [10, 110], [75, 75]], edges: [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 1], [2, 9], [9, 5], [7, 9], [9, 4], [2, 4]] },
  { difficulty: 'hard', nodes: [[0, 0], [45, 0], [90, 0], [0, 55], [45, 55], [90, 55], [0, 110], [45, 110], [90, 110], [135, 55]], edges: [[1, 2], [2, 3], [1, 4], [2, 5], [3, 6], [4, 5], [5, 6], [4, 7], [5, 8], [6, 9], [7, 8], [8, 9], [6, 10], [9, 10], [2, 4]] },
];

const difficultyPlan: Difficulty[] = ['easy', 'easy', 'easy', 'easy', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard'];
const keyOf = ([a, b]: PuzzleEdge) => `${Math.min(a, b)}-${Math.max(a, b)}`;

const mapNodes = (id: number, points: [number, number][]) => {
  const variant = id - 1;
  const width = 0.62 + (variant % 4) * 0.04;
  const height = 0.56 + (variant % 3) * 0.05;
  const offsetX = 0.12 + (variant % 5) * 0.015;
  const offsetY = 0.14 + (Math.floor(variant / 2) % 4) * 0.01;
  return points.map(([x, y], index) => ({
    id: index + 1,
    x: Number((offsetX + ((variant % 2 === 0 ? x : 145 - x) / 145) * width).toFixed(3)),
    y: Number((offsetY + (y / 145) * height).toFixed(3)),
  }));
};

const isConnected = (nodes: PuzzleNode[], edges: PuzzleEdge[]) => {
  const seen = new Set<number>([nodes[0]?.id]);
  const walk = [...seen];
  while (walk.length) {
    const node = walk.pop()!;
    edges.forEach(([a, b]) => {
      const next = a === node ? b : b === node ? a : null;
      if (next && !seen.has(next)) {
        seen.add(next);
        walk.push(next);
      }
    });
  }
  return seen.size === nodes.length;
};

const assertEulerGraph = (level: PuzzleLevel) => {
  const degree = level.edges.reduce<Record<number, number>>((map, [a, b]) => ({ ...map, [a]: (map[a] ?? 0) + 1, [b]: (map[b] ?? 0) + 1 }), {});
  const odd = Object.values(degree).filter((value) => value % 2 === 1).length;
  const uniqueEdges = new Set(level.edges.map(keyOf)).size === level.edges.length;
  if (!level.nodes.length || !uniqueEdges || !isConnected(level.nodes, level.edges) || ![0, 2].includes(odd)) {
    throw new Error(`Invalid Euler level ${level.id}`);
  }
};

const pickTemplate = (difficulty: Difficulty, index: number) => {
  const group = templates.filter((template) => template.difficulty === difficulty);
  return group[index % group.length];
};

export const generateLevels = (count = 10): PuzzleLevel[] =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const difficulty = difficultyPlan[index] ?? 'hard';
    const template = pickTemplate(difficulty, index);
    const level: PuzzleLevel = {
      id,
      title: `${difficulty[0].toUpperCase()}${difficulty.slice(1)} ${id}`,
      difficulty,
      nodes: mapNodes(id, template.nodes),
      edges: template.edges,
    };
    assertEulerGraph(level);
    return level;
  });

export const generateLevelData = (count = 10) => generateLevels(count).map(({ nodes, edges }) => ({ nodes, edges }));
