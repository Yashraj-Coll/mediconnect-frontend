import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import PatientService from '../services/PatientService';

export const PatientContext = createContext();

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch patient profile when user is authenticated
  useEffect(() => {
  // 🔥 FIX: Only fetch patient profile for PATIENT users
  if (isAuthenticated && user?.id) {
    const userRole = user.role || user.userRole || user.type || '';
    const normalizedRole = userRole.toUpperCase().replace('ROLE_', '');
    
    if (normalizedRole === 'PATIENT') {
      console.log('Fetching patient profile for PATIENT user:', user.id);
      fetchPatientProfileById(user.id);
    } else {
      console.log('Skipping patient profile fetch for non-patient user:', normalizedRole);
      setPatientProfile(null);
      setLoading(false);
    }
  } else {
    // Try to get user from localStorage if not in context
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (storedUser && storedUser.id) {
          const userRole = storedUser.role || storedUser.userRole || storedUser.type || '';
          const normalizedRole = userRole.toUpperCase().replace('ROLE_', '');
          
          if (normalizedRole === 'PATIENT') {
            console.log('Fetching patient profile with stored PATIENT user ID:', storedUser.id);
            fetchPatientProfileById(storedUser.id);
          } else {
            console.log('Skipping patient profile fetch for stored non-patient user:', normalizedRole);
            setPatientProfile(null);
            setLoading(false);
          }
        } else {
          console.log('No user ID found in stored user data');
          setPatientProfile(null);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
        setPatientProfile(null);
        setLoading(false);
      }
    } else {
      setPatientProfile(null);
      setLoading(false);
    }
  }
}, [user, isAuthenticated]);

  const fetchPatientProfileById = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching patient profile for user ID:', userId);
      const result = await PatientService.getPatientByUserId(userId);
      
      if (result.success) {
        console.log('Patient profile data received:', result.data);
        setPatientProfile(result.data);
      } else {
        console.error('Failed to fetch patient profile:', result.error);
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch patient profile');
      console.error('Error fetching patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create or update patient profile
  const updatePatientProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (patientProfile?.id) {
        // Update existing profile
        result = await PatientService.updatePatient(patientProfile.id, profileData);
      } else {
        // Create new profile
        result = await PatientService.createPatient({
          ...profileData,
          userId: user.id
        });
      }
      
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
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get patient appointments
  const getPatientAppointments = async () => {
    if (!patientProfile?.id) {
      return { success: false, error: 'Patient profile not found' };
    }
    
    try {
      return await PatientService.getPatientAppointments(patientProfile.id);
    } catch (err) {
      return { success: false, error: 'Failed to fetch appointments' };
    }
  };

  // Get patient medical records
  const getPatientMedicalRecords = async () => {
    if (!patientProfile?.id) {
      return { success: false, error: 'Patient profile not found' };
    }
    
    try {
      return await PatientService.getPatientMedicalRecords(patientProfile.id);
    } catch (err) {
      return { success: false, error: 'Failed to fetch medical records' };
    }
  };

  // Get patient prescriptions
  const getPatientPrescriptions = async () => {
    if (!patientProfile?.id) {
      return { success: false, error: 'Patient profile not found' };
    }
    
    try {
      return await PatientService.getPatientPrescriptions(patientProfile.id);
    } catch (err) {
      return { success: false, error: 'Failed to fetch prescriptions' };
    }
  };

  // Context value
  const contextValue = {
    patientProfile,
    loading,
    error,
    updatePatientProfile,
    getPatientAppointments,
    getPatientMedicalRecords,
    getPatientPrescriptions,
    refreshProfile: () => user?.id && fetchPatientProfileById(user.id)
  };

  return (
    <PatientContext.Provider value={contextValue}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContext;