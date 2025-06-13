import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Gauge, AlertCircle, Calendar, Loader } from 'lucide-react';
import { Vehicle, Complaint, OdometerReading } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface VehicleDetailsPageProps {
  vehicle: Vehicle;
  onBack: () => void;
}

export const VehicleDetailsPage: React.FC<VehicleDetailsPageProps> = ({ vehicle, onBack }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [odometers, setOdometers] = useState<OdometerReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComplaint, setNewComplaint] = useState('');
  const [complaintStatus, setComplaintStatus] = useState<'open' | 'cleared'>('open');
  const [newOdometer, setNewOdometer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadVehicleData();
  }, [vehicle.chassis]);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      const [complaintsData, odometersData] = await Promise.all([
        apiService.getComplaintsByVehicle(vehicle.chassis),
        apiService.getOdometersByVehicle(vehicle.chassis)
      ]);
      setComplaints(complaintsData);
      setOdometers(odometersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading vehicle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComplaint = async () => {
    if (user?.role !== 'admin') {
      alert('Only admins can add complaints.');
      return;
    }

    if (!newComplaint.trim()) {
      alert('Please enter a complaint description.');
      return;
    }

    try {
      setSubmitting(true);
      await apiService.addComplaint({
        chassis: vehicle.chassis,
        text: newComplaint.trim(),
        status: complaintStatus,
        date: new Date().toISOString()
      });
      setNewComplaint('');
      await loadVehicleData();
    } catch (error) {
      console.error('Error adding complaint:', error);
      alert('Failed to add complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddOdometer = async () => {
    if (user?.role !== 'admin') {
      alert('Only admins can add odometer readings.');
      return;
    }

    const reading = parseFloat(newOdometer);
    if (!newOdometer.trim() || isNaN(reading) || reading < 0) {
      alert('Please enter a valid odometer reading.');
      return;
    }

    try {
      setSubmitting(true);
      await apiService.addOdometer({
        chassis: vehicle.chassis,
        value: reading,
        date: new Date().toISOString()
      });
      setNewOdometer('');
      await loadVehicleData();
    } catch (error) {
      console.error('Error adding odometer:', error);
      alert('Failed to add odometer reading. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canAddData = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Vehicle Details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Chassis Number:</span>
              <span className="font-medium font-mono text-sm">{vehicle.chassis}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Registration Number:</span>
              <span className="font-medium">{vehicle.reg || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Motor Number:</span>
              <span className="font-medium">{vehicle.motor || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dispatch Date:</span>
              <span className="font-medium">{vehicle.dispatch || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Registration Date:</span>
              <span className="font-medium">{vehicle.regDate || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Allocated Depot:</span>
              <span className="font-medium">{vehicle.depot || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Manufacturing Date:</span>
              <span className="font-medium">{vehicle.mfgDate || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="font-medium">{vehicle.model || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Colour:</span>
              <span className="font-medium">{vehicle.colour || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seating Capacity:</span>
              <span className="font-medium">{vehicle.seating || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Motor Power (kW):</span>
              <span className="font-medium">{vehicle.motorKw || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Warranty Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Warranty Details</h4>
              <p className="text-gray-600">2 years standard warranty from manufacturing date</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Last Maintenance</h4>
              <p className="text-gray-600">Service data not available</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Wheel Alignment</h4>
              <p className="text-gray-600">Last alignment data not available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaint History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Complaint History</span>
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader className="h-5 w-5 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {complaints.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No complaints recorded</p>
                ) : (
                  complaints.map((complaint) => (
                    <div key={complaint.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 font-medium">{complaint.text}</p>
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <span className="text-gray-500">
                          {new Date(complaint.date).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            complaint.status === 'open'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {canAddData && (
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newComplaint}
                      onChange={(e) => setNewComplaint(e.target.value)}
                      placeholder="Enter new complaint"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="flex items-center space-x-3">
                      <select
                        value={complaintStatus}
                        onChange={(e) => setComplaintStatus(e.target.value as 'open' | 'cleared')}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="open">Open</option>
                        <option value="cleared">Cleared</option>
                      </select>
                      <button
                        onClick={handleAddComplaint}
                        disabled={submitting}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                        <span>{submitting ? 'Adding...' : 'Submit'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Odometer History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Gauge className="h-5 w-5" />
              <span>Odometer Readings</span>
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader className="h-5 w-5 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {odometers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No odometer readings recorded</p>
                ) : (
                  odometers.map((reading) => (
                    <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Gauge className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-gray-900">
                          {reading.value.toLocaleString()} km
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(reading.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {canAddData && (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={newOdometer}
                      onChange={(e) => setNewOdometer(e.target.value)}
                      placeholder="Enter odometer reading"
                      min="0"
                      step="0.1"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddOdometer}
                      disabled={submitting}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{submitting ? 'Adding...' : 'Update'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};