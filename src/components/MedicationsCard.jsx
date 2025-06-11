import React, { useState, useEffect } from 'react';
import PrescriptionService from '../services/PrescriptionService';
import { FaArrowRight, FaPills, FaBell, FaBellSlash } from 'react-icons/fa';
import Loading from './common/Loading';
import ErrorAlert from './common/ErrorAlert';

const MedicationsCard = ({ patientId }) => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminderStatus, setReminderStatus] = useState({});
  const [loadingReminders, setLoadingReminders] = useState({});

  useEffect(() => {
    const fetchMedications = async () => {
      if (!patientId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await PrescriptionService.getActivePrescriptionsForPatient(patientId);
        
        if (response && response.success) {
          // Ensure data is an array
          const data = Array.isArray(response.data) 
            ? response.data 
            : (response.data ? [response.data] : []);
            
          // Process medications from prescriptions
          const meds = PrescriptionService.getMedicationsByType(data);
          
          // Get remaining days for each prescription
          const medicationsWithDays = await Promise.all(
            meds.map(async med => {
              try {
                const daysResponse = await PrescriptionService.getPrescriptionRemainingDays(med.prescriptionId);
                return {
                  ...med,
                  remainingDays: daysResponse && daysResponse.success ? daysResponse.data : null
                };
              } catch (err) {
                console.error(`Error getting remaining days for prescription ${med.prescriptionId}:`, err);
                return {
                  ...med,
                  remainingDays: null
                };
              }
            })
          );
          
          // Sort medications by remaining days (lower first)
          const sortedMedications = medicationsWithDays.sort((a, b) => {
            if (a.remainingDays === null) return 1;
            if (b.remainingDays === null) return -1;
            return a.remainingDays - b.remainingDays;
          });
          
          setMedications(sortedMedications);
          
          // Initialize reminder status
          const initialReminderStatus = {};
          sortedMedications.forEach(med => {
            initialReminderStatus[med.id] = false; // Default to no reminder
          });
          setReminderStatus(initialReminderStatus);
        } else {
          setError((response && response.error) || 'Failed to fetch medications');
        }
      } catch (err) {
        console.error('Error fetching medications:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [patientId]);

  const toggleReminder = async (medicationId, prescriptionId) => {
    try {
      // Set loading state for this specific medication
      setLoadingReminders(prev => ({
        ...prev,
        [medicationId]: true
      }));
      
      // Toggle reminder state optimistically
      setReminderStatus(prev => ({
        ...prev,
        [medicationId]: !prev[medicationId]
      }));
      
      // Call API based on new state
      const isEnabled = !reminderStatus[medicationId];
      
      if (isEnabled) {
        await PrescriptionService.setPrescriptionReminder(prescriptionId);
      } else {
        await PrescriptionService.cancelPrescriptionReminder(prescriptionId);
      }
    } catch (err) {
      console.error('Error toggling reminder:', err);
      
      // Revert on error
      setReminderStatus(prev => ({
        ...prev,
        [medicationId]: !prev[medicationId]
      }));
      
      // Show error message with alert (as per original code)
      alert('Failed to update reminder settings. Please try again.');
    } finally {
      // Clear loading state
      setLoadingReminders(prev => ({
        ...prev,
        [medicationId]: false
      }));
    }
  };

  const getRemainingDaysClass = (days) => {
    if (days === null || days === undefined) return 'text-gray-500';
    
    if (days <= 5) return 'text-red-500';
    if (days <= 10) return 'text-orange-500';
    return 'text-green-500';
  };

  if (loading) {
    return <Loading message="Loading medications..." />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Medications</h2>
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (medications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Medications</h2>
        <div className="text-center text-gray-500 py-6">
          <FaPills className="text-4xl mx-auto mb-2" />
          <p>No active medications found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Current Medications</h2>
        <button 
          className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
          onClick={() => window.location.href = '/medications'}
        >
          View All Medications <FaArrowRight className="ml-1" />
        </button>
      </div>

      <div className="space-y-4">
        {medications.slice(0, 3).map(medication => (
          <div key={medication.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{medication.name || 'Unnamed Medication'}</h3>
                <p className="text-sm text-gray-600">
                  {medication.dosage || 'No dosage'} - {medication.frequency || 'As needed'}
                </p>
                {medication.instructions && (
                  <p className="text-xs text-gray-500 mt-1">{medication.instructions}</p>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-sm font-medium ${getRemainingDaysClass(medication.remainingDays)}`}>
                  {medication.remainingDays !== null ? `${medication.remainingDays} days left` : 'Ongoing'}
                </span>
                <button 
                  className="mt-1 text-sm text-gray-500 hover:text-purple-600 flex items-center"
                  onClick={() => toggleReminder(medication.id, medication.prescriptionId)}
                  disabled={loadingReminders[medication.id]}
                >
                  {loadingReminders[medication.id] ? (
                    <span className="flex items-center">
                      <span className="h-3 w-3 mr-1 rounded-full border-2 border-t-purple-600 border-purple-200 animate-spin"></span>
                      Loading...
                    </span>
                  ) : reminderStatus[medication.id] ? (
                    <>
                      <FaBellSlash className="mr-1" /> Disable Reminder
                    </>
                  ) : (
                    <>
                      <FaBell className="mr-1" /> Set Reminder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {medications.length > 3 && (
        <div className="mt-4 text-center">
          <button 
            className="text-purple-600 hover:text-purple-800 text-sm"
            onClick={() => window.location.href = '/medications'}
          >
            +{medications.length - 3} more medications
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicationsCard;