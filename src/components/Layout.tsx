import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  HomeIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isDarkMode = useStore((state) => state.isDarkMode);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Expenses', href: '/expenses', icon: CurrencyDollarIcon },
    { name: 'Report', href: '/report', icon: ChartPieIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 flex w-20 md:w-72 flex-col glass-morphism rounded-none md:rounded-r-3xl z-50">
        <div className="flex h-16 shrink-0 items-center justify-center md:justify-start md:px-6">
          <span className="hidden text-2xl font-bold md:block text-foreground">Fornance</span>
          <span className="block text-2xl font-bold md:hidden text-foreground">F</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-2 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`nav-item ${
                      isActive ? 'nav-item-active' : 'nav-item-inactive'
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="hidden md:block">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Backdrop for light mode */}
      {!isDarkMode && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
        </div>
      )}

      {/* Main content */}
      <div className="pl-20 md:pl-72 w-full">
        <main className="min-h-screen py-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout; 