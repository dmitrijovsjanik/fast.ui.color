import { useState } from 'react';
import { Header, Navigation, Settings, ColorPalette, AddColorRow, Footer } from './index';
import '../styles/FastUI.css';

export function FastUIDesign() {
  const [selectedScale, setSelectedScale] = useState('Semantic');
  const [selectedNaming, setSelectedNaming] = useState('1,2,3...');

  const handleColorClick = (type: string, index: number) => {
    console.log(`Clicked ${type} color ${index + 1}`);
  };

  const handleAddColor = () => {
    console.log('Add new color palette');
  };

  const handleCopySVG = () => {
    console.log('Copy SVG');
  };

  const handleCreate = () => {
    console.log('Create');
  };

  const colorPalettes = [
    { type: 'brand' as const, locked: false },
    { type: 'accent' as const, locked: true },
    { type: 'positive' as const, locked: true },
    { type: 'warning' as const, locked: true },
    { type: 'negative' as const, locked: true },
    { type: 'neutral' as const, locked: true },
  ];

  return (
    <div className="fast-ui-design">
      <div className="main-container">
        <Header />
        
        <div className="body">
          <Navigation />
          
          <div className="body-content">
            <Settings 
              selectedScale={selectedScale}
              selectedNaming={selectedNaming}
            />
            
            <div className="color-schemes">
              {colorPalettes.map((palette, index) => (
                <ColorPalette
                  key={palette.type}
                  type={palette.type}
                  locked={palette.locked}
                  onColorClick={(colorIndex) => handleColorClick(palette.type, colorIndex)}
                />
              ))}
              
              <AddColorRow onAddClick={handleAddColor} />
            </div>
          </div>
          
          <Footer 
            onCopySVG={handleCopySVG}
            onCreate={handleCreate}
          />
        </div>
      </div>
    </div>
  );
}
