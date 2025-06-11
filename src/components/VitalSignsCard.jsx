import React, { useState, useEffect } from 'react';
import VitalSignsService from '../services/VitalSignsService';
import { FaPlus, FaArrowRight, FaHeartbeat, FaWeight, FaThermometerHalf, FaLungs } from 'react-icons/fa';
import { FaDroplet } from "react-icons/fa6";
import { Spinner, Alert } from 'react-bootstrap'; // Added Alert import for ErrorAlert

const VitalSignsCard = ({ patientId }) => {
  const [vitalSigns, setVitalSigns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestVitalSigns = async () => {
      if (!patientId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await VitalSignsService.getLatestVitalSigns(patientId);
        
        if (response && response.success) {
          // Ensure data is an array even if API returns a single object or null
          const dataArray = Array.isArray(response.data) 
            ? response.data 
            : (response.data ? [response.data] : []);
          
          // Group vital signs by type
          const groupedVitalSigns = {};
          
          // Safely process each item in the array
          dataArray.forEach(vitalSign => {
            if (vitalSign && vitalSign.readingType) {
              groupedVitalSigns[vitalSign.readingType] = vitalSign;
            }
          });
          
          setVitalSigns(groupedVitalSigns);
        } else {
          setError((response && response.error) || 'Failed to fetch vital signs');
        }
      } catch (err) {
        console.error('Error fetching vital signs:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestVitalSigns();
  }, [patientId]);

  // Get icon for vital sign type
  const getVitalSignIcon = (type) => {
    switch (type) {
      case 'BLOOD_PRESSURE':
        return <FaDroplet className="text-red-500" />;
      case 'HEART_RATE':
        return <FaHeartbeat className="text-red-500" />;
      case 'WEIGHT':
        return <FaWeight className="text-blue-500" />;
      case 'TEMPERATURE':
        return <FaThermometerHalf className="text-orange-500" />;
      case 'BLOOD_SUGAR':
        return <FaDroplet className="text-purple-500" />;
      case 'OXYGEN_SATURATION':
        return <FaLungs className="text-blue-500" />;
      default:
        return null;
    }
  };

  // Get status indicator class
  const getStatusClass = (status) => {
    if (!status) return 'text-gray-500';
    
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

  // Format display name for vital sign type
  const formatVitalSignType = (type) => {
    if (!type) return '';
    
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Loading component
  const LoadingComponent = ({ message = "Loading vital signs..." }) => (
    <div className="text-center p-4">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="mt-2">{message}</p>
    </div>
  );

  // Error alert component
  const ErrorAlert = ({ message }) => (
    <Alert variant="danger">
      <Alert.Heading>Error</Alert.Heading>
      <p>{message}</p>
    </Alert>
  );

  if (loading) {
    return <LoadingComponent message="Loading vital signs..." />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  // Check if we have any vital signs to display
  const hasVitalSigns = Object.keys(vitalSigns).length > 0;

  if (!hasVitalSigns) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Health Overview</h2>
        </div>
        <div className="text-center text-gray-500 py-6">
          <FaHeartbeat className="text-4xl mx-auto mb-2" />
          <p>No vital sign records found.</p>
          <button
            className="flex items-center text-purple-600 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 mt-4 mx-auto"
            onClick={() => window.location.href = '/vital-signs/add'}
          >
            <FaPlus className="mr-2" /> Add Your First Reading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Health Overview</h2>
        <button 
          className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
          onClick={() => window.location.href = '/vital-signs'}
        >
          View All Vitals <FaArrowRight className="ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blood Pressure */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between">
            <div className="flex items-center">
              {getVitalSignIcon('BLOOD_PRESSURE')}
              <span className="ml-2 text-gray-700">Blood Pressure</span>
            </div>
            <span className={`font-semibold ${vitalSigns.BLOOD_PRESSURE ? getStatusClass(vitalSigns.BLOOD_PRESSURE.readingStatus) : ''}`}>
              {vitalSigns.BLOOD_PRESSURE ? vitalSigns.BLOOD_PRESSURE.readingValue : '--'} mmHg
            </span>
          </div>
          {vitalSigns.BLOOD_PRESSURE && vitalSigns.BLOOD_PRESSURE.readingDate && (
            <div className="text-xs text-gray-500 mt-1">
              {new Date(vitalSigns.BLOOD_PRESSURE.readingDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Blood Sugar */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between">
            <div className="flex items-center">
              {getVitalSignIcon('BLOOD_SUGAR')}
              <span className="ml-2 text-gray-700">Blood Sugar (Fasting)</span>
            </div>
            <span className={`font-semibold ${vitalSigns.BLOOD_SUGAR ? getStatusClass(vitalSigns.BLOOD_SUGAR.readingStatus) : ''}`}>
              {vitalSigns.BLOOD_SUGAR ? vitalSigns.BLOOD_SUGAR.readingValue : '--'} mg/dL
            </span>
          </div>
          {vitalSigns.BLOOD_SUGAR && vitalSigns.BLOOD_SUGAR.readingDate && (
            <div className="text-xs text-gray-500 mt-1">
              {new Date(vitalSigns.BLOOD_SUGAR.readingDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Heart Rate */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between">
            <div className="flex items-center">
              {getVitalSignIcon('HEART_RATE')}
              <span className="ml-2 text-gray-700">Heart Rate</span>
            </div>
            <span className={`font-semibold ${vitalSigns.HEART_RATE ? getStatusClass(vitalSigns.HEART_RATE.readingStatus) : ''}`}>
              {vitalSigns.HEART_RATE ? vitalSigns.HEART_RATE.readingValue : '--'} bpm
            </span>
          </div>
          {vitalSigns.HEART_RATE && vitalSigns.HEART_RATE.readingDate && (
            <div className="text-xs text-gray-500 mt-1">
              {new Date(vitalSigns.HEART_RATE.readingDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between">
            <div className="flex items-center">
              {getVitalSignIcon('WEIGHT')}
              <span className="ml-2 text-gray-700">Weight</span>
            </div>
            <span className={`font-semibold ${vitalSigns.WEIGHT ? getStatusClass(vitalSigns.WEIGHT.readingStatus) : ''}`}>
              {vitalSigns.WEIGHT ? vitalSigns.WEIGHT.readingValue : '--'} kg
            </span>
          </div>
          {vitalSigns.WEIGHT && vitalSigns.WEIGHT.readingDate && (
            <div className="text-xs text-gray-500 mt-1">
              {new Date(vitalSigns.WEIGHT.readingDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Temperature - Only shown if available */}
        {vitalSigns.TEMPERATURE && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                {getVitalSignIcon('TEMPERATURE')}
                <span className="ml-2 text-gray-700">Temperature</span>
              </div>
              <span className={`font-semibold ${getStatusClass(vitalSigns.TEMPERATURE.readingStatus)}`}>
                {vitalSigns.TEMPERATURE.readingValue} °F
              </span>
            </div>
            {vitalSigns.TEMPERATURE.readingDate && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(vitalSigns.TEMPERATURE.readingDate).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Oxygen Saturation - Only shown if available */}
        {vitalSigns.OXYGEN_SATURATION && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                {getVitalSignIcon('OXYGEN_SATURATION')}
                <span className="ml-2 text-gray-700">Oxygen Saturation</span>
              </div>
              <span className={`font-semibold ${getStatusClass(vitalSigns.OXYGEN_SATURATION.readingStatus)}`}>
                {vitalSigns.OXYGEN_SATURATION.readingValue}%
              </span>
            </div>
            {vitalSigns.OXYGEN_SATURATION.readingDate && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(vitalSigns.OXYGEN_SATURATION.readingDate).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          className="flex items-center text-purple-600 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
          onClick={() => window.location.href = '/vital-signs/add'}
        >
          <FaPlus className="mr-2" /> Add New Reading
        </button>
      </div>
    </div>
  );
};

export default VitalSignsCard;