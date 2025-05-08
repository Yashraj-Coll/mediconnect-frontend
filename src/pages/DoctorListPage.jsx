import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
// Default doctor profile image
const DEFAULT_PROFILE_IMAGE = '/assets/images/default-doctor.jpg';

const DoctorListPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedConsultationType, setSelectedConsultationType] = useState('video');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [languages, setLanguages] = useState([]);
  const { isAuthenticated, token } = useAuth();

  // Fetch all doctors when component mounts
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // Use the public endpoint for non-authenticated users
      const url = '/api/doctors/public/all';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(url, { headers });
      
      // Process the response data
      const doctorsData = response.data;
      
      // Extract unique specialties from the doctor data
      const allSpecialties = [...new Set(doctorsData.map(doctor => doctor.specialization))];
      setSpecialties(allSpecialties);
      
      // Create list of doctors with properly formatted data
      const formattedDoctors = doctorsData.map(doctor => {
        // Fetch doctor languages from doctor_languages table if available
        // For now, using default languages
        const doctorLanguages = ['English', 'Hindi', 'Bengali'];
        
        return {
          id: doctor.id,
          name: `${doctor.user.firstName} ${doctor.user.lastName}`,
          specialty: doctor.specialization,
          qualifications: doctor.education || 'MBBS',
          experience: doctor.yearsOfExperience ? `${doctor.yearsOfExperience}+ years` : 'N/A',
          hospital: doctor.hospitalAffiliation,
          languages: doctorLanguages,
          licenseNo: doctor.licenseNumber,
          rating: doctor.averageRating || 4.5,
          reviews: Math.floor(Math.random() * 500) + 100, // Random number for demo
          nextAvailable: getNextAvailableSlot(),
          consultationFee: doctor.consultationFee,
          profileImage: doctor.profileImage || DEFAULT_PROFILE_IMAGE,
          isAvailableForEmergency: doctor.isAvailableForEmergency
        };
      });
      
      // Extract unique languages from all doctors
      const allLanguages = [...new Set(formattedDoctors.flatMap(doctor => doctor.languages))];
      setLanguages(allLanguages);
      
      setDoctors(formattedDoctors);
      setFilteredDoctors(formattedDoctors);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again later.');
      setLoading(false);
    }
  };

  // Helper function to get a random available slot for demo purposes
  const getNextAvailableSlot = () => {
    const slots = ['Today', 'Tomorrow', 'In 2 days'];
    return slots[Math.floor(Math.random() * slots.length)];
  };

  // Filter doctors based on search criteria
  useEffect(() => {
    let results = doctors;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(doctor => 
        doctor.name.toLowerCase().includes(term) ||
        doctor.specialty.toLowerCase().includes(term) ||
        (doctor.hospital && doctor.hospital.toLowerCase().includes(term))
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      results = results.filter(doctor => 
        doctor.specialty === selectedSpecialty
      );
    }

    // Filter by language
    if (selectedLanguage) {
      results = results.filter(doctor => 
        doctor.languages.includes(selectedLanguage)
      );
    }

    // Filter by experience
    if (selectedExperience) {
      const yearsPart = doctor => parseInt(doctor.experience.split(' ')[0]) || 0;
      
      if (selectedExperience === "0-5") {
        results = results.filter(doctor => yearsPart(doctor) <= 5);
      } else if (selectedExperience === "5-10") {
        results = results.filter(doctor => yearsPart(doctor) > 5 && yearsPart(doctor) <= 10);
      } else if (selectedExperience === "10+") {
        results = results.filter(doctor => yearsPart(doctor) > 10);
      }
    }

    setFilteredDoctors(results);
  }, [searchTerm, selectedSpecialty, selectedLanguage, selectedExperience, doctors]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSpecialtyChange = (e) => {
    setSelectedSpecialty(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleExperienceChange = (e) => {
    setSelectedExperience(e.target.value);
  };

  const handleConsultationTypeChange = (type) => {
    setSelectedConsultationType(type);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedLanguage('');
    setSelectedExperience('');
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
            <h2 className="text-2xl font-bold mb-2">Error Loading Doctors</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchDoctors}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  return (
    <div className="pt-28 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Doctors & Book Appointments</h1>
          <p className="text-gray-600">Connect with top specialists for video consultations or in-person visits</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by doctor name, specialty, or hospital"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <div className="md:w-1/4">
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={selectedSpecialty}
                onChange={handleSpecialtyChange}
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty, index) => (
                  <option key={index} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
            <div className="md:w-48">
              <button 
                onClick={() => handleConsultationTypeChange('video')}
                className={`${selectedConsultationType === 'video' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 border-gray-300 border'} 
                  w-full p-3 rounded-lg font-medium transition`}
              >
                <i className="fas fa-video mr-2"></i> Video Consultation
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Languages:</span>
              <select
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={selectedLanguage}
                onChange={handleLanguageChange}
              >
                <option value="">All Languages</option>
                {languages.map((language, index) => (
                  <option key={index} value={language}>{language}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Experience:</span>
              <select
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={selectedExperience}
                onChange={handleExperienceChange}
              >
                <option value="">Any Experience</option>
                <option value="0-5">0-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            {(searchTerm || selectedSpecialty || selectedLanguage || selectedExperience) && (
              <button 
                onClick={clearFilters}
                className="text-purple-600 font-medium hover:text-purple-800 transition"
              >
                Clear Filters
                <i className="fas fa-times ml-1"></i>
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Available
          </h2>
        </div>

        {/* Doctor Listing */}
        <div className="space-y-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map(doctor => (
              <div key={doctor.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row">
                  {/* Doctor Image and Basic Info */}
                  <div className="md:w-1/4 mb-6 md:mb-0 flex flex-col items-center md:items-start">
                    <div className="relative mb-3">
                      <img 
                        src={doctor.profileImage || `/api/placeholder/150/150`} 
                        alt={doctor.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                      />
                      <div className="absolute -bottom-2 right-0 bg-white rounded-full px-2 py-1 text-xs font-medium text-purple-600 flex items-center shadow-sm border border-gray-100">
                        <i className="fas fa-star text-yellow-400 mr-1"></i>
                        {doctor.rating}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-center md:text-left">{doctor.name}</h3>
                    <p className="text-purple-600 font-medium text-center md:text-left">{doctor.specialty}</p>
                    <p className="text-gray-600 text-sm mt-1 text-center md:text-left">{doctor.qualifications}</p>
                  </div>
                  
                  {/* Doctor Details */}
                  <div className="md:w-2/4 md:pl-6 mb-6 md:mb-0">
                    <div className="mb-4">
                      <p className="text-gray-700">
                        <i className="fas fa-hospital mr-2 text-gray-500"></i>
                        {doctor.hospital || "Independent Practice"}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-700">
                        <i className="fas fa-user-md mr-2 text-gray-500"></i>
                        {doctor.experience} experience
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-700">
                        <i className="fas fa-language mr-2 text-gray-500"></i>
                        {doctor.languages.join(', ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">
                        <i className="fas fa-id-card mr-2 text-gray-500"></i>
                        License No: {doctor.licenseNo}
                      </p>
                    </div>
                    {doctor.isAvailableForEmergency && (
                      <div className="mt-3">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                          Available for Emergency
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Booking Section */}
                  <div className="md:w-1/4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 text-sm">Consultation Fee:</span>
                        <span className="font-semibold text-lg">₹{doctor.consultationFee}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Next Available:</span>
                        <span className="text-green-600 font-medium">{doctor.nextAvailable}</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Link to={isAuthenticated ? `/appointment/${doctor.id}` : '/login?redirect=doctors'} className="block bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-lg transition duration-300 text-center">
                        Book Video Consultation
                      </Link>
                      <Link to={`/doctors/${doctor.id}`} className="block mt-3 text-purple-600 py-2 rounded-lg font-medium hover:bg-purple-50 transition duration-300 text-center border border-purple-200">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="mb-4">
                <i className="fas fa-search text-4xl text-gray-300"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">No doctors found</h3>
              <p className="text-gray-600">
                We couldn't find any doctors matching your search criteria.
                Try adjusting your filters or search for a different specialty.
              </p>
              <button 
                onClick={clearFilters}
                className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredDoctors.length > 10 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-50">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="px-4 py-2 rounded-md bg-purple-600 text-white font-medium">1</button>
              <button className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-50">2</button>
              <button className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-50">3</button>
              <span className="px-2 text-gray-600">...</span>
              <button className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-50">10</button>
              <button className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-50">
                <i className="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorListPage;