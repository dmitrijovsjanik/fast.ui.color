import { useState, useEffect, useRef } from 'react';
import { KeyPoint } from '../../types/curveEditor';
import { ChromaCurveType } from '../../utils/apcaSystem';

interface ChromaInputsProps {
  keyPoints: KeyPoint[];
  onKeyPointChange: (pointId: string, value: string) => void;
  curveType: ChromaCurveType;
  onCurveTypeChange?: (curveType: ChromaCurveType) => void;
}

export function ChromaInputs({ 
  keyPoints, 
  onKeyPointChange, 
  curveType,
  onCurveTypeChange 
}: ChromaInputsProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newValues: Record<string, string> = {};
    keyPoints.forEach(point => {
      newValues[point.id] = Math.round(point.y * 100).toString(); // Convert to integer percentage
    });
    setInputValues(newValues);
  }, [keyPoints]);

  // Обработчик клика вне дропдауна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleInputChange = (pointId: string, value: string) => {
    console.log('ChromaInputs handleInputChange:', pointId, value);
    setInputValues(prev => ({ ...prev, [pointId]: value }));
    
    if (value === '' || value === '-') {
      return;
    }
    
    const percentValue = parseInt(value);
    if (!isNaN(percentValue) && percentValue >= 0 && percentValue <= 25) {
      const chromaValue = percentValue / 100;
      console.log('Вызываем onKeyPointChange для chroma:', pointId, chromaValue);
      onKeyPointChange(pointId, chromaValue.toString());
    } else {
      console.log('Недопустимое значение процента:', percentValue);
    }
  };

  const handleInputBlur = (pointId: string, value: string) => {
    const percentValue = parseInt(value);
    if (isNaN(percentValue) || percentValue < 0 || percentValue > 25) {
      // Восстанавливаем исходное значение
      const originalValue = keyPoints.find(p => p.id === pointId)?.y || 0;
      setInputValues(prev => ({ ...prev, [pointId]: Math.round(originalValue * 100).toString() }));
    }
  };

  const handleKeyDown = (pointId: string, currentValue: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      const percentValue = parseInt(currentValue);
      if (!isNaN(percentValue) && percentValue >= 0 && percentValue <= 25) {
        const chromaValue = percentValue / 100;
        onKeyPointChange(pointId, chromaValue.toString());
      } else {
        // Восстанавливаем исходное значение
        const originalValue = keyPoints.find(p => p.id === pointId)?.y || 0;
        setInputValues(prev => ({ ...prev, [pointId]: Math.round(originalValue * 100).toString() }));
      }
    }
  };

  const handleCurveTypeChange = (newCurveType: ChromaCurveType) => {
    if (onCurveTypeChange) {
      onCurveTypeChange(newCurveType);
    }
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="keypoints-inputs-row">
      <div className="curve-selector">
        <button 
          className="curve-selector-button"
          onClick={toggleDropdown}
          title={`Chroma curve: ${curveType}`}
        >
          <svg className="curve-selector-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M3 12h6l3-9 6 18 3-9h3" />
          </svg>
        </button>
        {isDropdownOpen && (
          <div className="curve-selector-dropdown" ref={dropdownRef}>
            <div 
              className={`curve-selector-option ${curveType === 'parabolic' ? 'active' : ''}`} 
              onClick={() => handleCurveTypeChange('parabolic')}
            >
              <div className="curve-selector-option-icon parabolic-icon"></div>
              Parabolic
            </div>
            <div 
              className={`curve-selector-option ${curveType === 'linear' ? 'active' : ''}`} 
              onClick={() => handleCurveTypeChange('linear')}
            >
              <div className="curve-selector-option-icon linear-icon"></div>
              Linear
            </div>
            <div 
              className={`curve-selector-option ${curveType === 'custom' ? 'active' : ''}`} 
              onClick={() => handleCurveTypeChange('custom')}
            >
              <div className="curve-selector-option-icon custom-icon"></div>
              Custom
            </div>
          </div>
        )}
      </div>
      <div className="keypoints-inputs-container">
        {keyPoints.map((point, index) => {
          // Для параболической кривой блокируем все кроме 1 и 6 (индексы 0 и 5)
          // Для линейной кривой блокируем промежуточные точки
          const isDisabled = (curveType === 'parabolic' && index !== 0 && index !== 5) ||
                           (curveType === 'linear' && index > 0 && index < keyPoints.length - 1);
          return (
            <input
              key={point.id}
              type="number"
              min="0"
              max="25"
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
      </div>
    </div>
  );
}
