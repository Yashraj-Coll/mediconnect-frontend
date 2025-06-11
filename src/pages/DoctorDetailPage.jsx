import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DoctorService from '../services/DoctorService';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';
import DoctorCard from '../components/DoctorCard';


// Helper function to get the correct image URL based on various formats
const getImageUrl = (profileImage, gender) => {
  // If no profile image, return gender-specific default
  if (!profileImage) {
    if (gender === 'FEMALE') {
      return '/images/Female Doctor.jpg';
    } else {
      return '/images/Male Doctor.jpg';
    }
  }

  // For debugging - check if image has default values we don't want to use
  if (profileImage.includes('default-profile.jpg') || profileImage.includes('/assets/images/')) {
    if (gender === 'FEMALE') {
      return '/images/Female Doctor.jpg';
    } else {
      return '/images/Male Doctor.jpg';
    }
  }

  // Just use the direct filename with the uploads path
  return `${API_BASE_URL}/uploads/${profileImage}`;
};

const DoctorDetailPage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      console.log('Fetching doctor details for ID:', id);
      const result = await DoctorService.getDoctorById(id);
      
      if (result.success) {
        // Process the doctor data for display
        const doctorData = result.data;
        
        // Update the profileImage path if it exists
        if (doctorData) {
          doctorData.profileImage = getImageUrl(doctorData.profileImage, doctorData.gender);
        }
        
        setDoctor(doctorData);
      } else {
        setError(result.error || 'Failed to fetch doctor details');
      }
    } catch (err) {
      setError('An error occurred while fetching doctor details');
      console.error('Error fetching doctor:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDoctorName = (doctor) => {
    // Make sure we correctly format the doctor's name
    if (!doctor) return 'Unknown Doctor';
    
    // Check for direct name property
    if (doctor.name) return doctor.name;
    
    // Check for nested user object
    if (doctor.user) {
      const { firstName, lastName } = doctor.user;
      if (firstName || lastName) {
        return `Dr. ${firstName || ''} ${lastName || ''}`.trim();
      }
    }
    
    // Check for flat structure
    if (doctor.firstName || doctor.lastName) {
      return `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    }
    
    return 'Unknown Doctor';
  };

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
            <h2 className="text-2xl font-bold mb-2">Error Loading Doctor Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchDoctorDetails}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Make sure we have doctor data
  if (!doctor) {
    return (
      <div className="pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <i className="fas fa-user-md text-purple-500 text-4xl mb-4"></i>
            <h2 className="text-2xl font-bold mb-2">Doctor Not Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find information for this doctor.</p>
            <Link 
              to="/doctors"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition inline-block"
            >
              View All Doctors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const doctorName = formatDoctorName(doctor);
  const specialization = doctor.specialization || 'General Practice';
  const education = doctor.education || 'MD';
  const experience = doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years` : '10+ years';
  const languages = doctor.languages && doctor.languages.length > 0 ? doctor.languages : ['Not specified'];
  const hospital = doctor.hospitalAffiliation || 'City Hospital';
  const consultationFee = doctor.consultationFee || 500;
  const gender = doctor.gender || 'MALE'; // Default to MALE if not specified

  return (
    <div className="pt-28 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Doctor profile header with background */}
        <div className="bg-purple-600 rounded-t-xl h-48 relative mb-16">
          <div className="absolute -bottom-16 left-10">
            <div className="h-32 w-32 rounded-full bg-white p-1">
              <img 
                src={doctor.profileImage} 
                alt={doctorName}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  const fallbackImage = gender === 'FEMALE' ? 
                    '/images/Female Doctor.jpg' : 
                    '/images/Male Doctor.jpg';
                  e.target.src = fallbackImage;
                }}
              />
            </div>
          </div>
        </div>

        {/* Doctor info and booking section */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="p-6 flex flex-col md:flex-row">
            {/* Doctor Info */}
            <div className="md:w-8/12">
              <h1 className="text-3xl font-bold mb-1">{doctorName}</h1>
              <p className="text-purple-600 font-medium mb-2">{specialization}</p>
              <p className="text-gray-600 mb-4">{education} • {experience} experience</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {doctor.isAvailableForEmergency && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                    Available for Emergency
                  </span>
                )}
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  <i className="fas fa-star mr-1"></i>
                  {doctor.averageRating || '4.8'} Rating
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  <i className="fas fa-user-md mr-1"></i>
                  {doctor.patientCount || '500+'} Patients
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-700">
                    <i className="fas fa-hospital mr-2 text-purple-500"></i>
                    {hospital}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <i className="fas fa-language mr-2 text-purple-500"></i>
                    {Array.isArray(languages) && languages.length > 0 ? languages.join(', ') : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <i className="fas fa-id-card mr-2 text-purple-500"></i>
                    License No: {doctor.licenseNumber || 'MED12345'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <i className="fas fa-money-bill-wave mr-2 text-purple-500"></i>
                    Consultation Fee: ₹{consultationFee}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Booking Section */}
            <div className="md:w-4/12 md:pl-6 mt-6 md:mt-0 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Book an Appointment</h3>
                <p className="text-gray-600 mb-4">
                  Available for both video consultations and in-person visits.
                </p>
                
                <Link 
                  to={isAuthenticated ? `/appointment/${doctor.id}` : `/login?redirect=/appointment/${doctor.id}`}
                  className="block bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-lg transition duration-300 text-center mb-3"
                >
                  Book Video Consultation
                </Link>
                
                <Link 
                  to={isAuthenticated ? `/in-person-appointment/${doctor.id}` : `/login?redirect=/in-person-appointment/${doctor.id}`}
                  className="block bg-white text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 transition duration-300 text-center border border-purple-200"
                >
                  Book In-person Visit
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for different sections */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button 
                className={`px-6 py-4 text-center whitespace-nowrap font-medium text-sm ${activeTab === 'overview' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-6 py-4 text-center whitespace-nowrap font-medium text-sm ${activeTab === 'experience' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('experience')}
              >
                Experience & Education
              </button>
              <button 
                className={`px-6 py-4 text-center whitespace-nowrap font-medium text-sm ${activeTab === 'reviews' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
              <button 
                className={`px-6 py-4 text-center whitespace-nowrap font-medium text-sm ${activeTab === 'locations' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('locations')}
              >
                Locations & Timings
              </button>
              <button 
                className={`px-6 py-4 text-center whitespace-nowrap font-medium text-sm ${activeTab === 'faq' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('faq')}
              >
                FAQs
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-bold mb-4">About Doctor</h3>
                <p className="text-gray-700 mb-6">
                  {doctor.about || 
                  `${doctorName} is a specialist in ${specialization} with over ${experience} of clinical experience. 
                  ${doctorName} has expertise in diagnosing and treating various medical conditions related to ${specialization}.`}
                </p>
                
                {/* Areas of Expertise - ENHANCED */}
<h4 className="text-lg font-bold mb-3">Areas of Expertise</h4>
<ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
  {(doctor.areasOfExpertise || doctor.expertise || [
    'General consultations',
    `${doctor.specialization || 'Medical'} disorders`,
    'Preventive healthcare',
    'Health education'
  ]).map((item, index) => (
    <li key={index} className="flex items-start">
      <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
      <span>{item}</span>
    </li>
  ))}
</ul>

{/* Services Offered - ENHANCED */}
<h4 className="text-lg font-bold mb-3">Services Offered</h4>
<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
  {(doctor.servicesOffered || doctor.services || [
    'Online consultations',
    'In-person visits',
    'Follow-up consultations',
    'Health check-ups'
  ]).map((service, index) => (
    <li key={index} className="flex items-start">
      <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
      <span>{service}</span>
    </li>
  ))}
</ul>
              </div>
            )}
            
            {activeTab === 'experience' && (
  <div className="space-y-6">
    {/* Professional Experience - ENHANCED */}
    <h3 className="text-xl font-bold mb-4">Professional Experience</h3>
    <div className="space-y-6">
      {(doctor.professionalExperience || doctor.experiences || [
        { 
          hospital: doctor.hospitalAffiliation || 'City Hospital', 
          role: `Senior ${doctor.specialization || 'Medical'} Specialist`, 
          period: "2015 - Present",
          description: "Providing consultations and treatment to patients."
        }
      ]).map((exp, index) => (
        <div key={index} className="border-l-4 border-purple-200 pl-4 py-1">
          <h4 className="font-bold text-gray-800">{exp.role}</h4>
          <p className="text-purple-600">{exp.hospital}</p>
          <p className="text-gray-600 text-sm">{exp.period}</p>
          <p className="text-gray-700 mt-1">{exp.description}</p>
        </div>
      ))}
    </div>

    {/* Education & Training - ENHANCED */}
    <h3 className="text-xl font-bold mb-4 mt-8">Education & Training</h3>
    <div className="space-y-6">
      {(doctor.educationTraining || doctor.educationDetails || [
        { 
          degree: doctor.education || 'MD', 
          institution: "Harvard Medical School", 
          year: "2010"
        }
      ]).map((edu, index) => (
        <div key={index} className="border-l-4 border-blue-200 pl-4 py-1">
          <h4 className="font-bold text-gray-800">{edu.degree}</h4>
          <p className="text-blue-600">{edu.institution}</p>
          <p className="text-gray-600 text-sm">{edu.year}</p>
        </div>
      ))}
    </div>

    {/* Awards & Recognitions - ENHANCED */}
    <h3 className="text-xl font-bold mb-4 mt-8">Awards & Recognitions</h3>
    <div className="space-y-4">
      {(doctor.awardsRecognitions || doctor.awards || [
        { 
          title: "Excellence in Patient Care", 
          year: "2018",
          organization: "Indian Medical Association"
        }
      ]).map((award, index) => (
        <div key={index} className="flex items-start">
          <i className="fas fa-award text-yellow-500 mt-1 mr-3 text-xl"></i>
          <div>
            <h4 className="font-bold text-gray-800">{award.title}</h4>
            <p className="text-gray-600">{award.organization}, {award.year}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
            
            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Patient Reviews</h3>
                  {isAuthenticated && (
                    <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition">
                      Write a Review
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center">
                  <div className="md:w-1/3 text-center mb-4 md:mb-0">
                    <div className="text-5xl font-bold text-purple-600 mb-1">{doctor.averageRating || '4.8'}</div>
                    <div className="flex justify-center text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <i key={star} className={`fas fa-star ${star <= Math.round(doctor.averageRating || 4.8) ? '' : 'text-gray-300'}`}></i>
                      ))}
                    </div>
                    <p className="text-gray-600">Based on {doctor.reviewCount || '120'} reviews</p>
                  </div>
                  
                  <div className="md:w-2/3 md:pl-6">
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map(rating => {
                        const percent = rating === 5 ? 70 : 
                                       rating === 4 ? 20 : 
                                       rating === 3 ? 5 : 
                                       rating === 2 ? 3 : 2;
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
                  {(doctor.reviews || [
                    {
                      name: "Rahul Sharma",
                      rating: 5,
                      date: "2 months ago",
                      comment: "Excellent doctor! Very attentive and knowledgeable. I felt very comfortable during the consultation and all my concerns were addressed."
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
                      comment: "Very happy with the treatment. The doctor explained everything clearly and the prescribed medication worked well."
                    }
                  ]).map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6">
                      <div className="flex justify-between mb-2">
                        <div className="font-bold text-gray-800">{review.name}</div>
                        <div className="text-gray-500 text-sm">{review.date}</div>
                      </div>
                      <div className="flex text-yellow-400 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <i key={star} className={`fas fa-star ${star <= review.rating ? '' : 'text-gray-300'}`}></i>
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
            
            {activeTab === 'locations' && (
  <div className="space-y-6">
    {/* ALWAYS SHOW PRIMARY CLINIC - No condition check */}
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="font-bold text-lg text-gray-800 mb-2">
        {doctor.clinicName || doctor.hospitalAffiliation || `${doctor.specialization || 'Medical'} Clinic`}
      </h4>
      
      {/* Address with City, State, Pincode - DYNAMIC FALLBACKS */}
      <div className="flex items-start mb-3">
        <i className="fas fa-map-marker-alt text-red-500 mt-1 mr-3"></i>
        <p className="text-gray-700">
          {(() => {
            const addressParts = [];
            
            // Use doctor's clinic info if available
            if (doctor.clinicAddress) addressParts.push(doctor.clinicAddress);
            if (doctor.clinicCity) addressParts.push(doctor.clinicCity);
            if (doctor.clinicState) addressParts.push(doctor.clinicState);
            if (doctor.clinicPincode) addressParts.push(`- ${doctor.clinicPincode}`);
            
            // If we have address parts, return them
            if (addressParts.length > 0) {
              return addressParts.join(', ');
            }
            
            // DYNAMIC FALLBACK based on doctor ID or specialization
            const doctorId = doctor.id || 1;
            const specialization = doctor.specialization || 'Medical';
            
            const fallbackLocations = [
              "178/181 Naskar Para Road, Ghusuri, Howrah, West Bengal - 711107",
              "45/2 Park Street, Kolkata, West Bengal - 700016", 
              "123 Salt Lake City, Sector V, Kolkata, West Bengal - 700091",
              "67 Gariahat Road, Dhakuria, Kolkata, West Bengal - 700031",
              "89 Rashbehari Avenue, Ballygunge, Kolkata, West Bengal - 700019",
              "234 Lenin Sarani, Esplanade, Kolkata, West Bengal - 700013",
              "156 Camac Street, Park Circus, Kolkata, West Bengal - 700017"
            ];
            
            return fallbackLocations[doctorId % fallbackLocations.length];
          })()}
        </p>
      </div>
      
      {/* Phone - DYNAMIC FALLBACK */}
      <div className="flex items-start mb-4">
        <i className="fas fa-phone-alt text-green-500 mt-1 mr-3"></i>
        <p className="text-gray-700">
          {(() => {
            if (doctor.clinicPhone) return doctor.clinicPhone;
            if (doctor.user?.phoneNumber) return doctor.user.phoneNumber;
            if (doctor.phoneNumber) return doctor.phoneNumber;
            
            // Dynamic fallback phone based on doctor ID
            const doctorId = doctor.id || 1;
            const basePhone = 9051117000;
            return `${basePhone + doctorId}`;
          })()}
        </p>
      </div>
      
      <h5 className="font-bold text-gray-800 mb-2">Consultation Hours</h5>
      
{/* Smart Time Grouping with DYNAMIC FALLBACKS */}
<div className="space-y-2">
  {(() => {
    // Get timings with dynamic fallbacks
    const getTimingWithFallback = (timing, defaultTiming) => {
      if (timing && timing !== '' && timing.toLowerCase() !== 'closed') return timing;
      return defaultTiming;
    };
    
    // Different default schedules based on specialization
    const getDefaultSchedule = () => {
      const specialization = doctor.specialization?.toLowerCase() || '';
      const doctorId = doctor.id || 1;
      
      if (specialization.includes('cardio')) {
        return {
          weekday: '08:00 AM - 02:00 PM',
          saturday: '09:00 AM - 01:00 PM',
          sunday: 'Closed'
        };
      } else if (specialization.includes('derma') || specialization.includes('skin')) {
        return {
          weekday: '10:00 AM - 06:00 PM',
          saturday: '10:00 AM - 02:00 PM', 
          sunday: 'Closed'
      };
      } else if (specialization.includes('ortho') || specialization.includes('bone')) {
        return {
          weekday: '09:00 AM - 05:00 PM',
          saturday: '09:00 AM - 01:00 PM',
          sunday: 'Closed'
        };
      } else {
        // General schedule with slight variation based on doctor ID
        const schedules = [
          { weekday: '09:00 AM - 01:00 PM', saturday: '10:00 AM - 02:00 PM', sunday: 'Closed' },
          { weekday: '10:00 AM - 02:00 PM', saturday: '09:00 AM - 01:00 PM', sunday: 'Closed' },
          { weekday: '08:00 AM - 12:00 PM', saturday: '08:00 AM - 12:00 PM', sunday: 'Closed' },
          { weekday: '11:00 AM - 03:00 PM', saturday: '11:00 AM - 01:00 PM', sunday: 'Closed' },
          { weekday: '09:00 AM - 05:00 PM', saturday: '09:00 AM - 01:00 PM', sunday: 'Closed' }
        ];
        return schedules[doctorId % schedules.length];
      }
    };
    
    const defaultSchedule = getDefaultSchedule();
    
    // NORMALIZE timing strings for better comparison
    const normalizeTiming = (timing) => {
      if (!timing || timing.toLowerCase().includes('closed')) return 'Closed';
      return timing.trim().replace(/\s+/g, ' '); // Remove extra spaces
    };
    
    const timings = {
      monday: normalizeTiming(getTimingWithFallback(doctor.mondayTiming, defaultSchedule.weekday)),
      tuesday: normalizeTiming(getTimingWithFallback(doctor.tuesdayTiming, defaultSchedule.weekday)), 
      wednesday: normalizeTiming(getTimingWithFallback(doctor.wednesdayTiming, defaultSchedule.weekday)),
      thursday: normalizeTiming(getTimingWithFallback(doctor.thursdayTiming, defaultSchedule.weekday)),
      friday: normalizeTiming(getTimingWithFallback(doctor.fridayTiming, defaultSchedule.weekday)),
      saturday: normalizeTiming(getTimingWithFallback(doctor.saturdayTiming, defaultSchedule.saturday)),
      sunday: normalizeTiming(getTimingWithFallback(doctor.sundayTiming, defaultSchedule.sunday))
    };

    console.log('Doctor timings:', timings); // For debugging

    // Group same timings together
    const timeGroups = {};
    Object.entries(timings).forEach(([day, time]) => {
      if (!timeGroups[time]) {
        timeGroups[time] = [];
      }
      timeGroups[time].push(day);
    });

    console.log('Time groups:', timeGroups); // For debugging

    return Object.entries(timeGroups).map(([time, days], index) => {
      // Sort days in correct order
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const sortedDays = days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
      
      // Format day names properly
      const dayNames = sortedDays.map(day => 
        day.charAt(0).toUpperCase() + day.slice(1)
      );
      
      let displayDays;
      
      // Check for Monday-Friday pattern (most common)
      if (sortedDays.length === 5 && 
          sortedDays.includes('monday') && 
          sortedDays.includes('tuesday') && 
          sortedDays.includes('wednesday') && 
          sortedDays.includes('thursday') && 
          sortedDays.includes('friday') &&
          !sortedDays.includes('saturday') &&
          !sortedDays.includes('sunday')) {
        displayDays = 'Monday - Friday';
      }
      // Check for Monday-Saturday pattern
      else if (sortedDays.length === 6 && 
               sortedDays.includes('monday') && 
               sortedDays.includes('saturday') &&
               !sortedDays.includes('sunday')) {
        displayDays = 'Monday - Saturday';
      }
      // Check for consecutive weekdays
      else if (sortedDays.length > 2) {
        const firstDay = dayNames[0];
        const lastDay = dayNames[dayNames.length - 1];
        
        // Check if days are consecutive
        const firstIndex = dayOrder.indexOf(sortedDays[0]);
        const lastIndex = dayOrder.indexOf(sortedDays[sortedDays.length - 1]);
        const isConsecutive = (lastIndex - firstIndex + 1) === sortedDays.length;
        
        if (isConsecutive) {
          displayDays = `${firstDay} - ${lastDay}`;
        } else {
          displayDays = dayNames.join(', ');
        }
      }
      // For 1-2 days, list them individually
      else {
        displayDays = dayNames.join(', ');
      }

      return (
        <div key={index} className="flex">
          <span className="font-medium text-gray-700 w-40">{displayDays}:</span>
          <span className="text-gray-700">{time}</span>
        </div>
      );
    });
  })()}
</div>
      
      {/* Online Consultation Badge */}
      {(doctor.onlineConsultation || doctor.specialization) && (
        <div className="mt-4">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            <i className="fas fa-video mr-1"></i>
            Online Consultation Available
          </span>
        </div>
      )}
      
      {/* Get Directions Button */}
      <div className="mt-4">
        <button className="text-purple-600 font-medium hover:text-purple-800 transition flex items-center">
          <i className="fas fa-directions mr-2"></i>
          Get Directions
        </button>
      </div>
    </div>
  </div>
)}
            
            {activeTab === 'faq' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      question: "What should I bring to my first appointment?",
                      answer: "Please bring your ID, insurance information (if applicable), and any previous medical records or test results relevant to your condition. Also, come prepared with a list of your current medications and any questions you might have."
                    },
                    {
                      question: "How do I prepare for a video consultation?",
                      answer: "Ensure you have a stable internet connection and a quiet, well-lit space for the consultation. Test your camera and microphone beforehand. Have any medical documents ready to share and make a list of symptoms or questions to discuss."
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
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <div className="p-4 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-gray-800">{faq.question}</h4>
                          <i className="fas fa-chevron-down text-purple-600"></i>
                        </div>
                        <div className="mt-2 text-gray-700">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;