export interface KeyPoint {
  id: string;
  y: number; // 0-1 (значение яркости/хроматики) или APCA контраст (0-108) или Chroma (0-0.4)
  locked?: boolean;
  isApcach?: boolean; // Флаг для определения типа значения
  isChroma?: boolean; // Флаг для определения типа значения (хроматика)
}

export interface BezierCurve {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  controlPoint1: { x: number; y: number };
  controlPoint2: { x: number; y: number };
}

export type CurveMode = 'bezier' | 'keypoints';

export interface CurveSettings {
  mode: CurveMode;
  keyPoints: KeyPoint[];
  bezierCurve: BezierCurve;
  steps: number; // количество шагов (11 для Linear, 12 для Semantic)
}

export interface CurveEditorProps {
  settings: CurveSettings;
  onSettingsChange: (settings: CurveSettings) => void;
  type: 'lightness' | 'chroma'; // тип кривой
}
