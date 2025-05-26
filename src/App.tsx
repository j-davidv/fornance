import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="fixed top-0 left-0 right-0 h-12 bg-card/50 backdrop-blur-sm z-40 flex items-center">
          <Link to="/" className="pl-14 font-bold text-lg tracking-wide leading-none pt-1 text-foreground/90 drop-shadow-sm hover:text-foreground/100 transition-colors">
            Fornance
          </Link>
        </div>
        <main className="min-h-screen p-4 pt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/report" element={<Report />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
};

export default App; 