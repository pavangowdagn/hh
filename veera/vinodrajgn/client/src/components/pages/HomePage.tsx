import React, { useState, useEffect } from 'react';
import { Car, MapPin, Eye, Loader } from 'lucide-react';
import { Vehicle } from '../../types';
import { apiService } from '../../services/api';

interface HomePageProps {
  onViewDetails: (vehicle: Vehicle) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onViewDetails }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await apiService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRegistrationState = (regNumber: string): string => {
    if (!regNumber) return 'Unknown';
    
    // Extract state code from registration number (first 2 characters)
    const stateCode = regNumber.substring(0, 2).toUpperCase();
    
    const stateCodes: { [key: string]: string } = {
      'KA': 'Karnataka',
      'TN': 'Tamil Nadu',
      'AP': 'Andhra Pradesh',
      'TS': 'Telangana',
      'MH': 'Maharashtra',
      'DL': 'Delhi',
      'UP': 'Uttar Pradesh',
      'GJ': 'Gujarat',
      'RJ': 'Rajasthan',
      'MP': 'Madhya Pradesh',
      'HR': 'Haryana',
      'PB': 'Punjab',
      'WB': 'West Bengal',
      'OR': 'Odisha',
      'JH': 'Jharkhand',
      'BR': 'Bihar',
      'AS': 'Assam',
      'KL': 'Kerala'
    };
    
    return stateCodes[stateCode] || 'Unknown State';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading vehicles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Fleet Management</h2>
        <p className="text-gray-600">Electric vehicle fleet across Bangalore, Mysore, and Hubli depots</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center space-x-2">
            <Car className="h-6 w-6" />
            <h3 className="text-xl font-semibold">Fleet Overview</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Vehicle Number
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Registration State
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Chassis Number
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Fleet Operation Depot
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Car className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{vehicle.reg || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Registration Number</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{getRegistrationState(vehicle.reg || '')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {vehicle.chassis}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        vehicle.depot?.includes('Bangalore') ? 'bg-blue-500' :
                        vehicle.depot?.includes('Mysore') ? 'bg-green-500' :
                        vehicle.depot?.includes('Hubli') ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-gray-900">{vehicle.depot || 'Unknown Depot'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewDetails(vehicle)}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {vehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No vehicles found</p>
            <p className="text-gray-400">Vehicle data will appear here once loaded</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Vehicles</p>
              <p className="text-3xl font-bold">{vehicles.length}</p>
            </div>
            <Car className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Depots</p>
              <p className="text-3xl font-bold">
                {new Set(vehicles.map(v => v.depot).filter(Boolean)).size}
              </p>
            </div>
            <MapPin className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Registration States</p>
              <p className="text-3xl font-bold">
                {new Set(vehicles.map(v => getRegistrationState(v.reg || '')).filter(state => state !== 'Unknown State')).size}
              </p>
            </div>
            <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-lg">
              ST
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};