import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">GC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">GreenCell EV Pvt Ltd</h1>
              <h2 className="text-sm text-gray-600">Contract Manufacture Department</h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.username}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium capitalize">
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};