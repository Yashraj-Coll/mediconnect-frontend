import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import PatientService from '../services/PatientService';

export const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch patient profile when user is authenticated
  useEffect(() => {
    if (currentUser?.id) {
      fetchPatientProfile();
    } else {
      setPatientProfile(null);
      setLoading(false);
    }
  }, [currentUser]);

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await PatientService.getPatientByUserId(currentUser.id);
      
      if (result.success) {
        setPatientProfile(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch patient profile');
      console.error('Error fetching patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPatientProfile = async (patientData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await PatientService.createPatient({
        ...patientData,
        userId: currentUser.id
      });
      
      if (result.success) {
        setPatientProfile(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'Failed to create patient profile';
      setError(errorMessage);
      console.error('Error creating patient profile:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePatientProfile = async (patientData) => {
    if (!patientProfile?.id) return { success: false, error: 'No patient profile found' };
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await PatientService.updatePatient(patientProfile.id, patientData);
      
      if (result.success) {
        setPatientProfile(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'Failed to update patient profile';
      setError(errorMessage);
      console.error('Error updating patient profile:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    patientProfile,
    loading,
    error,
    fetchPatientProfile,
    createPatientProfile,
    updatePatientProfile,
    hasPatientProfile: !!patientProfile
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

// Custom hook to use patient context
export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

export default PatientContext;