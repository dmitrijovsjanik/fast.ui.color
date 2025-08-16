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

// Генерация значений из ключевых точек (прямое соответствие)
export function interpolateKeyPoints(keyPoints: KeyPoint[], steps: number): number[] {
  if (keyPoints.length === 0) return new Array(steps).fill(0.5);
  if (keyPoints.length === 1) return new Array(steps).fill(keyPoints[0].y);
  
  // Каждая ключевая точка соответствует конкретному шагу
  // Если у нас 11 ключевых точек и 11 шагов, возвращаем значения напрямую
  if (keyPoints.length === steps) {
    return keyPoints.map(point => point.y);
  }
  
  // Если количество точек не совпадает, интерполируем
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
  if (settings.mode === 'bezier') {
    return generateBezierValues(settings.bezierCurve, settings.steps);
  } else {
    return interpolateKeyPoints(settings.keyPoints, settings.steps);
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

// Генерация линейной кривой (равномерное распределение)
export function generateLinearCurve(): CurveSettings {
  // Создаем 11 равномерно распределенных точек от 0.98 до 0.1
  const keyPoints = [];
  for (let i = 0; i < 11; i++) {
    const t = i / 10; // от 0 до 1
    const y = 0.98 - (0.98 - 0.1) * t; // линейная интерполяция от 0.98 до 0.1
    keyPoints.push({
      id: `point-${i}`,
      y: y
    });
  }

  return {
    mode: 'keypoints',
    steps: 11,
    keyPoints: keyPoints,
    bezierCurve: {
      startPoint: { x: 0, y: 0.98 },
      endPoint: { x: 1, y: 0.1 },
      controlPoint1: { x: 0.33, y: 0.33 },
      controlPoint2: { x: 0.66, y: 0.66 }
    }
  };
}

// Генерация S-образной кривой
export function generateSCurve(): CurveSettings {
  // Создаем S-образно распределенные точки от 0.98 до 0.1
  const keyPoints = [];
  for (let i = 0; i < 11; i++) {
    const t = i / 10; // от 0 до 1
    const sCurve = 3 * Math.pow(t, 2) - 2 * Math.pow(t, 3); // S-образная функция
    const y = 0.98 - (0.98 - 0.1) * sCurve; // S-образная интерполяция от 0.98 до 0.1
    keyPoints.push({
      id: `point-${i}`,
      y: y
    });
  }

  return {
    mode: 'keypoints',
    steps: 11,
    keyPoints: keyPoints,
    bezierCurve: {
      startPoint: { x: 0, y: 0.98 },
      endPoint: { x: 1, y: 0.1 },
      controlPoint1: { x: 0.25, y: 0.2 },
      controlPoint2: { x: 0.75, y: 0.8 }
    }
  };
}

// Генерация кастомной кривой (равномерное распределение)
export function generateCustomCurve(): CurveSettings {
  return {
    mode: 'keypoints',
    steps: 11,
    keyPoints: [
      { id: 'point-0', y: 0.98 },  // Шаг 1 (дефолт 98%)
      { id: 'point-1', y: 0.2 },   // Шаг 2
      { id: 'point-2', y: 0.3 },   // Шаг 3
      { id: 'point-3', y: 0.4 },   // Шаг 4
      { id: 'point-4', y: 0.5 },   // Шаг 5
      { id: 'point-5', y: 0.6 },   // Шаг 6
      { id: 'point-6', y: 0.7 },   // Шаг 7
      { id: 'point-7', y: 0.8 },   // Шаг 8
      { id: 'point-8', y: 0.85 },  // Шаг 9
      { id: 'point-9', y: 0.95 },  // Шаг 10
      { id: 'point-10', y: 0.1 }   // Шаг 11 (дефолт 10%)
    ],
    bezierCurve: {
      startPoint: { x: 0, y: 0.98 },
      endPoint: { x: 1, y: 0.1 },
      controlPoint1: { x: 0.33, y: 0.33 },
      controlPoint2: { x: 0.66, y: 0.66 }
    }
  };
}

// Функция для тестирования линейности кривой
export function testCurveLinearity(lightnessValues: number[]): void {
  console.log('=== ТЕСТ ЛИНЕЙНОСТИ КРИВОЙ ===');
  console.log('Значения яркости:', lightnessValues.map((v, i) => `${i+1}: ${(v * 100).toFixed(1)}%`));
  
  // Проверяем равномерность шагов
  const differences: number[] = [];
  for (let i = 1; i < lightnessValues.length; i++) {
    const diff = lightnessValues[i-1] - lightnessValues[i];
    differences.push(diff);
  }
  
  console.log('Разности между соседними шагами:', differences.map((d, i) => `${i+1}-${i+2}: ${(d * 100).toFixed(1)}%`));
  
  // Проверяем отклонения от идеальной линейности
  const totalRange = lightnessValues[0] - lightnessValues[lightnessValues.length - 1];
  const expectedStep = totalRange / (lightnessValues.length - 1);
  
  console.log('Общий диапазон:', (totalRange * 100).toFixed(1) + '%');
  console.log('Ожидаемый шаг:', (expectedStep * 100).toFixed(1) + '%');
  
  const deviations: number[] = [];
  for (let i = 0; i < differences.length; i++) {
    const deviation = Math.abs(differences[i] - expectedStep);
    deviations.push(deviation);
  }
  
  console.log('Отклонения от идеального шага:', deviations.map((d, i) => `${i+1}-${i+2}: ${(d * 100).toFixed(1)}%`));
  
  const maxDeviation = Math.max(...deviations);
  const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  
  console.log('Максимальное отклонение:', (maxDeviation * 100).toFixed(1) + '%');
  console.log('Среднее отклонение:', (avgDeviation * 100).toFixed(1) + '%');
  
  // Проверяем контраст между соседними цветами
  const contrasts: number[] = [];
  for (let i = 1; i < lightnessValues.length; i++) {
    const l1 = lightnessValues[i-1];
    const l2 = lightnessValues[i];
    const contrast = Math.abs(l1 - l2) / Math.min(l1, l2);
    contrasts.push(contrast);
  }
  
  console.log('Контрасты между соседними цветами:', contrasts.map((c, i) => `${i+1}-${i+2}: ${(c * 100).toFixed(1)}%`));
  
  console.log('=== КОНЕЦ ТЕСТА ===');
}


