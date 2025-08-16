import { useState, useEffect } from 'react';
import { KeyPoint } from '../../types/curveEditor';
import { ChromaCurveType } from '../../utils/apcaSystem';

interface ChromaInputsProps {
  keyPoints: KeyPoint[];
  onKeyPointChange: (pointId: string, value: string) => void;
  curveType: ChromaCurveType;
  colorType: string;
}

export function ChromaInputs({ keyPoints, onKeyPointChange, curveType, colorType }: ChromaInputsProps) {
  // Состояние для хранения значений инпутов
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Обновляем значения инпутов при изменении keyPoints
  useEffect(() => {
    const newValues: Record<string, string> = {};
    keyPoints.forEach(point => {
      // Используем хроматические значения напрямую (point.y содержит Chroma 0-0.4)
      newValues[point.id] = (point.y * 100).toFixed(1); // Конвертируем в проценты для отображения
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

    const percentValue = parseFloat(value);
    if (!isNaN(percentValue) && percentValue >= 0 && percentValue <= 40) { // 0-40% = 0-0.4
      // Добавляем небольшую задержку для более плавного ввода
      setTimeout(() => {
        // Конвертируем проценты в хроматические значения (0-0.4)
        const chromaValue = percentValue / 100;
        onKeyPointChange(pointId, chromaValue.toString());
      }, 100);
    }
  };

  const handleInputBlur = (pointId: string, value: string) => {
    // При потере фокуса, если значение пустое или недопустимое, восстанавливаем исходное
    if (value === '' || value === '-' || isNaN(parseFloat(value))) {
      const point = keyPoints.find(p => p.id === pointId);
      const originalValue = ((point?.y || 0) * 100).toFixed(1);
      setInputValues(prev => ({ ...prev, [pointId]: originalValue }));
    }
  };

  const handleKeyDown = (pointId: string, value: string, e: React.KeyboardEvent) => {
    // При нажатии Enter применяем значение
    if (e.key === 'Enter') {
      const percentValue = parseFloat(value);
      if (!isNaN(percentValue) && percentValue >= 0 && percentValue <= 40) {
        // Конвертируем проценты в хроматические значения
        const chromaValue = percentValue / 100;
        onKeyPointChange(pointId, chromaValue.toString());
      } else {
        // Если значение недопустимое, восстанавливаем исходное
        const point = keyPoints.find(p => p.id === pointId);
        const originalValue = ((point?.y || 0) * 100).toFixed(1);
        setInputValues(prev => ({ ...prev, [pointId]: originalValue }));
      }
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="chroma-inputs-container">
      <div className="chroma-header">
        <span className="chroma-label">Chroma ({colorType})</span>
        <span className="chroma-curve-type">{curveType}</span>
      </div>
      <div className="chroma-inputs">
        {keyPoints.map((point, index) => {
          // Определяем, должен ли инпут быть заблокирован
          // Блокируем инпуты 2-10 (индексы 1-9) для параболической и линейной кривых
          const isDisabled = (curveType === 'parabolic' || curveType === 'linear') && 
                           index > 0 && index < keyPoints.length - 1;
          
          return (
            <input
              key={point.id}
              type="number"
              min="0"
              max="40"
              step="0.1"
              inputMode="decimal"
              value={inputValues[point.id] || '0.0'}
              onChange={(e) => handleInputChange(point.id, e.target.value)}
              onBlur={(e) => handleInputBlur(point.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(point.id, inputValues[point.id] || '', e)}
              className={`chroma-input ${isDisabled ? 'disabled' : ''}`}
              placeholder="%"
              disabled={isDisabled}
            />
          );
        })}
      </div>
    </div>
  );
}
