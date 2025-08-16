import React, { useState, useRef, useEffect } from 'react';
import { CurveEditorProps, CurveMode, KeyPoint, BezierCurve } from '../../types/curveEditor';
import { generateCurveValues, syncCurveModes, bezierToKeyPoints } from '../../utils/curveUtils';
import './CurveEditor.css';

export function CurveEditor({ settings, onSettingsChange, type }: CurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState(settings);

  // Синхронизация при изменении режима
  useEffect(() => {
    if (localSettings.mode !== settings.mode) {
      const syncedSettings = syncCurveModes(localSettings);
      setLocalSettings(syncedSettings);
      onSettingsChange(syncedSettings);
    }
  }, [localSettings.mode, settings.mode, onSettingsChange]);

  // Инициализация ключевых точек при первом рендере
  useEffect(() => {
    if (settings.keyPoints.length === 0 && settings.mode === 'keypoints') {
      const keyPoints = bezierToKeyPoints(settings.bezierCurve, settings.steps);
      const newSettings = { ...settings, keyPoints };
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);
    }
  }, [settings, onSettingsChange]);

  // Отрисовка кривой
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Очистка канваса
    ctx.clearRect(0, 0, width, height);

    // Убираем сетку - больше не рисуем её

    // Отрисовка кривой
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    const values = generateCurveValues(localSettings);
    for (let i = 0; i < values.length; i++) {
      const x = (i / (values.length - 1)) * width;
      const y = (1 - values[i]) * height; // Инвертируем Y для канваса
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Отрисовка точек
    if (localSettings.mode === 'keypoints') {
      localSettings.keyPoints.forEach((point, index) => {
        const x = (index / (localSettings.keyPoints.length - 1)) * width;
        const y = (1 - point.y) * height;
        
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    } else {
      // Отрисовка контрольных точек Безье
      const { bezierCurve } = localSettings;
      const points = [
        bezierCurve.startPoint,
        bezierCurve.controlPoint1,
        bezierCurve.controlPoint2,
        bezierCurve.endPoint
      ];

      points.forEach((point, index) => {
        const x = point.x * width;
        const y = (1 - point.y) * height;
        
        ctx.fillStyle = index === 0 || index === 3 ? '#10b981' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Линии к контрольным точкам
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(bezierCurve.startPoint.x * width, (1 - bezierCurve.startPoint.y) * height);
      ctx.lineTo(bezierCurve.controlPoint1.x * width, (1 - bezierCurve.controlPoint1.y) * height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(bezierCurve.controlPoint2.x * width, (1 - bezierCurve.controlPoint2.y) * height);
      ctx.lineTo(bezierCurve.endPoint.x * width, (1 - bezierCurve.endPoint.y) * height);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }
  }, [localSettings, type]);

  // Дефолтные настройки кривых
  const getDefaultCurve = (type: 'lightness' | 'chroma'): BezierCurve => {
    if (type === 'lightness') {
      return {
        startPoint: { x: 0, y: 0.98 },
        endPoint: { x: 1, y: 0.08 },
        controlPoint1: { x: 0.33, y: 0.8 },
        controlPoint2: { x: 0.66, y: 0.3 }
      };
    } else {
      return {
        startPoint: { x: 0, y: 0.1 },
        endPoint: { x: 1, y: 0.1 },
        controlPoint1: { x: 0.5, y: 1.0 },
        controlPoint2: { x: 0.5, y: 1.0 }
      };
    }
  };

  // Сброс кривой на дефолт
  const handleResetCurve = () => {
    const defaultCurve = getDefaultCurve(type);
    const newSettings = { 
      ...localSettings, 
      bezierCurve: defaultCurve,
      keyPoints: bezierToKeyPoints(defaultCurve, localSettings.steps)
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  // Обработка кликов и перетаскивания с увеличенной областью клика
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;

    if (localSettings.mode === 'keypoints') {
      // Поиск ближайшей точки с увеличенной областью клика
      const threshold = 0.08; // Увеличиваем область клика
      const clickedPoint = localSettings.keyPoints.find((point, index) => {
        const pointX = index / (localSettings.keyPoints.length - 1);
        return Math.abs(pointX - x) < threshold && Math.abs(point.y - y) < threshold;
      });

      if (clickedPoint) {
        setIsDragging(true);
        setDraggedPoint(clickedPoint.id);
      }
      // Убираем возможность добавления новых точек - их количество фиксировано
    } else {
      // Режим Безье - поиск ближайшей контрольной точки с увеличенной областью
      const threshold = 0.08; // Увеличиваем область клика
      const points = [
        { point: localSettings.bezierCurve.startPoint, index: 0 },
        { point: localSettings.bezierCurve.controlPoint1, index: 1 },
        { point: localSettings.bezierCurve.controlPoint2, index: 2 },
        { point: localSettings.bezierCurve.endPoint, index: 3 }
      ];

      const clickedPoint = points.find(({ point }) => 
        Math.abs(point.x - x) < threshold && Math.abs(point.y - y) < threshold
      );

      if (clickedPoint) {
        setIsDragging(true);
        setDraggedPoint(`bezier-${clickedPoint.index}`);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));

    if (localSettings.mode === 'keypoints') {
      const newKeyPoints = localSettings.keyPoints.map(point =>
        point.id === draggedPoint ? { ...point, y } : point
      );
      const newSettings = { ...localSettings, keyPoints: newKeyPoints };
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);
    } else {
      const bezierIndex = parseInt(draggedPoint.split('-')[1]);
      const newBezierCurve = { ...localSettings.bezierCurve };
      
      switch (bezierIndex) {
        case 0:
          newBezierCurve.startPoint = { x, y };
          break;
        case 1:
          newBezierCurve.controlPoint1 = { x, y };
          break;
        case 2:
          newBezierCurve.controlPoint2 = { x, y };
          break;
        case 3:
          newBezierCurve.endPoint = { x, y };
          break;
      }

      const newSettings = { ...localSettings, bezierCurve: newBezierCurve };
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedPoint(null);
  };

  const handleModeChange = (mode: CurveMode) => {
    if (mode === 'keypoints' && localSettings.keyPoints.length === 0) {
      // При переключении на ключевые точки генерируем их из кривой Безье
      const keyPoints = bezierToKeyPoints(localSettings.bezierCurve, localSettings.steps);
      const newSettings = { ...localSettings, mode, keyPoints };
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);
    } else {
      const newSettings = { ...localSettings, mode };
      setLocalSettings(newSettings);
    }
  };

  // Обработчик изменения значения ключевой точки через инпут
  const handleKeyPointChange = (pointId: string, newValue: string) => {
    const value = parseFloat(newValue);
    if (isNaN(value) || value < 0 || value > 1) return;
    
    const newKeyPoints = localSettings.keyPoints.map(point =>
      point.id === pointId ? { ...point, y: value } : point
    );
    const newSettings = { ...localSettings, keyPoints: newKeyPoints };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="curve-editor">
      <div className="curve-controls">
        <div className="curve-mode-toggle">
          <button
            className={localSettings.mode === 'bezier' ? 'active' : ''}
            onClick={() => handleModeChange('bezier')}
          >
            Кривая Безье
          </button>
          <button
            className={localSettings.mode === 'keypoints' ? 'active' : ''}
            onClick={() => handleModeChange('keypoints')}
          >
            Ключевые точки
          </button>
        </div>
        <button
          className="reset-curve-button"
          onClick={handleResetCurve}
          title="Сбросить кривую на дефолт"
        >
          Сброс
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={88}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="curve-canvas"
      />

      {localSettings.mode === 'keypoints' && (
        <div className="keypoints-list">
          <h4>Ключевые точки ({localSettings.keyPoints.length}):</h4>
          <div className="keypoints-inputs">
            {localSettings.keyPoints.map((point) => (
              <input
                key={point.id}
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={point.y.toFixed(2)}
                onChange={(e) => handleKeyPointChange(point.id, e.target.value)}
                className="keypoint-input"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
