import React, { useState, useEffect } from 'react';
import { Gauge, RefreshCw, Loader, Calendar, Plus } from 'lucide-react';
import { OdometerSummary } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const OdometerPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState<OdometerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingReading, setAddingReading] = useState(false);
  const [newReading, setNewReading] = useState({
    chassis: '',
    value: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadSummary();
    loadVehicles();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOdometerSummary();
      setSummaryData(data);
    } catch (error) {
      console.error('Error loading odometer summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const vehicleData = await apiService.getVehicles();
      setVehicles(vehicleData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReading.chassis || !newReading.value || !newReading.date) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setAddingReading(true);
      await apiService.addOdometer({
        chassis: newReading.chassis,
        value: parseInt(newReading.value),
        date: newReading.date
      });
      
      setNewReading({ 
        chassis: '', 
        value: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      setShowAddForm(false);
      await loadSummary();
    } catch (error) {
      console.error('Error adding odometer reading:', error);
      alert('Failed to add odometer reading. Please try again.');
    } finally {
      setAddingReading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadSummary();
    } finally {
      setRefreshing(false);
    }
  };

  const filterByTimePeriod = (data: OdometerSummary[], period: string) => {
    if (period === 'all') return data;
    
    const now = new Date();
    const timeFilters = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    return data.map(depot => {
      const filteredVehicles = depot.vehicles.filter(v => {
        const readingDate = new Date(v.date);
        return (now.getTime() - readingDate.getTime()) <= timeFilters[period as keyof typeof timeFilters];
      });

      return {
        ...depot,
        vehicles: filteredVehicles,
        totalOdometer: filteredVehicles.reduce((sum, v) => sum + v.lastReading, 0),
        vehicleCount: filteredVehicles.length
      };
    }).filter(depot => depot.vehicleCount > 0);
  };

  const filteredData = filterByTimePeriod(summaryData, timeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading odometer summary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Odometer Summary</h2>
        <p className="text-gray-600">Vehicle mileage tracking and analytics</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <label htmlFor="time-filter" className="font-medium text-gray-700">
              Filter by Time Period:
            </label>
            <select
              id="time-filter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            {(user?.role === 'admin' || user?.role === 'upload') && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reading
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {showAddForm && (user?.role === 'admin' || user?.role === 'upload') && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Odometer Reading</h3>
            <form onSubmit={handleAddReading} className="space-y-4">
              <div>
                <label htmlFor="vehicle-select-odometer" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle *
                </label>
                <select
                  id="vehicle-select-odometer"
                  value={newReading.chassis}
                  onChange={(e) => setNewReading({ ...newReading, chassis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.chassis}>
                      {vehicle.reg} - {vehicle.chassis} ({vehicle.depot})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="odometer-value" className="block text-sm font-medium text-gray-700 mb-2">
                  Odometer Reading (km) *
                </label>
                <input
                  type="number"
                  id="odometer-value"
                  value={newReading.value}
                  onChange={(e) => setNewReading({ ...newReading, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter odometer reading..."
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="reading-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Reading Date *
                </label>
                <input
                  type="date"
                  id="reading-date"
                  value={newReading.date}
                  onChange={(e) => setNewReading({ ...newReading, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingReading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {addingReading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Reading'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <Gauge className="h-8 w-8" />
              <div>
                <p className="text-blue-100">Total Distance</p>
                <p className="text-2xl font-bold">
                  {filteredData.reduce((sum, depot) => sum + depot.totalOdometer, 0).toLocaleString()} km
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                D
              </div>
              <div>
                <p className="text-green-100">Active Depots</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                V
              </div>
              <div>
                <p className="text-purple-100">Total Vehicles</p>
                <p className="text-2xl font-bold">
                  {filteredData.reduce((sum, depot) => sum + depot.vehicleCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-6 py-4 text-left font-semibold">Depot</th>
                <th className="px-6 py-4 text-right font-semibold">Total Odometer (km)</th>
                <th className="px-6 py-4 text-center font-semibold">Vehicle Count</th>
                <th className="px-6 py-4 text-left font-semibold">Vehicle Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No odometer data available for the selected time period
                  </td>
                </tr>
              ) : (
                filteredData.map((depot, index) => (
                  <tr
                    key={depot.depot}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {depot.depot}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-blue-600">
                      {depot.totalOdometer.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {depot.vehicleCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {depot.vehicles
                          .sort((a, b) => a.reg.localeCompare(b.reg))
                          .map((vehicle, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-gray-900">{vehicle.reg}</span>
                              <span className="text-gray-500 ml-2">
                                ({vehicle.lastReading.toLocaleString()} km)
                              </span>
                            </div>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};