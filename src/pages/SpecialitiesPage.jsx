import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock data for specialties
const specialtiesList = [
  {
    id: 1,
    name: 'Cardiology',
    icon: 'fa-heartbeat',
    description: 'Deals with disorders of the heart and cardiovascular system',
    doctorCount: 24,
    color: 'red'
  },
  {
    id: 2,
    name: 'Neurology',
    icon: 'fa-brain',
    description: 'Focuses on disorders of the nervous system including the brain and spinal cord',
    doctorCount: 18,
    color: 'blue'
  },
  {
    id: 3,
    name: 'Orthopedics',
    icon: 'fa-bone',
    description: 'Concerned with the correction of deformities or disorders of the skeletal system',
    doctorCount: 22,
    color: 'yellow'
  },
  {
    id: 4,
    name: 'Dermatology',
    icon: 'fa-allergies',
    description: 'Deals with the skin and its diseases, including hair and nail disorders',
    doctorCount: 16,
    color: 'green'
  },
  {
    id: 5,
    name: 'Gynecology',
    icon: 'fa-venus',
    description: 'Specializes in women\'s health, particularly the female reproductive system',
    doctorCount: 20,
    color: 'pink'
  },
  {
    id: 6,
    name: 'Pediatrics',
    icon: 'fa-baby',
    description: 'Focused on the medical care of infants, children, and adolescents',
    doctorCount: 25,
    color: 'purple'
  },
  {
    id: 7,
    name: 'Ophthalmology',
    icon: 'fa-eye',
    description: 'Deals with the anatomy, physiology and diseases of the eye and visual system',
    doctorCount: 15,
    color: 'cyan'
  },
  {
    id: 8,
    name: 'ENT',
    icon: 'fa-ear-deaf',
    description: 'Specializes in diagnosis and treatment of ear, nose, throat, and head and neck disorders',
    doctorCount: 19,
    color: 'orange'
  },
  {
    id: 9,
    name: 'Psychiatry',
    icon: 'fa-brain',
    description: 'Focuses on the diagnosis, treatment, and prevention of mental, emotional and behavioral disorders',
    doctorCount: 14,
    color: 'indigo'
  },
  {
    id: 10,
    name: 'Dentistry',
    icon: 'fa-tooth',
    description: 'Concerned with the study, diagnosis, prevention, and treatment of diseases of the teeth and oral cavity',
    doctorCount: 30,
    color: 'blue'
  },
  {
    id: 11,
    name: 'Endocrinology',
    icon: 'fa-vial',
    description: 'Relates to the diagnosis and treatment of hormone imbalances and other problems with the endocrine glands',
    doctorCount: 12,
    color: 'green'
  },
  {
    id: 12,
    name: 'Oncology',
    icon: 'fa-radiation',
    description: 'Specializes in the diagnosis and treatment of cancer',
    doctorCount: 22,
    color: 'purple'
  },
  {
    id: 13,
    name: 'Pulmonology',
    icon: 'fa-lungs',
    description: 'Deals with diseases involving the respiratory tract',
    doctorCount: 16,
    color: 'blue'
  },
  {
    id: 14,
    name: 'Gastroenterology',
    icon: 'fa-stomach',
    description: 'Focuses on the digestive system and its disorders',
    doctorCount: 18,
    color: 'brown'
  },
  {
    id: 15,
    name: 'Nephrology',
    icon: 'fa-kidneys',
    description: 'Concerned with the study of normal kidney function, kidney problems, and renal replacement therapy',
    doctorCount: 14,
    color: 'green'
  },
  {
    id: 16,
    name: 'Urology',
    icon: 'fa-toilet',
    description: 'Focuses on surgical and medical diseases of the urinary-tract system and the male reproductive organs',
    doctorCount: 15,
    color: 'yellow'
  },
  {
    id: 17,
    name: 'Hematology',
    icon: 'fa-droplet',
    description: 'Concerned with the study of blood, blood-forming organs, and blood diseases',
    doctorCount: 10,
    color: 'red'
  },
  {
    id: 18,
    name: 'Rheumatology',
    icon: 'fa-bone',
    description: 'Devoted to the diagnosis and therapy of rheumatic diseases, including autoimmune diseases and joint problems',
    doctorCount: 8,
    color: 'orange'
  }
];

const getColorClass = (color) => {
  const colorMap = {
    'red': 'bg-red-100 text-red-600',
    'blue': 'bg-blue-100 text-blue-600',
    'green': 'bg-green-100 text-green-600',
    'yellow': 'bg-yellow-100 text-yellow-600',
    'orange': 'bg-orange-100 text-orange-600',
    'purple': 'bg-purple-100 text-purple-600',
    'pink': 'bg-pink-100 text-pink-600',
    'indigo': 'bg-indigo-100 text-indigo-600',
    'cyan': 'bg-cyan-100 text-cyan-600',
    'brown': 'bg-amber-100 text-amber-600'
  };
  
  return colorMap[color] || 'bg-gray-100 text-gray-600';
};

const SpecialitiesPage = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpecialties, setFilteredSpecialties] = useState([]);

  useEffect(() => {
    // Simulate API call to fetch specialties
    setTimeout(() => {
      setSpecialties(specialtiesList);
      setFilteredSpecialties(specialtiesList);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSpecialties(specialties);
    } else {
      const filtered = specialties.filter(specialty => 
        specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialty.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSpecialties(filtered);
    }
  }, [searchTerm, specialties]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Medical Specialties</h1>
          <p className="text-gray-600">Browse our comprehensive list of medical specialties and find the right doctor for your needs</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a specialty..."
                className="w-full p-4 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <i className="fas fa-search"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecialties.map(specialty => (
            <Link 
              key={specialty.id}
              to={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <div className={`w-14 h-14 rounded-xl ${getColorClass(specialty.color)} flex items-center justify-center mr-4`}>
                    <i className={`fas ${specialty.icon} text-2xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{specialty.name}</h3>
                    <div className="flex items-center mt-1">
                      <i className="fas fa-user-md text-gray-400 mr-1"></i>
                      <span className="text-sm text-gray-500">{specialty.doctorCount} Doctors</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{specialty.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {filteredSpecialties.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg mx-auto">
            <div className="mb-4">
              <i className="fas fa-search text-4xl text-gray-300"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">No specialties found</h3>
            <p className="text-gray-600">
              We couldn't find any specialties matching "{searchTerm}".
              Try a different search term or browse all specialties.
            </p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Show All Specialties
            </button>
          </div>
        )}

        {/* Common Health Issues Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Common Health Issues by Specialty</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cardiology */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-red-50 p-4 border-b border-red-100">
                <div className="flex items-center">
                  <div className="bg-red-100 text-red-600 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-heartbeat"></i>
                  </div>
                  <h3 className="font-bold text-red-800">Cardiology</h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-circle text-xs text-red-500 mt-1.5 mr-2"></i>
                    <span className="text-gray-700">Hypertension (High Blood Pressure)</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-circle text-xs text-red-500 mt-1.5 mr-2"></i>
                    <span className="text-gray-700">Coronary Artery Disease</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-circle text-xs text-red-500 mt-1.5 mr-2"></i>
                    <span className="text-gray-700">Heart Failure</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-circle text-xs text-red-500 mt-1.5 mr-2"></i>
                    <span className="text-gray-700">Arrhythmias (Irregular Heart Rhythm)</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-circle text-xs text-red-500 mt-1.5 mr-2"></i>
                    <span className="text-gray-700">Valvular Heart Disease</span>
                  </li>
                </ul>
                <Link
                  to="/doctors?specialty=Cardiology"
                  className="mt-4 inline-block text-red-600 hover:text-red-800 font-medium"
                >
                  Find a Cardiologist <i className="fas fa-arrow-right ml-1"></i>
                </Link>
              </div>
            </div>
            
            {/* Dermatology */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-green-50 p-4 border-b border-green-100">
                <div className="flex items-center">
                  <div className="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-allergies"></i>
                  </div>
                  <h3 className="font-bold text-green-800">Dermatology</h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-circle text-xs text-green-500 mt-1.5 mr-2"></i>
                    <span className="text-gray-700">Acne and Rosacea</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-circle text-xs text-green-500 mt-1.5 mr-2"></i>
                    <span className="text-gray-700">Eczema and Dermatitis</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-circle text-xs text-green-500 mt-1.5 mr-2"></i>
                    <span className="text-gray-700">Psoriasis</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-circle text-xs text-green-500 mt-1.5 mr-2"></i>
                    <span className="text-gray-700">Skin Cancer</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-circle text-xs text-green-500 mt-1.5 mr-2"></i>
                    <span className="text-gray-700">Hair and Nail Disorders</span>
                  </li>
                </ul>
                <Link
                  to="/doctors?specialty=Dermatology"
                  className="mt-4 inline-block text-green-600 hover:text-green-800 font-medium"
                >
                  Find a Dermatologist <i className="fas fa-arrow-right ml-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialitiesPage;