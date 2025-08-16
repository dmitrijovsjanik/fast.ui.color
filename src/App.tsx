import { ThemeProvider } from './themes/themeProvider';
import { FastUIDesign } from './components/FastUIDesign';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <FastUIDesign />
    </ThemeProvider>
  );
}

export default App;
