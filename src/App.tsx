import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useStore } from './store/useStore';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import Report from './pages/Report';
import Navigation from './components/Navigation';

const App = () => {
  const isDarkMode = useStore(state => state.isDarkMode);

  // Apply dark mode class on mount and when isDarkMode changes
  useEffect(() => {
    // Force immediate application of dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update theme color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#1a1b1e' : '#ffffff');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </main>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#1f2937',
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App; 