import React, { useState, useEffect } from 'react';
import { useThemeService, useColorPalettes, useThemeExport } from '../../themes/useThemeService';
import { generateAllPalettes, validatePalettes, checkColorCompatibility } from '../../utils/paletteGenerator';
import { ColorType } from '../../utils/colorGenerator';
import './ThemeManager.css';

// =======================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =======================

interface ThemeManagerProps {
  onThemeChange?: (themeName: string) => void;
  onPaletteUpdate?: (palettes: any) => void;
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
  disabled?: boolean;
}

// =======================
// КОМПОНЕНТЫ
// =======================

/**
 * Компонент выбора цвета
 */
const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label, disabled = false }) => {
  return (
    <div className="color-picker">
      <label className="color-picker-label">{label}</label>
      <div className="color-picker-input">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="color-input"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="color-text-input"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

/**
 * Компонент палитры цветов
 */
const ColorPaletteDisplay: React.FC<{ palette: any; type: ColorType }> = ({ palette, type }) => {
  if (!palette || !palette.steps) return null;

  return (
    <div className="color-palette-display">
      <h4 className="palette-title">{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
      <div className="palette-colors">
        {palette.steps.map((step: any, index: number) => (
          <div
            key={index}
            className="palette-color"
            style={{ backgroundColor: step.hex }}
            title={`${step.hex} - Контраст: ${step.contrast.toFixed(2)}`}
          >
            <span className="color-step">{step.step}</span>
            <span className="color-contrast">{step.contrast.toFixed(1)}</span>
          </div>
        ))}
      </div>
      <div className="palette-info">
        <span className={`accessibility-badge ${palette.accessibility.wcagAA ? 'success' : 'error'}`}>
          WCAG AA: {palette.accessibility.wcagAA ? '✓' : '✗'}
        </span>
        <span className={`accessibility-badge ${palette.accessibility.wcagAAA ? 'success' : 'error'}`}>
          WCAG AAA: {palette.accessibility.wcagAAA ? '✓' : '✗'}
        </span>
      </div>
    </div>
  );
};

/**
 * Основной компонент управления темами
 */
export const ThemeManager: React.FC<ThemeManagerProps> = ({ onThemeChange, onPaletteUpdate }) => {
  // Хуки для работы с темами
  const {
    currentTheme,
    availableThemes,
    isLoading,
    switchTheme,
    getThemeConfig,
    updateColorPalette,
    cloneTheme,
    removeTheme
  } = useThemeService();

  const { palettes } = useColorPalettes(currentTheme);
  const { downloadTheme } = useThemeExport();

  // Локальное состояние
  const [brandColor, setBrandColor] = useState('#3b82f6');
  const [scale, setScale] = useState<'Linear' | 'Semantic'>('Linear');
  const [steps, setSteps] = useState(11);
  const [ensureAccessibility, setEnsureAccessibility] = useState(true);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Загружаем текущую тему при инициализации
  useEffect(() => {
    const theme = getThemeConfig(currentTheme);
    if (theme && theme.tokens.colors.brand) {
      setBrandColor(theme.tokens.colors.brand.baseColor);
    }
  }, [currentTheme, getThemeConfig]);

  // Генерируем палитры при изменении параметров
  useEffect(() => {
    if (isLoading) return;

    try {
      const config = {
        brandColor,
        scale,
        steps,
        ensureAccessibility,
        targetContrast: 4.5
      };

      const generatedPalettes = generateAllPalettes(config);
      
      // Валидируем палитры
      const validation = validatePalettes(generatedPalettes);
      setValidationResult(validation);

      // Проверяем совместимость
      const compatibility = checkColorCompatibility(generatedPalettes);
      setCompatibilityResult(compatibility);

      // Обновляем палитры в сервисе
      Object.entries(generatedPalettes).forEach(([type, palette]) => {
        updateColorPalette(currentTheme, type as ColorType, palette.baseColor);
      });

      // Уведомляем родительский компонент
      if (onPaletteUpdate) {
        onPaletteUpdate(generatedPalettes);
      }
    } catch (error) {
      console.error('Ошибка генерации палитр:', error);
    }
  }, [brandColor, scale, steps, ensureAccessibility, currentTheme, isLoading, updateColorPalette, onPaletteUpdate]);

  // Обработчики событий
  const handleThemeSwitch = (themeName: string) => {
    switchTheme(themeName);
    if (onThemeChange) {
      onThemeChange(themeName);
    }
  };

  const handleBrandColorChange = (color: string) => {
    setBrandColor(color);
  };

  const handleExportTheme = (format: 'css' | 'json') => {
    downloadTheme(currentTheme, format);
  };

  const handleCreateTheme = () => {
    const themeName = prompt('Введите название новой темы:');
    if (themeName) {
      const success = cloneTheme(currentTheme, themeName);
      if (success) {
        alert(`Тема "${themeName}" создана успешно!`);
      } else {
        alert('Ошибка создания темы');
      }
    }
  };

  const handleRemoveTheme = (themeName: string) => {
    if (confirm(`Удалить тему "${themeName}"?`)) {
      const success = removeTheme(themeName);
      if (success) {
        alert(`Тема "${themeName}" удалена`);
      } else {
        alert('Ошибка удаления темы');
      }
    }
  };

  return (
    <div className="theme-manager">
      {/* Заголовок */}
      <div className="theme-manager-header">
        <h2>Управление темами</h2>
        <div className="theme-controls">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-secondary"
          >
            {showAdvanced ? 'Скрыть' : 'Показать'} расширенные настройки
          </button>
        </div>
      </div>

      {/* Выбор темы */}
      <div className="theme-selector">
        <label className="theme-selector-label">Текущая тема:</label>
        <select
          value={currentTheme}
          onChange={(e) => handleThemeSwitch(e.target.value)}
          disabled={isLoading}
          className="theme-select"
        >
          {availableThemes.map(theme => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
        <button onClick={handleCreateTheme} className="btn btn-primary">
          Создать тему
        </button>
        {currentTheme !== 'light' && currentTheme !== 'dark' && (
          <button
            onClick={() => handleRemoveTheme(currentTheme)}
            className="btn btn-danger"
          >
            Удалить
          </button>
        )}
      </div>

      {/* Основные настройки */}
      <div className="theme-settings">
        <div className="settings-section">
          <h3>Основные настройки</h3>
          
          <ColorPicker
            color={brandColor}
            onChange={handleBrandColorChange}
            label="Бренд-цвет"
          />

          <div className="setting-group">
            <label className="setting-label">Тип шкалы:</label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value as 'Linear' | 'Semantic')}
              className="setting-select"
            >
              <option value="Linear">Линейная</option>
              <option value="Semantic">Семантическая</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-label">Количество шагов:</label>
            <input
              type="number"
              min="5"
              max="20"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-group">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={ensureAccessibility}
                onChange={(e) => setEnsureAccessibility(e.target.checked)}
                className="setting-checkbox"
              />
              Обеспечить доступность (WCAG)
            </label>
          </div>
        </div>

        {/* Расширенные настройки */}
        {showAdvanced && (
          <div className="settings-section">
            <h3>Расширенные настройки</h3>
            <div className="advanced-settings">
              <p>Здесь можно добавить дополнительные настройки для токенов дизайна</p>
            </div>
          </div>
        )}
      </div>

      {/* Валидация и совместимость */}
      {(validationResult || compatibilityResult) && (
        <div className="validation-section">
          <h3>Проверка качества</h3>
          
          {validationResult && (
            <div className={`validation-result ${validationResult.isValid ? 'success' : 'error'}`}>
              <h4>Валидация палитр</h4>
              <div className="validation-info">
                <span className={`badge ${validationResult.accessibility.wcagAA ? 'success' : 'error'}`}>
                  WCAG AA: {validationResult.accessibility.wcagAA ? '✓' : '✗'}
                </span>
                <span className={`badge ${validationResult.accessibility.wcagAAA ? 'success' : 'error'}`}>
                  WCAG AAA: {validationResult.accessibility.wcagAAA ? '✓' : '✗'}
                </span>
                <span className="badge info">
                  Контраст: {validationResult.accessibility.minContrast.toFixed(1)} - {validationResult.accessibility.maxContrast.toFixed(1)}
                </span>
              </div>
              {validationResult.issues.length > 0 && (
                <ul className="validation-issues">
                  {validationResult.issues.map((issue: string, index: number) => (
                    <li key={index} className="validation-issue">{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {compatibilityResult && (
            <div className={`compatibility-result ${compatibilityResult.isCompatible ? 'success' : 'error'}`}>
              <h4>Совместимость цветов</h4>
              {compatibilityResult.issues.length > 0 && (
                <ul className="compatibility-issues">
                  {compatibilityResult.issues.map((issue: string, index: number) => (
                    <li key={index} className="compatibility-issue">{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Палитры цветов */}
      <div className="palettes-section">
        <h3>Цветовые палитры</h3>
        <div className="palettes-grid">
          {Object.entries(palettes).map(([type, palette]) => (
            <ColorPaletteDisplay
              key={type}
              palette={palette}
              type={type as ColorType}
            />
          ))}
        </div>
      </div>

      {/* Экспорт */}
      <div className="export-section">
        <h3>Экспорт</h3>
        <div className="export-controls">
          <button
            onClick={() => handleExportTheme('css')}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Экспорт CSS
          </button>
          <button
            onClick={() => handleExportTheme('json')}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Экспорт JSON
          </button>
        </div>
      </div>

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span>Обновление палитр...</span>
        </div>
      )}
    </div>
  );
};
