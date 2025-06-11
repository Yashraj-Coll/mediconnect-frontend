import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_BASE_URL = "http://localhost:8080/mediconnect";

// Enhanced Axios instance with better error handling
// Enhanced Axios instance with better error handling and authentication
const api = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const sessionToken = localStorage.getItem('session_token');
  
  console.log('API Request - Token exists:', !!token, 'Session exists:', !!sessionToken);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (sessionToken) {
    config.headers['X-Session-Id'] = sessionToken;
  }
  
  console.log('API Request URL:', config.url, 'Headers:', config.headers);
  return config;
}, error => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => {
    console.log('API Response success:', response.config.url, response.status);
    return response;
  },
  error => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing storage and redirecting');
      // Handle token expiry
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const tabOptions = [
  { id: 'overview', label: 'Overview' },
  { id: 'patients', label: 'My Patients' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'add-vitals', label: 'Add Vitals' },
  { id: 'add-prescription', label: 'Add Prescription' },
  { id: 'add-record', label: 'Add Medical Record' },
  { id: 'profile', label: 'Profile' }
];

const vitalTypesList = [
  { type: 'Blood Pressure', unit: 'mmHg' },
  { type: 'Blood Sugar', unit: 'mg/dL' },
  { type: 'Heart Rate', unit: 'bpm' },
  { type: 'Weight', unit: 'kg' },
  { type: 'Temperature', unit: '°C' },
  { type: 'Oxygen Saturation', unit: '%' },
  { type: 'Respiratory Rate', unit: 'breaths/min' }
];

const DoctorDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Top-level state
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    upcomingAppointments: 0,
    completedAppointments: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Patient search and selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Enhanced vitals form with better structure
  const [vitalFormData, setVitalFormData] = useState({
    patientId: '',
    vitalType: '',
    value: '',
    unit: '',
    status: 'normal',
    notes: '',
    readingDate: new Date().toISOString().split('T')[0]
  });

  // Enhanced prescription form
  const [prescriptionFormData, setPrescriptionFormData] = useState({
    patientId: '',
    appointmentId: '',
    medications: [{ 
      medicationName: '', 
      dosage: '', 
      frequency: 'Once daily', 
      duration: '7 days', 
      route: 'Oral',
      instructions: '',
      beforeMeal: false
    }],
    specialInstructions: '',
    notes: '',
    validDays: 30,
    isRefillable: false,
    refillCount: 0
  });

  // Enhanced medical record form
  const [recordFormData, setRecordFormData] = useState({
    patientId: '',
    title: '',
    type: 'Lab Test',
    hospital: '',
    notes: '',
    file: null
  });

  // Profile form remains the same...
  const [profileFormData, setProfileFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialization: '',
  education: '',
  experience: '',
  hospitalAffiliation: '',
  consultationFee: '',
  biography: '',
  languages: [],
  isAvailableForEmergency: false,
  // NEW: Clinic Information
  clinicName: '',
  clinicAddress: '',
  clinicCity: '',
  clinicState: '',
  clinicPincode: '',
  clinicPhone: '',
  onlineConsultation: false,
  // NEW: Clinic Timings
  mondayTiming: '',
  tuesdayTiming: '',
  wednesdayTiming: '',
  thursdayTiming: '',
  fridayTiming: '',
  saturdayTiming: '',
  sundayTiming: ''
});

  // Password change state
const [showPasswordModal, setShowPasswordModal] = useState(false);
const [passwordFormData, setPasswordFormData] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const [passwordStrength, setPasswordStrength] = useState({
  strength: '',
  score: 0,
  issues: []
});
const [showPasswords, setShowPasswords] = useState({
  current: false,
  new: false,
  confirm: false
});

// ADD these NEW state variables:
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showDeactivateModal, setShowDeactivateModal] = useState(false);
const [deleteFormData, setDeleteFormData] = useState({
  currentPassword: '',
  confirmation: ''
});
const [deactivateFormData, setDeactivateFormData] = useState({
  currentPassword: '',
  reason: ''
});

  // Toast for success messages
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // ENHANCED: Fetch all doctor data with proper error handling
  useEffect(() => {
  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== STARTING DOCTOR DATA FETCH ===');

      // Step 1: Get current user
      console.log('Step 1: Fetching current user...');
      const userResponse = await api.get('/auth/current-user');
      console.log('User Response:', userResponse.data);
      setUser(userResponse.data);

      // Step 2: Get doctor profile
      console.log('Step 2: Fetching doctor profile...');
      const doctorResponse = await api.get(`/doctors/by-user/${userResponse.data.id}`);
      console.log('Doctor Response:', doctorResponse.data);
      const doctorObj = Array.isArray(doctorResponse.data) ? doctorResponse.data[0] : doctorResponse.data;
      setDoctor(doctorObj);

      // Step 3: Get doctor's appointments
      console.log('Step 3: Fetching appointments...');
      const appointmentsResponse = await api.get(`/appointments/doctor/${doctorObj.id}`);
      console.log('Appointments Response:', appointmentsResponse.data);
      const appointmentsData = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];

      // 🎯 FIX 4: Skip Method 1 entirely - it doesn't exist
      console.log('Step 4: Fetching patient data...');
      let realPatientsData = [];

      // Method 2: Get all patients and match them (THIS WORKS!)
      try {
        console.log('Fetching all patients...');
        const allPatientsResponse = await api.get('/patients');
        console.log('All patients response:', allPatientsResponse.data);
        
        if (allPatientsResponse.data && allPatientsResponse.data.length > 0) {
          const allPatients = Array.isArray(allPatientsResponse.data) ? allPatientsResponse.data : [allPatientsResponse.data];
          console.log('✅ Found', allPatients.length, 'patients');
          
          // Get unique patient IDs from appointments
          const uniquePatientIds = [...new Set(appointmentsData.map(app => app.patientId).filter(id => id))];
          console.log('Unique Patient IDs needed:', uniquePatientIds);
          
          // Match patients with appointments
          realPatientsData = uniquePatientIds.map(patientId => {
            const foundPatient = allPatients.find(p => p.id === patientId);
            if (foundPatient) {
              console.log(`✅ Found real patient data for ID ${patientId}:`, foundPatient);
              
              return {
                id: foundPatient.id,
                name: foundPatient.user ? 
                  `${foundPatient.user.firstName || ''} ${foundPatient.user.lastName || ''}`.trim() : 
                  `${foundPatient.firstName || ''} ${foundPatient.lastName || ''}`.trim() || 'Unknown Patient',
                email: foundPatient.user?.email || foundPatient.email || '',
                phone: foundPatient.user?.phoneNumber || foundPatient.phoneNumber || '',
                gender: foundPatient.gender || foundPatient.user?.gender || 'MALE',
                bloodGroup: foundPatient.bloodGroup || '',
                age: (() => {
                  if (foundPatient.age && foundPatient.age !== '') return foundPatient.age;
                  if (foundPatient.user?.age && foundPatient.user.age !== '') return foundPatient.user.age;
                  
                  const dob = foundPatient.dateOfBirth || foundPatient.user?.dateOfBirth;
                  if (dob) {
                    const birthDate = new Date(dob);
                    const today = new Date();
                    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      calculatedAge--;
                    }
                    return calculatedAge > 0 ? calculatedAge.toString() : '';
                  }
                  return '';
                })(),
                dateOfBirth: foundPatient.dateOfBirth || foundPatient.user?.dateOfBirth || '',
                profileImage: foundPatient.profileImage || foundPatient.user?.profileImage || null,
                address: foundPatient.address || foundPatient.user?.address || '',
                emergencyContact: foundPatient.emergencyContact || foundPatient.user?.emergencyContact || ''
              };
            } else {
              console.log(`❌ No patient found for ID ${patientId}, creating fallback`);
              return {
                id: patientId,
                name: `Patient ${patientId}`,
                email: `patient${patientId}@medical.com`,
                phone: `+91-${String(9000000000 + patientId)}`,
                gender: 'MALE',
                bloodGroup: 'O+',
                age: '25'
              };
            }
          });
        }
      } catch (error2) {
        console.log('❌ Patient fetch failed:', error2.response?.status);
        // Create fallback data if needed
        const uniquePatientIds = [...new Set(appointmentsData.map(app => app.patientId).filter(id => id))];
        realPatientsData = uniquePatientIds.map(patientId => ({
          id: patientId,
          name: `Patient ${patientId}`,
          email: `patient${patientId}@medical.com`,
          phone: `+91-${String(9000000000 + patientId)}`,
          gender: 'MALE',
          bloodGroup: 'O+',
          age: '25'
        }));
      }

      console.log('Final real patients data:', realPatientsData);
      setPatients(realPatientsData);
      setFilteredPatients(realPatientsData);

      // Step 5: Enhance appointments with patient data
      console.log('Step 5: Enhancing appointments with patient data...');
      const finalEnhancedAppointments = appointmentsData.map(appointment => {
        const patient = realPatientsData.find(p => p.id === appointment.patientId);
        return {
          ...appointment,
          patientName: patient?.name || `Patient ${appointment.patientId}`,
          patientEmail: patient?.email || '',
          patientPhone: patient?.phone || '',
          patientGender: patient?.gender || 'MALE',
          patientBloodGroup: patient?.bloodGroup || '',
          patientAge: patient?.age || '',
          patientProfileImage: patient?.profileImage || null
        };
      });

      console.log('Final enhanced appointments:', finalEnhancedAppointments);
      setAppointments(finalEnhancedAppointments);

      // Step 6: Calculate statistics
      console.log('Step 6: Calculating statistics...');
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const todayAppointments = finalEnhancedAppointments.filter(app => {
        const appDate = new Date(app.appointmentDateTime);
        const appDay = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());
        return appDay.getTime() === today.getTime();
      });

      const upcomingAppointments = finalEnhancedAppointments.filter(app => 
        app.status?.toLowerCase() === 'upcoming' || app.status?.toLowerCase() === 'scheduled'
      );

      const completedAppointments = finalEnhancedAppointments.filter(app => 
        app.status?.toLowerCase() === 'completed'
      );

      const stats = {
        todayAppointments: todayAppointments.length,
        totalPatients: realPatientsData.length,
        upcomingAppointments: upcomingAppointments.length,
        completedAppointments: completedAppointments.length
      };

      console.log('Dashboard statistics:', stats);
      setDashboardStats(stats);

      console.log('=== DOCTOR DATA FETCH COMPLETED SUCCESSFULLY ===');
      setLoading(false);
      
    } catch (err) {
      console.error('=== ERROR IN DOCTOR DATA FETCH ===', err);
      
      let errorMessage = 'Failed to fetch doctor profile. Please refresh the page.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        localStorage.clear();
        window.location.href = '/login';
        return;
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please contact support.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a few minutes.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  fetchDoctorData();
}, []);

  // Initialize profile form after data load
  useEffect(() => {
  if (user && doctor) {
    setProfileFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      specialization: doctor.specialization || '',
      education: doctor.education || '',
      experience: doctor.experience || '',
      hospitalAffiliation: doctor.hospitalAffiliation || '',
      consultationFee: doctor.consultationFee || '',
      biography: doctor.biography || '',
      languages: doctor.languages || [],
      isAvailableForEmergency: doctor.isAvailableForEmergency || false,
      // NEW: Clinic Information
      clinicName: doctor.clinicName || '',
      clinicAddress: doctor.clinicAddress || '',
      clinicCity: doctor.clinicCity || '',
      clinicState: doctor.clinicState || '',
      clinicPincode: doctor.clinicPincode || '',
      clinicPhone: doctor.clinicPhone || '',
      onlineConsultation: doctor.onlineConsultation || false,
      // NEW: Clinic Timings
      mondayTiming: doctor.mondayTiming || '',
      tuesdayTiming: doctor.tuesdayTiming || '',
      wednesdayTiming: doctor.wednesdayTiming || '',
      thursdayTiming: doctor.thursdayTiming || '',
      fridayTiming: doctor.fridayTiming || '',
      saturdayTiming: doctor.saturdayTiming || '',
      sundayTiming: doctor.sundayTiming || ''
    });
  }
}, [user, doctor]);

  // Filter patients based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  // Enhanced image helpers
  const getDoctorProfileImage = (doctor) => {
  if (doctor?.profileImage) {
    // Handle both relative and absolute URLs
    if (doctor.profileImage.startsWith('http')) {
      return doctor.profileImage;
    } else {
      return `${BACKEND_BASE_URL}/uploads/${doctor.profileImage}`;
    }
  }
  return doctor?.gender === 'FEMALE' ? '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg';
};

  // Enhanced image helpers with better profile image handling
const getPatientProfileImage = (patient) => {
  // Check multiple possible profile image sources
  if (patient?.profileImage) {
    // Handle both relative and absolute URLs
    if (patient.profileImage.startsWith('http')) {
      return patient.profileImage;
    } else {
      return `${BACKEND_BASE_URL}/uploads/${patient.profileImage}`;
    }
  }
  
  if (patient?.profilePicture) {
    if (patient.profilePicture.startsWith('http')) {
      return patient.profilePicture;
    } else {
      return `${BACKEND_BASE_URL}/uploads/${patient.profilePicture}`;
    }
  }
  
  if (patient?.avatar) {
    if (patient.avatar.startsWith('http')) {
      return patient.avatar;
    } else {
      return `${BACKEND_BASE_URL}/uploads/${patient.avatar}`;
    }
  }
  
  // Fallback to default images based on gender
  return patient?.gender === 'FEMALE' ? '/images/Profile Photo Woman.jpg' : '/images/Profile Photo Man.jpg';
};

  // ENHANCED: Handle vital form submission with proper API call
  const handleVitalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError('Please select a patient first');
      return;
    }

    try {
      const vitalData = {
        patientId: selectedPatient.id,
        vitalType: vitalFormData.vitalType,
        value: vitalFormData.value,
        status: vitalFormData.status,
        notes: vitalFormData.notes,
        readingDate: new Date(vitalFormData.readingDate).toISOString()
      };

      console.log('Submitting vital data:', vitalData);
      await api.post('/vital-signs', vitalData);
      
      // Reset form
      setVitalFormData({
        patientId: '',
        vitalType: '',
        value: '',
        unit: '',
        status: 'normal',
        notes: '',
        readingDate: new Date().toISOString().split('T')[0]
      });
      setSelectedPatient(null);
      
      showSuccessMessage('Vital signs added successfully');
    } catch (err) {
      console.error('Error adding vital signs:', err);
      setError('Failed to add vital signs. Please try again.');
    }
  };

  // ENHANCED: Handle prescription form submission
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError('Please select a patient first');
      return;
    }

    try {
      const prescriptionData = {
        patientId: selectedPatient.id,
        doctorId: doctor.id,
        appointmentId: prescriptionFormData.appointmentId || null,
        prescriptionDate: new Date().toISOString(),
        validUntil: new Date(Date.now() + prescriptionFormData.validDays * 24 * 60 * 60 * 1000).toISOString(),
        specialInstructions: prescriptionFormData.specialInstructions,
        notes: prescriptionFormData.notes,
        isRefillable: prescriptionFormData.isRefillable,
        refillCount: prescriptionFormData.refillCount,
        isDigitallySigned: true,
        prescriptionItems: prescriptionFormData.medications.filter(med => med.medicationName).map(med => ({
          medicationName: med.medicationName,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          route: med.route,
          instructions: med.instructions,
          beforeMeal: med.beforeMeal
        }))
      };

      console.log('Submitting prescription data:', prescriptionData);
      await api.post('/prescriptions', prescriptionData);
      
      // Reset form
      setPrescriptionFormData({
        patientId: '',
        appointmentId: '',
        medications: [{ 
          medicationName: '', 
          dosage: '', 
          frequency: 'Once daily', 
          duration: '7 days', 
          route: 'Oral',
          instructions: '',
          beforeMeal: false
        }],
        specialInstructions: '',
        notes: '',
        validDays: 30,
        isRefillable: false,
        refillCount: 0
      });
      setSelectedPatient(null);
      
      showSuccessMessage('Prescription created successfully');
    } catch (err) {
      console.error('Error creating prescription:', err);
      setError('Failed to create prescription. Please try again.');
    }
  };

  // ENHANCED: Handle medical record form submission
  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError('Please select a patient first');
      return;
    }

    if (!recordFormData.file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', recordFormData.file);
      formData.append('patientId', selectedPatient.id);
      formData.append('doctorId', doctor.id);
      formData.append('title', recordFormData.title);
      formData.append('type', recordFormData.type);
      formData.append('hospital', recordFormData.hospital || doctor.hospitalAffiliation);
      formData.append('notes', recordFormData.notes);

      await api.post('/medical-records/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Reset form
      setRecordFormData({
        patientId: '',
        title: '',
        type: 'Lab Test',
        hospital: '',
        notes: '',
        file: null
      });
      setSelectedPatient(null);
      
      showSuccessMessage('Medical record uploaded successfully');
    } catch (err) {
      console.error('Error uploading medical record:', err);
      setError('Failed to upload medical record. Please try again.');
    }
  };

  const handleMarkComplete = async (appointmentId, patientName) => {
  if (!window.confirm(`Mark appointment with ${patientName} as completed?`)) {
    return;
  }

  try {
    console.log('Marking appointment as complete:', appointmentId);
    
    const response = await api.put(`/appointments/${appointmentId}/complete`, {
      completedAt: new Date().toISOString(),
      status: 'completed'
    });

    if (response.data) {
      console.log('Appointment marked as complete successfully');
      
      // Update the appointments state
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: 'completed', completedAt: new Date().toISOString() }
            : appointment
        )
      );

      // Update dashboard stats
      setDashboardStats(prevStats => ({
        ...prevStats,
        upcomingAppointments: prevStats.upcomingAppointments - 1,
        completedAppointments: prevStats.completedAppointments + 1
      }));

      showSuccessMessage(`Appointment with ${patientName} marked as completed`);
    }
  } catch (err) {
    console.error('Error marking appointment as complete:', err);
    
    let errorMessage = 'Failed to mark appointment as complete. Please try again.';
    
    if (err.response?.status === 404) {
      errorMessage = 'Appointment not found. It may have been already updated.';
    } else if (err.response?.status === 400) {
      errorMessage = 'This appointment cannot be marked as complete.';
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    }
    
    setError(errorMessage);
  }
};

  // Handle profile update (keep existing)
  const handleProfileUpdate = async () => {
  try {
    setLoading(true);
    
    await api.put('/doctors/profile', {
      firstName: profileFormData.firstName,
      lastName: profileFormData.lastName,
      email: profileFormData.email,
      phoneNumber: profileFormData.phone,
      specialization: profileFormData.specialization,
      education: profileFormData.education,
      experience: profileFormData.experience,
      hospitalAffiliation: profileFormData.hospitalAffiliation,
      consultationFee: parseFloat(profileFormData.consultationFee) || 0,
      biography: profileFormData.biography,
      isAvailableForEmergency: profileFormData.isAvailableForEmergency,
      // NEW: Clinic Information
      clinicName: profileFormData.clinicName,
      clinicAddress: profileFormData.clinicAddress,
      clinicCity: profileFormData.clinicCity,
      clinicState: profileFormData.clinicState,
      clinicPincode: profileFormData.clinicPincode,
      clinicPhone: profileFormData.clinicPhone,
      onlineConsultation: profileFormData.onlineConsultation,
      // NEW: Clinic Timings
      mondayTiming: profileFormData.mondayTiming,
      tuesdayTiming: profileFormData.tuesdayTiming,
      wednesdayTiming: profileFormData.wednesdayTiming,
      thursdayTiming: profileFormData.thursdayTiming,
      fridayTiming: profileFormData.fridayTiming,
      saturdayTiming: profileFormData.saturdayTiming,
      sundayTiming: profileFormData.sundayTiming
    });

    showSuccessMessage('Profile updated successfully');
    setLoading(false);
    
    // Refresh data
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    
  } catch (err) {
    console.error('Error updating profile:', err);
    setLoading(false);
    
    const errorMessage = err.response?.data?.error || 
                        err.response?.data?.message || 
                        'Failed to update profile. Please try again.';
    setError(errorMessage);
  }
};

// ADD these new functions for account management:

// Handle account deletion
const handleDeleteAccount = async (e) => {
  e.preventDefault();
  
  if (!deleteFormData.currentPassword || deleteFormData.confirmation !== 'DELETE MY ACCOUNT') {
    setError('Please enter your password and type "DELETE MY ACCOUNT" to confirm');
    return;
  }

  try {
    await api.delete('/doctors/profile/delete-account', {
      data: {
        currentPassword: deleteFormData.currentPassword,
        confirmation: deleteFormData.confirmation
      }
    });

    alert('Account deleted successfully. You will be logged out.');
    localStorage.clear();
    window.location.href = '/login';

  } catch (err) {
    const errorMessage = err.response?.data?.error || 'Failed to delete account';
    setError(errorMessage);
  }
};

// Handle account deactivation
const handleDeactivateAccount = async (e) => {
  e.preventDefault();
  
  if (!deactivateFormData.currentPassword) {
    setError('Please enter your current password');
    return;
  }

  try {
    await api.post('/doctors/profile/deactivate', {
      currentPassword: deactivateFormData.currentPassword,
      reason: deactivateFormData.reason
    });

    alert('Account deactivated successfully. You will be logged out.');
    localStorage.clear();
    window.location.href = '/login';

  } catch (err) {
    const errorMessage = err.response?.data?.error || 'Failed to deactivate account';
    setError(errorMessage);
  }
};

// Render delete account modal
const renderDeleteAccountModal = () => {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-red-600">Delete Account Permanently</h3>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-bold text-red-800 mb-2">⚠️ Warning</h4>
          <p className="text-sm text-red-700">
            This action will permanently delete your account and all associated data. 
            This cannot be undone.
          </p>
        </div>

        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              value={deleteFormData.currentPassword}
              onChange={(e) => setDeleteFormData(prev => ({ 
                ...prev, 
                currentPassword: e.target.value 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type "DELETE MY ACCOUNT" to confirm *
            </label>
            <input
              type="text"
              value={deleteFormData.confirmation}
              onChange={(e) => setDeleteFormData(prev => ({ 
                ...prev, 
                confirmation: e.target.value 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="DELETE MY ACCOUNT"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !deleteFormData.currentPassword || 
                deleteFormData.confirmation !== 'DELETE MY ACCOUNT'
              }
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                deleteFormData.currentPassword && 
                deleteFormData.confirmation === 'DELETE MY ACCOUNT'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Render deactivate account modal  
const renderDeactivateAccountModal = () => {
  if (!showDeactivateModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-orange-600">Deactivate Account</h3>
          <button
            onClick={() => setShowDeactivateModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleDeactivateAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              value={deactivateFormData.currentPassword}
              onChange={(e) => setDeactivateFormData(prev => ({ 
                ...prev, 
                currentPassword: e.target.value 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for deactivation (optional)
            </label>
            <textarea
              value={deactivateFormData.reason}
              onChange={(e) => setDeactivateFormData(prev => ({ 
                ...prev, 
                reason: e.target.value 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              rows="3"
              placeholder="Let us know why you're deactivating..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDeactivateModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!deactivateFormData.currentPassword}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                deactivateFormData.currentPassword
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Deactivate Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const handlePasswordChange = async (e) => {
  e.preventDefault();
  
  if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
    setError('All password fields are required');
    return;
  }
  
  if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
    setError('New passwords do not match');
    return;
  }
  
  if (passwordFormData.newPassword.length < 6) {
    setError('New password must be at least 6 characters long');
    return;
  }

  try {
    const response = await api.put('/doctors/profile/password', {
      currentPassword: passwordFormData.currentPassword,
      newPassword: passwordFormData.newPassword,
      confirmPassword: passwordFormData.confirmPassword
    });

    if (response.data.success) {
      showSuccessMessage('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength({ strength: '', score: 0, issues: [] });
    } else {
      setError(response.data.error || 'Failed to change password');
    }
  } catch (err) {
    console.error('Error changing password:', err);
    const errorMessage = err.response?.data?.error || 
                        err.response?.data?.message || 
                        'Failed to change password. Please try again.';
    setError(errorMessage);
  }
};

// Validate password strength (optional enhancement)
const validatePasswordStrength = async (password) => {
  if (!password || password.length === 0) {
    setPasswordStrength({ strength: '', score: 0, issues: [] });
    return;
  }

  try {
    const response = await api.post('/doctors/profile/validate-password', {
      password: password
    });
    
    setPasswordStrength({
      strength: response.data.strength || '',
      score: response.data.score || 0,
      issues: response.data.issues || []
    });
  } catch (err) {
    // Fallback client-side validation
    const issues = [];
    if (password.length < 8) issues.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) issues.push('One uppercase letter');
    if (!/[a-z]/.test(password)) issues.push('One lowercase letter');
    if (!/[0-9]/.test(password)) issues.push('One number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) issues.push('One special character');
    
    const score = Math.max(0, 100 - (issues.length * 20));
    const strength = score < 40 ? 'Weak' : score < 70 ? 'Fair' : score < 90 ? 'Good' : 'Strong';
    
    setPasswordStrength({ strength, score, issues });
  }
};

// Handle password input change with strength validation
const handlePasswordInputChange = (field, value) => {
  setPasswordFormData(prev => ({ ...prev, [field]: value }));
  
  // Validate strength for new password
  if (field === 'newPassword') {
    validatePasswordStrength(value);
  }
};

// Toggle password visibility
const togglePasswordVisibility = (field) => {
  setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
};

// Get password strength color
const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 'Weak': return 'text-red-600 bg-red-100';
    case 'Fair': return 'text-yellow-600 bg-yellow-100';
    case 'Good': return 'text-blue-600 bg-blue-100';
    case 'Strong': return 'text-green-600 bg-green-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

  // Handle profile image upload (keep existing)
  const handleProfileImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file
  if (file.size > 5 * 1024 * 1024) {
    setError('File size too large. Please select an image under 5MB.');
    return;
  }

  if (!file.type.startsWith('image/')) {
    setError('Please select a valid image file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log('Uploading profile image for doctor ID:', doctor.id);
    
    // 🎯 FIX 2: This endpoint already exists and works!
    await api.post(`/doctors/${doctor.id}/upload-profile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    showSuccessMessage('Profile image updated successfully');
    
    // 🎯 FIX 3: Use user.id for refresh (this works)
    const response = await api.get(`/doctors/by-user/${user.id}`);
    const updatedDoctor = Array.isArray(response.data) ? response.data[0] : response.data;
    setDoctor(updatedDoctor);
    
  } catch (err) {
    console.error('Error uploading profile image:', err);
    
    let errorMessage = 'Failed to upload profile image. Please try again.';
    
    if (err.response?.status === 413) {
      errorMessage = 'File size too large. Please select a smaller image.';
    } else if (err.response?.status === 415) {
      errorMessage = 'Invalid file format. Please select a valid image file.';
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    }
    
    setError(errorMessage);
  }
};

  // Medication management functions
  const addMedicationToPrescription = () => {
    setPrescriptionFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { 
        medicationName: '', 
        dosage: '', 
        frequency: 'Once daily', 
        duration: '7 days', 
        route: 'Oral',
        instructions: '',
        beforeMeal: false
      }]
    }));
  };

  const removeMedicationFromPrescription = (index) => {
    setPrescriptionFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedicationInPrescription = (index, field, value) => {
    setPrescriptionFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // ENHANCED OVERVIEW TAB - Now fully dynamic
  const renderOverviewTab = () => {
    const todayAppointments = appointments.filter(app => {
      const today = new Date();
      const appDate = new Date(app.appointmentDateTime);
      return appDate.toDateString() === today.toDateString();
    });

    const upcomingAppointments = appointments.filter(app => 
      app.status?.toLowerCase() === 'upcoming' || app.status?.toLowerCase() === 'scheduled'
    ).slice(0, 5);

    return (
      <div>
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome, Dr. {user?.firstName} {user?.lastName}!</h2>
          <p className="text-purple-100">Manage your patients and appointments from your dashboard.</p>
        </div>

        {/* DYNAMIC Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-xl p-3 mr-4">
                <i className="fas fa-calendar-day text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{dashboardStats.todayAppointments}</h3>
                <p className="text-gray-600">Today's Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-xl p-3 mr-4">
                <i className="fas fa-users text-green-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{dashboardStats.totalPatients}</h3>
                <p className="text-gray-600">Total Patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-xl p-3 mr-4">
                <i className="fas fa-clock text-purple-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{dashboardStats.upcomingAppointments}</h3>
                <p className="text-gray-600">Upcoming</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-xl p-3 mr-4">
                <i className="fas fa-check-circle text-orange-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{dashboardStats.completedAppointments}</h3>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC Today's Appointments with Video Join */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold">Today's Appointments</h3>
          </div>
          <div className="p-6">
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <img
                        src={getPatientProfileImage(appointment.patientData || { 
  gender: appointment.patientGender, 
  profileImage: appointment.patientProfileImage 
})}
                        alt={appointment.patientName}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="font-bold">{appointment.patientName}</h4>
                        <p className="text-gray-600 text-sm">{formatTime(appointment.appointmentDateTime)}</p>
                        <p className="text-gray-500 text-xs">Duration: {appointment.durationMinutes || 30} min</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.appointmentType === 'video' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {appointment.appointmentType === 'video' ? 'Video' : 'In-person'}
                      </span>
                      {appointment.appointmentType === 'video' && (
                        <Link
                          to={`/video-consultation/${appointment.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center"
                        >
                          <i className="fas fa-video mr-2"></i>
                          Join Call
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPatient({
                            id: appointment.patientId,
                            name: appointment.patientName,
                            email: appointment.patientEmail || '',
                            gender: appointment.patientGender || 'MALE'
                          });
                          setActiveTab('add-prescription');
                        }}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                      >
                        <i className="fas fa-prescription mr-1"></i>
                        Prescribe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-calendar-alt text-gray-300 text-4xl mb-3"></i>
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="bg-blue-100 rounded-xl p-4 inline-flex mb-4">
              <i className="fas fa-heartbeat text-blue-600 text-2xl"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Add Vital Signs</h3>
            <p className="text-gray-600 mb-4">Record patient vital signs</p>
            <button
              onClick={() => setActiveTab('add-vitals')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Vitals
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="bg-green-100 rounded-xl p-4 inline-flex mb-4">
              <i className="fas fa-prescription text-green-600 text-2xl"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Create Prescription</h3>
            <p className="text-gray-600 mb-4">Write patient prescriptions</p>
            <button
              onClick={() => setActiveTab('add-prescription')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Add Prescription
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="bg-purple-100 rounded-xl p-4 inline-flex mb-4">
              <i className="fas fa-file-medical text-purple-600 text-2xl"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Upload Medical Record</h3>
            <p className="text-gray-600 mb-4">Add patient medical records</p>
            <button
              onClick={() => setActiveTab('add-record')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Add Record
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 2. PATIENTS TAB - Enhanced with dynamic data
  const renderPatientsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Patients</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search patients..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        {filteredPatients.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredPatients.map(patient => (
              <div key={patient.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={getPatientProfileImage(patient)}
                    alt={patient.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{patient.name}</h3>
                    <p className="text-gray-600">{patient.email}</p>
                    <p className="text-gray-600">{patient.phone}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500 mr-4">
                        Age: {patient.age || 'N/A'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Blood Group: {patient.bloodGroup || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setActiveTab('add-vitals');
                    }}
                    className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition"
                  >
                    <i className="fas fa-heartbeat mr-1"></i>
                    Vitals
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setActiveTab('add-prescription');
                    }}
                    className="bg-green-100 text-green-600 px-3 py-2 rounded-lg hover:bg-green-200 transition"
                  >
                    <i className="fas fa-prescription mr-1"></i>
                    Prescription
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setActiveTab('add-record');
                    }}
                    className="bg-purple-100 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-200 transition"
                  >
                    <i className="fas fa-file-medical mr-1"></i>
                    Record
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <i className="fas fa-users text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">
              {searchTerm ? 'No patients found matching your search' : 'No patients found. Patients will appear here after they book appointments with you.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // 3. APPOINTMENTS TAB - Enhanced with video join functionality
  // REPLACE the renderAppointmentsTab function in your DoctorDashboardPage.jsx with this fixed version:

const renderAppointmentsTab = () => {
  const upcomingAppointments = appointments.filter(app => 
    app.status?.toLowerCase() === 'upcoming' || app.status?.toLowerCase() === 'scheduled'
  );
  const completedAppointments = appointments.filter(app => 
    app.status?.toLowerCase() === 'completed'
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Appointments</h2>

      {/* Upcoming Appointments */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Upcoming Appointments ({upcomingAppointments.length})</h3>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={getPatientProfileImage(appointment.patientData || { 
                        gender: appointment.patientGender, 
                        profileImage: appointment.patientProfileImage 
                      })}
                      alt={appointment.patientName}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-bold text-lg">{appointment.patientName}</h4>
                      <p className="text-gray-600">{formatDate(appointment.appointmentDateTime)} at {formatTime(appointment.appointmentDateTime)}</p>
                      <div className="flex items-center mt-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mr-2 ${
                          appointment.appointmentType === 'video' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {appointment.appointmentType === 'video' ? 'Video Consultation' : 'In-person Visit'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Duration: {appointment.durationMinutes || 30} min
                        </span>
                      </div>
                      {appointment.patientNotes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <i className="fas fa-sticky-note mr-1"></i>
                          {appointment.patientNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced Action Buttons with Mark Complete */}
                  <div className="flex flex-col space-y-2">
                    {appointment.appointmentType === 'video' && (
                      <Link
                        to={`/video-consultation/${appointment.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                      >
                        <i className="fas fa-video mr-2"></i>
                        Join Video Call
                      </Link>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
  const patientData = patients.find(p => p.id === appointment.patientId);
  setSelectedPatient(patientData || {
    id: appointment.patientId,
    name: appointment.patientName,
    email: appointment.patientEmail || '',
    gender: appointment.patientGender || 'MALE',
    profileImage: appointment.patientProfileImage
  });
  setPrescriptionFormData(prev => ({
    ...prev,
    appointmentId: appointment.id
  }));
  setActiveTab('add-prescription');
}}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        <i className="fas fa-prescription mr-1"></i>
                        Prescription
                      </button>
                      
                      <button
                        onClick={() => {
  const patientData = patients.find(p => p.id === appointment.patientId);
  setSelectedPatient(patientData || {
    id: appointment.patientId,
    name: appointment.patientName,
    email: appointment.patientEmail || '',
    gender: appointment.patientGender || 'MALE',
    profileImage: appointment.patientProfileImage
  });
  setActiveTab('add-vitals');
}}
                        className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                      >
                        <i className="fas fa-heartbeat mr-1"></i>
                        Vitals
                      </button>
                    </div>
                    
                    {/* Mark As Complete Button */}
                    <button
                      onClick={() => handleMarkComplete(appointment.id, appointment.patientName)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                    >
                      <i className="fas fa-check-circle mr-2"></i>
                      Mark As Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <i className="fas fa-calendar-alt text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        )}
      </div>

      {/* Completed Appointments - FIXED TO SHOW PROFILE IMAGES */}
      <div>
        <h3 className="text-lg font-bold mb-4">Recent Appointments ({completedAppointments.length})</h3>
        {completedAppointments.length > 0 ? (
          <div className="space-y-4">
            {completedAppointments.slice(0, 10).map(appointment => {
              // 🎯 FIX: Find the patient data from the patients array
              const patientData = patients.find(p => p.id === appointment.patientId) || {
                gender: appointment.patientGender || 'MALE',
                profileImage: appointment.patientProfileImage
              };

              return (
                <div key={appointment.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={getPatientProfileImage(patientData)}
                        alt={appointment.patientName}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.target.src = appointment.patientGender === 'FEMALE' 
                            ? '/images/Profile Photo Woman.jpg' 
                            : '/images/Profile Photo Man.jpg';
                        }}
                      />
                      <div>
                        <h4 className="font-bold text-lg">{appointment.patientName}</h4>
                        <p className="text-gray-600">{formatDate(appointment.appointmentDateTime)} at {formatTime(appointment.appointmentDateTime)}</p>
                        <div className="flex items-center mt-2">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mr-2 bg-green-100 text-green-800">
                            <i className="fas fa-check-circle mr-1"></i>
                            Completed
                          </span>
                          {appointment.completedAt && (
                            <span className="text-xs text-gray-500">
                              <i className="fas fa-clock mr-1"></i>
                              Completed on {formatDate(appointment.completedAt)}
                            </span>
                          )}
                        </div>
                        {/* Show patient details if available */}
                        {patientData && patientData.age && (
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 mr-3">
                              Age: {patientData.age}
                            </span>
                            {patientData.bloodGroup && (
                              <span className="text-xs text-gray-500">
                                Blood Group: {patientData.bloodGroup}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
  const patientData = patients.find(p => p.id === appointment.patientId);
  setSelectedPatient(patientData || {
    id: appointment.patientId,
    name: appointment.patientName,
    email: appointment.patientEmail || '',
    gender: appointment.patientGender || 'MALE',
    profileImage: appointment.patientProfileImage
  });
  setActiveTab('add-record');
}}
                        className="bg-purple-100 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-200 transition"
                      >
                        <i className="fas fa-file-medical mr-1"></i>
                        Add Record
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <i className="fas fa-history text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">No completed appointments</p>
          </div>
        )}
      </div>
    </div>
  );
};

  // 4. ADD VITALS TAB - Enhanced with better validation
  const renderAddVitalsTab = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Add Vital Signs</h2>

      {/* Patient Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">Select Patient</h3>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        {selectedPatient ? (
          <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={getPatientProfileImage(selectedPatient)}
                alt={selectedPatient.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-bold">{selectedPatient.name}</h4>
                <p className="text-gray-600">{selectedPatient.email}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-red-600 hover:text-red-800"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto">
            {filteredPatients.map(patient => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition"
              >
                <img
                  src={getPatientProfileImage(patient)}
                  alt={patient.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <h4 className="font-medium">{patient.name}</h4>
                  <p className="text-gray-600 text-sm">{patient.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Vital Signs Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-lg mb-4">Vital Signs Information</h3>
        <form onSubmit={handleVitalSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vital Type *</label>
              <select
                value={vitalFormData.vitalType}
                onChange={(e) => {
                  const selectedType = vitalTypesList.find(type => type.type === e.target.value);
                  setVitalFormData(prev => ({
                    ...prev,
                    vitalType: e.target.value,
                    unit: selectedType ? selectedType.unit : ''
                  }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              >
                <option value="">Select vital type</option>
                {vitalTypesList.map(type => (
                  <option key={type.type} value={type.type}>{type.type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
              <input
                type="text"
                value={vitalFormData.value}
                onChange={(e) => setVitalFormData(prev => ({ ...prev, value: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="e.g. 120/80, 98.6, 72"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                value={vitalFormData.unit}
                onChange={(e) => setVitalFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={vitalFormData.status}
                onChange={(e) => setVitalFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reading Date</label>
              <input
                type="date"
                value={vitalFormData.readingDate}
                onChange={(e) => setVitalFormData(prev => ({ ...prev, readingDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={vitalFormData.notes}
              onChange={(e) => setVitalFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              rows="3"
              placeholder="Additional notes or observations..."
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedPatient}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                selectedPatient
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-heartbeat mr-2"></i>
              Add Vital Signs
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 5. ADD PRESCRIPTION TAB - Enhanced with better medication management
  const renderAddPrescriptionTab = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create Prescription</h2>

      {/* Patient Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">Select Patient</h3>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        {selectedPatient ? (
          <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={getPatientProfileImage(selectedPatient)}
                alt={selectedPatient.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-bold">{selectedPatient.name}</h4>
                <p className="text-gray-600">{selectedPatient.email}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-red-600 hover:text-red-800"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto">
            {filteredPatients.map(patient => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition"
              >
                <img
                  src={getPatientProfileImage(patient)}
                  alt={patient.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <h4 className="font-medium">{patient.name}</h4>
                  <p className="text-gray-600 text-sm">{patient.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Prescription Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-lg mb-4">Prescription Details</h3>
        <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
          
          {/* Prescription Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid For (Days)</label>
              <input
                type="number"
                value={prescriptionFormData.validDays}
                onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, validDays: parseInt(e.target.value) || 30 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                min="1"
                max="365"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Appointment</label>
              <select
                value={prescriptionFormData.appointmentId}
                onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, appointmentId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Select appointment (optional)</option>
                {appointments.filter(app => selectedPatient && app.patientId === selectedPatient.id).map(appointment => (
                  <option key={appointment.id} value={appointment.id}>
                    {formatDate(appointment.appointmentDateTime)} - {formatTime(appointment.appointmentDateTime)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={prescriptionFormData.isRefillable}
                  onChange={(e) => setPrescriptionFormData(prev => ({ 
                    ...prev, 
                    isRefillable: e.target.checked,
                    refillCount: e.target.checked ? prev.refillCount : 0
                  }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Refillable</span>
              </label>
              {prescriptionFormData.isRefillable && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Refill Count</label>
                  <input
                    type="number"
                    value={prescriptionFormData.refillCount}
                    onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, refillCount: parseInt(e.target.value) || 0 }))}
                    className="w-20 p-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                    max="12"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Medications */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-700">Medications</h4>
              <button
                type="button"
                onClick={addMedicationToPrescription}
                className="bg-green-100 text-green-600 px-3 py-2 rounded-lg hover:bg-green-200 transition"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Medication
              </button>
            </div>

            {prescriptionFormData.medications.map((medication, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium">Medication {index + 1}</h5>
                  {prescriptionFormData.medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicationFromPrescription(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                    <input
                      type="text"
                      value={medication.medicationName}
                      onChange={(e) => updateMedicationInPrescription(index, 'medicationName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="e.g. Paracetamol"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => updateMedicationInPrescription(index, 'dosage', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="e.g. 500mg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                    <select
                      value={medication.frequency}
                      onChange={(e) => updateMedicationInPrescription(index, 'frequency', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      required
                    >
                      <option value="">Select frequency</option>
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Four times daily">Four times daily</option>
                      <option value="Every 4 hours">Every 4 hours</option>
                      <option value="Every 6 hours">Every 6 hours</option>
                      <option value="Every 8 hours">Every 8 hours</option>
                      <option value="As needed">As needed</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <select
                      value={medication.duration}
                      onChange={(e) => updateMedicationInPrescription(index, 'duration', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">Select duration</option>
                      <option value="3 days">3 days</option>
                      <option value="5 days">5 days</option>
                      <option value="7 days">7 days</option>
                      <option value="10 days">10 days</option>
                      <option value="14 days">14 days</option>
                      <option value="21 days">21 days</option>
                      <option value="1 month">1 month</option>
                      <option value="2 months">2 months</option>
                      <option value="3 months">3 months</option>
                      <option value="Continuous">Continuous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                    <select
                      value={medication.route}
                      onChange={(e) => updateMedicationInPrescription(index, 'route', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="Oral">Oral</option>
                      <option value="Topical">Topical</option>
                      <option value="Injection">Injection</option>
                      <option value="Inhalation">Inhalation</option>
                      <option value="Eye drops">Eye drops</option>
                      <option value="Ear drops">Ear drops</option>
                      <option value="Nasal">Nasal</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={medication.beforeMeal}
                        onChange={(e) => updateMedicationInPrescription(index, 'beforeMeal', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Take before meals</span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <textarea
                      value={medication.instructions}
                      onChange={(e) => updateMedicationInPrescription(index, 'instructions', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      rows="2"
                      placeholder="e.g. Take with food, avoid alcohol"
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
            <textarea
              value={prescriptionFormData.specialInstructions}
              onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              rows="2"
              placeholder="Special instructions for the entire prescription..."
            ></textarea>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={prescriptionFormData.notes}
              onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              rows="3"
              placeholder="Any additional notes for the patient or pharmacy..."
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedPatient || prescriptionFormData.medications.every(med => !med.medicationName)}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                selectedPatient && prescriptionFormData.medications.some(med => med.medicationName)
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-prescription mr-2"></i>
              Create Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 6. ADD MEDICAL RECORD TAB - Enhanced with better file handling
  const renderAddRecordTab = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Upload Medical Record</h2>

      {/* Patient Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">Select Patient</h3>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        {selectedPatient ? (
          <div className="bg-purple-50 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={getPatientProfileImage(selectedPatient)}
                alt={selectedPatient.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-bold">{selectedPatient.name}</h4>
                <p className="text-gray-600">{selectedPatient.email}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-red-600 hover:text-red-800"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto">
            {filteredPatients.map(patient => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition"
              >
                <img
                  src={getPatientProfileImage(patient)}
                  alt={patient.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <h4 className="font-medium">{patient.name}</h4>
                  <p className="text-gray-600 text-sm">{patient.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Medical Record Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-lg mb-4">Medical Record Information</h3>
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={recordFormData.title}
                onChange={(e) => setRecordFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="e.g. Blood Test Report, X-Ray Results"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={recordFormData.type}
                onChange={(e) => setRecordFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              >
                <option value="">Select type</option>
                <option value="Lab Test">Lab Test</option>
                <option value="Radiology">Radiology (X-Ray, MRI, CT)</option>
                <option value="Prescription">Prescription</option>
                <option value="Cardiac Test">Cardiac Test (ECG, Echo)</option>
                <option value="Consultation Notes">Consultation Notes</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Vaccination Record">Vaccination Record</option>
                <option value="Surgery Report">Surgery Report</option>
                <option value="Pathology Report">Pathology Report</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic</label>
              <input
                type="text"
                value={recordFormData.hospital}
                onChange={(e) => setRecordFormData(prev => ({ ...prev, hospital: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder={doctor?.hospitalAffiliation || "Hospital name"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
              <input
                type="file"
                onChange={(e) => setRecordFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.dicom"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG, DOC, DOCX, DICOM (Max: 10MB)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={recordFormData.notes}
              onChange={(e) => setRecordFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              rows="4"
              placeholder="Additional notes about this medical record, findings, recommendations..."
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedPatient || !recordFormData.file}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                selectedPatient && recordFormData.file
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-upload mr-2"></i>
              Upload Medical Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 7. PROFILE TAB - Enhanced with better organization
  const renderProfileTab = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Doctor Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center">
            <img
              src={getDoctorProfileImage(doctor)}
              alt={`Dr. ${user?.firstName} ${user?.lastName}`}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
            />
            <label className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-200 transition">
              Change Photo
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleProfileImageUpload}
              />
            </label>
            <h3 className="text-xl font-bold mt-4">Dr. {user?.firstName} {user?.lastName}</h3>
            <p className="text-purple-600">{doctor?.specialization}</p>
            <p className="text-gray-600">{doctor?.hospitalAffiliation}</p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center">
              <i className="fas fa-star text-yellow-400 mr-2"></i>
              <span>{doctor?.averageRating || '4.8'} Rating</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-users text-blue-500 mr-2"></i>
              <span>{dashboardStats.totalPatients} Patients</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-calendar text-green-500 mr-2"></i>
              <span>{dashboardStats.completedAppointments} Completed</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-clock text-purple-500 mr-2"></i>
              <span>{dashboardStats.upcomingAppointments} Upcoming</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={profileFormData.firstName}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={profileFormData.lastName}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileFormData.email}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileFormData.phone}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  value={profileFormData.specialization}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, specialization: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g. Cardiology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input
                  type="text"
                  value={profileFormData.education}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, education: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g. MBBS, MD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input
                  type="text"
                  value={profileFormData.experience}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g. 10 years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Affiliation</label>
                <input
                  type="text"
                  value={profileFormData.hospitalAffiliation}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, hospitalAffiliation: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g. City Hospital"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={profileFormData.consultationFee}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, consultationFee: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g. 500"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emergencyAvailable"
                  checked={profileFormData.isAvailableForEmergency}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, isAvailableForEmergency: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-2"
                />
                <label htmlFor="emergencyAvailable" className="text-sm font-medium text-gray-700">
                  Available for Emergency
                </label>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
              <textarea
                value={profileFormData.biography}
                onChange={(e) => setProfileFormData(prev => ({ ...prev, biography: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                rows="4"
                placeholder="Tell patients about yourself, your experience, and approach to medicine..."
              ></textarea>
            </div>
          </div>

          {/* NEW: Clinic Information Section */}
<div className="bg-white rounded-xl shadow-md p-6">
  <h3 className="font-bold text-lg mb-4">Clinic Information</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
      <input
        type="text"
        value={profileFormData.clinicName || ''}
        onChange={(e) => setProfileFormData(prev => ({ ...prev, clinicName: e.target.value }))}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        placeholder="e.g. City Health Clinic"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Phone</label>
      <input
        type="tel"
        value={profileFormData.clinicPhone || ''}
        onChange={(e) => setProfileFormData(prev => ({ ...prev, clinicPhone: e.target.value }))}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        placeholder="e.g. +91 9876543210"
      />
    </div>
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
      <textarea
        value={profileFormData.clinicAddress || ''}
        onChange={(e) => setProfileFormData(prev => ({ ...prev, clinicAddress: e.target.value }))}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        rows="2"
        placeholder="e.g. 123 Main Street, Medical Complex"
      ></textarea>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
      <input
        type="text"
        value={profileFormData.clinicCity || ''}
        onChange={(e) => setProfileFormData(prev => ({ ...prev, clinicCity: e.target.value }))}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        placeholder="e.g. Mumbai"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
      <input
        type="text"
        value={profileFormData.clinicState || ''}
        onChange={(e) => setProfileFormData(prev => ({ ...prev, clinicState: e.target.value }))}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        placeholder="e.g. Maharashtra"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
      <input
        type="text"
        value={profileFormData.clinicPincode || ''}
        onChange={(e) => setProfileFormData(prev => ({ ...prev, clinicPincode: e.target.value }))}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        placeholder="e.g. 400001"
        maxLength="6"
      />
    </div>
    <div className="flex items-center">
      <input
        type="checkbox"
        id="onlineConsultation"
        checked={profileFormData.onlineConsultation || false}
        onChange={(e) => setProfileFormData(prev => ({ ...prev, onlineConsultation: e.target.checked }))}
        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-2"
      />
      <label htmlFor="onlineConsultation" className="text-sm font-medium text-gray-700">
        Offer Online Consultations
      </label>
    </div>
  </div>
</div>

{/* NEW: Clinic Timings Section */}
<div className="bg-white rounded-xl shadow-md p-6">
  <h3 className="font-bold text-lg mb-4">Clinic Timings</h3>
  <div className="space-y-4">
    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
      <div key={day} className="flex items-center">
        <div className="w-24">
          <label className="text-sm font-medium text-gray-700">{day}:</label>
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={profileFormData[`${day.toLowerCase()}Timing`] || ''}
            onChange={(e) => setProfileFormData(prev => ({ 
              ...prev, 
              [`${day.toLowerCase()}Timing`]: e.target.value 
            }))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="e.g. 09:00-17:00 or Closed"
          />
        </div>
      </div>
    ))}
    <p className="text-sm text-gray-500 mt-2">
      Format: HH:MM-HH:MM (e.g. 09:00-17:00) or "Closed"
    </p>
  </div>
</div>

{/* NEW: Account Deletion Section */}
<div className="bg-red-50 border border-red-200 rounded-xl p-6">
  <h3 className="font-bold text-lg mb-4 text-red-800">Danger Zone</h3>
  <div className="space-y-4">
    <div>
      <h4 className="font-medium text-red-700 mb-2">Deactivate Account</h4>
      <p className="text-sm text-red-600 mb-3">
        Temporarily disable your account. You can reactivate it later by contacting support.
      </p>
      <button
        onClick={() => setShowDeactivateModal(true)}
        className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition"
      >
        Deactivate Account
      </button>
    </div>
    
    <div className="border-t border-red-200 pt-4">
      <h4 className="font-medium text-red-700 mb-2">Delete Account Permanently</h4>
      <p className="text-sm text-red-600 mb-3">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <button
        onClick={() => setShowDeleteModal(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
      >
        Delete Account Permanently
      </button>
    </div>
  </div>
</div>

          {/* Save Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="bg-red-100 text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-200 transition"
            >
              <i className="fas fa-key mr-2"></i>
              Change Password
            </button>
            
            <button
              onClick={handleProfileUpdate}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              <i className="fas fa-save mr-2"></i>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
// Password Change Modal
const renderPasswordChangeModal = () => {
  if (!showPasswordModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
          <button
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setPasswordStrength({ strength: '', score: 0, issues: [] });
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwordFormData.currentPassword}
                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordFormData.newPassword}
                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Enter your new password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {passwordFormData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 'Weak' ? 'bg-red-500 w-1/4' :
                        passwordStrength.strength === 'Fair' ? 'bg-yellow-500 w-2/4' :
                        passwordStrength.strength === 'Good' ? 'bg-blue-500 w-3/4' :
                        passwordStrength.strength === 'Strong' ? 'bg-green-500 w-full' : 'w-0'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getPasswordStrengthColor(passwordStrength.strength)}`}>
                    {passwordStrength.strength}
                  </span>
                </div>
                {passwordStrength.issues.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-medium">Password should include:</p>
                    <ul className="mt-1 space-y-1">
                      {passwordStrength.issues.map((issue, index) => (
                        <li key={index} className="flex items-center">
                          <i className="fas fa-times text-red-400 text-xs mr-2"></i>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordFormData.confirmPassword}
                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {passwordFormData.confirmPassword && passwordFormData.newPassword !== passwordFormData.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                <i className="fas fa-times mr-1"></i>
                Passwords do not match
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordStrength({ strength: '', score: 0, issues: [] });
              }}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !passwordFormData.currentPassword || 
                !passwordFormData.newPassword || 
                !passwordFormData.confirmPassword ||
                passwordFormData.newPassword !== passwordFormData.confirmPassword ||
                passwordFormData.newPassword.length < 6
              }
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                passwordFormData.currentPassword && 
                passwordFormData.newPassword && 
                passwordFormData.confirmPassword &&
                passwordFormData.newPassword === passwordFormData.confirmPassword &&
                passwordFormData.newPassword.length >= 6
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-key mr-2"></i>
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
  
  // Main render
  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 pb-16 flex flex-col items-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-24 right-4 z-50 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md flex items-start max-w-md">
            <div className="text-green-500 mr-3">
              <i className="fas fa-check-circle text-xl"></i>
            </div>
            <div className="flex-grow">
              <p className="font-bold">Success!</p>
              <p>{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-green-500 hover:text-green-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <div className="fixed top-24 right-4 z-50 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md flex items-start max-w-md">
            <div className="text-red-500 mr-3">
              <i className="fas fa-exclamation-circle text-xl"></i>
            </div>
            <div className="flex-grow">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex">
              {tabOptions.map(tab => (
                <button
                  key={tab.id}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {(() => {
            switch (activeTab) {
              case 'overview': return renderOverviewTab();
              case 'patients': return renderPatientsTab();
              case 'appointments': return renderAppointmentsTab();
              case 'add-vitals': return renderAddVitalsTab();
              case 'add-prescription': return renderAddPrescriptionTab();
              case 'add-record': return renderAddRecordTab();
              case 'profile': return renderProfileTab();
              default: return renderOverviewTab();
            }
          })()}
        </div>
      </div>
      {renderPasswordChangeModal()}
      {renderDeleteAccountModal()}
    {renderDeactivateAccountModal()}
    </div>
  );
};
export default DoctorDashboardPage;