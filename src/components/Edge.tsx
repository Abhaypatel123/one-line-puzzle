import { Line } from 'react-native-svg';

type EdgeProps = {
  color: string;
  glow?: boolean;
  width?: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export const Edge = ({ color, glow = false, width = 8, x1, x2, y1, y2 }: EdgeProps) => (
  <>
    {glow ? <Line stroke="rgba(255, 0, 214, 0.2)" strokeLinecap="round" strokeWidth={width + 12} x1={x1} x2={x2} y1={y1} y2={y2} /> : null}
    <Line stroke={color} strokeLinecap="round" strokeWidth={width} x1={x1} x2={x2} y1={y1} y2={y2} />
  </>
);
