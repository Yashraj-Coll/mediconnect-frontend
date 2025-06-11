import React, { useState, useEffect } from 'react';
import DoctorService from '../services/DoctorService';
import AdminService from '../services/AdminService';
import { API_BASE_URL } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, UserPlus, User, Calendar, Activity, Star, Edit, Trash2, Plus, Search, Filter, Eye, X, Shield, EyeOff } from 'lucide-react';

const getDeleteButtonTooltip = (admin, currentUser, adminCount) => {
  if (admin.id === currentUser?.id) {
    return "Cannot delete your own account";
  }
  if (adminCount <= 1) {
    return "Cannot delete the last admin";
  }
  return "Delete Admin";
};
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  //const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  //const [editingDoctor, setEditingDoctor] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Helper function to get the correct image URL
  const getImageUrl = (profileImage, gender) => {
    if (!profileImage) {
      return gender === 'FEMALE' ? '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg';
    }
    if (profileImage.includes('default-profile.jpg') || profileImage.includes('/assets/images/')) {
      return gender === 'FEMALE' ? '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg';
    }
    return `${API_BASE_URL}/uploads/${profileImage}`;
  };

  // Helper function for patient profile images
  const getPatientImageUrl = (profileImage, gender) => {
    if (!profileImage) {
      return gender === 'FEMALE' ? '/images/Profile Photo Woman.jpg' : '/images/Profile Photo Man.jpg';
    }
    return `${API_BASE_URL}/uploads/${profileImage}`;
  };

  // Fetch doctors from database
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const result = await DoctorService.getAllDoctors();
      
      if (result.success && result.data) {
        let doctorsData = result.data;
        
        if (!Array.isArray(doctorsData)) {
          if (doctorsData.data && Array.isArray(doctorsData.data)) {
            doctorsData = doctorsData.data;
          } else if (doctorsData.content && Array.isArray(doctorsData.content)) {
            doctorsData = doctorsData.content;
          } else if (doctorsData.doctors && Array.isArray(doctorsData.doctors)) {
            doctorsData = doctorsData.doctors;
          }
        }
        
        const formattedDoctors = doctorsData.map(doctor => ({
          ...doctor,
          name: `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Unknown Doctor',
          profileImage: getImageUrl(doctor.profileImage, doctor.gender)
        }));
        
        setDoctors(formattedDoctors);
        setError('');
      } else {
        setError(result.error || 'Failed to load doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

const deleteDoctor = async (doctorId, doctorName) => {
  try {
    console.log('🗑️ Attempting to delete doctor:', doctorId);
    
    const result = await DoctorService.deleteDoctor(doctorId);
    
    if (result.success) {
      console.log('✅ Doctor deleted successfully');
      // Refresh the doctors list
      fetchDoctors();
      // Also refresh dashboard stats
      fetchDashboardStats();
      // Show success message
      alert(`Doctor "${doctorName}" has been deleted successfully.`);
    } else {
      console.error('❌ Failed to delete doctor:', result.error);
      alert('Failed to delete doctor: ' + result.error);
    }
  } catch (err) {
    console.error('❌ Error deleting doctor:', err);
    alert('Error deleting doctor. Please try again.');
  }
};

  // Fetch patients from database (FIXED - using ROLE_PATIENT)
const fetchPatients = async () => {
  try {
    setLoading(true);
    console.log('🔄 Fetching patients via AdminService...');
    
    const result = await AdminService.getAllPatients();
    
    if (result.success) {
      console.log('✅ Raw patient data received:', result.data);
      
      const formattedPatients = (result.data || []).map(patient => {
        console.log('Processing patient:', patient);
        
        return {
          // Basic info
          id: patient.id,
          userId: patient.userId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient',
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          
          // FIXED: Complete medical data mapping
          dateOfBirth: patient.dateOfBirth,
          age: patient.age,
          gender: patient.gender || 'MALE',
          bloodGroup: patient.bloodGroup || 'Not specified',
          allergies: patient.allergies,
          chronicDiseases: patient.chronicDiseases,
          emergencyContactName: patient.emergencyContactName,
          emergencyContactNumber: patient.emergencyContactNumber,
          emergencyContactRelation: patient.emergencyContactRelation,
          insuranceProvider: patient.insuranceProvider,
          insurancePolicyNumber: patient.insurancePolicyNumber,
          height: patient.height,
          weight: patient.weight,
          preferredLanguage: patient.preferredLanguage,
          medicalCondition: patient.medicalCondition || 'General checkup',
          
          // Profile image
          profileImage: getPatientImageUrl(patient.profileImage, patient.gender),
          
          // Status
          enabled: patient.enabled,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt
        };
      });
      
      setPatients(formattedPatients);
      console.log('✅ Formatted patients loaded:', formattedPatients.length);
      console.log('Sample patient data:', formattedPatients[0]);
    } else {
      console.log('❌ Failed to load patients:', result.error);
      setError(result.error || 'Failed to load patients');
    }
  } catch (err) {
    console.error('❌ Error in fetchPatients:', err);
    setError('Failed to load patients. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // Fetch admins from database (FIXED - using ROLE_ADMIN)
    
const fetchAdmins = async () => {
  try {
    setLoading(true);
    console.log('Fetching admins via AdminService...');
    
    const result = await AdminService.getAllAdmins();
    
    if (result.success) {
      const formattedAdmins = (result.data || []).map(admin => ({
        ...admin,
        name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Unknown Admin'
      }));
      
      setAdmins(formattedAdmins);
      console.log('✅ Admins loaded successfully:', formattedAdmins.length);
    } else {
      console.log('❌ Failed to load admins:', result.error);
      // Fallback: Add current user as admin
      if (currentUser) {
        setAdmins([currentUser]);
      }
    }
  } catch (err) {
    console.error('❌ Error in fetchAdmins:', err);
    if (currentUser) {
      setAdmins([currentUser]);
    }
  } finally {
    setLoading(false);
  }
};

// ADD this new function after fetchAdmins
const [dashboardStats, setDashboardStats] = useState({
  totalAdmins: 0,
  totalDoctors: 0, 
  totalPatients: 0,
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0
});

const fetchDashboardStats = async () => {
  try {
    console.log('Fetching dashboard stats...');
    
    const result = await AdminService.getDashboardStats();
    
    if (result.success) {
      setDashboardStats(result.data);
      console.log('✅ Dashboard stats loaded:', result.data);
    } else {
      console.log('❌ Failed to load dashboard stats:', result.error);
      // Calculate stats from existing data
      setDashboardStats({
        totalAdmins: admins.length,
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        totalUsers: admins.length + doctors.length + patients.length,
        activeUsers: admins.length + doctors.length + patients.length,
        inactiveUsers: 0
      });
    }
  } catch (err) {
    console.error('❌ Error fetching dashboard stats:', err);
  }
};

  // Fetch current user details
// Fetch current user details
const fetchCurrentUser = async () => {
  try {
    // FIXED: Use the correct endpoint from AuthContext
    const userData = user; // Get from AuthContext instead of API call
    if (userData) {
      console.log('🔍 Current user loaded from AuthContext:', userData);
      setCurrentUser(userData);
    } else {
      console.log('⚠️ No user in AuthContext, trying alternative method...');
      // Fallback: Try to get from auth context or localStorage
      const authData = JSON.parse(localStorage.getItem('authData') || '{}');
      if (authData.user) {
        console.log('🔍 Current user loaded from localStorage:', authData.user);
        setCurrentUser(authData.user);
      }
    }
  } catch (err) {
    console.error('Error fetching current user:', err);
  }
};
  // REPLACE the existing useEffect with this
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🚀 Loading Admin Dashboard Data...');
      
      // Load current user first
      await fetchCurrentUser();
      
      // Load all data in parallel
      await Promise.all([
        fetchDoctors(),
        fetchPatients(), 
        fetchAdmins()
      ]);
      
      // Load dashboard stats after other data
      await fetchDashboardStats();
      
      console.log('✅ All dashboard data loaded successfully!');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  // Filter doctors based on search and specialty
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchTerm || 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hospitalAffiliation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !filterSpecialty || doctor.specialization === filterSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  // Get unique specializations for filter
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))].filter(Boolean);

  // Top Doctors by Specialty Component - Only show best doctor per specialty
  const TopDoctorsBySpecialty = () => {
    const topSpecialties = specializations.slice(0, 3).map(specialty => {
      const bestDoctor = doctors
        .filter(doctor => doctor.specialization === specialty)
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))[0];
      
      return { specialty, doctor: bestDoctor };
    }).filter(item => item.doctor);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {topSpecialties.map(({ specialty, doctor }) => (
          <div key={specialty} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <h3 className="text-lg font-bold mb-4 text-purple-700">Best {specialty} Doctor</h3>
            <div className="flex items-center space-x-4">
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = doctor.gender === 'FEMALE' ? 
                    '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg';
                }}
              />
              <div className="flex-1">
                <p className="font-bold text-gray-800">{doctor.name}</p>
                <p className="text-purple-600 text-sm">{doctor.hospitalAffiliation}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {doctor.averageRating || '4.5'} Rating
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {doctor.yearsOfExperience} years exp • ₹{doctor.consultationFee}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Dashboard Stats Component
  // REPLACE the DashboardStats component with this
const DashboardStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">Total Doctors</p>
          <p className="text-3xl font-bold text-purple-600">{dashboardStats.totalDoctors || doctors.length}</p>
          <p className="text-xs text-green-600 mt-1">↗ Active & Available</p>
        </div>
        <div className="bg-purple-100 p-3 rounded-full">
          <Users className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">Total Patients</p>
          <p className="text-3xl font-bold text-green-600">{dashboardStats.totalPatients || patients.length}</p>
          <p className="text-xs text-blue-600 mt-1">↗ Registered Users</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <User className="h-8 w-8 text-green-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">Total Admins</p>
          <p className="text-3xl font-bold text-blue-600">{dashboardStats.totalAdmins || admins.length}</p>
          <p className="text-xs text-purple-600 mt-1">System Administrators</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-full">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">Total Users</p>
          <p className="text-3xl font-bold text-orange-600">{dashboardStats.totalUsers || (doctors.length + patients.length + admins.length)}</p>
          <p className="text-xs text-green-600 mt-1">All System Users</p>
        </div>
        <div className="bg-orange-100 p-3 rounded-full">
          <Users className="h-8 w-8 text-orange-600" />
        </div>
      </div>
    </div>
  </div>
);

  // Doctor Preview Modal - Enhanced with full details
  const DoctorPreviewModal = ({ doctor, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-700">Doctor Profile Preview</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Doctor Header */}
          <div className="bg-purple-600 rounded-xl h-32 relative mb-16">
            <div className="absolute -bottom-12 left-6">
              <div className="h-24 w-24 rounded-full bg-white p-1">
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = doctor.gender === 'FEMALE' ? 
                      '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg';
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold mb-2 text-gray-800">Dr. {doctor.name}</h3>
              <p className="text-purple-600 font-semibold text-lg mb-3">{doctor.specialization}</p>
              <p className="text-gray-600 mb-4">{doctor.education}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {doctor.isAvailableForEmergency && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                    Available for Emergency
                  </span>
                )}
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  <Star className="h-3 w-3 inline mr-1" />
                  {doctor.averageRating || '4.8'} Rating
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {doctor.yearsOfExperience} years experience
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg mb-4">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Experience:</span>
                    <p className="text-gray-600">{doctor.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Hospital:</span>
                    <p className="text-gray-600">{doctor.hospitalAffiliation}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Fee:</span>
                    <p className="text-gray-600">₹{doctor.consultationFee}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Email:</span>
                    <p className="text-gray-600">{doctor.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Rating:</span>
                    <p className="flex items-center text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {doctor.averageRating || '4.5'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">License:</span>
                    <p className="text-gray-600">{doctor.licenseNumber}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Emergency:</span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      doctor.isAvailableForEmergency ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {doctor.isAvailableForEmergency ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Phone:</span>
                    <p className="text-gray-600">{doctor.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">About Doctor:</h4>
                <p className="text-gray-600">
                  Dr. {doctor.name} is a specialist in {doctor.specialization} with over {doctor.yearsOfExperience} years of clinical experience. 
                  Dr. {doctor.name} has expertise in diagnosing and treating various medical conditions related to {doctor.specialization}.
                </p>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Services Offered:</h4>
                <ul className="grid grid-cols-2 gap-1 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Online consultations
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    In-person visits
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Follow-up consultations
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Health check-ups
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Medical certificates
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Prescription services
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right side - Additional Info */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200">
                <h4 className="font-bold text-purple-700 mb-4">Quick Info</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{doctor.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patients:</span>
                    <span className="font-medium">500+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Languages:</span>
                    <span className="font-medium">English, Hindi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation:</span>
                    <span className="font-medium text-green-600">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Patient Preview Modal
  const PatientPreviewModal = ({ patient, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-700">Patient Profile Preview</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <img
                src={patient.profileImage}
                alt={patient.name}
                className="w-full h-64 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = patient.gender === 'FEMALE' ? 
                    '/images/Profile Photo Woman.jpg' : '/images/Profile Photo Man.jpg';
                }}
              />
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-2 text-gray-800">{patient.name}</h3>
              <p className="text-green-600 font-semibold text-lg mb-3">Patient ID: #{patient.id}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Age:</span>
                    <p className="text-gray-600">{patient.age || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Gender:</span>
                    <p className="text-gray-600">{patient.gender}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Blood Group:</span>
                    <p className="text-gray-600">{patient.bloodGroup || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date of Birth:</span>
                    <p className="text-gray-600">{patient.dateOfBirth || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Email:</span>
                    <p className="text-gray-600">{patient.email}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Phone:</span>
                    <p className="text-gray-600">{patient.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Emergency Contact:</span>
                    <p className="text-gray-600">{patient.emergencyContactNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Medical Condition:</span>
                    <p className="text-gray-600">{patient.medicalCondition || 'None specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="font-semibold text-gray-700">Allergies:</span>
                <p className="text-gray-600">{patient.allergies || 'No known allergies'}</p>
              </div>
              
              <div className="mt-4">
                <span className="font-semibold text-gray-700">Chronic Diseases:</span>
                <p className="text-gray-600">{patient.chronicDiseases || 'None'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Admin Preview Modal
  const AdminPreviewModal = ({ admin, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Admin Profile Preview</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">
              {admin.firstName} {admin.lastName}
            </h3>
            <p className="text-blue-600 font-semibold text-lg mb-4">System Administrator</p>
            
            <div className="grid grid-cols-1 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="font-semibold text-gray-700">Email:</span>
                <p className="text-gray-600">{admin.email}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Phone:</span>
                <p className="text-gray-600">{admin.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">User ID:</span>
                <p className="text-gray-600">#{admin.id}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status:</span>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  admin.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {admin.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Doctor Form Component with Profile Image Preview
  const DoctorForm = ({ doctor, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      firstName: doctor?.firstName || '',
      lastName: doctor?.lastName || '',
      email: doctor?.email || '',
      password: '', 
      confirmPassword: '', 
      specialization: doctor?.specialization || '',
      education: doctor?.education || '',
      yearsOfExperience: doctor?.yearsOfExperience || '',
      hospitalAffiliation: doctor?.hospitalAffiliation || '',
      consultationFee: doctor?.consultationFee || '',
      licenseNumber: doctor?.licenseNumber || '',
      phoneNumber: doctor?.phoneNumber || '',
      gender: doctor?.gender || 'MALE',
      isAvailableForEmergency: doctor?.isAvailableForEmergency || false,
      profileImage: null
    });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e) => {
  e.preventDefault();
  
  // ADD PASSWORD VALIDATION FOR NEW DOCTORS:
  if (!doctor && formData.password !== formData.confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  if (!doctor && formData.password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }
  
  console.log('Saving doctor:', formData);
  onSave(formData);
};

    const previewImage = formData.profileImage ? 
      URL.createObjectURL(formData.profileImage) : 
      (doctor?.profileImage || (formData.gender === 'FEMALE' ? '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg'));

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-700">
                {doctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Fields */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* ADD THESE PASSWORD FIELDS RIGHT AFTER EMAIL: */}
{!doctor && ( // Only show for new doctors
  <>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
          minLength="6"
          placeholder="Minimum 6 characters"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
          minLength="6"
          placeholder="Confirm your password"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
        <p className="text-red-500 text-sm mt-1">⚠️ Passwords do not match</p>
      )}
    </div>
  </>
)}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                      <input
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
                      <input
                        type="text"
                        value={formData.education}
                        onChange={(e) => setFormData({...formData, education: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital Affiliation</label>
                      <input
                        type="text"
                        value={formData.hospitalAffiliation}
                        onChange={(e) => setFormData({...formData, hospitalAffiliation: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee (₹)</label>
                      <input
                        type="number"
                        value={formData.consultationFee}
                        onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, profileImage: e.target.files[0]})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">Leave empty to keep existing image when updating</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isAvailableForEmergency}
                          onChange={(e) => setFormData({...formData, isAvailableForEmergency: e.target.checked})}
                          className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-semibold text-gray-700">Available for Emergency</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200">
                    <h3 className="text-lg font-bold mb-4 text-purple-700">Preview</h3>
                    <div className="text-center">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                      />
                      <h4 className="font-bold text-lg text-gray-800">
                        Dr. {formData.firstName} {formData.lastName}
                      </h4>
                      <p className="text-purple-600 font-medium">{formData.specialization}</p>
                      <p className="text-gray-600 text-sm mb-2">{formData.education}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>{formData.yearsOfExperience} years experience</p>
                        <p>₹{formData.consultationFee} consultation</p>
                        <p>License: {formData.licenseNumber}</p>
                        <p>{formData.hospitalAffiliation}</p>
                      </div>
                      {formData.isAvailableForEmergency && (
                        <span className="inline-block mt-2 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                          Emergency Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-lg"
                >
                  {doctor ? 'Update Doctor' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Patient Form Component
  // FIXED Patient Form Component with live gender preview update
const PatientForm = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState({
  firstName: patient?.firstName || '',
  lastName: patient?.lastName || '',
  email: patient?.email || '',
  password: '', // ADD THIS
  confirmPassword: '', // ADD THIS
  phoneNumber: patient?.phoneNumber || '',
  dateOfBirth: patient?.dateOfBirth || '',
  gender: patient?.gender || 'MALE',
  bloodGroup: patient?.bloodGroup || '',
  allergies: patient?.allergies || '',
  chronicDiseases: patient?.chronicDiseases || '',
  emergencyContactName: patient?.emergencyContactName || '',
  emergencyContactNumber: patient?.emergencyContactNumber || '',
  emergencyContactRelation: patient?.emergencyContactRelation || '',
  insuranceProvider: patient?.insuranceProvider || '',
  insurancePolicyNumber: patient?.insurancePolicyNumber || '',
  height: patient?.height || '',
  weight: patient?.weight || '',
  preferredLanguage: patient?.preferredLanguage || '',
  medicalCondition: patient?.medicalCondition || '',
  profileImage: null,
  imagePreview: null, // ADD THIS
  _genderChanged: false
});
  const [saving, setSaving] = useState(false);
  const [previewImageKey, setPreviewImageKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  
  try {
    // Validate passwords for new patients
    if (!patient && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      setSaving(false);
      return;
    }
    
    if (!patient && formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      setSaving(false);
      return;
    }
    
    console.log('💾 Submitting patient form data...');
    
    // Create FormData object for file upload
    const formDataToSend = new FormData();
    
    // Append all required fields
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('email', formData.email);
    
    // Only append password for new patients
    if (!patient && formData.password) {
      formDataToSend.append('password', formData.password);
    }
    
    // Append all other fields if they have values
    if (formData.phoneNumber) formDataToSend.append('phoneNumber', formData.phoneNumber);
    if (formData.dateOfBirth) formDataToSend.append('dateOfBirth', formData.dateOfBirth);
    if (formData.gender) formDataToSend.append('gender', formData.gender);
    if (formData.bloodGroup) formDataToSend.append('bloodGroup', formData.bloodGroup);
    if (formData.allergies) formDataToSend.append('allergies', formData.allergies);
    if (formData.chronicDiseases) formDataToSend.append('chronicDiseases', formData.chronicDiseases);
    if (formData.emergencyContactName) formDataToSend.append('emergencyContactName', formData.emergencyContactName);
    if (formData.emergencyContactNumber) formDataToSend.append('emergencyContactNumber', formData.emergencyContactNumber);
    if (formData.emergencyContactRelation) formDataToSend.append('emergencyContactRelation', formData.emergencyContactRelation);
    if (formData.insuranceProvider) formDataToSend.append('insuranceProvider', formData.insuranceProvider);
    if (formData.insurancePolicyNumber) formDataToSend.append('insurancePolicyNumber', formData.insurancePolicyNumber);
    if (formData.height) formDataToSend.append('height', formData.height);
    if (formData.weight) formDataToSend.append('weight', formData.weight);
    if (formData.preferredLanguage) formDataToSend.append('preferredLanguage', formData.preferredLanguage);
    if (formData.medicalCondition) formDataToSend.append('medicalCondition', formData.medicalCondition);
    
    // Append profile image if selected
    if (formData.profileImage) {
      formDataToSend.append('profileImage', formData.profileImage);
    }
    
    // Debug: Log what we're sending
    console.log('📤 Sending FormData with fields:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }
    
    let result;
    if (patient?.id) {
      // Update existing patient
      console.log('📝 Updating patient ID:', patient.id);
      result = await AdminService.updatePatient(patient.id, formDataToSend);
    } else {
      // Create new patient
      console.log('➕ Creating new patient');
      result = await AdminService.createPatient(formDataToSend);
    }
    
    if (result.success) {
      console.log('✅ Patient saved successfully:', result.data);
      onSave(result.data);
    } else {
      console.error('❌ Failed to save patient:', result.error);
      alert('Failed to save patient: ' + result.error);
    }
  } catch (err) {
    console.error('❌ Error saving patient:', err);
    alert('Error saving patient. Please try again.');
  } finally {
    setSaving(false);
  }
};

  // FIXED: Dynamic preview image that updates with gender changes
  // REPLACE the existing getPreviewImage function with this updated version:
const getPreviewImage = () => {
  // If we have a new image selected, show that
  if (formData.imagePreview) {
    return formData.imagePreview;
  }
  
  // If gender was changed or no existing image, show default for current gender
  if (formData._genderChanged || (!patient?.profileImage)) {
    return formData.gender === 'FEMALE' ? 
      '/images/Profile Photo Woman.jpg' : 
      '/images/Profile Photo Man.jpg';
  }
  
  // Show existing patient image if no changes
  if (patient?.profileImage) {
    return patient.profileImage;
  }
  
  // Fallback to default
  return formData.gender === 'FEMALE' ? 
    '/images/Profile Photo Woman.jpg' : 
    '/images/Profile Photo Man.jpg';
};

  // FIXED: Handle gender change with instant preview update
  // FIXED: Handle gender change with instant preview update
const handleGenderChange = (e) => {
  const newGender = e.target.value;
  console.log('🚻 Gender changed to:', newGender);
  
  setFormData({
    ...formData, 
    gender: newGender,
    _genderChanged: true // Mark that gender was changed
  });
  
  // Force preview image to update
  setPreviewImageKey(prev => prev + 1);
};

// ✅ handleImageChange is NOW OUTSIDE and SEPARATE
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFormData({
      ...formData,
      profileImage: file,
      imagePreview: URL.createObjectURL(file)
    });
    // Force preview update
    setPreviewImageKey(prev => prev + 1);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-700">
              {patient ? 'Edit Patient Profile' : 'Add New Patient'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {/* ADD these password fields RIGHT AFTER the email field */}
{!patient && ( // Only show for new patients
  <>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
          minLength="6"
          placeholder="Minimum 6 characters"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
          minLength="6"
          placeholder="Confirm your password"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
        <p className="text-red-500 text-sm mt-1">⚠️ Passwords do not match</p>
      )}
    </div>
  </>
)}                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={handleGenderChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact</label>
                   <input
                     type="tel"
                     value={formData.emergencyContactNumber}
                     onChange={(e) => setFormData({...formData, emergencyContactNumber: e.target.value})}
                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                   <input
                     type="number"
                     value={formData.height}
                     onChange={(e) => setFormData({...formData, height: e.target.value})}
                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                   <input
                     type="number"
                     value={formData.weight}
                     onChange={(e) => setFormData({...formData, weight: e.target.value})}
                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                   />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                   <textarea
                     value={formData.allergies}
                     onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                     placeholder="List any allergies"
                     rows="2"
                   />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Chronic Diseases</label>
                   <textarea
                     value={formData.chronicDiseases}
                     onChange={(e) => setFormData({...formData, chronicDiseases: e.target.value})}
                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                     placeholder="List any chronic conditions"
                     rows="2"
                   />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Condition</label>
                   <input
                     type="text"
                     value={formData.medicalCondition}
                     onChange={(e) => setFormData({...formData, medicalCondition: e.target.value})}
                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                     placeholder="Current medical condition"
                   />
                 </div>
                 <div className="md:col-span-2">
  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
  <input
    type="file"
    accept="image/*"
    onChange={handleImageChange}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
  />
  <p className="text-sm text-gray-500 mt-1">
    Image will be saved as {formData.firstName ? formData.firstName.toLowerCase() : 'firstname'}.jpg
  </p>
  
</div>
               </div>
             </div>

             {/* FIXED: Preview Section with forced re-render */}
             <div className="lg:col-span-1">
               <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                 <h3 className="text-lg font-bold mb-4 text-green-700">Preview</h3>
                 <div className="text-center">
                  {/* REPLACE the preview image with this updated version */}
<img
  key={`preview-${previewImageKey}-${formData.gender}`}
  src={formData.imagePreview || getPreviewImage()}
  alt="Preview"
  className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = formData.gender === 'FEMALE' ? 
      '/images/Profile Photo Woman.jpg' : 
      '/images/Profile Photo Man.jpg';
  }}
/>
                   <h4 className="font-bold text-lg text-gray-800">
                     {formData.firstName} {formData.lastName}
                   </h4>
                   <p className="text-green-600 font-medium">Patient</p>
                   <div className="text-xs text-gray-500 space-y-1 mt-2">
                     <p>Blood Group: {formData.bloodGroup || 'Not specified'}</p>
                     <p>Gender: {formData.gender}</p>
                     <p>DOB: {formData.dateOfBirth || 'Not specified'}</p>
                     <p>Emergency: {formData.emergencyContactNumber || 'Not provided'}</p>
                     {formData.height && <p>Height: {formData.height} cm</p>}
                     {formData.weight && <p>Weight: {formData.weight} kg</p>}
                   </div>
                 </div>
               </div>
             </div>
           </div>

           <div className="flex justify-end space-x-4 mt-8">
             <button
               type="button"
               onClick={onClose}
               className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
               disabled={saving}
             >
               Cancel
             </button>
             <button
               type="submit"
               className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
               disabled={saving}
             >
               {saving ? (
                 <div className="flex items-center">
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                   Saving...
                 </div>
               ) : (
                 patient ? 'Update Patient' : 'Add Patient'
               )}
             </button>
           </div>
         </form>
       </div>
     </div>
   </div>
 );
};

  // Admin Form Component
  // REPLACE your AdminForm component in AdminDashboard.jsx with this:

const AdminForm = ({ admin, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: admin?.firstName || '',
    lastName: admin?.lastName || '',
    email: admin?.email || '',
    phoneNumber: admin?.phoneNumber || '',
    password: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validate passwords for new admins
      if (!admin && formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        setSaving(false);
        return;
      }
      
      if (!admin && formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        setSaving(false);
        return;
      }
      
      console.log('💾 Submitting admin form data...');
      
      // Create data object
      const adminDataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || null
      };
      
      // Only add password for new admins
      if (!admin && formData.password) {
        adminDataToSend.password = formData.password;
      }
      
      console.log('📤 Sending admin data:', adminDataToSend);
      
      let result;
      if (admin?.id) {
        // Update existing admin
        console.log('📝 Updating admin ID:', admin.id);
        result = await AdminService.updateAdmin(admin.id, adminDataToSend);
      } else {
        // Create new admin
        console.log('➕ Creating new admin');
        result = await AdminService.createAdmin(adminDataToSend);
      }
      
      if (result.success) {
        console.log('✅ Admin saved successfully:', result.data);
        onSave(result.data);
      } else {
        console.error('❌ Failed to save admin:', result.error);
        alert('Failed to save admin: ' + result.error);
      }
    } catch (err) {
      console.error('❌ Error saving admin:', err);
      alert('Error saving admin. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">
              {admin ? 'Edit Admin Profile' : 'Add New Admin'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {!admin && (
  <>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          minLength="6"
          placeholder="Minimum 6 characters"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          minLength="6"
          placeholder="Confirm your password"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
        <p className="text-red-500 text-sm mt-1">⚠️ Passwords do not match</p>
      )}
    </div>
  </>
)}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  admin ? 'Update Admin' : 'Add Admin'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

  // Main render
  return (
    <div className="min-h-screen bg-gray-50" style={{paddingTop: '64px'}}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">MediConnect Admin Dashboard</h1>
              <p className="text-purple-100 mt-1">Manage doctors, patients, and system settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">Administrator Panel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-72 bg-white shadow-xl">
          <nav className="p-6">
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <Activity className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              
              <button
                onClick={() => setActiveTab('doctors')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-200 ${
                  activeTab === 'doctors' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Doctors</span>
                <span className="ml-auto bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                  {doctors.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('patients')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-200 ${
                  activeTab === 'patients' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Patients</span>
                <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  {patients.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('admins')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-200 ${
                  activeTab === 'admins' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admins</span>
                <span className="ml-auto bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                  {admins.length}
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium">{error}</p>
                  <button
                    onClick={() => {
                      fetchDoctors();
                      fetchPatients();
                      fetchAdmins();
                      fetchCurrentUser();
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 font-medium underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
                <p className="text-gray-600">Welcome back! Here's what's happening with MediConnect today.</p>
              </div>
              <DashboardStats />
              <TopDoctorsBySpecialty />
            </div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Doctors Management</h2>
                  <p className="text-gray-600 mt-1">Manage doctor profiles and information</p>
                </div>
                <Link 
  to="/admin/doctors/add" 
  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
>
  <Plus className="h-5 w-5" />
  <span className="font-medium">Add Doctor</span>
</Link>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search doctors by name, specialty, or hospital..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:w-64">
                    <select
                      value={filterSpecialty}
                      onChange={(e) => setFilterSpecialty(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Specializations</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Doctors List - FIXED: Made compact */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                  <h3 className="text-xl font-bold text-gray-800">
                    {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
                  </h3>
                  <p className="text-gray-600 mt-1">Manage doctor profiles and settings</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Specialization
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Experience
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Hospital
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDoctors.map(doctor => (
                        <tr key={doctor.id} className="hover:bg-purple-50 transition-colors duration-200">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={doctor.profileImage}
                                alt={doctor.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = doctor.gender === 'FEMALE' ? 
                                    '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg';
                                }}
                              />
                              <div className="ml-3">
                                <div className="text-sm font-bold text-gray-900">
                                  Dr. {doctor.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {doctor.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                              {doctor.specialization}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{doctor.yearsOfExperience} years</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{doctor.hospitalAffiliation}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedDoctor(doctor)}
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <Link
  to={`/admin/doctors/edit/${doctor.id}`}
  className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
  title="Edit"
>
  <Edit className="h-4 w-4" />
</Link>
                              <button
  onClick={async () => {
    const confirmMessage = `Are you sure you want to delete Dr. ${doctor.name}?\n\n` +
                          `Specialization: ${doctor.specialization}\n` +
                          `Hospital: ${doctor.hospitalAffiliation}\n` +
                          `This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      await deleteDoctor(doctor.id, `Dr. ${doctor.name}`);
    }
  }}
  className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
  title="Delete"
>
  <Trash2 className="h-4 w-4" />
</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Patients Management</h2>
                  <p className="text-gray-600 mt-1">View and manage patient records</p>
                </div>
                <button
                  onClick={() => setShowPatientForm(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Patient</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                  <h3 className="text-xl font-bold text-gray-800">
                    {patients.length} {patients.length === 1 ? 'Patient' : 'Patients'} Found
                  </h3>
                  <p className="text-gray-600 mt-1">Manage patient profiles and records</p>
                </div>

                {patients.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Patients Found</h3>
                    <p className="text-gray-500 mb-6">
                      No patients are currently registered in the system.
                    </p>
                    <button 
                      onClick={() => setShowPatientForm(true)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
                    >
                      Add First Patient
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Blood Group
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Medical Condition
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
  {patients.map(patient => (
    <tr key={patient.id} className="hover:bg-green-50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={patient.profileImage}
            alt={patient.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = patient.gender === 'FEMALE' ? 
                '/images/Profile Photo Woman.jpg' : '/images/Profile Photo Man.jpg';
            }}
          />
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900">
              {patient.name}
            </div>
            <div className="text-sm text-gray-500">
              ID: #{patient.id} {patient.age && `• Age: ${patient.age}`}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{patient.email}</div>
        <div className="text-sm text-gray-500">{patient.phoneNumber}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {patient.gender}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{patient.bloodGroup}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{patient.medicalCondition}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedPatient(patient)}
            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setEditingPatient(patient);
              setShowPatientForm(true);
            }}
            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
  onClick={async () => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const result = await AdminService.deletePatient(patient.id);
        if (result.success) {
          console.log('✅ Patient deleted successfully');
          fetchPatients(); // Refresh the list
        } else {
          console.error('❌ Failed to delete patient:', result.error);
          alert('Failed to delete patient: ' + result.error);
        }
      } catch (err) {
        console.error('❌ Error deleting patient:', err);
        alert('Error deleting patient. Please try again.');
      }
    }
  }}
  className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
  title="Delete"
>
  <Trash2 className="h-4 w-4" />
</button>
        </div>
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

          {/* Admins Tab */}
          {activeTab === 'admins' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Admins Management</h2>
                  <p className="text-gray-600 mt-1">Manage system administrators</p>
                </div>
                <button
                  onClick={() => setShowAdminForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Admin</span>
                </button>
              </div>

              {/* Current Admin Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Current Administrator</h2>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    Active Session
                  </span>
                </div>

                {currentUser && (
                  <div className="flex items-center space-x-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center">
                        <Shield className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">
                        {currentUser.firstName} {currentUser.lastName}
                      </h3>
                      <p className="text-purple-600 font-medium">{currentUser.role?.replace('ROLE_', '') || 'Administrator'}</p>
                      <p className="text-gray-600">{currentUser.email}</p>
                      <p className="text-sm text-gray-500">Phone: {currentUser.phoneNumber || 'Not provided'}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-green-600 font-medium">Online Now</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-mono text-purple-600">#{currentUser.id}</p>
                      <p className="text-sm text-gray-500 mt-2">Account Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        currentUser.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {currentUser.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* All Admins List */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h3 className="text-xl font-bold text-gray-800">
                    {admins.length} {admins.length === 1 ? 'Admin' : 'Admins'} Found
                  </h3>
                  <p className="text-gray-600 mt-1">Manage system administrators</p>
                </div>

                {admins.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Additional Admins Found</h3>
                    <p className="text-gray-500 mb-6">
                      Add more administrators to help manage the system.
                    </p>
                    <button 
                      onClick={() => setShowAdminForm(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Add First Admin
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Admin
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {admins.map(admin => (
                          <tr key={admin.id} className="hover:bg-blue-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Shield className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-bold text-gray-900">
                                    {admin.firstName} {admin.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: #{admin.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{admin.email}</div>
                              <div className="text-sm text-gray-500">{admin.phoneNumber || 'Not provided'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {admin.role?.replace('ROLE_', '') || 'Admin'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                admin.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {admin.enabled ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedAdmin(admin)}
                                  className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingAdmin(admin);
                                    setShowAdminForm(true);
                                  }}
                                  className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
  onClick={async () => {
    try {
      // First check if admin can be deleted
      const canDeleteResult = await AdminService.canDeleteAdmin(admin.id, currentUser);
      
      if (!canDeleteResult.canDelete) {
        alert(`Cannot delete admin: ${canDeleteResult.reason}`);
        return;
      }
      
      // Show confirmation dialog with more details
      const confirmMessage = `Are you sure you want to delete admin "${admin.firstName} ${admin.lastName}"?\n\n` +
                            `Email: ${admin.email}\n` +
                            `This action cannot be undone.`;
      
      if (window.confirm(confirmMessage)) {
        console.log('🗑️ Attempting to delete admin:', admin.id);
        
        // Pass current user for additional safety check
        console.log('🔍 About to delete admin with currentUser:', currentUser);
const result = await AdminService.deleteAdmin(admin.id, currentUser);
        
        if (result.success) {
          console.log('✅ Admin deleted successfully');
          // Refresh the admins list
          fetchAdmins();
          // Also refresh dashboard stats
          fetchDashboardStats();
          // Show success message
          alert(`Admin "${admin.firstName} ${admin.lastName}" has been deleted successfully.`);
        } else {
          console.error('❌ Failed to delete admin:', result.error);
          
          // Show user-friendly error messages
          if (result.errorCode === 'CANNOT_DELETE_SELF') {
            alert('❌ You cannot delete your own admin account!');
          } else if (result.errorCode === 'CANNOT_DELETE_LAST_ADMIN') {
            alert('❌ Cannot delete the last admin! At least one admin must remain in the system.');
          } else {
            alert('Failed to delete admin: ' + result.error);
          }
        }
      }
    } catch (err) {
      console.error('❌ Error in delete admin process:', err);
      alert('Error deleting admin. Please try again.');
    }
  }}
  disabled={admin.id === currentUser?.id || admins.length <= 1}
  className={`p-2 rounded-lg transition-colors ${
    admin.id === currentUser?.id || admins.length <= 1
      ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
      : 'text-red-600 hover:text-red-900 hover:bg-red-50'
  }`}
  title={getDeleteButtonTooltip(admin, currentUser, admins.length)}
>
  <Trash2 className="h-4 w-4" />
</button>

                              </div>
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
        </div>
      </div>

      {/* Modals */}
      {selectedDoctor && (
        <DoctorPreviewModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
        />
      )}

      {selectedPatient && (
        <PatientPreviewModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {selectedAdmin && (
        <AdminPreviewModal
          admin={selectedAdmin}
          onClose={() => setSelectedAdmin(null)}
        />
      )}

      

      {showPatientForm && (
        <PatientForm
          patient={editingPatient}
          onClose={() => {
            setShowPatientForm(false);
            setEditingPatient(null);
          }}
          onSave={(patientData) => {
            console.log('Save patient:', patientData);
            setShowPatientForm(false);
            setEditingPatient(null);
            fetchPatients();
          }}
        />
      )}

      {showAdminForm && (
        <AdminForm
          admin={editingAdmin}
          onClose={() => {
            setShowAdminForm(false);
            setEditingAdmin(null);
          }}
          onSave={(adminData) => {
            console.log('Save admin:', adminData);
            setShowAdminForm(false);
            setEditingAdmin(null);
            fetchAdmins();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 