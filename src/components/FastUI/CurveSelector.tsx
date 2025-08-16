import { useState, useRef, useEffect } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { CurveSettings } from '../../types/curveEditor';
import { generateLinearCurve, generateSCurve } from '../../utils/curveUtils';

export type CurveType = 'linear' | 's-curve' | 'custom';

interface CurveSelectorProps {
  currentCurve: CurveSettings;
  onCurveChange: (curve: CurveSettings) => void;
  onCurveTypeChange: (type: CurveType) => void;
  curveType: CurveType;
}

export function CurveSelector({ 
  currentCurve, 
  onCurveChange, 
  onCurveTypeChange,
  curveType 
}: CurveSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие дропдауна при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCurveTypeSelect = (type: CurveType) => {
    let newCurve: CurveSettings;
    
    // Сохраняем текущие значения крайних точек
    const currentFirstPoint = currentCurve.keyPoints[0];
    const currentLastPoint = currentCurve.keyPoints[currentCurve.keyPoints.length - 1];
    
    switch (type) {
      case 'linear':
        newCurve = generateLinearCurve();
        break;
      case 's-curve':
        newCurve = generateSCurve();
        break;
      case 'custom':
        // Для кастомной кривой сохраняем все текущие значения
        newCurve = {
          ...currentCurve,
          mode: 'keypoints',
          steps: 11
        };
        break;
      default:
        newCurve = currentCurve;
    }

    // Восстанавливаем пользовательские значения крайних точек
    if (newCurve.keyPoints.length > 0) {
      newCurve.keyPoints[0] = { ...newCurve.keyPoints[0], y: currentFirstPoint.y };
      newCurve.keyPoints[newCurve.keyPoints.length - 1] = { ...newCurve.keyPoints[newCurve.keyPoints.length - 1], y: currentLastPoint.y };
      
      // Пересчитываем промежуточные точки для линейной и S-образной кривых
      if (type === 'linear' || type === 's-curve') {
        const firstPoint = newCurve.keyPoints[0];
        const lastPoint = newCurve.keyPoints[newCurve.keyPoints.length - 1];
        
        if (type === 'linear') {
          // Линейная интерполяция между крайними точками
          for (let i = 1; i < newCurve.keyPoints.length - 1; i++) {
            const t = i / (newCurve.keyPoints.length - 1);
            newCurve.keyPoints[i] = {
              ...newCurve.keyPoints[i],
              y: firstPoint.y - (firstPoint.y - lastPoint.y) * t
            };
          }
        } else if (type === 's-curve') {
          // S-образная интерполяция
          for (let i = 1; i < newCurve.keyPoints.length - 1; i++) {
            const t = i / (newCurve.keyPoints.length - 1);
            
            // Более выраженная S-образная функция
            let sCurve;
            if (t < 0.5) {
              // Первая половина - медленное изменение
              sCurve = 2 * Math.pow(t, 3);
            } else {
              // Вторая половина - быстрое изменение
              sCurve = 1 - 2 * Math.pow(1 - t, 3);
            }
            
            newCurve.keyPoints[i] = {
              ...newCurve.keyPoints[i],
              y: firstPoint.y - (firstPoint.y - lastPoint.y) * sCurve
            };
          }
        }
      }
    }

    onCurveChange(newCurve);
    onCurveTypeChange(type);
    setIsOpen(false);
  };

  const getCurveTypeLabel = (type: CurveType) => {
    switch (type) {
      case 'linear':
        return 'Линейная';
      case 's-curve':
        return 'S-образная';
      case 'custom':
        return 'Кастомная';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="curve-selector" ref={dropdownRef}>
      <button
        className="curve-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        title={getCurveTypeLabel(curveType)}
      >
        <ChartBarIcon className="curve-selector-icon" />
      </button>
      
      {isOpen && (
        <div className="curve-selector-dropdown">
          <div 
            className={`curve-selector-option ${curveType === 'linear' ? 'active' : ''}`}
            onClick={() => handleCurveTypeSelect('linear')}
          >
            <div className="curve-selector-option-icon linear-icon"></div>
            <span>Линейная</span>
          </div>
          
          <div 
            className={`curve-selector-option ${curveType === 's-curve' ? 'active' : ''}`}
            onClick={() => handleCurveTypeSelect('s-curve')}
          >
            <div className="curve-selector-option-icon s-curve-icon"></div>
            <span>S-образная</span>
          </div>
          
          <div 
            className={`curve-selector-option ${curveType === 'custom' ? 'active' : ''}`}
            onClick={() => handleCurveTypeSelect('custom')}
          >
            <div className="curve-selector-option-icon custom-icon"></div>
            <span>Кастомная</span>
          </div>
        </div>
      )}
    </div>
  );
}
