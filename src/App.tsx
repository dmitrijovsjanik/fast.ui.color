import React from 'react';
import { ThemeProvider } from './themes/themeProvider';
import { ColorPalette } from './components/ColorPalette';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <ColorPalette />
    </ThemeProvider>
  );
}

export default App;
