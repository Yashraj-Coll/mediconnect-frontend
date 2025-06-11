import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_BASE_URL = "http://localhost:8080/mediconnect";


function getUnitFromType(type) {
  switch (type) {
    case 'Blood Pressure': return 'mmHg';
    case 'Blood Sugar': return 'mg/dL';
    case 'Heart Rate': return 'bpm';
    case 'Weight': return 'kg';
    case 'Temperature': return '°C';
    case 'Oxygen Saturation': return '%';
    case 'Respiratory Rate': return 'breaths/min';
    default: return '';
  }
}




// Axios instance 
const api = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  // Bearer Token
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  
  const sessionToken = localStorage.getItem('session_token');
  if (sessionToken) config.headers['X-Session-Id'] = sessionToken;
  
  return config;
});

const tabOptions = [
  { id: 'overview', label: 'Overview' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'records', label: 'Medical Records' },
  { id: 'medications', label: 'Medications' },
  { id: 'vitals', label: 'Vital Signs' },
  { id: 'profile', label: 'Profile' }
];

const vitalTypesList = [
  { type: 'Blood Pressure', unit: 'mmHg' },
  { type: 'Blood Sugar', unit: 'mg/dL' },
  { type: 'Heart Rate', unit: 'bpm' },
  { type: 'Weight', unit: 'kg' },
  { type: 'Temperature', unit: '°C' },
  { type: 'Oxygen Saturation', unit: '%' }
];

const PatientDashboardPage = () => {
  
  const location = useLocation();
  const navigate = useNavigate();

  // Top-level state
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vitalReadings, setVitalReadings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Medical Records Tab
  const [selectedRecordType, setSelectedRecordType] = useState('all');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFormVisible, setUploadFormVisible] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({ title: '', type: '', hospital: '', notes: '' });

  // Vitals Tab
  const [activeVitalType, setActiveVitalType] = useState('Blood Pressure');
  const [newVitalFormVisible, setNewVitalFormVisible] = useState(false);
  const [newVitalFormData, setNewVitalFormData] = useState({ readingType: '', readingValue: '', readingUnit: '', notes: '' });

  // Profile Tab
  const [profileFormData, setProfileFormData] = useState(null);

  // Add these state variables if missing
const [isEditing, setIsEditing] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [showPasswordChange, setShowPasswordChange] = useState(false);
const [passwordValidation, setPasswordValidation] = useState({
  isValid: false,
  errors: []
});

// Password Change State (add these after existing state)
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

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Add these new state variables for password visibility
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// Password strength validation
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("One special character");
  
  const score = Math.max(0, 100 - (errors.length * 20));
  const strength = score < 40 ? 'Weak' : score < 70 ? 'Fair' : score < 90 ? 'Good' : 'Strong';
  
  return { strength, score, issues: errors };
};

// Handle password change
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
  
  if (passwordFormData.newPassword.length < 8) {
    setError('New password must be at least 8 characters long');
    return;
  }

  try {
    const response = await api.post('/auth/change-password', {
      currentPassword: passwordFormData.currentPassword,
      newPassword: passwordFormData.newPassword,
      confirmPassword: passwordFormData.confirmPassword
    });

    setSuccessMessage('Password changed successfully');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
    
    setShowPasswordModal(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordStrength({ strength: '', score: 0, issues: [] });
  } catch (err) {
    console.error('Error changing password:', err);
    const errorMessage = err.response?.data?.message || 'Failed to change password. Please try again.';
    setError(errorMessage);
  }
};

// Handle password input change with strength validation
const handlePasswordInputChange = (field, value) => {
  setPasswordFormData(prev => ({ ...prev, [field]: value }));
  
  if (field === 'newPassword') {
    setPasswordStrength(validatePassword(value));
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

  // Toast for payment success
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setSuccessMessage('Appointment booked successfully! You will receive a confirmation email shortly.');
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Fetch user and patient
  useEffect(() => {
    const fetchUserAndPatient = async () => {
      try {
        setLoading(true);
        const userResponse = await api.get('/auth/current-user');
        setUser(userResponse.data);

        const patientResponse = await api.get(`/patients/by-user/${userResponse.data.id}`);
const patientObj = Array.isArray(patientResponse.data) ? patientResponse.data[0] : patientResponse.data;
setPatient(patientObj);
console.log('Loaded patient:', patientObj);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user profile. Please try again later.');
        setLoading(false);
      }
    };
    fetchUserAndPatient();
  }, []);

  // Fetch all patient data after patient loads
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patient || !patient.id) return;
      try {
        setLoading(true);
        const [
          appointmentsResponse,
          medicalRecordsResponse,
          prescriptionsResponse,
          vitalsResponse
        ] = await Promise.all([
          api.get(`/appointments/patient/${patient.id}`),
          api.get(`/medical-records/patient/${patient.id}`),
          api.get(`/prescriptions/patient/${patient.id}`),
          api.get(`/vital-signs/patient/${patient.id}/latest`)
        ]);
        setAppointments(appointmentsResponse.data || []);
        setMedicalRecords(medicalRecordsResponse.data || []);
        setPrescriptions(prescriptionsResponse.data || []);
         const mappedVitals = (vitalsResponse.data || []).map(vital => ({
  id: vital.id,
  readingType: vital.vitalType,         // yeh
  readingValue: vital.value,            // yeh
  readingUnit: getUnitFromType(vital.vitalType), // custom function, neeche diya hai
  readingStatus: vital.status,          // yeh
  notes: vital.notes,
  readingDate: vital.readingDate,
}));
setVitalReadings(mappedVitals);


      setLoading(false);
    } catch (err) {
      setError('Failed to fetch patient data. Please try again later.');
      setLoading(false);
    }
  };
  fetchPatientData();
}, [patient]);

  // Initialize profile form after data load
  useEffect(() => {
    if (user && patient) {
      setProfileFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        allergies: patient.allergies || '',
        chronicDiseases: patient.chronicDiseases || '',
        emergencyContact: patient.emergencyContactNumber || '',
      });
    }
  }, [user, patient]);

   // Replace the existing handleProfileImageUpload function with this enhanced version
const handleProfileImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    setError('Please upload a valid image file (JPEG, PNG, or GIF)');
    return;
  }

  // Validate file size (max 5MB) - FIXED: file.size not file.getSize()
  if (file.size > 5 * 1024 * 1024) {
    setError('Image size should be less than 5MB');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  
  try {
    await api.post(`/patients/${patient.id}/upload-profile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    setSuccessMessage('Profile image updated successfully');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);

    // Refresh patient data to get updated profile image - FIXED: patient.userId not patient.userId
    const response = await api.get(`/patients/by-user/${user.id}`);
    const updatedPatient = Array.isArray(response.data) ? response.data[0] : response.data;
    setPatient(updatedPatient);
  } catch (err) {
    setError('Failed to upload profile image. Please try again.');
  }
};

  // For patient profile image:
const getPatientProfileImage = (patient) => {
  if (patient?.profileImage) {
    return `${BACKEND_BASE_URL}/uploads/${patient.profileImage}`;
  }
  if (patient?.gender === 'FEMALE') {
    return '/images/Profile Photo Woman.jpg'; // ya jahan default image rakha ho
  }
  return '/images/Profile Photo Man.jpg';
};


  // Replace the existing handleProfileInputChange function
const handleProfileInputChange = (event) => {
  const { name, value, type, checked } = event.target;
  setProfileFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));

  // Clear any existing errors when user starts typing
  if (error) {
    setError(null);
  }
};



// Replace the existing handleProfileUpdate function with this enhanced version
const handleEnhancedProfileUpdate = async () => {
  try {
    // Validate required fields
    if (!profileFormData.firstName?.trim() || !profileFormData.lastName?.trim()) {
      setError('First name and last name are required');
      return;
    }

    // Validate email format
    if (!isValidEmail(profileFormData.email)) {
      setError('Please enter a valid email address');
      return;
    }


    // Prepare emergency contact data
    let emergencyContactName = '';
    let emergencyContactNumber = '';
    if (profileFormData.emergencyContact) {
      const contactParts = profileFormData.emergencyContact.split('-').map(str => str.trim());
      emergencyContactName = contactParts[0] || '';
      emergencyContactNumber = contactParts[1] || contactParts[0] || '';
    }

    const updateData = {
      firstName: profileFormData.firstName.trim(),
      lastName: profileFormData.lastName.trim(),
      email: profileFormData.email.trim(),
      phoneNumber: profileFormData.phone.trim(),
      dateOfBirth: profileFormData.dateOfBirth,
      gender: profileFormData.gender,
      bloodGroup: profileFormData.bloodGroup,
      allergies: profileFormData.allergies,
      chronicDiseases: profileFormData.chronicDiseases,
      emergencyContactName: emergencyContactName,
      emergencyContactNumber: emergencyContactNumber,
    };

    // Update User
    await api.put(`/users/${user.id}`, {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      email: updateData.email,
      phoneNumber: updateData.phoneNumber,
    });

    // Update Patient
    await api.put(`/patients/${patient.id}`, {
      dateOfBirth: updateData.dateOfBirth,
      gender: updateData.gender,
      bloodGroup: updateData.bloodGroup,
      allergies: updateData.allergies,
      chronicDiseases: updateData.chronicDiseases,
      emergencyContactName: updateData.emergencyContactName,
      emergencyContactNumber: updateData.emergencyContactNumber
    });

    setSuccessMessage('Profile updated successfully');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
    setIsEditing(false);
    setShowPasswordChange(false);
    
    // Refresh user data
    const userResponse = await api.get('/auth/current-user');
    setUser(userResponse.data);
    const patientResponse = await api.get(`/patients/by-user/${userResponse.data.id}`);
    const updatedPatient = Array.isArray(patientResponse.data) ? patientResponse.data[0] : patientResponse.data;
    setPatient(updatedPatient);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
  }
};

// Add these new functions right after handleEnhancedProfileUpdate
const handleDeleteAccount = async () => {
  try {
    console.log('🚀 Starting enhanced dynamic account deletion process...');
    
    // Enhanced confirmation with clear warning
    const confirmMessage = `⚠️ DELETE ACCOUNT PERMANENTLY ⚠️\n\n` +
                          `This will automatically scan and delete ALL related data from the entire database.\n` +
                          `The enhanced system will:\n` +
                          `• Remove ALL traces of your account from entire database\n` +
                          `This action CANNOT be undone!\n\n` +
                          `Type "DELETE EVERYTHING" to confirm:`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput !== "DELETE EVERYTHING") {
      alert("Account deletion cancelled. Please type 'DELETE EVERYTHING' exactly to confirm.");
      return;
    }

    const patientId = patient?.id;
    const userId = user?.id;

    if (!patientId) {
      alert("❌ Cannot delete account: Patient information not found");
      return;
    }

    console.log('📊 Patient ID:', patientId, 'User ID:', userId);

    // Step 1: Get deletion preview (helpful for debugging)
    try {
      console.log('🔍 Getting deletion preview...');
      const previewResponse = await api.get(`/patients/${patientId}/deletion-preview`);
      console.log('📋 Deletion preview:', previewResponse.data);
      
      if (previewResponse.data.totalRowsToDelete > 0) {
        console.log(`📊 Will delete ${previewResponse.data.totalRowsToDelete} rows from ${Object.keys(previewResponse.data.tablesAffected).length} tables`);
      }
    } catch (previewError) {
      console.log('⚠️ Could not get deletion preview, proceeding anyway...');
      console.log('Preview error details:', previewError.response?.data);
    }

    // Step 2: Perform enhanced dynamic cascade deletion
    console.log('🗑️ Performing enhanced dynamic cascade deletion...');
    
    // Show loading indicator
    const loadingAlert = "🔄 Deleting account... Please wait and do not close this page.\n\nThis may take a few moments as the system deletes all related data.";
    
    // Use a more user-friendly approach
    const isConfirmed = window.confirm(loadingAlert + "\n\nClick OK to proceed with deletion.");
    if (!isConfirmed) {
      alert("Deletion cancelled by user.");
      return;
    }
    
    try {
      const deleteResponse = await api.delete(`/patients/${patientId}`);
      
      console.log('✅ Delete response received:', deleteResponse.status, deleteResponse.data);
      
      if (deleteResponse.status === 200 || deleteResponse.status === 204) {
        console.log('✅ Enhanced dynamic deletion completed successfully');
        console.log('📊 Deletion results:', deleteResponse.data);
        
        // Step 3: Clean up and redirect
        console.log('🧹 Cleaning up local storage...');
        
        // Clear all stored data
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear any cached data
        if (window.caches) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
        
        // Show success message
        const successMessage = deleteResponse.data?.message || 'Account deleted successfully with enhanced cascade deletion';
        const detailsMessage = deleteResponse.data?.enhancedDeletion ? 
          '\n\nEnhanced Features Used:\n• Dynamic constraint detection\n• Optimized deletion order\n• Orphaned records cleanup' : 
          '';
        
        alert(`✅ SUCCESS!\n\n${successMessage}${detailsMessage}\n\nAll your data has been permanently removed from the system.\n\nYou will now be redirected to the home page.`);
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          // Force a complete page reload to clear any remaining state
          window.location.href = '/';
        }, 2000);
        
      } else {
        throw new Error(`Unexpected response status: ${deleteResponse.status}`);
      }
      
    } catch (deleteError) {
      throw deleteError; // Re-throw to be handled by outer catch
    }

  } catch (error) {
    console.error('❌ Error during enhanced dynamic account deletion:', error);
    
    // Enhanced error handling with specific error types
    let errorMessage = 'Account deletion failed';
    let technicalDetails = '';
    let suggestedAction = '';
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      technicalDetails = `HTTP Status: ${status}`;
      
      if (status === 404) {
        errorMessage = 'Account not found';
        suggestedAction = 'Your account may have already been deleted. Try logging out and checking if you can still log in.';
        
        // Offer to logout
        const shouldLogout = window.confirm(
          '🔍 Account Not Found\n\n' +
          'Your account may have already been deleted.\n\n' +
          'Would you like to logout and return to the login page?'
        );
        
        if (shouldLogout) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }
        return;
        
      } else if (status === 403) {
        errorMessage = 'Permission denied';
        suggestedAction = 'You may not have permission to delete this account. Please contact support.';
        
      } else if (status === 500) {
        errorMessage = 'Server error during enhanced deletion process';
        technicalDetails += `\nServer Error: ${data.error || 'Internal server error'}`;
        
        // Check for specific constraint violations
        if (data.error && data.error.includes('foreign key constraint')) {
          errorMessage = 'Database constraint error detected';
          suggestedAction = 'There was an issue with the database deletion sequence. Please contact support with the technical details below.';
          technicalDetails += '\nIssue: Foreign key constraint violation during deletion';
        } else if (data.error && data.error.includes('transaction')) {
          suggestedAction = 'A database transaction error occurred. Please try again in a few minutes.';
        } else {
          suggestedAction = 'An unexpected server error occurred. Please contact support if this persists.';
        }
        
      } else {
        errorMessage = `Deletion failed with status ${status}`;
        technicalDetails += `\nResponse: ${data.error || data.message || 'Unknown error'}`;
        suggestedAction = 'Please try again or contact support if the issue persists.';
      }
    } else if (error.message) {
      errorMessage = error.message;
      technicalDetails = 'Network or client-side error';
      
      if (error.message.includes('Network Error')) {
        suggestedAction = 'Please check your internet connection and try again.';
      } else {
        suggestedAction = 'A network error occurred. Please try again.';
      }
    }
    
    // Show comprehensive error message
    const fullErrorMessage = `❌ ENHANCED DELETION FAILED\n\n${errorMessage}\n\n` +
                             `The enhanced dynamic system attempted to:\n` +
                             `• Detect all foreign key relationships\n` +
                             `• Calculate optimal deletion order\n` +
                             `• Delete data with constraint handling\n` +
                             `• Clean up orphaned records\n\n` +
                             `However, an error occurred during this process.\n\n` +
                             `${suggestedAction}\n\n` +
                             `Technical Details: ${technicalDetails}`;
    
    alert(fullErrorMessage);
    
    // Ask user if they want to logout for security
    const shouldLogout = window.confirm(
      '🔒 Security Logout Option\n\n' +
      'For security purposes, would you like to be logged out?\n\n' +
      'This will clear your session data, but your account may still exist in the system.\n\n' +
      'Click OK to logout, or Cancel to stay logged in and try again.'
    );
    
    if (shouldLogout) {
      console.log('🔒 User chose security logout after deletion failure');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  }
};
const handleCancelEdit = () => {
  // Reset form data to original values
  if (user && patient) {
    setProfileFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      bloodGroup: patient.bloodGroup || '',
      allergies: patient.allergies || '',
      chronicDiseases: patient.chronicDiseases || '',
      emergencyContact: patient.emergencyContactNumber || '',
    });
  }
  setIsEditing(false);
  setShowPasswordChange(false);
  setPasswordValidation({ isValid: false, errors: [] });
};

  // Tab change handler
  const handleTabChange = (tabId) => setActiveTab(tabId);

  // Helper utilities
  const calculateRemainingDays = (validUntil) => {
    if (!validUntil) return 0;
    const validDate = new Date(validUntil);
    const today = new Date();
    const diffTime = validDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getDoctorName = (appointment) => {
    if (!appointment || !appointment.doctorName) {
      if (appointment?.doctor?.user?.firstName && appointment?.doctor?.user?.lastName) {
        return `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
      }
      return 'Unknown Doctor';
    }
    return appointment.doctorName;
  };

  const getDoctorImage = (appointment) => {
  const profileImage = appointment.doctorProfileImage;
  const gender = appointment.doctorGender || 'MALE';
  if (!profileImage || profileImage.trim() === '') {
    return gender === 'FEMALE'
      ? '/images/Female Doctor.jpg'
      : '/images/Male Doctor.jpg';
  }
  if (
    profileImage.includes('default-profile.jpg') ||
    profileImage.includes('/assets/images/')
  ) {
    return gender === 'FEMALE'
      ? '/images/Female Doctor.jpg'
      : '/images/Male Doctor.jpg';
  }
  return `http://localhost:8080/mediconnect/uploads/${profileImage}`;
};



  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'high': case 'elevated': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  

  // --- START TAB RENDER FUNCTIONS ---

  // 1. OVERVIEW TAB
  const renderOverviewTab = () => {
    const upcomingAppointments = (appointments ?? []).filter(app => app.status?.toLowerCase() === 'upcoming');
    const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
    const activePrescriptions = (prescriptions ?? []).filter(prescription => {
      if (!prescription.validUntil) return true;
      const validUntil = new Date(prescription.validUntil);
      return validUntil > new Date();
    });
    return (
      <div>
        <div className="bg-gradient-primary text-white p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user?.firstName} {user?.lastName}!</h2>
          <p className="text-indigo-100">Here's a summary of your health information and upcoming appointments.</p>
        </div>
        {/* Next Appointment & Health Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Next Appointment Card */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-purple-50 p-4 border-b border-purple-100">
              <h3 className="font-bold text-purple-800">Next Appointment</h3>
            </div>
            <div className="p-6">
              {nextAppointment ? (
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <img
                    src={getDoctorImage(nextAppointment)}
                    alt={getDoctorName(nextAppointment)}
                    className="w-16 h-16 rounded-full object-cover mb-4 md:mb-0 md:mr-4"
                  />
                  <div className="flex-grow">
                    <h4 className="font-bold text-lg">{getDoctorName(nextAppointment)}</h4>
                    <p className="text-purple-600">{nextAppointment?.doctor?.specialization || nextAppointment?.doctorSpecialization || 'Specialist'}</p>
                    <div className="flex flex-wrap items-center mt-2 text-gray-600">
                      <div className="flex items-center mr-6 mb-2">
                        <i className="far fa-calendar mr-2"></i>
                        <span>{formatDate(nextAppointment.appointmentDateTime)}</span>
                      </div>
                      <div className="flex items-center mr-6 mb-2">
                        <i className="far fa-clock mr-2"></i>
                        <span>{formatTime(nextAppointment.appointmentDateTime)}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <i className={`fas fa-${nextAppointment.appointmentType === 'video' ? 'video' : 'hospital'} mr-2`}></i>
                        <span>{nextAppointment.appointmentType === 'video' ? 'Video Consultation' : 'In-person Visit'}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/video-consultation/${nextAppointment.id}`}
                    className="mt-4 md:mt-0 bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition text-center"
                  >
                    Join Consultation
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="far fa-calendar-plus text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500">No upcoming appointments</p>
                  <Link
                    to="/doctors"
                    className="mt-4 inline-block bg-gradient-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
                  >
                    Book Appointment
                  </Link>
                </div>
              )}
            </div>
          </div>
          {/* Health Overview Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-50 p-4 border-b border-blue-100">
              <h3 className="font-bold text-blue-800">Health Overview</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(vitalReadings ?? []).slice(0, 3).map((vital, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{vital.readingType}</span>
                    <div className="flex items-center">
                      <span className={`font-medium ${vital.readingStatus?.toLowerCase() === 'normal' ? 'text-green-600' : 'text-red-600'}`}>
                        {vital.readingValue} {vital.readingUnit}
                      </span>
                      {vital.readingStatus?.toLowerCase() === 'normal' && (
                        <i className="fas fa-check-circle text-green-500 ml-2"></i>
                      )}
                      {vital.readingStatus?.toLowerCase() === 'elevated' && (
                        <i className="fas fa-arrow-up text-red-500 ml-2"></i>
                      )}
                      {vital.readingStatus?.toLowerCase() === 'low' && (
                        <i className="fas fa-arrow-down text-red-500 ml-2"></i>
                      )}
                    </div>
                  </div>
                ))}
                {(vitalReadings ?? []).length === 0 && (
                  <p className="text-gray-500 text-center">No vital signs recorded</p>
                )}
              </div>
              <button
                onClick={() => setActiveTab('vitals')}
                className="mt-4 w-full text-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Vitals <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
        {/* Recent Medications & Records */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Medications */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-green-50 p-4 border-b border-green-100">
              <h3 className="font-bold text-green-800">Current Medications</h3>
            </div>
            <div className="p-4">
              {activePrescriptions.length > 0 && activePrescriptions[0].prescriptionItems && activePrescriptions[0].prescriptionItems.length > 0 ? (
                <div className="space-y-4">
                  {activePrescriptions.slice(0, 2).flatMap(prescription =>
                    prescription.prescriptionItems?.slice(0, 2).map(item => (
                      <div key={item.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{item.medicationName}</h4>
                            <p className="text-gray-600 text-sm">{item.dosage} - {item.frequency}</p>
                          </div>
                          <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            {calculateRemainingDays(prescription.validUntil)} days left
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No current medications</p>
              )}
              <button
                onClick={() => setActiveTab('medications')}
                className="mt-2 w-full text-center text-green-600 hover:text-green-800 font-medium"
              >
                View All Medications <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>
          {/* Recent Medical Records */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-orange-50 p-4 border-b border-orange-100">
              <h3 className="font-bold text-orange-800">Recent Medical Records</h3>
            </div>
            <div className="p-4">
              {(medicalRecords ?? []).length > 0 ? (
                <div className="space-y-4">
                  {(medicalRecords ?? []).slice(0, 2).map(record => (
                    <div key={record.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{record.title}</h4>
                          <p className="text-gray-600 text-sm">{record.type} - {formatDate(record.recordDate)}</p>
                        </div>
                        <button
                          onClick={() => window.open(`/api/medical-records/download/${record.documentPath.split('/').pop()}`, '_blank')}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No medical records</p>
              )}
              <button
                onClick={() => setActiveTab('records')}
                className="mt-2 w-full text-center text-orange-600 hover:text-orange-800 font-medium"
              >
                View All Records <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
        {/* AI Health Assistant */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
          <div className="p-6 flex flex-col md:flex-row items-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
              <i className="fas fa-robot text-indigo-600 text-2xl"></i>
            </div>
            <div className="flex-grow text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">AI Health Assistant</h3>
              <p className="text-gray-600">Get answers to your health questions, medication reminders, and personalized health insights.</p>
            </div>
            <Link
              to="/ai-chat"
              className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition"
            >
              Chat Now
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // 2. APPOINTMENTS TAB
  const renderAppointmentsTab = () => {
    const upcomingAppointments = (appointments ?? []).filter(app => app.status?.toLowerCase() === 'upcoming');
    const completedAppointments = (appointments ?? []).filter(app => app.status?.toLowerCase() === 'completed');
    const cancelledAppointments = (appointments ?? []).filter(app => app.status?.toLowerCase() === 'cancelled');

    const handleCancelAppointment = async (appointmentId) => {
      try {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
          await api.put(`/appointments/${appointmentId}/status/cancelled`);
          setAppointments(prev =>
            (prev ?? []).map(app => app.id === appointmentId ? { ...app, status: 'cancelled' } : app)
          );
          setSuccessMessage('Appointment cancelled successfully');
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 5000);
        }
      } catch (err) {
        setError('Failed to cancel appointment. Please try again.');
      }
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Appointments</h2>
          <Link
            to="/doctors"
            className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition"
          >
            Book New Appointment
          </Link>
        </div>
        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Upcoming Appointments</h3>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row items-start">
                    <img
                      src={getDoctorImage(appointment)}
                      alt={getDoctorName(appointment)}
                      className="w-16 h-16 rounded-full object-cover mb-4 md:mb-0 md:mr-4"
                    />
                    <div className="flex-grow">
                      <h4 className="font-bold text-lg">{getDoctorName(appointment)}</h4>
                      <p className="text-purple-600">{appointment.doctorSpecialization || 'Specialist'}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-gray-600">
                        <div className="flex items-center">
                          <i className="far fa-calendar mr-2"></i>
                          <span>{formatDate(appointment.appointmentDateTime)}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="far fa-clock mr-2"></i>
                          <span>{formatTime(appointment.appointmentDateTime)}</span>
                        </div>
                        <div className="flex items-center">
                          <i className={`fas fa-${appointment.appointmentType === 'video' ? 'video' : 'hospital'} mr-2`}></i>
                          <span>{appointment.appointmentType === 'video' ? 'Video Consultation' : 'In-person Visit'}</span>
                        </div>
                        <div className="flex items-center md:col-span-3">
                          <i className="fas fa-hospital mr-2"></i>
                          <span>{appointment.doctorHospitalAffiliation || 'Hospital'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                      {appointment.appointmentType === 'video' && (
                        <Link
                          to={`/video-consultation/${appointment.id}`}
                          className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition text-center"
                        >
                          Join Consultation
                        </Link>
                      )}
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <i className="far fa-calendar-plus text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">No upcoming appointments</p>
              <Link
                to="/doctors"
                className="mt-4 inline-block bg-gradient-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
              >
                Book Appointment
              </Link>
            </div>
          )}
        </div>
        {/* Past Appointments */}
<div className="mb-8">
  <h3 className="text-lg font-bold mb-4">Past Appointments</h3>
  {completedAppointments.length > 0 ? (
    <div className="space-y-4">
      {completedAppointments.map(appointment => (
        <div key={appointment.id} className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row items-start">
            <img
              src={getDoctorImage(appointment)}
              alt={getDoctorName(appointment)}
              className="w-16 h-16 rounded-full object-cover mb-4 md:mb-0 md:mr-4"
            />
            <div className="flex-grow">
              <h4 className="font-bold text-lg">{getDoctorName(appointment)}</h4>
              {/* SPECIALIZATION FIX */}
              <p className="text-purple-600">
                {appointment.doctorSpecialization ||
                 appointment?.doctor?.specialization ||
                 'Specialist'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-gray-600">
                <div className="flex items-center">
                  <i className="far fa-calendar mr-2"></i>
                  <span>{formatDate(appointment.appointmentDateTime)}</span>
                </div>
                <div className="flex items-center">
                  <i className="far fa-clock mr-2"></i>
                  <span>{formatTime(appointment.appointmentDateTime)}</span>
                </div>
                <div className="flex items-center">
                  <i className={`fas fa-${appointment.appointmentType === 'video' ? 'video' : 'hospital'} mr-2`}></i>
                  <span>{appointment.appointmentType === 'video' ? 'Video Consultation' : 'In-person Visit'}</span>
                </div>
                {/* HOSPITAL AFFILIATION FIX */}
                <div className="flex items-center md:col-span-3">
                  <i className="fas fa-hospital mr-2"></i>
                  <span>
                    {appointment.doctorHospitalAffiliation ||
                     appointment?.doctor?.hospitalAffiliation ||
                     'Hospital'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                Completed
              </span>
              {appointment.medicalRecordId && (
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  View Summary
                </button>
              )}
              <Link
                to="/doctors"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Book Follow-up
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <p className="text-gray-500">No past appointments</p>
    </div>
  )}
</div>

        {/* Cancelled Appointments */}
        {cancelledAppointments.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4">Cancelled Appointments</h3>
            <div className="space-y-4">
              {cancelledAppointments.map(appointment => (
                <div key={appointment.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row items-start">
                    <img
                      src={getDoctorImage(appointment)}
                      alt={getDoctorName(appointment)}
                      className="w-16 h-16 rounded-full object-cover mb-4 md:mb-0 md:mr-4"
                    />
                    <div className="flex-grow">
                      <h4 className="font-bold text-lg">{getDoctorName(appointment)}</h4>
                      <p className="text-purple-600">{appointment.doctorSpecialization || 'Specialist'}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-gray-600">
                        <div className="flex items-center">
                          <i className="far fa-calendar mr-2"></i>
                          <span>{formatDate(appointment.appointmentDateTime)}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="far fa-clock mr-2"></i>
                          <span>{formatTime(appointment.appointmentDateTime)}</span>
                        </div>
                        <div className="flex items-center">
                          <i className={`fas fa-${appointment.appointmentType === 'video' ? 'video' : 'hospital'} mr-2`}></i>
                          <span>{appointment.appointmentType === 'video' ? 'Video Consultation' : 'In-person Visit'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                      <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                        Cancelled
                      </span>
                      <Link
                        to="/doctors"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Reschedule
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  // 3. MEDICAL RECORDS TAB
  const renderMedicalRecordsTab = () => {
    // Get unique types for filter
    const recordTypes = [...new Set((medicalRecords ?? []).map(record => record.type))].filter(Boolean);
    // Filtered records
    const filteredRecords = selectedRecordType === 'all'
      ? (medicalRecords ?? [])
      : (medicalRecords ?? []).filter(record => record.type === selectedRecordType);

    // Upload handlers
    const handleFileChange = (event) => setUploadFile(event.target.files[0]);
    const handleInputChange = (event) => {
      const { name, value } = event.target;
      setUploadFormData(prev => ({
        ...prev, [name]: value
      }));
    };

    const handleUpload = async (event) => {
      event.preventDefault();
      if (!uploadFile) {
        alert('Please select a file to upload');
        return;
      }
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('patientId', patient.id);
      formData.append('doctorId', patient?.appointments?.[0]?.doctor?.id || 1); // fallback doctorId=1
      formData.append('title', uploadFormData.title);
      formData.append('type', uploadFormData.type);
      formData.append('hospital', uploadFormData.hospital);
      formData.append('notes', uploadFormData.notes);
      try {
        const response = await api.post('/medical-records/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMedicalRecords(prev => [response.data, ...(prev ?? [])]);
        setUploadFile(null);
        setUploadFormData({ title: '', type: '', hospital: '', notes: '' });
        setUploadFormVisible(false);
        setSuccessMessage('Medical record uploaded successfully');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
      } catch (err) {
        setError('Failed to upload medical record. Please try again.');
      }
    };

    const handleDownload = (record) => {
      if (record.documentPath) {
        const filename = record.documentPath.split('/').pop();
        window.open(`/api/medical-records/download/${filename}`, '_blank');
      }
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Medical Records</h2>
          <button
            onClick={() => setUploadFormVisible(!uploadFormVisible)}
            className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition"
          >
            <i className="fas fa-upload mr-2"></i>
            {uploadFormVisible ? 'Cancel Upload' : 'Upload New Record'}
          </button>
        </div>

        {/* Upload Form */}
        {uploadFormVisible && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Upload Medical Record</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={uploadFormData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Type *</label>
                  <select
                    name="type"
                    value={uploadFormData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select a type</option>
                    <option value="Lab Test">Lab Test</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Cardiac Test">Cardiac Test</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Hospital/Clinic</label>
                  <input
                    type="text"
                    name="hospital"
                    value={uploadFormData.hospital}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">File *</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={uploadFormData.notes}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
                >
                  Upload Record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Record Type Filter */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRecordType('all')}
            className={`${selectedRecordType === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-3 py-1 rounded-full text-sm font-medium transition`}
          >
            All Records
          </button>
          {recordTypes.map((type, index) => (
            <button
              key={index}
              onClick={() => setSelectedRecordType(type)}
              className={`${selectedRecordType === type ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-3 py-1 rounded-full text-sm font-medium transition`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Records List */}
        {filteredRecords.length > 0 ? (
          <div className="space-y-4">
            {filteredRecords.map(record => (
              <div key={record.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row items-start">
                  <div className="bg-purple-100 rounded-xl p-3 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                    {record.type === 'Lab Test' && <i className="fas fa-flask text-2xl text-purple-600"></i>}
                    {record.type === 'Radiology' && <i className="fas fa-x-ray text-2xl text-purple-600"></i>}
                    {record.type === 'Prescription' && <i className="fas fa-prescription text-2xl text-purple-600"></i>}
                    {record.type === 'Cardiac Test' && <i className="fas fa-heartbeat text-2xl text-purple-600"></i>}
                    {!['Lab Test', 'Radiology', 'Prescription', 'Cardiac Test'].includes(record.type) && (
                      <i className="fas fa-file-medical text-2xl text-purple-600"></i>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-lg">{record.title}</h4>
                    <p className="text-purple-600">{record.type}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-gray-600">
                      <div className="flex items-center">
                        <i className="far fa-calendar mr-2"></i>
                        <span>{formatDate(record.recordDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-user-md mr-2"></i>
                        <span>
                        {record.doctorName ? `Dr. ${record.doctorName}` : 'Doctor'}                        
                        </span>
                      </div>
                      <div className="flex items-center md:col-span-2">
                        <i className="fas fa-hospital mr-2"></i>
                        <span>{record.hospital}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex md:flex-col gap-3">
                    <button
                      onClick={() => handleDownload(record)}
                      className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition"
                    >
                      <i className="fas fa-download mr-2"></i>
                      Download
                    </button>
                    <button
                      onClick={() => {
                        // Email share
                        const subject = `Medical Record: ${record.title}`;
                        const body = `Please find attached the medical record from ${record.hospital} dated ${formatDate(record.recordDate)}.`;
                        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      }}
                      className="border border-purple-200 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition"
                    >
                      <i className="fas fa-share-alt mr-2"></i>
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <i className="fas fa-file-medical text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">No medical records found</p>
            <button
              onClick={() => setUploadFormVisible(true)}
              className="mt-4 inline-block bg-gradient-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
            >
              Upload Your First Record
            </button>
          </div>
        )}
      </div>
    );
  };

  // 4. MEDICATIONS TAB
  const renderMedicationsTab = () => {
    const activePrescriptions = (prescriptions ?? []).filter(prescription => {
      if (!prescription.validUntil) return true;
      const validUntil = new Date(prescription.validUntil);
      return validUntil > new Date();
    });
    const pastPrescriptions = (prescriptions ?? []).filter(prescription => {
      if (!prescription.validUntil) return false;
      const validUntil = new Date(prescription.validUntil);
      return validUntil <= new Date();
    });

    // Reminder handler
    const toggleReminder = async (prescriptionId) => {
      try {
        await api.post(`/prescriptions/${prescriptionId}/reminder`);
        setSuccessMessage('Medication reminder set successfully');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
      } catch (err) {
        setError('Failed to set medication reminder. Please try again.');
      }
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Medications</h2>
          <button
            onClick={() => window.open('/medication-reminders', '_blank')}
            className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition"
          >
            <i className="fas fa-bell mr-2"></i>
            Set Reminders
          </button>
        </div>

        {/* Active Medications */}
        <h3 className="text-lg font-bold mb-4">Current Medications</h3>
        {activePrescriptions.length > 0 ? (
          <div className="space-y-4 mb-8">
            {activePrescriptions.map(prescription => (
              <div key={prescription.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-green-50 p-3 border-b border-green-100">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-green-800">
                      Prescription from {prescription.doctorName ? `Dr. ${prescription.doctorName}` : 'Doctor'}
                    </h4>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Valid until {formatDate(prescription.validUntil)}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  {prescription.prescriptionItems && prescription.prescriptionItems.length > 0 ? (
                    <div className="space-y-8">
                      {prescription.prescriptionItems.map(item => (
                        <div key={item.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-xl">{item.medicationName}</h4>
                              <p className="text-purple-600">{item.dosage}</p>
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              Active
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h5 className="text-sm text-gray-500 mb-1">Frequency</h5>
                              <p className="text-gray-700">{item.frequency}</p>
                            </div>
                            <div>
                              <h5 className="text-sm text-gray-500 mb-1">Prescribed By</h5>
                              <p className="text-gray-700">
                                {prescription.doctorName ? `Dr. ${prescription.doctorName}` : 'Doctor'}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-sm text-gray-500 mb-1">Start Date</h5>
                              <p className="text-gray-700">{formatDate(prescription.prescriptionDate)}</p>
                            </div>
                            <div>
                              <h5 className="text-sm text-gray-500 mb-1">End Date</h5>
                              <p className="text-gray-700">{formatDate(prescription.validUntil)}</p>
                            </div>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <h5 className="text-sm font-medium text-blue-800 mb-1">Instructions</h5>
                            <p className="text-blue-700">{item.instructions || 'Take as directed.'}</p>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-gray-600 mr-2">Remaining:</span>
                              <span className="font-semibold text-green-600">{calculateRemainingDays(prescription.validUntil)} days</span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleReminder(prescription.id)}
                                className="text-purple-600 hover:text-purple-800"
                                title="Set Reminder"
                              >
                                <i className="fas fa-bell"></i>
                              </button>
                              <button
                                onClick={() => window.open(`/prescriptions/${prescription.id}`, '_blank')}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Prescription"
                              >
                                <i className="fas fa-prescription"></i>
                              </button>
                              {prescription.isRefillable && prescription.refillCount > 0 && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.post(`/prescriptions/${prescription.id}/refill`);
                                      setPrescriptions(prev =>
                                        (prev ?? []).map(p =>
                                          p.id === prescription.id
                                            ? { ...p, refillCount: p.refillCount - 1 }
                                            : p
                                        )
                                      );
                                      setSuccessMessage('Prescription refilled successfully');
                                      setShowSuccessToast(true);
                                      setTimeout(() => setShowSuccessToast(false), 5000);
                                    } catch (err) {
                                      setError('Failed to refill prescription. Please try again.');
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                  title="Refill Prescription"
                                >
                                  <i className="fas fa-sync-alt"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No medication details available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center mb-8">
            <i className="fas fa-prescription-bottle text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">No current medications</p>
          </div>
        )}

        {/* Medication History */}
        <h3 className="text-lg font-bold mb-4">Medication History</h3>
        {pastPrescriptions.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Medication</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Dosage</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Prescribed By</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Start Date</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pastPrescriptions.flatMap(prescription =>
                    prescription.prescriptionItems?.map(item => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-4 px-6 font-medium">{item.medicationName}</td>
                        <td className="py-4 px-6">{item.dosage}</td>
                        <td className="py-4 px-6">
                          {prescription.doctorName ? `Dr. ${prescription.doctorName}` : 'Doctor'}
                        </td>
                        <td className="py-4 px-6">{formatDate(prescription.prescriptionDate)}</td>
                        <td className="py-4 px-6">{formatDate(prescription.validUntil)}</td>
                      </tr>
                    )) || []
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">No medication history available</p>
          </div>
        )}
      </div>
    );
  };

    // 5. VITALS TAB (FULL)
  const renderVitalsTab = () => {
    const typeVitals = (vitalReadings ?? []).filter(vital =>
      vital.readingType?.toUpperCase() === activeVitalType.toUpperCase()
    );

    const handleVitalInputChange = (event) => {
      const { name, value } = event.target;
      setNewVitalFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (name === 'readingType') {
        const selectedType = vitalTypesList.find(t => t.type === value);
        if (selectedType) {
          setNewVitalFormData(prev => ({
            ...prev,
            readingUnit: selectedType.unit
          }));
        }
      }
    };

    const handleAddVital = async (event) => {
      event.preventDefault();
      try {
        const vitalData = {
          patientId: patient.id,
          readingType: newVitalFormData.readingType,
          readingValue: newVitalFormData.readingValue,
          readingUnit: newVitalFormData.readingUnit,
          notes: newVitalFormData.notes,
          readingDate: new Date().toISOString()
        };

        const response = await api.post('/vital-signs', vitalData);
        setVitalReadings(prev => [response.data, ...(prev ?? [])]);
        setNewVitalFormData({
          readingType: '',
          readingValue: '',
          readingUnit: '',
          notes: ''
        });
        setNewVitalFormVisible(false);
        setSuccessMessage('Vital sign added successfully');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
      } catch (err) {
        setError('Failed to add vital sign. Please try again.');
      }
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Vital Signs</h2>
          <button
            onClick={() => setNewVitalFormVisible(!newVitalFormVisible)}
            className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition"
          >
            <i className="fas fa-plus mr-2"></i>
            {newVitalFormVisible ? 'Cancel' : 'Add New Reading'}
          </button>
        </div>
        {/* Add New Vital Form */}
        {newVitalFormVisible && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Add New Vital Reading</h3>
            <form onSubmit={handleAddVital} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Reading Type *</label>
                  <select
                    name="readingType"
                    value={newVitalFormData.readingType}
                    onChange={handleVitalInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select vital type</option>
                    {vitalTypesList.map((type, index) => (
                      <option key={index} value={type.type}>{type.type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Reading Value *</label>
                  <input
                    type="text"
                    name="readingValue"
                    value={newVitalFormData.readingValue}
                    onChange={handleVitalInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                    placeholder="e.g. 120/80, 98.6, 72"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    name="readingUnit"
                    value={newVitalFormData.readingUnit}
                    onChange={handleVitalInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={newVitalFormData.notes}
                    onChange={handleVitalInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. After exercise, Before meal"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Latest Readings */}
        <h3 className="text-lg font-bold mb-4">Latest Readings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {(vitalReadings ?? []).slice(0, 6).map((vital, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-700">{vital.readingType}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(vital.readingStatus)}`}>
                    {vital.readingStatus ? vital.readingStatus.charAt(0).toUpperCase() + vital.readingStatus.slice(1).toLowerCase() : 'Normal'}
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-3">{vital.readingValue} {vital.readingUnit}</div>
                <div className="text-sm text-gray-500">
                  <i className="far fa-calendar-alt mr-1"></i>
                  {formatDate(vital.readingDate)}
                </div>
              </div>
            </div>
          ))}
          {(vitalReadings ?? []).length === 0 && (
            <div className="md:col-span-3 bg-white rounded-xl shadow-md p-8 text-center">
              <i className="fas fa-heartbeat text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">No vital readings recorded</p>
              <button
                onClick={() => setNewVitalFormVisible(true)}
                className="mt-4 inline-block bg-gradient-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
              >
                Add Your First Reading
              </button>
            </div>
          )}
        </div>

        {/* Vitals History */}
        {(vitalReadings ?? []).length > 0 && (
          <>
            <h3 className="text-lg font-bold mb-4">History</h3>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Tabs for vital types */}
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {vitalTypesList.map((vitalType, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveVitalType(vitalType.type)}
                      className={`px-6 py-3 ${
                        activeVitalType === vitalType.type
                          ? 'border-b-2 border-purple-600 font-medium text-purple-600'
                          : 'font-medium text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {vitalType.type}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="p-6">
                {/* Graph Placeholder */}
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <i className="fas fa-chart-line text-3xl text-gray-300 mb-2"></i>
                    <p className="text-gray-500">{activeVitalType} History Chart</p>
                  </div>
                </div>
                {/* History Table */}
                {typeVitals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Reading</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {typeVitals.map((vital, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4">{formatDate(vital.readingDate)}</td>
                            <td className="py-3 px-4">{formatTime(vital.readingDate)}</td>
                            <td className="py-3 px-4 font-medium">{vital.readingValue} {vital.readingUnit}</td>
                            <td className="py-3 px-4">
                              <span className={`${getStatusClass(vital.readingStatus)} px-2 py-1 rounded-full text-xs font-medium`}>
                                {vital.readingStatus ? vital.readingStatus.charAt(0).toUpperCase() + vital.readingStatus.slice(1).toLowerCase() : 'Normal'}
                              </span>
                            </td>
                            <td className="py-3 px-4">{vital.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No {activeVitalType} readings recorded</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // 6. PROFILE TAB (FULL)
const renderProfileTab = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profile & Settings</h2>
        <div className="flex space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit Profile
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <i className="fas fa-trash mr-2"></i>
                Delete Account
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEnhancedProfileUpdate}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <i className="fas fa-save mr-2"></i>
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Details */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-purple-50 p-4 border-b border-purple-100">
            <h3 className="font-bold text-purple-800 flex items-center">
              <i className="fas fa-user mr-2"></i>
              Personal Details
              {isEditing && (
                <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Editing Mode
                </span>
              )}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row mb-6">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={getPatientProfileImage(patient)}
                      alt={`${profileFormData?.firstName} ${profileFormData?.lastName}`}
                      className="w-32 h-32 rounded-full object-cover mb-3 border-4 border-purple-100"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer transition">
                        <i className="fas fa-camera"></i>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                        />
                      </label>
                    )}
                  </div>
                  {!isEditing && (
                    <label className="text-purple-600 hover:text-purple-800 text-sm font-medium cursor-pointer">
                      Change Photo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileFormData?.firstName || ''}
                      onChange={handleProfileInputChange}
                      disabled={!isEditing}
                      className={`w-full p-3 border rounded-lg transition ${
                        isEditing 
                          ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileFormData?.lastName || ''}
                      onChange={handleProfileInputChange}
                      disabled={!isEditing}
                      className={`w-full p-3 border rounded-lg transition ${
                        isEditing 
                          ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileFormData?.email || ''}
                      onChange={handleProfileInputChange}
                      disabled={!isEditing}
                      className={`w-full p-3 border rounded-lg transition ${
                        isEditing 
                          ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileFormData?.phone || ''}
                      onChange={handleProfileInputChange}
                      disabled={!isEditing}
                      className={`w-full p-3 border rounded-lg transition ${
                        isEditing 
                          ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileFormData?.dateOfBirth || ''}
                      onChange={handleProfileInputChange}
                      disabled={!isEditing}
                      className={`w-full p-3 border rounded-lg transition ${
                        isEditing 
                          ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={profileFormData?.gender || ''}
                      onChange={handleProfileInputChange}
                      disabled={!isEditing}
                      className={`w-full p-3 border rounded-lg transition ${
                        isEditing 
                          ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={profileFormData?.bloodGroup || ''}
                      onChange={handleProfileInputChange}
                      disabled={!isEditing}
                      className={`w-full p-3 border rounded-lg transition ${
                        isEditing 
                          ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information & Settings */}
        <div className="space-y-6">
          {/* Medical Information */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-50 p-4 border-b border-blue-100">
              <h3 className="font-bold text-blue-800 flex items-center">
                <i className="fas fa-heartbeat mr-2"></i>
                Medical Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-exclamation-triangle text-yellow-500 mr-1"></i>
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={profileFormData?.allergies || ''}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  placeholder="List any allergies (e.g., Penicillin, Peanuts, etc.)"
                  rows="3"
                  className={`w-full p-3 border rounded-lg transition resize-none ${
                    isEditing 
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-notes-medical text-red-500 mr-1"></i>
                  Chronic Conditions
                </label>
                <textarea
                  name="chronicDiseases"
                  value={profileFormData?.chronicDiseases || ''}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  placeholder="List any chronic conditions (e.g., Diabetes, Hypertension, etc.)"
                  rows="3"
                  className={`w-full p-3 border rounded-lg transition resize-none ${
                    isEditing 
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-phone text-green-500 mr-1"></i>
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={profileFormData?.emergencyContact || ''}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  placeholder="Emergency contact number"
                  className={`w-full p-3 border rounded-lg transition ${
                    isEditing 
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
<div className="bg-white rounded-xl shadow-md overflow-hidden">
  <div className="bg-green-50 p-4 border-b border-green-100">
    <h3 className="font-bold text-green-800 flex items-center">
      <i className="fas fa-cog mr-2"></i>
      Account Settings
    </h3>
  </div>
  <div className="p-6">
    {/* Password Change Section */}
    <div className="flex justify-between items-center">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          <i className="fas fa-lock mr-1"></i>
          Password
        </label>
        <p className="text-sm text-gray-500 mt-1">Change your account password</p>
      </div>
      <button
        onClick={() => setShowPasswordModal(true)}
        className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition font-medium"
      >
        <i className="fas fa-key mr-2"></i>
        Change Password
      </button>
    </div>
  </div>
  </div>
      </div>
</div>


      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data including medical records, appointments, and personal information.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Password Change Modal */}
      {showPasswordModal && (
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
                    passwordFormData.newPassword.length < 8
                  }
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                    passwordFormData.currentPassword && 
                    passwordFormData.newPassword && 
                    passwordFormData.confirmPassword &&
                    passwordFormData.newPassword === passwordFormData.confirmPassword &&
                    passwordFormData.newPassword.length >= 8
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
      )}
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
          className="bg-gradient-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="pt-14 pb-16 bg-gray-50">
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
              case 'appointments': return renderAppointmentsTab();
              case 'records': return renderMedicalRecordsTab();
              case 'medications': return renderMedicationsTab();
              case 'vitals': return renderVitalsTab();
              case 'profile': return renderProfileTab();
              default: return renderOverviewTab();
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;