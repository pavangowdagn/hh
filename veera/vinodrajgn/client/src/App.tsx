import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/pages/HomePage';
import { SOPPage } from './components/pages/SOPPage';
import { RetroPage } from './components/pages/RetroPage';
import { ComplaintsPage } from './components/pages/ComplaintsPage';
import { OdometerPage } from './components/pages/OdometerPage';
import { VehicleDetailsPage } from './components/pages/VehicleDetailsPage';

import { Vehicle } from './types';
import { apiService } from './services/api';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  const loadVehicles = async () => {
    try {
      const data = await apiService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentPage('vehicle-details');
  };

  const handleBackToHome = () => {
    setSelectedVehicle(null);
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onViewDetails={handleViewDetails} />;
      case 'sop':
        return <SOPPage vehicles={vehicles} />;
      case 'retro':
        return <RetroPage vehicles={vehicles} />;
      case 'complaints':
        return <ComplaintsPage vehicles={vehicles} />;
      case 'odometer':
        return <OdometerPage />;

      case 'vehicle-details':
        return selectedVehicle ? (
          <VehicleDetailsPage vehicle={selectedVehicle} onBack={handleBackToHome} />
        ) : (
          <HomePage onViewDetails={handleViewDetails} />
        );
      default:
        return <HomePage onViewDetails={handleViewDetails} />;
    }
  };

  return (
    <Layout>
      {currentPage !== 'vehicle-details' && (
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      )}
      {renderCurrentPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;