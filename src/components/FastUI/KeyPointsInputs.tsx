import { useState, useEffect } from 'react';
import { KeyPoint } from '../../types/curveEditor';
import { CurveType } from './CurveSelector';

interface KeyPointsInputsProps {
  keyPoints: KeyPoint[];
  onKeyPointChange: (pointId: string, value: string) => void;
  curveType: CurveType;
}

export function KeyPointsInputs({ keyPoints, onKeyPointChange, curveType }: KeyPointsInputsProps) {
  // Состояние для хранения значений инпутов
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Обновляем значения инпутов при изменении keyPoints
  useEffect(() => {
    const newValues: Record<string, string> = {};
    keyPoints.forEach(point => {
      newValues[point.id] = Math.round(point.y * 100).toString();
    });
    setInputValues(newValues);
  }, [keyPoints]);

  const handleInputChange = (pointId: string, value: string) => {
    // Обновляем локальное состояние
    setInputValues(prev => ({ ...prev, [pointId]: value }));

    // Если значение пустое или не число, не обновляем кривую
    if (value === '' || value === '-') {
      return;
    }

    const percentValue = parseInt(value);
    if (!isNaN(percentValue) && percentValue >= 0 && percentValue <= 100) {
      // Добавляем небольшую задержку для более плавного ввода
      setTimeout(() => {
        onKeyPointChange(pointId, (percentValue / 100).toString());
      }, 100);
    }
  };

  const handleInputBlur = (pointId: string, value: string) => {
    // При потере фокуса, если значение пустое или недопустимое, восстанавливаем исходное
    if (value === '' || value === '-' || isNaN(parseInt(value))) {
      const originalValue = Math.round((keyPoints.find(p => p.id === pointId)?.y || 0) * 100);
      setInputValues(prev => ({ ...prev, [pointId]: originalValue.toString() }));
    }
  };

  const handleKeyDown = (pointId: string, value: string, e: React.KeyboardEvent) => {
    // При нажатии Enter применяем значение
    if (e.key === 'Enter') {
      const percentValue = parseInt(value);
      if (!isNaN(percentValue) && percentValue >= 0 && percentValue <= 100) {
        onKeyPointChange(pointId, (percentValue / 100).toString());
      } else {
        // Если значение недопустимое, восстанавливаем исходное
        const originalValue = Math.round((keyPoints.find(p => p.id === pointId)?.y || 0) * 100);
        setInputValues(prev => ({ ...prev, [pointId]: originalValue.toString() }));
      }
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <>
      {keyPoints.map((point, index) => {
        // Определяем, должен ли инпут быть заблокирован
        // Блокируем инпуты 2-10 (индексы 1-9) для линейной и S-образной кривых
        const isDisabled = (curveType === 'linear' || curveType === 's-curve') && 
                         index > 0 && index < keyPoints.length - 1;
        
        return (
          <input
            key={point.id}
            type="number"
            min="0"
            max="100"
            step="1"
            inputMode="numeric"
            value={inputValues[point.id] || '0'}
            onChange={(e) => handleInputChange(point.id, e.target.value)}
            onBlur={(e) => handleInputBlur(point.id, e.target.value)}
            onKeyDown={(e) => handleKeyDown(point.id, inputValues[point.id] || '', e)}
            className={`keypoint-input ${isDisabled ? 'disabled' : ''}`}
            placeholder="%"
            disabled={isDisabled}
          />
        );
      })}
    </>
  );
}
