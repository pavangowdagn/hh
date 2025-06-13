import React from 'react';
import { Home, FileText, Wrench, AlertCircle, Gauge, Settings } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },

    { id: 'sop', label: 'SOP for Maintenance', icon: FileText },
    { id: 'retro', label: 'Retro Summary', icon: Wrench },
    { id: 'complaints', label: 'Complaints Summary', icon: AlertCircle },
    { id: 'odometer', label: 'Odometer Summary', icon: Gauge }
  ];

  return (
    <nav className="bg-green-600 shadow-lg mb-6">
      <div className="px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onPageChange(id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-all whitespace-nowrap ${
                currentPage === id
                  ? 'bg-white text-green-600 shadow-lg'
                  : 'text-white hover:bg-green-500'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};