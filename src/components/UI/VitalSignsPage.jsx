import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FaHeartbeat, 
  FaWeight, 
  FaThermometerHalf, 
  FaLungs, 
  FaPlus, 
  FaCalendarAlt, 
  FaChartLine
} from 'react-icons/fa';
import { GiDroplet } from 'react-icons/gi';
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import VitalSignsService from '../../services/VitalSignsService';
import PageHeader from '../components/common/Header';
import Modal from '../components/common/Modal';

const VitalSignsPage = () => {
  const user = useSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState('latest');
  const [selectedType, setSelectedType] = useState('BLOOD_PRESSURE');
  const [timeFrame, setTimeFrame] = useState('month');
  const [vitalSigns, setVitalSigns] = useState([]);
  const [vitalSignsHistory, setVitalSignsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVitalSign, setNewVitalSign] = useState({
    readingType: 'BLOOD_PRESSURE',
    readingValue: '',
    readingUnit: getDefaultUnit('BLOOD_PRESSURE'),
    notes: ''
  });

  useEffect(() => {
    const fetchVitalSigns = async () => {
      if (!user?.patientId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await VitalSignsService.getLatestVitalSigns(user.patientId);
        
        if (response.success) {
          setVitalSigns(response.data);
        } else {
          setError(response.error || 'Failed to fetch vital signs');
        }
      } catch (err) {
        console.error('Error fetching vital signs:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVitalSigns();
  }, [user?.patientId]);

  useEffect(() => {
    const fetchVitalSignsHistory = async () => {
      if (!user?.patientId || activeTab !== 'history') return;
      
      setHistoryLoading(true);
      
      try {
        const response = await VitalSignsService.getVitalSignsHistory(
          user.patientId, 
          selectedType, 
          timeFrame
        );
        
        if (response.success) {
          setVitalSignsHistory(response.data);
        } else {
          console.error('Error fetching history:', response.error);
        }
      } catch (err) {
        console.error('Error fetching vital signs history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchVitalSignsHistory();
  }, [user?.patientId, activeTab, selectedType, timeFrame]);

  // Helper function to get icon for vital sign type
  const getVitalSignIcon = (type) => {
    switch (type) {
      case 'BLOOD_PRESSURE':
        return <GiDroplet className="text-red-500 text-xl" />;
      case 'HEART_RATE':
        return <FaHeartbeat className="text-red-500 text-xl" />;
      case 'WEIGHT':
        return <FaWeight className="text-blue-500 text-xl" />;
      case 'TEMPERATURE':
        return <FaThermometerHalf className="text-orange-500 text-xl" />;
      case 'BLOOD_SUGAR':
        return <GiDroplet className="text-purple-500 text-xl" />;
      case 'OXYGEN_SATURATION':
        return <FaLungs className="text-blue-500 text-xl" />;
      default:
        return null;
    }
  };

  // Helper function to get default unit for vital sign type
  function getDefaultUnit(type) {
    switch (type) {
      case 'BLOOD_PRESSURE':
        return 'mmHg';
      case 'HEART_RATE':
        return 'bpm';
      case 'WEIGHT':
        return 'kg';
      case 'TEMPERATURE':
        return 'C';
      case 'BLOOD_SUGAR':
        return 'mg/dL';
      case 'OXYGEN_SATURATION':
        return '%';
      default:
        return '';
    }
  }

  // Helper function to get status color
  const getStatusClass = (status) => {
    switch (status) {
      case 'NORMAL':
        return 'text-green-500';
      case 'ELEVATED':
        return 'text-orange-500';
      case 'LOW':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Helper function to format vital sign type
  const formatVitalSignType = (type) => {
    if (!type) return '';
    
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'readingType') {
      setNewVitalSign({
        ...newVitalSign,
        readingType: value,
        readingUnit: getDefaultUnit(value)
      });
    } else {
      setNewVitalSign({
        ...newVitalSign,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newVitalSign.readingValue) {
      alert('Reading value is required');
      return;
    }
    
    try {
      const vitalSignData = {
        patientId: user.patientId,
        readingType: newVitalSign.readingType,
        readingValue: newVitalSign.readingValue,
        readingUnit: newVitalSign.readingUnit,
        notes: newVitalSign.notes,
        readingDate: new Date().toISOString()
      };
      
      const response = await VitalSignsService.addVitalSign(vitalSignData);
      
      if (response.success) {
        // Refresh vital signs data
        const latestResponse = await VitalSignsService.getLatestVitalSigns(user.patientId);
        if (latestResponse.success) {
          setVitalSigns(latestResponse.data);
        }
        
        // Close modal and reset form
        setShowAddModal(false);
        setNewVitalSign({
          readingType: 'BLOOD_PRESSURE',
          readingValue: '',
          readingUnit: getDefaultUnit('BLOOD_PRESSURE'),
          notes: ''
        });
        
        // Show success message
        alert('Vital sign added successfully!');
      } else {
        alert(response.error || 'Failed to add vital sign');
      }
    } catch (err) {
      console.error('Error adding vital sign:', err);
      alert('An error occurred while adding the vital sign');
    }
  };

  // Parse chart data
  const chartData = VitalSignsService.parseChartData(vitalSignsHistory, selectedType);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Vital Signs"
        icon={<FaHeartbeat className="text-purple-500" />}
        backLink="/"
        backText="Back to Dashboard"
      />

      {/* Add Vital Sign Button */}
      <div className="mb-6 flex justify-end">
        <button
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="mr-2" /> Add New Reading
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            className={`py-2 px-1 ${
              activeTab === 'latest'
                ? 'border-b-2 border-purple-500 text-purple-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('latest')}
          >
            Latest Readings
          </button>
          <button
            className={`py-2 px-1 ${
              activeTab === 'history'
                ? 'border-b-2 border-purple-500 text-purple-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History & Trends
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {loading ? (
        <Loading message="Loading vital signs..." />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : activeTab === 'latest' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blood Pressure */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center mb-4">
              {getVitalSignIcon('BLOOD_PRESSURE')}
              <h3 className="text-lg font-semibold text-gray-800 ml-2">Blood Pressure</h3>
            </div>
            {vitalSigns.find(v => v.readingType === 'BLOOD_PRESSURE') ? (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {vitalSigns.find(v => v.readingType === 'BLOOD_PRESSURE').readingValue}
                  </span>
                  <span className={`font-medium ${getStatusClass(vitalSigns.find(v => v.readingType === 'BLOOD_PRESSURE').readingStatus)}`}>
                    {vitalSigns.find(v => v.readingType === 'BLOOD_PRESSURE').readingStatus}
                  </span>
                </div>
                <div className="text-gray-500 mt-2">
                  <FaCalendarAlt className="inline mr-2" />
                  {new Date(vitalSigns.find(v => v.readingType === 'BLOOD_PRESSURE').readingDate).toLocaleString()}
                </div>
                {vitalSigns.find(v => v.readingType === 'BLOOD_PRESSURE').notes && (
                  <div className="mt-2 text-gray-600 text-sm">
                    <strong>Notes:</strong> {vitalSigns.find(v => v.readingType === 'BLOOD_PRESSURE').notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>

          {/* Heart Rate */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center mb-4">
              {getVitalSignIcon('HEART_RATE')}
              <h3 className="text-lg font-semibold text-gray-800 ml-2">Heart Rate</h3>
            </div>
            {vitalSigns.find(v => v.readingType === 'HEART_RATE') ? (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {vitalSigns.find(v => v.readingType === 'HEART_RATE').readingValue} bpm
                  </span>
                  <span className={`font-medium ${getStatusClass(vitalSigns.find(v => v.readingType === 'HEART_RATE').readingStatus)}`}>
                    {vitalSigns.find(v => v.readingType === 'HEART_RATE').readingStatus}
                  </span>
                </div>
                <div className="text-gray-500 mt-2">
                  <FaCalendarAlt className="inline mr-2" />
                  {new Date(vitalSigns.find(v => v.readingType === 'HEART_RATE').readingDate).toLocaleString()}
                </div>
                {vitalSigns.find(v => v.readingType === 'HEART_RATE').notes && (
                  <div className="mt-2 text-gray-600 text-sm">
                    <strong>Notes:</strong> {vitalSigns.find(v => v.readingType === 'HEART_RATE').notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>

          {/* Blood Sugar */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center mb-4">
              {getVitalSignIcon('BLOOD_SUGAR')}
              <h3 className="text-lg font-semibold text-gray-800 ml-2">Blood Sugar</h3>
            </div>
            {vitalSigns.find(v => v.readingType === 'BLOOD_SUGAR') ? (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {vitalSigns.find(v => v.readingType === 'BLOOD_SUGAR').readingValue} mg/dL
                  </span>
                  <span className={`font-medium ${getStatusClass(vitalSigns.find(v => v.readingType === 'BLOOD_SUGAR').readingStatus)}`}>
                    {vitalSigns.find(v => v.readingType === 'BLOOD_SUGAR').readingStatus}
                  </span>
                </div>
                <div className="text-gray-500 mt-2">
                  <FaCalendarAlt className="inline mr-2" />
                  {new Date(vitalSigns.find(v => v.readingType === 'BLOOD_SUGAR').readingDate).toLocaleString()}
                </div>
                {vitalSigns.find(v => v.readingType === 'BLOOD_SUGAR').notes && (
                  <div className="mt-2 text-gray-600 text-sm">
                    <strong>Notes:</strong> {vitalSigns.find(v => v.readingType === 'BLOOD_SUGAR').notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>

          {/* Weight */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center mb-4">
              {getVitalSignIcon('WEIGHT')}
              <h3 className="text-lg font-semibold text-gray-800 ml-2">Weight</h3>
            </div>
            {vitalSigns.find(v => v.readingType === 'WEIGHT') ? (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {vitalSigns.find(v => v.readingType === 'WEIGHT').readingValue} kg
                  </span>
                  <span className={`font-medium ${getStatusClass(vitalSigns.find(v => v.readingType === 'WEIGHT').readingStatus)}`}>
                    {vitalSigns.find(v => v.readingType === 'WEIGHT').readingStatus}
                  </span>
                </div>
                <div className="text-gray-500 mt-2">
                  <FaCalendarAlt className="inline mr-2" />
                  {new Date(vitalSigns.find(v => v.readingType === 'WEIGHT').readingDate).toLocaleString()}
                </div>
                {vitalSigns.find(v => v.readingType === 'WEIGHT').notes && (
                  <div className="mt-2 text-gray-600 text-sm">
                    <strong>Notes:</strong> {vitalSigns.find(v => v.readingType === 'WEIGHT').notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>

          {/* Temperature */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center mb-4">
              {getVitalSignIcon('TEMPERATURE')}
              <h3 className="text-lg font-semibold text-gray-800 ml-2">Temperature</h3>
            </div>
            {vitalSigns.find(v => v.readingType === 'TEMPERATURE') ? (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {vitalSigns.find(v => v.readingType === 'TEMPERATURE').readingValue}°C
                  </span>
                  <span className={`font-medium ${getStatusClass(vitalSigns.find(v => v.readingType === 'TEMPERATURE').readingStatus)}`}>
                    {vitalSigns.find(v => v.readingType === 'TEMPERATURE').readingStatus}
                  </span>
                </div>
                <div className="text-gray-500 mt-2">
                  <FaCalendarAlt className="inline mr-2" />
                  {new Date(vitalSigns.find(v => v.readingType === 'TEMPERATURE').readingDate).toLocaleString()}
                </div>
                {vitalSigns.find(v => v.readingType === 'TEMPERATURE').notes && (
                  <div className="mt-2 text-gray-600 text-sm">
                    <strong>Notes:</strong> {vitalSigns.find(v => v.readingType === 'TEMPERATURE').notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>

          {/* Oxygen Saturation */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center mb-4">
              {getVitalSignIcon('OXYGEN_SATURATION')}
              <h3 className="text-lg font-semibold text-gray-800 ml-2">Oxygen Saturation</h3>
            </div>
            {vitalSigns.find(v => v.readingType === 'OXYGEN_SATURATION') ? (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {vitalSigns.find(v => v.readingType === 'OXYGEN_SATURATION').readingValue}%
                  </span>
                  <span className={`font-medium ${getStatusClass(vitalSigns.find(v => v.readingType === 'OXYGEN_SATURATION').readingStatus)}`}>
                    {vitalSigns.find(v => v.readingType === 'OXYGEN_SATURATION').readingStatus}
                  </span>
                </div>
                <div className="text-gray-500 mt-2">
                  <FaCalendarAlt className="inline mr-2" />
                  {new Date(vitalSigns.find(v => v.readingType === 'OXYGEN_SATURATION').readingDate).toLocaleString()}
                </div>
                {vitalSigns.find(v => v.readingType === 'OXYGEN_SATURATION').notes && (
                  <div className="mt-2 text-gray-600 text-sm">
                    <strong>Notes:</strong> {vitalSigns.find(v => v.readingType === 'OXYGEN_SATURATION').notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* History View */}
          <div className="bg-white rounded-lg shadow-md p-5 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
              <div>
                <label htmlFor="vitalSignType" className="block text-sm font-medium text-gray-700 mb-1">
                  Vital Sign
                </label>
                <select
                  id="vitalSignType"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="BLOOD_PRESSURE">Blood Pressure</option>
                  <option value="HEART_RATE">Heart Rate</option>
                  <option value="BLOOD_SUGAR">Blood Sugar</option>
                  <option value="WEIGHT">Weight</option>
                  <option value="TEMPERATURE">Temperature</option>
                  <option value="OXYGEN_SATURATION">Oxygen Saturation</option>
                </select>
              </div>
              <div>
                <label htmlFor="timeFrame" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Frame
                </label>
                <select
                  id="timeFrame"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>

            {historyLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loading message={`Loading ${formatVitalSignType(selectedType)} history...`} />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No history data available for {formatVitalSignType(selectedType)}
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedType === 'BLOOD_PRESSURE' ? (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="systolic" 
                          stroke="#EF4444" 
                          name="Systolic" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="diastolic" 
                          stroke="#3B82F6" 
                          name="Diastolic" 
                        />
                      </>
                    ) : (
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8B5CF6" 
                        name={formatVitalSignType(selectedType)} 
                        activeDot={{ r: 8 }} 
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Reading History Table */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <FaChartLine className="inline mr-2" />
              {formatVitalSignType(selectedType)} History
            </h3>
            
            {vitalSignsHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No history data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reading
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vitalSignsHistory.map(reading => (
                      <tr key={reading.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(reading.readingDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {reading.readingValue} {reading.readingUnit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reading.readingStatus === 'NORMAL' 
                              ? 'bg-green-100 text-green-800' 
                              : reading.readingStatus === 'ELEVATED'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {reading.readingStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {reading.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Vital Sign Modal */}
      <Modal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Vital Sign Reading"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="readingType" className="block text-sm font-medium text-gray-700 mb-1">
              Reading Type
            </label>
            <select
              id="readingType"
              name="readingType"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newVitalSign.readingType}
              onChange={handleInputChange}
            >
              <option value="BLOOD_PRESSURE">Blood Pressure</option>
              <option value="HEART_RATE">Heart Rate</option>
              <option value="BLOOD_SUGAR">Blood Sugar</option>
              <option value="WEIGHT">Weight</option>
              <option value="TEMPERATURE">Temperature</option>
              <option value="OXYGEN_SATURATION">Oxygen Saturation</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="readingValue" className="block text-sm font-medium text-gray-700 mb-1">
              Reading Value
              {newVitalSign.readingType === 'BLOOD_PRESSURE' && " (e.g., 120/80)"}
            </label>
            <input
              type="text"
              id="readingValue"
              name="readingValue"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newVitalSign.readingValue}
              onChange={handleInputChange}
              placeholder={newVitalSign.readingType === 'BLOOD_PRESSURE' ? '120/80' : 'Enter value'}
            />
          </div>
          
          <div>
            <label htmlFor="readingUnit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              type="text"
              id="readingUnit"
              name="readingUnit"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newVitalSign.readingUnit}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newVitalSign.notes}
              onChange={handleInputChange}
              placeholder="Any additional information"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Save Reading
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VitalSignsPage;