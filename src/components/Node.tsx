import { Circle } from 'react-native-svg';

type NodeProps = {
  active?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  x: number;
  y: number;
};

export const Node = ({ active = false, innerRadius = 6, outerRadius = 13, x, y }: NodeProps) => (
  <>
    <Circle cx={x} cy={y} fill={active ? 'rgba(255, 0, 214, 0.22)' : 'rgba(207,220,255,0.1)'} r={active ? outerRadius + 3 : outerRadius} />
    <Circle cx={x} cy={y} fill={active ? '#ff00d6' : '#f2f5ff'} r={active ? innerRadius + 2 : innerRadius} />
  </>
);
