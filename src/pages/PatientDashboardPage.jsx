import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
// Tab options for the dashboard
const tabOptions = [
  { id: 'overview', label: 'Overview' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'records', label: 'Medical Records' },
  { id: 'medications', label: 'Medications' },
  { id: 'vitals', label: 'Vital Signs' },
  { id: 'profile', label: 'Profile' }
];

const PatientDashboardPage = () => {
  const location = useLocation();
  const { user, token } = useContext(AuthContext);  // Use AuthContext for user info
  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [medications, setMedications] = useState([]);
  const [vitalReadings, setVitalReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if coming from payment page with success
    if (location.state?.paymentSuccess) {
      setSuccessMessage('Appointment booked successfully! You will receive a confirmation email shortly.');
      setShowSuccessToast(true);
      
      // Hide success toast after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    // Only fetch data if user is logged in and token exists
    if (user && token) {
      fetchPatientData();
    }
  }, [user, token]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Step 1: Get patient data linked to current user
      const patientResponse = await axios.get(`/api/patients/by-user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!patientResponse.data) {
        throw new Error('No patient profile found for this user');
      }
      
      const patientData = patientResponse.data;
      
      // Format patient data
      setPatient({
        id: patientData.id,
        name: `${user.firstName} ${user.lastName}`,
        age: calculateAge(patientData.dateOfBirth),
        gender: patientData.gender,
        bloodGroup: patientData.bloodGroup,
        email: user.email,
        phone: user.phoneNumber,
        address: patientData.address || 'Address not set',
        profileImage: user.profileImage || `/assets/images/patients/default-patient.jpg`
      });
      
      // Step 2: Fetch appointments for this patient
      const appointmentsResponse = await axios.get(`/api/appointments/patient/${patientData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(transformAppointments(appointmentsResponse.data));
      
      // Step 3: Fetch medical records
      const recordsResponse = await axios.get(`/api/medical-records/patient/${patientData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const recordsData = recordsResponse.data;
      setMedicalRecords(transformMedicalRecords(recordsData));
      
      // Step 4: Extract medications from medical records (prescription type)
      const medicationsData = recordsData.filter(record => record.recordType === 'PRESCRIPTION');
      setMedications(transformMedications(medicationsData));
      
      // Step 5: Extract vital signs from medical records
      const vitalsData = recordsData.filter(record => 
        record.temperature || record.heartRate || record.bloodPressure || 
        record.oxygenSaturation || record.weight
      );
      setVitalReadings(transformVitals(vitalsData));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setError(error.message || 'Failed to load patient data');
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const transformAppointments = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    return data.map(appointment => {
      // Get doctor data safely
      const doctor = appointment.doctor || {};
      const doctorUser = doctor.user || {};
      
      return {
        id: appointment.id,
        doctorName: `${doctorUser.firstName || 'Dr.'} ${doctorUser.lastName || ''}`,
        doctorSpecialty: doctor.specialization || 'Specialist',
        doctorImage: doctor.profileImage || '/assets/images/doctors/default-doctor.jpg',
        date: new Date(appointment.appointmentDateTime),
        time: new Date(appointment.appointmentDateTime).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: (appointment.status || 'SCHEDULED').toLowerCase(),
        type: (appointment.type === 'VIDEO_CALL' || appointment.appointmentType === 'VIDEO_CALL') ? 'video' : 'in-person',
        hospital: doctor.hospitalAffiliation || 'Online Consultation'
      };
    });
  };
  
  const transformMedicalRecords = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    return data.map(record => {
      // Get doctor data safely
      const doctor = record.doctor || {};
      const doctorUser = doctor.user || {};
      
      return {
        id: record.id,
        title: record.title || `Medical Record #${record.id}`,
        type: formatRecordType(record.recordType || 'OTHER'),
        date: new Date(record.recordDate || record.createdAt),
        doctor: `${doctorUser.firstName || 'Dr.'} ${doctorUser.lastName || ''}`,
        hospital: doctor.hospitalAffiliation || 'Not specified',
        file: record.fileName,
        fileUrl: record.fileUrl
      };
    });
  };
  
  const formatRecordType = (type) => {
    if (!type) return 'Other';
    
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  const transformMedications = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    return data.map(medication => {
      // Get doctor data safely
      const doctor = medication.doctor || {};
      const doctorUser = doctor.user || {};
      
      // Try to extract dosage and frequency from description
      let dosage = '500mg';
      let frequency = '3 times daily';
      
      if (medication.description) {
        const dosageMatch = medication.description.match(/(\d+\s*(?:mg|mcg|g|ml))/i);
        if (dosageMatch) dosage = dosageMatch[0];
        
        const frequencyMatch = medication.description.match(/(once|twice|three times|four times|daily|every \d+ hours)/i);
        if (frequencyMatch) frequency = frequencyMatch[0];
      }
      
      // Calculate remaining days (default to 30 if not specified)
      const createdDate = new Date(medication.createdAt);
      const today = new Date();
      const daysSinceCreated = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.max(0, 30 - daysSinceCreated);
      
      return {
        id: medication.id,
        name: medication.title || 'Prescription',
        dosage: dosage,
        frequency: frequency,
        startDate: new Date(medication.createdAt),
        endDate: new Date(medication.createdAt),
        prescribedBy: `${doctorUser.firstName || 'Dr.'} ${doctorUser.lastName || ''}`,
        remainingDays: remainingDays,
        instructions: medication.description || 'Take as directed by your doctor.'
      };
    });
  };
  
  const transformVitals = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    return data.map(vital => ({
      type: getVitalType(vital),
      value: getVitalValue(vital),
      date: new Date(vital.recordDate || vital.createdAt),
      status: determineVitalStatus(vital)
    }));
  };
  
  const getVitalType = (vital) => {
    if (vital.temperature) return 'Temperature';
    if (vital.heartRate) return 'Heart Rate';
    if (vital.bloodPressure) return 'Blood Pressure';
    if (vital.oxygenSaturation) return 'Oxygen Saturation';
    if (vital.weight) return 'Weight';
    return 'Other';
  };
  
  const getVitalValue = (vital) => {
    if (vital.temperature) return `${vital.temperature} °C`;
    if (vital.heartRate) return `${vital.heartRate} bpm`;
    if (vital.bloodPressure) return vital.bloodPressure;
    if (vital.oxygenSaturation) return `${vital.oxygenSaturation}%`;
    if (vital.weight) return `${vital.weight} kg`;
    return 'N/A';
  };
  
  const determineVitalStatus = (vital) => {
    // Temperature
    if (vital.temperature) {
      if (vital.temperature < 36.5) return 'low';
      if (vital.temperature > 37.5) return 'high';
      return 'normal';
    }
    
    // Heart Rate
    if (vital.heartRate) {
      if (vital.heartRate < 60) return 'low';
      if (vital.heartRate > 100) return 'high';
      return 'normal';
    }
    
    // Blood Pressure (simplistic check)
    if (vital.bloodPressure) {
      const systolic = parseInt(vital.bloodPressure.split('/')[0]);
      if (systolic < 90) return 'low';
      if (systolic > 140) return 'high';
      return 'normal';
    }
    
    // Oxygen Saturation
    if (vital.oxygenSaturation) {
      if (vital.oxygenSaturation < 95) return 'low';
      return 'normal';
    }
    
    return 'normal';
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'appointments':
        return renderAppointmentsTab();
      case 'records':
        return renderMedicalRecordsTab();
      case 'medications':
        return renderMedicationsTab();
      case 'vitals':
        return renderVitalsTab();
      case 'profile':
        return renderProfileTab();
      default:
        return renderOverviewTab();
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Rest of the component can remain the same with the tab rendering functions
  
  // Overview Tab Content
  const renderOverviewTab = () => {
    // Filter upcoming appointments
    const upcomingAppointments = appointments.filter(app => 
      app.status === 'scheduled' || app.status === 'confirmed'
    ).sort((a, b) => a.date - b.date);
    
    const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
    
    // ... rest of the renderOverviewTab function ...
    
    return (
      <div>
        {/* Welcome Section */}
        <div className="bg-gradient-primary text-white p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome, {patient?.name}!</h2>
          <p className="text-indigo-100">Here's a summary of your health information and upcoming appointments.</p>
        </div>
        
        {/* ... rest of the JSX with next appointment, health overview, etc ... */}
      </div>
    );
  };
  
  // Similar updates for other tab content methods...
  
  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
            <h2 className="text-2xl font-bold mb-2">Error Loading Patient Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchPatientData}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no patient was found for the logged in user
  if (!patient) {
    return (
      <div className="pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <i className="fas fa-user-md text-purple-500 text-4xl mb-4"></i>
            <h2 className="text-2xl font-bold mb-2">No Patient Profile Found</h2>
            <p className="text-gray-600 mb-4">You need to create a patient profile to access this dashboard.</p>
            <Link 
              to="/create-patient-profile"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
            >
              Create Patient Profile
            </Link>
          </div>
        </div>
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
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        <div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;