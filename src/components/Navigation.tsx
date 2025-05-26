import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BanknotesIcon, 
  Cog6ToothIcon,
  Bars3Icon,
  DocumentChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Dashboard' },
    { path: '/expenses', icon: BanknotesIcon, label: 'Expenses' },
    { path: '/report', icon: DocumentChartBarIcon, label: 'Report' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
  ];

  // Handle scroll events
  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > 20) { // Hide after scrolling 20px
        setIsVisible(false);
      } else { // Show only at the top
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, []);

  return (
    <>
      {/* Hamburger Menu Button and App Name - Only visible at top */}
      <div 
        className={`fixed top-3 left-4 z-50 flex items-center gap-3 transition-transform duration-300
          ${isVisible ? 'translate-y-0' : '-translate-y-20'}`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary/90 backdrop-blur-sm text-white rounded-lg p-1.5 shadow-lg hover:bg-primary/80 transition-all duration-300"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <Link 
          to="/" 
          className="text-foreground font-bold text-lg hover:text-primary transition-colors duration-300"
        >
          Fornance
        </Link>
      </div>

      {/* Navigation Panel - Shows when menu is open */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 z-40
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <nav 
        className={`fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-xl transition-all duration-300 z-50
          border-r border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-bold text-xl shadow-lg">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">Fornance</span>
              <span className="text-xs text-muted-foreground">Financial Manager</span>
            </div>
          </div>

          <div className="flex-1 px-3 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-300
                    ${isActive 
                      ? 'bg-primary/20 text-primary font-medium' 
                      : 'text-foreground/70 hover:bg-white/10 hover:text-foreground'
                    }
                    hover:pl-4`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto border-t border-white/10">
            <div className="p-3 text-xs text-foreground/70 text-center">
              <p className="font-medium">Fornance v1.0</p>
              <p className="text-foreground/50">Track your expenses with ease</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation; 