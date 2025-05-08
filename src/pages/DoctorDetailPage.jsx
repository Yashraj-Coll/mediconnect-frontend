import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DoctorService from '../services/DoctorService';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      const result = await DoctorService.getDoctorById(id);
      if (result.success) {
        setDoctor(result.data);
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
    if (!doctor?.user) return 'Unknown Doctor';
    return `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;
  };

  const getExperienceText = (doctor) => {
    if (doctor?.yearsOfExperience) {
      return `${doctor.yearsOfExperience}+ years`;
    }
    return '0 years';
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
      <div className="pt-32 pb-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <i className="fas fa-exclamation-circle text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2">Doctor Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link 
              to="/doctors"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700"
            >
              Back to Doctors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Doctor Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-primary h-32 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white">
                <img 
                  src="/api/placeholder/150/150" 
                  alt={formatDoctorName(doctor)}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="pt-20 pb-6 px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold">{formatDoctorName(doctor)}</h1>
                <p className="text-purple-600 font-medium">{doctor?.specialization}</p>
                <p className="text-gray-600 text-sm mt-1">{doctor?.education || 'No education data'}</p>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400 mr-2">
                    <i className="fas fa-star"></i>
                    <span className="ml-1 text-gray-700">{doctor?.averageRating || 'N/A'}</span>
                  </div>
                  <span className="text-gray-500">(reviews not available)</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Link 
                  to={`/appointment/${doctor?.id}`}
                  className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="md:w-2/3">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button 
                    className={`px-6 py-4 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button 
                    className={`px-6 py-4 text-sm font-medium ${activeTab === 'experience' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('experience')}
                  >
                    Experience & Education
                  </button>
                  <button 
                    className={`px-6 py-4 text-sm font-medium ${activeTab === 'reviews' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    Reviews
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">About Doctor</h2>
                    <p className="text-gray-600 mb-6">
                      {doctor?.biography || 'No biography available.'}
                    </p>

                    <h3 className="text-lg font-bold mb-3">Experience</h3>
                    <p className="text-gray-600 mb-6">
                      {doctor?.experience || 'No experience details available.'}
                    </p>

                    <h3 className="text-lg font-bold mb-3">Languages</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {/* Since languages aren't in the backend model yet, showing default */}
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">English</span>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">Hindi</span>
                    </div>
                  </div>
                )}

                {/* Experience & Education Tab */}
                {activeTab === 'experience' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Education & Training</h2>
                    <div className="space-y-4 mb-8">
                      {doctor?.education ? (
                        <div className="flex">
                          <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                            <i className="fas fa-graduation-cap text-purple-600"></i>
                          </div>
                          <div>
                            <p className="text-gray-800">{doctor.education}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600">No education information available.</p>
                      )}
                    </div>

                    <h2 className="text-xl font-bold mb-4">Professional Experience</h2>
                    <div className="space-y-4">
                      {doctor?.experience ? (
                        <div className="flex">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <i className="fas fa-briefcase text-blue-600"></i>
                          </div>
                          <div>
                            <p className="text-gray-800 font-medium">Professional Experience</p>
                            <p className="text-gray-600">{doctor.experience}</p>
                            {doctor.yearsOfExperience && (
                              <p className="text-gray-500 text-sm">{getExperienceText(doctor)} experience</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600">No experience information available.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="bg-green-100 rounded-lg py-2 px-4 mr-4">
                        <span className="text-3xl font-bold text-green-700">{doctor?.averageRating || 'N/A'}</span>
                      </div>
                      <div>
                        <div className="flex text-yellow-400 mb-1">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star-half-alt"></i>
                        </div>
                        <p className="text-gray-600">Reviews not available</p>
                      </div>
                    </div>

                    <div className="text-center py-8">
                      <i className="fas fa-comment-alt text-4xl text-gray-300 mb-3"></i>
                      <p className="text-gray-500">No reviews yet for this doctor.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:w-1/3">
            {/* Appointment Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold mb-2">Book Appointment</h3>
                <p className="text-gray-600 mb-4">Consultation Fee: ₹{doctor?.consultationFee || 'Not available'}</p>
                <Link 
                  to={`/appointment/${doctor?.id}`}
                  className="block w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-lg transition text-center"
                >
                  Book Video Consultation
                </Link>
              </div>
              <div className="p-6">
                <h4 className="font-medium mb-3">Available Slots</h4>
                
                <div className="mb-4">
                  <h5 className="text-sm text-gray-500 mb-2">Morning</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">09:00 AM</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">10:00 AM</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">11:00 AM</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-sm text-gray-500 mb-2">Afternoon</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">01:00 PM</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">02:00 PM</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">03:00 PM</span>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm text-gray-500 mb-2">Evening</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">05:00 PM</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">06:00 PM</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">07:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Info */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Hospital Information</h3>
                <div className="flex items-start mb-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-hospital text-blue-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">{doctor?.hospitalAffiliation || 'Hospital Information Not Available'}</h4>
                    <p className="text-gray-600 text-sm">Hospital affiliation</p>
                  </div>
                </div>
                <div className="flex items-start mb-4">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-id-card text-green-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">License Number</h4>
                    <p className="text-gray-600 text-sm">{doctor?.licenseNumber || 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;