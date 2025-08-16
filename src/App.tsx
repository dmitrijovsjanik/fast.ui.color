import { ThemeProvider } from './themes/themeProvider';
import { FastUIDesign } from './components/FastUI/FastUIDesign';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <FastUIDesign />
    </ThemeProvider>
  );
}

export default App;
