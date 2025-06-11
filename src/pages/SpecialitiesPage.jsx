import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Enhanced mock data with image URLs and better spacing
const specialtiesList = [
  {
    id: 1,
    name: 'Cardiology',
    icon: 'fa-heartbeat',
    description: 'Expert heart care with advanced cardiovascular treatments and comprehensive cardiac health management.',
    doctorCount: 24,
    color: 'red',
    gradient: 'from-red-500 to-pink-600',
    consultations: '2,500+',
    rating: 4.8,
    emergencyAvailable: true,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Heart Attack', 'Hypertension', 'Arrhythmias', 'Heart Surgery']
  },
  {
    id: 2,
    name: 'Neurology',
    icon: 'fa-brain',
    description: 'Advanced neurological care for brain, spine and nervous system disorders with cutting-edge technology.',
    doctorCount: 18,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    consultations: '1,800+',
    rating: 4.7,
    emergencyAvailable: true,
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Stroke', 'Epilepsy', 'Migraine', 'Brain Surgery']
  },
  {
    id: 3,
    name: 'Orthopedics',
    icon: 'fa-bone',
    description: 'Comprehensive bone and joint care with modern surgical techniques and rehabilitation programs.',
    doctorCount: 22,
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
    consultations: '3,200+',
    rating: 4.6,
    emergencyAvailable: false,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Fractures', 'Joint Replacement', 'Arthritis', 'Sports Injury']
  },
  {
    id: 4,
    name: 'Dermatology',
    icon: 'fa-allergies',
    description: 'Complete skin health solutions including medical dermatology and advanced cosmetic treatments.',
    doctorCount: 16,
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    consultations: '2,100+',
    rating: 4.5,
    emergencyAvailable: false,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Acne Treatment', 'Skin Cancer', 'Psoriasis', 'Anti-Aging']
  },
  {
    id: 5,
    name: 'Gynecology',
    icon: 'fa-venus',
    description: 'Specialized women\'s healthcare covering reproductive health, pregnancy care and wellness programs.',
    doctorCount: 20,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    consultations: '2,800+',
    rating: 4.9,
    emergencyAvailable: true,
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Pregnancy Care', 'PCOS', 'Fertility Treatment', 'Women Wellness']
  },
  {
    id: 6,
    name: 'Pediatrics',
    icon: 'fa-baby',
    description: 'Gentle and comprehensive medical care for children from newborns to adolescents with family-centered approach.',
    doctorCount: 25,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    consultations: '4,500+',
    rating: 4.8,
    emergencyAvailable: true,
    image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Child Vaccination', 'Growth Monitoring', 'Pediatric Care', 'Teen Health']
  },
  {
    id: 7,
    name: 'Ophthalmology',
    icon: 'fa-eye',
    description: 'Advanced eye care services including LASIK surgery, cataract treatment and comprehensive vision care.',
    doctorCount: 15,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    consultations: '1,900+',
    rating: 4.7,
    emergencyAvailable: false,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['LASIK Surgery', 'Cataract', 'Glaucoma', 'Retinal Care']
  },
  {
    id: 8,
    name: 'Dentistry',
    icon: 'fa-tooth',
    description: 'Complete oral healthcare including cosmetic dentistry, implants and advanced dental surgical procedures.',
    doctorCount: 30,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    consultations: '3,800+',
    rating: 4.7,
    emergencyAvailable: true,
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Dental Implants', 'Root Canal', 'Teeth Whitening', 'Oral Surgery']
  },
  {
    id: 9,
    name: 'Psychiatry',
    icon: 'fa-brain',
    description: 'Mental health support with confidential counseling, therapy sessions and comprehensive psychiatric care.',
    doctorCount: 14,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    consultations: '1,600+',
    rating: 4.8,
    emergencyAvailable: true,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Depression', 'Anxiety', 'Therapy', 'Mental Wellness']
  },
  {
    id: 10,
    name: 'Oncology',
    icon: 'fa-radiation',
    description: 'Comprehensive cancer care with advanced treatment options, chemotherapy and complete support systems.',
    doctorCount: 22,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    consultations: '1,200+',
    rating: 4.9,
    emergencyAvailable: true,
    image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Cancer Treatment', 'Chemotherapy', 'Radiation', 'Oncology Care']
  },
  {
    id: 11,
    name: 'ENT',
    icon: 'fa-ear-deaf',
    description: 'Expert treatment for ear, nose, throat disorders with modern surgical techniques and hearing solutions.',
    doctorCount: 19,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    consultations: '2,300+',
    rating: 4.6,
    emergencyAvailable: true,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Hearing Loss', 'Sinusitis', 'Throat Surgery', 'ENT Care']
  },
  {
    id: 12,
    name: 'Endocrinology',
    icon: 'fa-vial',
    description: 'Specialized hormone and diabetes care with personalized treatment plans and lifestyle management.',
    doctorCount: 12,
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    consultations: '1,400+',
    rating: 4.6,
    emergencyAvailable: false,
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&w=400&q=80',
    conditions: ['Diabetes Care', 'Thyroid', 'Hormone Therapy', 'Metabolism']
  }
];

const SpecialitiesPage = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpecialties, setFilteredSpecialties] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Simulate API call to fetch specialties
    setTimeout(() => {
      setSpecialties(specialtiesList);
      setFilteredSpecialties(specialtiesList);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = specialties;

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(specialty => 
        specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialty.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialty.conditions.some(condition => 
          condition.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply category filter
    if (selectedFilter === 'emergency') {
      filtered = filtered.filter(specialty => specialty.emergencyAvailable);
    } else if (selectedFilter === 'popular') {
      filtered = filtered.filter(specialty => parseInt(specialty.consultations.replace(/\D/g, '')) > 2000);
    } else if (selectedFilter === 'high-rated') {
      filtered = filtered.filter(specialty => specialty.rating >= 4.7);
    }

    setFilteredSpecialties(filtered);
  }, [searchTerm, specialties, selectedFilter]);

  const filters = [
    { key: 'all', label: 'All Specialties', icon: 'fas fa-th-large' },
    { key: 'emergency', label: 'Emergency Available', icon: 'fas fa-ambulance' },
    { key: 'popular', label: 'Most Popular', icon: 'fas fa-fire' },
    { key: 'high-rated', label: 'Top Rated', icon: 'fas fa-star' }
  ];

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-purple-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-600 text-lg mt-6 font-medium">Loading Medical Specialties...</p>
          <p className="text-gray-500 text-sm mt-2">Finding the best doctors for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-lg mb-8 border">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">24/7 Medical Care Available</span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent">
            Medical Specialties
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-10">
            Connect with India's leading medical specialists across all major healthcare domains. 
            Expert care, advanced treatments, and personalized attention for your health needs.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-12 mb-12">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border">
              <div className="text-3xl font-bold text-purple-600 mb-2">{specialties.length}+</div>
              <div className="text-gray-600 font-medium">Specialties</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {specialties.reduce((sum, s) => sum + s.doctorCount, 0)}+
              </div>
              <div className="text-gray-600 font-medium">Expert Doctors</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border">
              <div className="text-3xl font-bold text-green-600 mb-2">25,000+</div>
              <div className="text-gray-600 font-medium">Consultations</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-16">
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search specialties, conditions, or treatments..."
                className="w-full p-6 pl-16 pr-6 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 shadow-xl bg-white transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
                <i className="fas fa-search text-xl"></i>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filters.map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
                  selectedFilter === filter.key
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 shadow-lg'
                }`}
              >
                <i className={filter.icon}></i>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Specialties Grid */}
        {filteredSpecialties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
            {filteredSpecialties.map(specialty => (
              <Link 
                key={specialty.id}
                to={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
                className="group block"
              >
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-500 transform group-hover:-translate-y-3 group-hover:shadow-2xl border border-gray-100">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={specialty.image} 
                      alt={specialty.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x200/6366f1/ffffff?text=${specialty.name}`;
                      }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${specialty.gradient} opacity-80`}></div>
                    
                    {/* Overlay Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
                      <div className="flex justify-between items-start">
                        <div className="w-14 h-14 bg-black bg-opacity-30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-20">
                          <i className={`fas ${specialty.icon} text-2xl text-white`}></i>
                        </div>
                        {specialty.emergencyAvailable && (
                          <div className="bg-red-500 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                            <i className="fas fa-ambulance mr-1"></i>
                            24/7
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-black bg-opacity-40 p-4 rounded-2xl backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">{specialty.name}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center bg-black bg-opacity-30 px-3 py-2 rounded-full border border-white border-opacity-20">
                            <i className="fas fa-user-md mr-2 text-white"></i>
                            <span className="text-white font-medium">{specialty.doctorCount} Doctors</span>
                          </div>
                          <div className="flex items-center bg-black bg-opacity-30 px-3 py-2 rounded-full border border-white border-opacity-20">
                            <i className="fas fa-star mr-2 text-yellow-300"></i>
                            <span className="text-white font-medium">{specialty.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-8">
                    <p className="text-gray-600 text-base mb-6 leading-relaxed">
                      {specialty.description}
                    </p>
                    
                    {/* Conditions */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {specialty.conditions.slice(0, 3).map((condition, index) => (
                          <span 
                            key={index}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                          >
                            {condition}
                          </span>
                        ))}
                        {specialty.conditions.length > 3 && (
                          <span className="text-sm text-gray-500 px-3 py-2">
                            +{specialty.conditions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">{specialty.consultations}</div>
                        <div className="text-sm text-gray-500">Consultations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">{specialty.rating}★</div>
                        <div className="text-sm text-gray-500">Rating</div>
                      </div>
                      <div className="text-purple-600 group-hover:text-purple-800 transition-colors p-3">
                        <i className="fas fa-arrow-right text-xl"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center max-w-2xl mx-auto mb-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-search text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-3xl font-bold mb-6 text-gray-800">No specialties found</h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {searchTerm ? 
                `No specialties match "${searchTerm}". Try a different search term or browse all specialties.` : 
                `No specialties match the selected filter. Try a different filter option.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                >
                  Clear Search
                </button>
              )}
              <button 
                onClick={() => setSelectedFilter('all')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl font-semibold transition-all transform hover:-translate-y-1"
              >
                Show All Specialties
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">Need Medical Consultation?</h2>
          <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Book an appointment with our specialist doctors and get expert medical advice from the comfort of your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/doctors"
              className="bg-white text-purple-600 px-10 py-5 rounded-2xl font-bold hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center text-lg"
            >
              <i className="fas fa-calendar-plus mr-3"></i>
              Book Appointment
            </Link>
            <Link
              to="/ai-chat"
              className="bg-purple-500 bg-opacity-20 backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-bold hover:bg-opacity-30 transition-all border-2 border-white border-opacity-20 flex items-center justify-center text-lg"
            >
              <i className="fas fa-robot mr-3"></i>
              AI Health Assistant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialitiesPage;