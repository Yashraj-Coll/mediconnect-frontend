import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorService from "../services/DoctorService";
import { API_BASE_URL } from '../config/apiConfig';

const DoctorForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [previewActiveTab, setPreviewActiveTab] = useState('overview');
  
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
  
  // Simplified Form Data State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'MALE',
    password: '',
    confirmPassword: '',
    specialization: '',
    licenseNumber: '',
    education: '',
    yearsOfExperience: '',
    hospitalAffiliation: '',
    consultationFee: '',
    isAvailableForEmergency: false,
    about: '',
    patientCount: '500+',
    expertise: '',
    services: '',
    biography: '',
    experience: '',
    languages: 'English,Hindi',
    profileImage: null,
    imagePreview: null
  });

  // Load doctor data if editing
  useEffect(() => {
    if (isEdit && id) {
      fetchDoctorData();
    }
  }, [isEdit, id]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const result = await DoctorService.getDoctorById(id);
      if (result.success) {
        const doctor = result.data;
        setFormData({
          firstName: doctor.firstName || '',
          lastName: doctor.lastName || '',
          email: doctor.email || '',
          phoneNumber: doctor.phoneNumber || '',
          gender: doctor.gender || 'MALE',
          password: '',
          confirmPassword: '',
          specialization: doctor.specialization || '',
          licenseNumber: doctor.licenseNumber || '',
          education: doctor.education || '',
          yearsOfExperience: doctor.yearsOfExperience || '',
          hospitalAffiliation: doctor.hospitalAffiliation || '',
          consultationFee: doctor.consultationFee || '',
          isAvailableForEmergency: doctor.isAvailableForEmergency || false,
          about: doctor.about || '',
          patientCount: doctor.patientCount || '500+',
          expertise: Array.isArray(doctor.expertise) ? doctor.expertise.join(', ') : (doctor.expertise || ''),
          services: Array.isArray(doctor.services) ? doctor.services.join(', ') : (doctor.services || ''),
          biography: doctor.biography || '',
          experience: doctor.experience || '',
          languages: Array.isArray(doctor.languages) ? doctor.languages.join(',') : 'English,Hindi',
          profileImage: null,
          imagePreview: getImageUrl(doctor.profileImage, doctor.gender)
        });
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file,
        imagePreview: file ? URL.createObjectURL(file) : null
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        if (!isEdit) {
          if (!formData.password.trim()) newErrors.password = 'Password is required';
          if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
          if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
          if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
          }
        }
        break;
        
      case 2:
        if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        if (!formData.education.trim()) newErrors.education = 'Education is required';
        if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
        if (!formData.consultationFee) newErrors.consultationFee = 'Consultation fee is required';
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  // Step 4 is preview only - don't submit
};

const handleFinalSubmit = async () => {
  let isValid = true;
  for (let step = 1; step <= 3; step++) {
    if (!validateStep(step)) {
      isValid = false;
      setCurrentStep(step);
      break;
    }
  }
  
  if (!isValid) return;
  
  setLoading(true);
  
  try {
    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'profileImage' && formData[key]) {
        submitData.append(key, formData[key]);
      } else if (key !== 'profileImage' && key !== 'imagePreview') {
        submitData.append(key, formData[key]);
      }
    });
    
    console.log('📤 Submitting doctor data...');
    
    let result;
    if (isEdit) {
      result = await DoctorService.updateDoctor(id, submitData);
    } else {
      result = await DoctorService.createDoctor(submitData);
    }
    
    if (result.success) {
      console.log('✅ Doctor saved successfully!');
      navigate('/admin-dashboard');
    } else {
      console.error('❌ Error saving doctor:', result.error);
      alert('Error saving doctor: ' + result.error);
    }
  } catch (error) {
    console.error('❌ Submit error:', error);
    alert('Error submitting form. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
              step === currentStep 
                ? 'bg-purple-600 text-white' 
                : step < currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step < currentStep ? '✓' : step}
          </div>
          {step < 4 && (
            <div 
              className={`flex-1 h-1 mx-4 transition-colors ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const stepTitles = {
    1: 'Basic Information',
    2: 'Professional Details', 
    3: 'Profile Content',
    4: 'Review & Submit'
  };

  // Enhanced Preview Component - Exactly like DoctorDetailPage
  const renderPatientViewPreview = () => {
    const doctorName = `Dr. ${formData.firstName} ${formData.lastName}`.trim();
    const specialization = formData.specialization || 'General Practice';
    const education = formData.education || 'MD';
    const experience = formData.yearsOfExperience ? `${formData.yearsOfExperience} years` : '10+ years';
    const languages = formData.languages ? formData.languages.split(',').map(l => l.trim()) : ['English', 'Hindi'];
    const hospital = formData.hospitalAffiliation || 'City Hospital';
    const consultationFee = formData.consultationFee || '500';
    const profileImage = formData.imagePreview || (formData.gender === 'FEMALE' ? '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg');
    
    const expertiseList = formData.expertise ? 
      formData.expertise.split(',').map(item => item.trim()).filter(item => item) : 
      ['General consultations', `${specialization} disorders`, 'Preventive healthcare', 'Health education'];
    
    const servicesList = formData.services ? 
      formData.services.split(',').map(item => item.trim()).filter(item => item) : 
      ['Online consultations', 'In-person visits', 'Follow-up consultations', 'Health check-ups', 'Medical certificates', 'Prescription services'];

    return (
      <div className="bg-gray-50 p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔍 Patient View Preview</h3>
        <p className="text-gray-600 mb-6 text-center">This is exactly how patients will see this doctor's profile</p>
        
        {/* Main Doctor Profile Header - Same as DoctorDetailPage */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Purple Header */}
          <div className="bg-purple-600 h-48 relative">
            <div className="absolute -bottom-16 left-10">
              <div className="h-32 w-32 rounded-full bg-white p-1 shadow-lg">
                <img 
                  src={profileImage} 
                  alt={doctorName}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = formData.gender === 'FEMALE' ? '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Doctor Info Section */}
          <div className="pt-20 p-6">
            <div className="flex flex-col md:flex-row">
              {/* Left Column - Doctor Info */}
              <div className="md:w-8/12">
                <h1 className="text-3xl font-bold mb-1">{doctorName || 'Dr. [Name]'}</h1>
                <p className="text-purple-600 font-medium mb-2">{specialization}</p>
                <p className="text-gray-600 mb-4">{education} • {experience} experience</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.isAvailableForEmergency && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                      Available for Emergency
                    </span>
                  )}
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    ⭐ 4.8 Rating
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    👥 {formData.patientCount} Patients
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-700 flex items-center">
                      <span className="text-purple-500 mr-2">🏥</span>
                      {hospital}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 flex items-center">
                      <span className="text-purple-500 mr-2">🗣️</span>
                      {languages.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 flex items-center">
                      <span className="text-purple-500 mr-2">📄</span>
                      License No: {formData.licenseNumber || 'MED12345'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 flex items-center">
                      <span className="text-purple-500 mr-2">💰</span>
                      Consultation Fee: ₹{consultationFee}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Booking Section */}
              <div className="md:w-4/12 md:pl-6 mt-6 md:mt-0 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Book an Appointment</h3>
                  <p className="text-gray-600 mb-4">
                    Available for both video consultations and in-person visits.
                  </p>
                  
                  <button className="block w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition duration-300 text-center mb-3">
                    Book Video Consultation
                  </button>
                  
                  <button className="block w-full bg-white text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 transition duration-300 text-center border border-purple-200">
                    Book In-person Visit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Section - Exactly like DoctorDetailPage */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'experience', label: 'Experience & Education' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'locations', label: 'Locations & Timings' },
                { id: 'faq', label: 'FAQs' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`px-6 py-4 text-center whitespace-nowrap font-medium text-sm ${
                    previewActiveTab === tab.id 
                      ? 'border-b-2 border-purple-600 text-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setPreviewActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {previewActiveTab === 'overview' && (
              <div>
                <h3 className="text-xl font-bold mb-4">About Doctor</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {formData.about || 
                  `${doctorName || 'Dr. [Name]'} is a specialist in ${specialization} with over ${experience} of clinical experience. 
                  ${doctorName || 'The doctor'} has expertise in diagnosing and treating various medical conditions related to ${specialization}.`}
                </p>
                
                <h4 className="text-lg font-bold mb-3">Areas of Expertise</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                  {expertiseList.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                
                <h4 className="text-lg font-bold mb-3">Services Offered</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {servicesList.map((service, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>

                {formData.biography && (
                  <div className="mt-6">
                    <h4 className="text-lg font-bold mb-3">Biography</h4>
                    <p className="text-gray-700 leading-relaxed">{formData.biography}</p>
                  </div>
                )}
              </div>
            )}
            
            {previewActiveTab === 'experience' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Professional Experience</h3>
                {formData.experience ? (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{formData.experience}</p>
                  </div>
                ) : (
                  <div className="space-y-6 mb-8">
                    <div className="border-l-4 border-purple-200 pl-4 py-2">
                      <h4 className="font-bold text-gray-800">Senior {specialization} Specialist</h4>
                      <p className="text-purple-600">{hospital}</p>
                      <p className="text-gray-600 text-sm">2015 - Present</p>
                      <p className="text-gray-700 mt-1">Providing consultations and treatment to patients with expertise in {specialization}.</p>
                    </div>
                    <div className="border-l-4 border-purple-200 pl-4 py-2">
                      <h4 className="font-bold text-gray-800">{specialization} Specialist</h4>
                      <p className="text-purple-600">Apollo Hospital</p>
                      <p className="text-gray-600 text-sm">2010 - 2015</p>
                      <p className="text-gray-700 mt-1">Managed outpatient department and emergency cases.</p>
                    </div>
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-4">Education & Training</h3>
                <div className="space-y-4 mb-8">
                  <div className="border-l-4 border-blue-200 pl-4 py-2">
                    <h4 className="font-bold text-gray-800">{education}</h4>
                    <p className="text-blue-600">Harvard Medical School</p>
                    <p className="text-gray-600 text-sm">2010</p>
                  </div>
                  {education !== 'MBBS' && (
                    <div className="border-l-4 border-blue-200 pl-4 py-2">
                      <h4 className="font-bold text-gray-800">MBBS</h4>
                      <p className="text-blue-600">All India Institute of Medical Sciences</p>
                      <p className="text-gray-600 text-sm">2006</p>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-4">Awards & Recognitions</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-yellow-500 mr-3 mt-1 text-xl">🏆</span>
                    <div>
                      <h4 className="font-bold text-gray-800">Excellence in Patient Care</h4>
                      <p className="text-gray-600">Indian Medical Association, 2018</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-500 mr-3 mt-1 text-xl">🏆</span>
                    <div>
                      <h4 className="font-bold text-gray-800">Best {specialization} Specialist</h4>
                      <p className="text-gray-600">Healthcare Excellence Awards, 2016</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {previewActiveTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Patient Reviews</h3>
                  <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition">
                    Write a Review
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center">
                  <div className="md:w-1/3 text-center mb-4 md:mb-0">
                    <div className="text-5xl font-bold text-purple-600 mb-1">4.8</div>
                    <div className="flex justify-center text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className="text-xl">⭐</span>
                      ))}
                    </div>
                    <p className="text-gray-600">Based on 120 reviews</p>
                  </div>
                  
                  <div className="md:w-2/3 md:pl-6">
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map(rating => {
                        const percent = rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2;
                        return (
                          <div key={rating} className="flex items-center">
                            <div className="flex items-center w-20">
                              <span className="text-sm font-medium text-gray-600">{rating} stars</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 ml-4">
                              <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-600 ml-4 w-12">{percent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {[
                    {
                      name: "Rahul Sharma",
                      rating: 5,
                      date: "2 months ago",
                      comment: `Excellent doctor! Very attentive and knowledgeable. I felt very comfortable during the consultation with ${doctorName || 'the doctor'} and all my concerns were addressed.`
                    },
                    {
                      name: "Priya Patel",
                      rating: 4,
                      date: "3 months ago",
                      comment: "Good experience overall. The doctor was professional and gave me proper medical advice. The only downside was the waiting time."
                    },
                    {
                      name: "Amit Kumar",
                      rating: 5,
                      date: "5 months ago",
                      comment: `Very happy with the treatment from ${doctorName || 'the doctor'}. Everything was explained clearly and the prescribed medication worked well.`
                    }
                  ].map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6">
                      <div className="flex justify-between mb-2">
                        <div className="font-bold text-gray-800">{review.name}</div>
                        <div className="text-gray-500 text-sm">{review.date}</div>
                      </div>
                      <div className="flex text-yellow-400 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={star <= review.rating ? '⭐' : '☆'}></span>
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button className="text-purple-600 font-medium hover:text-purple-800 transition">
                    Load More Reviews
                  </button>
                </div>
              </div>
            )}
            
            {previewActiveTab === 'locations' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Clinic Locations & Timings</h3>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="font-bold text-lg text-gray-800 mb-3">{hospital}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="text-red-500 mr-3 mt-1">📍</span>
                          <div>
                            <p className="font-semibold text-gray-700">Address</p>
                            <p className="text-gray-600">123 Main Street, City Center<br/>Bangalore - 560001</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="text-green-500 mr-3 mt-1">📞</span>
                          <div>
                            <p className="font-semibold text-gray-700">Phone</p>
                            <p className="text-gray-600">{formData.phoneNumber || '+91 9876543210'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="text-blue-500 mr-3 mt-1">💰</span>
                          <div>
                            <p className="font-semibold text-gray-700">Consultation Fee</p>
                            <p className="text-gray-600">₹{consultationFee}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="text-purple-500 mr-3 mt-1">🏥</span>
                          <div>
                            <p className="font-semibold text-gray-700">Specialization</p>
                            <p className="text-gray-600">{specialization}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h5 className="font-bold text-gray-800 mb-3">Consultation Hours</h5>
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-40">Monday - Friday:</span>
                          <span className="text-gray-700">09:00 AM - 01:00 PM</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-40">Saturday:</span>
                          <span className="text-gray-700">10:00 AM - 02:00 PM</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-40">Sunday:</span>
                          <span className="text-gray-700">11:00 AM - 03:00 PM</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h5 className="font-bold text-gray-800 mb-3">Available Services</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {servicesList.map((service, index) => (
                          <div key={index} className="flex items-center">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-700">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formData.isAvailableForEmergency && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-red-500 mr-2">🚨</span>
                          <span className="font-semibold text-red-700">Available for Emergency Consultations</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <button className="text-purple-600 font-medium hover:text-purple-800 transition flex items-center">
                        <span className="mr-2">🗺️</span>
                        Get Directions
                      </button>
                    </div>
                  </div>
                  
                  {/* Second Clinic */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="font-bold text-lg text-gray-800 mb-3">Health Plus Clinic</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="text-red-500 mr-3 mt-1">📍</span>
                          <div>
                            <p className="font-semibold text-gray-700">Address</p>
                            <p className="text-gray-600">45 Park Avenue, Indiranagar<br/>Bangalore - 560038</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="text-green-500 mr-3 mt-1">📞</span>
                          <div>
                            <p className="font-semibold text-gray-700">Phone</p>
                            <p className="text-gray-600">+91 9876543211</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="text-blue-500 mr-3 mt-1">💰</span>
                          <div>
                            <p className="font-semibold text-gray-700">Consultation Fee</p>
                            <p className="text-gray-600">₹{consultationFee}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="text-purple-500 mr-3 mt-1">🏥</span>
                          <div>
                            <p className="font-semibold text-gray-700">Specialization</p>
                            <p className="text-gray-600">{specialization}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h5 className="font-bold text-gray-800 mb-3">Consultation Hours</h5>
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-40">Monday - Wednesday:</span>
                          <span className="text-gray-700">05:00 PM - 09:00 PM</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-40">Sunday:</span>
                          <span className="text-gray-700">11:00 AM - 03:00 PM</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button className="text-purple-600 font-medium hover:text-purple-800 transition flex items-center">
                        <span className="mr-2">🗺️</span>
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {previewActiveTab === 'faq' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      question: "What should I bring to my appointment?",
                      answer: "Please bring your ID, insurance information (if applicable), and any previous medical records or test results relevant to your condition. Also, prepare a list of your current medications and any questions you might have."
                    },
                    {
                      question: "How do I prepare for a video consultation?",
                      answer: "Ensure you have a stable internet connection and a quiet, well-lit space. Test your camera and microphone beforehand. Have any medical documents ready to share and prepare a list of symptoms or questions to discuss."
                    },
                    {
                      question: `What is the consultation fee for ${specialization}?`,
                      answer: `The consultation fee is ₹${consultationFee}. This includes a comprehensive evaluation and treatment recommendations. Follow-up consultations may have different pricing.`
                    },
                    {
                      question: `What conditions does ${doctorName || 'the doctor'} treat?`,
                      answer: `${doctorName || 'Our doctor'} specializes in ${specialization} and treats various related conditions. With ${experience} of experience, comprehensive care is provided for all patients.`
                    },
                    {
                      question: "Is emergency consultation available?",
                      answer: formData.isAvailableForEmergency ? 
                        `Yes, ${doctorName || 'the doctor'} is available for emergency consultations. Please contact the clinic directly for urgent medical situations.` :
                        "For emergency medical situations, please contact your nearest emergency services or hospital emergency department."
                    },
                    {
                      question: "What insurance plans are accepted?",
                      answer: "We accept most major insurance plans. Please contact our office directly with your specific insurance information to verify coverage prior to your appointment."
                    },
                    {
                      question: "How can I get my prescription refilled?",
                      answer: "You can request prescription refills through our patient portal, by calling our office, or during your follow-up appointment. Please allow 48 hours for processing refill requests."
                    },
                    {
                      question: "What is the cancellation policy?",
                      answer: "We request that you notify us at least 24 hours in advance if you need to cancel or reschedule your appointment. This allows us to offer the time slot to another patient in need."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-gray-800">{faq.question}</h4>
                          <span className="text-purple-600 text-xl">❓</span>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFormFields = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Image
                </label>
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {formData.imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={formData.imagePreview} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Password fields for new doctors only */}
            {!isEdit && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    minLength="6"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    minLength="6"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Cardiology, Neurology"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.specialization ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="Medical license number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Education *
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="e.g., MBBS, MD"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.education ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hospital Affiliation
                </label>
                <input
                  type="text"
                  name="hospitalAffiliation"
                  value={formData.hospitalAffiliation}
                  onChange={handleInputChange}
                  placeholder="Current hospital or clinic"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Consultation Fee (₹) *
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="500"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.consultationFee ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.consultationFee && <p className="text-red-500 text-sm mt-1">{errors.consultationFee}</p>}
              </div>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailableForEmergency"
                  checked={formData.isAvailableForEmergency}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Available for Emergency</span>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                About Doctor
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                rows="4"
                placeholder="Brief description about the doctor..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Patient Count
              </label>
              <input
                type="text"
                name="patientCount"
                value={formData.patientCount}
                onChange={handleInputChange}
                placeholder="e.g., 500+, 1000+"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Areas of Expertise
              </label>
              <textarea
                name="expertise"
                value={formData.expertise}
                onChange={handleInputChange}
                rows="3"
                placeholder="Heart Surgery, Cardiac Care, Emergency Medicine"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple areas with commas</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Services Offered
              </label>
              <textarea
                name="services"
                value={formData.services}
                onChange={handleInputChange}
                rows="3"
                placeholder="Online consultations, In-person visits, Follow-up consultations"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple services with commas</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Biography
              </label>
              <textarea
                name="biography"
                value={formData.biography}
                onChange={handleInputChange}
                rows="4"
                placeholder="Detailed professional biography..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Experience
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe professional experience, previous positions, achievements..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Languages Spoken
              </label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleInputChange}
                placeholder="English,Hindi,Tamil"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Separate languages with commas (no spaces)</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Enhanced Patient View Preview */}
            {renderPatientViewPreview()}
            
            {/* Review Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                Doctor Profile Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><strong>Name:</strong> Dr. {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                  <p><strong>Specialization:</strong> {formData.specialization}</p>
                  <p><strong>Education:</strong> {formData.education}</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Experience:</strong> {formData.yearsOfExperience} years</p>
                  <p><strong>Fee:</strong> ₹{formData.consultationFee}</p>
                  <p><strong>Hospital:</strong> {formData.hospitalAffiliation}</p>
                  <p><strong>License:</strong> {formData.licenseNumber}</p>
                  <p><strong>Emergency:</strong> {formData.isAvailableForEmergency ? 'Available' : 'Not Available'}</p>
                </div>
              </div>
              
              {!isEdit && formData.password && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>🔑 Login Credentials:</strong> The doctor can login with email <strong>{formData.email}</strong> and the password you set.
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium flex items-center">
                <span className="text-green-600 mr-2">🎉</span>
                Ready to {isEdit ? 'update' : 'create'} doctor profile! Click "{isEdit ? 'Update Doctor' : 'Create Doctor'}" to save.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{paddingTop: '80px'}}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              {isEdit ? 'Edit Doctor Profile' : 'Add New Doctor'}
            </h1>
            <p className="text-purple-100 mt-2">
              {isEdit ? 'Update doctor information and profile details' : 'Create a comprehensive doctor profile with all details'}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Step Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Step {currentStep}: {stepTitles[currentStep]}
              </h2>
              <p className="text-gray-600">
                {currentStep === 1 && "Enter basic personal information and login credentials"}
                {currentStep === 2 && "Add professional credentials and details"}
                {currentStep === 3 && "Create compelling profile content"}
                {currentStep === 4 && "Review all information and see patient view preview"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {renderFormFields()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Previous
                </button>

                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    Step {currentStep} of 4
                  </span>
                </div>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
  type="button"
  onClick={handleFinalSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💾</span>
                        {isEdit ? 'Update Doctor' : 'Create Doctor'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Cancel Button */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard')}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Cancel and Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorForm; 