import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Svg from 'react-native-svg';

import { Edge } from '@components/Edge';
import { Node } from '@components/Node';
import { PuzzleLevel } from '@game/levelData';
import { GameProgress } from '@game/puzzleEngine';
import { Point, edgeKey, findNearestNode, getNode, hasEdge } from '@utils/graphUtils';

type PuzzleBoardProps = {
  gameStatus: 'playing' | 'failed' | 'completed';
  hintEdge: string | null;
  level: PuzzleLevel;
  onEnd: () => void;
  onMove: (point: Point) => void;
  onStart: (point: Point) => void;
  progress: GameProgress;
};

export const PuzzleBoard = ({ gameStatus, hintEdge, level, onEnd, onMove, onStart, progress }: PuzzleBoardProps) => {
  const windowSize = useWindowDimensions();
  const { width, height } = Dimensions.get('window');
  const boardSize = Math.min(windowSize.width || width, windowSize.height || height) * 0.9;
  const touchRadius = 0.06;
  const nodeOuter = Math.max(10, boardSize * 0.04);
  const nodeInner = Math.max(5, boardSize * 0.018);
  const baseStroke = Math.max(6, boardSize * 0.03);
  const [dragPoint, setDragPoint] = useState<Point | null>(null);
  const currentNodeRef = useRef<number | null>(progress.activeNodeId);
  const visitedEdgesRef = useRef(new Set(progress.visitedEdges));
  const toBoardPoint = useCallback((x: number, y: number) => ({ x: x / boardSize, y: y / boardSize }), [boardSize]);
  const toPixels = useCallback((point: Point) => ({ x: point.x * boardSize, y: point.y * boardSize }), [boardSize]);
  const handleStart = useCallback((x: number, y: number) => {
    if (gameStatus !== 'playing') return;
    const point = toBoardPoint(x, y);
    const start = findNearestNode(level.nodes, point, touchRadius);
    setDragPoint(start ? toPixels(start) : null);
    if (!start) return;
    currentNodeRef.current = start.id;
    visitedEdgesRef.current = new Set(progress.visitedEdges);
    onStart(start);
  }, [gameStatus, level.nodes, onStart, progress.visitedEdges, toBoardPoint, toPixels]);
  const handleMove = useCallback((x: number, y: number) => {
    if (gameStatus !== 'playing') return;
    const point = toBoardPoint(x, y);
    setDragPoint(toPixels(point));
    if (!currentNodeRef.current) return;
    const next = findNearestNode(level.nodes, point, touchRadius);
    if (!next || next.id === currentNodeRef.current) return;
    const key = edgeKey([currentNodeRef.current, next.id]);
    const valid = hasEdge(level, currentNodeRef.current, next.id) && !visitedEdgesRef.current.has(key);
    if (valid) {
      visitedEdgesRef.current.add(key);
      currentNodeRef.current = next.id;
    } else {
      currentNodeRef.current = null;
    }
    setDragPoint(toPixels(next));
    onMove(next);
  }, [gameStatus, level, onMove, toBoardPoint, toPixels]);
  const handleEnd = useCallback(() => {
    currentNodeRef.current = null;
    setDragPoint(null);
    onEnd();
  }, [onEnd]);

  useEffect(() => {
    currentNodeRef.current = progress.activeNodeId;
    visitedEdgesRef.current = new Set(progress.visitedEdges);
    if (gameStatus !== 'playing') setDragPoint(null);
  }, [gameStatus, progress.activeNodeId, progress.visitedEdges]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .shouldCancelWhenOutside(false)
        .onStart((event) => runOnJS(handleStart)(event.x, event.y))
        .onUpdate((event) => runOnJS(handleMove)(event.x, event.y))
        .onFinalize(() => runOnJS(handleEnd)()),
    [handleEnd, handleMove, handleStart]
  );

  const activeNode = progress.activeNodeId ? getNode(level.nodes, progress.activeNodeId) : null;
  const failed = gameStatus === 'failed';

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.board, { width: boardSize, height: boardSize }]}>
        <Svg height={boardSize} viewBox={`0 0 ${boardSize} ${boardSize}`} width={boardSize}>
          {level.edges.map(([a, b]) => {
            const from = getNode(level.nodes, a);
            const to = getNode(level.nodes, b);
            if (!from || !to) return null;
            const start = toPixels(from);
            const end = toPixels(to);
            return <Edge color="#dfe6ff" key={`base-${a}-${b}`} width={baseStroke} x1={start.x} x2={end.x} y1={start.y} y2={end.y} />;
          })}
          {level.edges.map(([a, b]) => {
            const key = edgeKey([a, b]);
            if (!progress.visitedEdges.includes(key) && hintEdge !== key) return null;
            const from = getNode(level.nodes, a);
            const to = getNode(level.nodes, b);
            if (!from || !to) return null;
            const start = toPixels(from);
            const end = toPixels(to);
            const color = progress.visitedEdges.includes(key) ? (failed ? '#ff4d67' : '#ff00d6') : '#ffd54a';
            return <Edge color={color} glow={progress.visitedEdges.includes(key)} key={`done-${key}`} width={baseStroke + 2} x1={start.x} x2={end.x} y1={start.y} y2={end.y} />;
          })}
          {activeNode && dragPoint && !progress.solved ? (
            <Edge color={failed ? '#ff4d67' : '#ff5be6'} glow width={baseStroke} x1={activeNode.x * boardSize} x2={dragPoint.x} y1={activeNode.y * boardSize} y2={dragPoint.y} />
          ) : null}
          {level.nodes.map((node) => <Node active={progress.activeNodeId === node.id} innerRadius={nodeInner} key={node.id} outerRadius={nodeOuter} x={node.x * boardSize} y={node.y * boardSize} />)}
        </Svg>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  board: {
    alignItems: 'center',
    backgroundColor: '#070721',
    borderRadius: 28,
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
