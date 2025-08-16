import { KeyPoint, BezierCurve, CurveSettings } from '../types/curveEditor';

// Вычисление точки на кривой Безье
export function bezierPoint(t: number, curve: BezierCurve): { x: number; y: number } {
  const { startPoint, endPoint, controlPoint1, controlPoint2 } = curve;
  
  const x = Math.pow(1 - t, 3) * startPoint.x +
            3 * Math.pow(1 - t, 2) * t * controlPoint1.x +
            3 * (1 - t) * Math.pow(t, 2) * controlPoint2.x +
            Math.pow(t, 3) * endPoint.x;
            
  const y = Math.pow(1 - t, 3) * startPoint.y +
            3 * Math.pow(1 - t, 2) * t * controlPoint1.y +
            3 * (1 - t) * Math.pow(t, 2) * controlPoint2.y +
            Math.pow(t, 3) * endPoint.y;
            
  return { x, y };
}

// Генерация значений по кривой Безье
export function generateBezierValues(curve: BezierCurve, steps: number): number[] {
  const values: number[] = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const point = bezierPoint(t, curve);
    values.push(point.y);
  }
  
  return values;
}

// Интерполяция между ключевыми точками (только Y координаты)
export function interpolateKeyPoints(keyPoints: KeyPoint[], steps: number): number[] {
  if (keyPoints.length === 0) return new Array(steps).fill(0.5);
  if (keyPoints.length === 1) return new Array(steps).fill(keyPoints[0].y);
  
  const values: number[] = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    
    // Линейная интерполяция между точками
    const pointIndex = t * (keyPoints.length - 1);
    const leftIndex = Math.floor(pointIndex);
    const rightIndex = Math.min(leftIndex + 1, keyPoints.length - 1);
    
    if (leftIndex === rightIndex) {
      values.push(keyPoints[leftIndex].y);
    } else {
      const ratio = pointIndex - leftIndex;
      const leftY = keyPoints[leftIndex].y;
      const rightY = keyPoints[rightIndex].y;
      const interpolatedValue = leftY + (rightY - leftY) * ratio;
      values.push(interpolatedValue);
    }
  }
  
  return values;
}

// Конвертация кривой Безье в ключевые точки (только Y координаты)
export function bezierToKeyPoints(curve: BezierCurve, steps: number): KeyPoint[] {
  const keyPoints: KeyPoint[] = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const point = bezierPoint(t, curve);
    
    keyPoints.push({
      id: `point-${i}`,
      y: point.y
    });
  }
  
  return keyPoints;
}

// Конвертация ключевых точек в кривую Безье
export function keyPointsToBezier(keyPoints: KeyPoint[]): BezierCurve {
  if (keyPoints.length === 0) {
    return {
      startPoint: { x: 0, y: 0.5 },
      endPoint: { x: 1, y: 0.5 },
      controlPoint1: { x: 0.33, y: 0.5 },
      controlPoint2: { x: 0.66, y: 0.5 }
    };
  }
  
  // Используем первую и последнюю точки как начальную и конечную
  const startPoint = keyPoints[0];
  const endPoint = keyPoints[keyPoints.length - 1];
  
  // Контрольные точки на основе промежуточных точек
  const midIndex = Math.floor(keyPoints.length / 2);
  const midPoint = keyPoints[midIndex];
  
  return {
    startPoint: { x: 0, y: startPoint.y },
    endPoint: { x: 1, y: endPoint.y },
    controlPoint1: { x: 0.33, y: midPoint.y },
    controlPoint2: { x: 0.66, y: midPoint.y }
  };
}

// Генерация значений по настройкам кривой
export function generateCurveValues(settings: CurveSettings): number[] {
  console.log('generateCurveValues called with:', settings);
  if (settings.mode === 'bezier') {
    const values = generateBezierValues(settings.bezierCurve, settings.steps);
    console.log('Bezier values:', values);
    return values;
  } else {
    const values = interpolateKeyPoints(settings.keyPoints, settings.steps);
    console.log('KeyPoints values:', values);
    return values;
  }
}

// Синхронизация между режимами
export function syncCurveModes(settings: CurveSettings): CurveSettings {
  if (settings.mode === 'bezier') {
    // Конвертируем Безье в ключевые точки (используем количество шагов из настроек)
    const keyPoints = bezierToKeyPoints(settings.bezierCurve, settings.steps);
    return { ...settings, keyPoints };
  } else {
    // Конвертируем ключевые точки в Безье
    const bezierCurve = keyPointsToBezier(settings.keyPoints);
    return { ...settings, bezierCurve };
  }
}
