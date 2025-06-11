import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import PatientService from '../services/PatientService';
import { 
  FaUserEdit, 
  FaIdCard, 
  FaTint, 
  FaWeight, 
  FaRulerVertical, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaSave,
  FaTimes,
  FaCamera
} from 'react-icons/fa';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import PageHeader from '../components/common/PageHeader';

const PatientProfilePage = () => {
  const user = useSelector(state => state.auth.user);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: '',
    height: '',
    weight: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    emergencyContactRelation: '',
    allergies: '',
    chronicDiseases: '',
    insuranceProvider: '',
    insurancePolicyNumber: ''
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await PatientService.getPatientByUserId(user.id);
        
        if (response.success) {
          setPatient(response.data);
          
          // Initialize form data with patient data
          const userData = response.data.user;
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            address: response.data.address || '',
            dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.substring(0, 10) : '',
            gender: response.data.gender || 'MALE',
            bloodGroup: response.data.bloodGroup || '',
            height: response.data.height ? response.data.height.toString() : '',
            weight: response.data.weight ? response.data.weight.toString() : '',
            emergencyContactName: response.data.emergencyContactName || '',
            emergencyContactNumber: response.data.emergencyContactNumber || '',
            emergencyContactRelation: response.data.emergencyContactRelation || '',
            allergies: response.data.allergies || '',
            chronicDiseases: response.data.chronicDiseases || '',
            insuranceProvider: response.data.insuranceProvider || '',
            insurancePolicyNumber: response.data.insurancePolicyNumber || ''
          });
        } else {
          setError(response.error || 'Failed to load patient data');
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('An unexpected error occurred while fetching your profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Prepare update data
      const updateData = {
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        address: formData.address,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNumber: formData.emergencyContactNumber,
        emergencyContactRelation: formData.emergencyContactRelation,
        allergies: formData.allergies,
        chronicDiseases: formData.chronicDiseases,
        insuranceProvider: formData.insuranceProvider,
        insurancePolicyNumber: formData.insurancePolicyNumber
      };
      
      // Update patient profile
      const response = await PatientService.updatePatient(patient.id, updateData);
      
      if (response.success) {
        // Update user data if needed
        const userResponse = await PatientService.updateUserProfile(user.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber
        });
        
        if (userResponse.success) {
          setPatient(prevPatient => ({
            ...prevPatient,
            ...response.data,
            user: {
              ...prevPatient.user,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phoneNumber: formData.phoneNumber
            }
          }));
          
          setIsEditing(false);
          toast.success('Profile updated successfully');
        } else {
          toast.error('Failed to update user information: ' + userResponse.error);
        }
      } else {
        toast.error('Failed to update profile: ' + response.error);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('An unexpected error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get BMI status
  const getBMIStatus = () => {
    if (!patient?.height || !patient?.weight) return null;
    
    const heightInMeters = patient.height / 100;
    const bmi = patient.weight / (heightInMeters * heightInMeters);
    
    if (bmi < 18.5) return { value: bmi.toFixed(1), status: 'Underweight', color: 'text-yellow-600' };
    if (bmi < 25) return { value: bmi.toFixed(1), status: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { value: bmi.toFixed(1), status: 'Overweight', color: 'text-yellow-600' };
    return { value: bmi.toFixed(1), status: 'Obese', color: 'text-red-600' };
  };

  const bmiStatus = getBMIStatus();

  if (loading && !patient) {
    return <Loading message="Loading your profile..." />;
  }

  if (error && !patient) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="pt-28 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <PageHeader title="Profile & Settings" subtitle="Manage your personal information and preferences" />
        
        {/* Dashboard Tabs */}
        <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex">
              <button className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Overview
              </button>
              <button className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Appointments
              </button>
              <button className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Medical Records
              </button>
              <button className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Medications
              </button>
              <button className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Vital Signs
              </button>
              <button className="px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 border-purple-600 text-purple-600">
                Profile
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Details Card */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-purple-50 p-4 border-b border-purple-100">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-purple-800">Personal Details</h3>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-purple-600 hover:text-purple-800 flex items-center px-3 py-1 border border-purple-300 rounded-md transition-colors hover:bg-purple-50"
                  >
                    <FaUserEdit className="mr-2" /> Edit Profile
                  </button>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Date of Birth</label>
                      <input 
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                      <label className="block text-sm text-gray-500 mb-1">Height (cm)</label>
                      <input 
                        type="number" 
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Weight (kg)</label>
                      <input 
                        type="number" 
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Address</label>
                    <textarea 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    ></textarea>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Name</label>
                        <input 
                          type="text" 
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                        <input 
                          type="tel" 
                          name="emergencyContactNumber"
                          value={formData.emergencyContactNumber}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Relation</label>
                        <input 
                          type="text" 
                          name="emergencyContactRelation"
                          value={formData.emergencyContactRelation}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Medical Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Allergies</label>
                        <textarea 
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleChange}
                          rows="2"
                          placeholder="List any allergies or 'None'"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Chronic Diseases</label>
                        <textarea 
                          name="chronicDiseases"
                          value={formData.chronicDiseases}
                          onChange={handleChange}
                          rows="2"
                          placeholder="List any chronic conditions or 'None'"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Insurance Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Insurance Provider</label>
                        <input 
                          type="text" 
                          name="insuranceProvider"
                          value={formData.insuranceProvider}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Policy Number</label>
                        <input 
                          type="text" 
                          name="insurancePolicyNumber"
                          value={formData.insurancePolicyNumber}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <FaTimes className="mr-2" /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-col md:flex-row mb-6">
                  <div className="md:w-1/3 mb-4 md:mb-0">
                    <div className="flex flex-col items-center">
                      <img 
                        src={patient?.user?.profileImage || "/api/placeholder/150/150"}
                        alt={patient?.user?.firstName} 
                        className="w-32 h-32 rounded-full object-cover mb-3 shadow-md"
                      />
                      <button className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center">
                        <FaCamera className="mr-1 h-4 w-4" />
                        Change Photo
                      </button>
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {patient?.user?.firstName} {patient?.user?.lastName}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
                      <div className="flex items-center text-gray-600">
                        <FaIdCard className="text-gray-400 mr-2" />
                        <span>{calculateAge(patient?.dateOfBirth)} years, {patient?.gender === 'MALE' ? 'Male' : patient?.gender === 'FEMALE' ? 'Female' : 'Other'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaTint className="text-gray-400 mr-2" />
                        <span>Blood Group: {patient?.bloodGroup || 'Not set'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaWeight className="text-gray-400 mr-2" />
                        <span>Weight: {patient?.weight ? `${patient.weight} kg` : 'Not set'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaRulerVertical className="text-gray-400 mr-2" />
                        <span>Height: {patient?.height ? `${patient.height} cm` : 'Not set'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaPhoneAlt className="text-gray-400 mr-2" />
                        <span>{patient?.user?.phoneNumber || 'Phone not set'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaEnvelope className="text-gray-400 mr-2" />
                        <span>{patient?.user?.email}</span>
                      </div>
                    </div>
                    
                    {bmiStatus && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">BMI (Body Mass Index)</h4>
                        <div className="flex items-center">
                          <div className="text-lg font-bold mr-2">{bmiStatus.value}</div>
                          <span className={`text-sm ${bmiStatus.color}`}>{bmiStatus.status}</span>
                        </div>
                      </div>
                    )}
                    
                    {patient?.address && (
                      <div className="mt-3 flex items-start text-gray-600">
                        <FaMapMarkerAlt className="text-gray-400 mr-2 mt-1" />
                        <span>{patient.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Emergency Contact */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Emergency Contact</h4>
                  {patient?.emergencyContactName ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{patient.emergencyContactName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{patient.emergencyContactNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Relation</p>
                        <p className="font-medium">{patient.emergencyContactRelation}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No emergency contact information provided</p>
                  )}
                </div>
                
                {/* Medical Information */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Medical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Allergies</p>
                      <p className="font-medium">{patient?.allergies || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Chronic Diseases</p>
                      <p className="font-medium">{patient?.chronicDiseases || 'None'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Insurance Details */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Insurance Details</h4>
                  {patient?.insuranceProvider ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Insurance Provider</p>
                        <p className="font-medium">{patient.insuranceProvider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Policy Number</p>
                        <p className="font-medium">{patient.insurancePolicyNumber}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No insurance information provided</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Additional Settings Cards */}
          <div className="space-y-6">
            {/* Account Settings Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <h3 className="font-bold text-blue-800">Account Settings</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                    Change Password
                  </button>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Notification Preferences</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="email-notif" 
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="email-notif" className="ml-2 text-gray-700">Email Notifications</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="sms-notif" 
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="sms-notif" className="ml-2 text-gray-700">SMS Notifications</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="push-notif" 
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="push-notif" className="ml-2 text-gray-700">Push Notifications</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Language Preferences Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-green-50 p-4 border-b border-green-100">
                <h3 className="font-bold text-green-800">Language Preferences</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Language
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="bn">Bengali</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
                
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                  Save Preferences
                </button>
              </div>
            </div>
            
            {/* Privacy Settings Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-red-50 p-4 border-b border-red-100">
                <h3 className="font-bold text-red-800">Privacy & Data</h3>
              </div>
              <div className="p-6">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="data-sharing" 
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="data-sharing" className="ml-2 text-gray-700">Allow data sharing with doctors</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="research-use" 
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="research-use" className="ml-2 text-gray-700">Allow anonymized data for research</label>
                  </div>
                </div>
                
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Delete Account
                </button>
              </div>
            </div>
            
            {/* Data Export Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-yellow-50 p-4 border-b border-yellow-100">
                <h3 className="font-bold text-yellow-800">Data Export</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Export all your health records and personal data in a portable format.
                </p>
                <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition">
                  Export My Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )}