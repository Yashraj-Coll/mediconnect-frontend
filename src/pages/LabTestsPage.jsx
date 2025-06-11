import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';

const LabTestsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { patientProfile } = usePatient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sample lab test categories and tests
  const categories = [
    { id: 'all', name: 'All Tests' },
    { id: 'blood', name: 'Blood Tests' },
    { id: 'imaging', name: 'Imaging' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'diabetes', name: 'Diabetes' },
    { id: 'covid', name: 'COVID-19' }
  ];
  
  const labTests = [
    { 
      id: 1, 
      name: 'Complete Blood Count (CBC)', 
      price: 599, 
      description: 'Analysis of different blood cells to evaluate overall health and detect disorders.',
      category: 'blood',
      sampleType: 'Blood',
      processingTime: '24 hours',
      homeCollection: true
    },
    { 
      id: 2, 
      name: 'Lipid Profile', 
      price: 799, 
      description: 'Measures the amount of cholesterol and fats in your blood.',
      category: 'blood',
      sampleType: 'Blood',
      processingTime: '24 hours',
      homeCollection: true
    },
    { 
      id: 3, 
      name: 'X-Ray Chest', 
      price: 1299, 
      description: 'Produces images of the heart, lungs, airways, blood vessels and bones in the chest.',
      category: 'imaging',
      sampleType: 'N/A',
      processingTime: '1 hour',
      homeCollection: false
    },
    { 
      id: 4, 
      name: 'ECG', 
      price: 699, 
      description: 'Records the electrical activity of the heart to detect abnormalities.',
      category: 'cardiology',
      sampleType: 'N/A',
      processingTime: 'Immediate',
      homeCollection: true
    },
    { 
      id: 5, 
      name: 'HbA1c', 
      price: 899, 
      description: 'Measures average blood glucose levels over the past 2-3 months.',
      category: 'diabetes',
      sampleType: 'Blood',
      processingTime: '24 hours',
      homeCollection: true
    },
    { 
      id: 6, 
      name: 'COVID-19 RT-PCR Test', 
      price: 1499, 
      description: 'Detects the presence of SARS-CoV-2 virus that causes COVID-19.',
      category: 'covid',
      sampleType: 'Nasal Swab',
      processingTime: '24-48 hours',
      homeCollection: true
    }
  ];
  
  // Filter tests based on selected category
  const filteredTests = selectedCategory === 'all' 
    ? labTests 
    : labTests.filter(test => test.category === selectedCategory);

  // Handle booking a lab test
  const handleBookTest = (test) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/lab-tests');
      return;
    }

    if (!patientProfile?.id) {
      alert('Please complete your profile before booking a test.');
      navigate('/profile');
      return;
    }

    // Calculate fees for lab test
    const testPrice = test.price;
    const registrationFee = 50; // Lab test registration fee
    const taxAmount = Math.round((testPrice + registrationFee) * 0.18);
    const totalAmount = testPrice + registrationFee + taxAmount;

    // Create lab test data structure similar to appointment data
    const labTestData = {
      testId: test.id,
      testName: test.name,
      testPrice: testPrice,
      sampleType: test.sampleType,
      processingTime: test.processingTime,
      homeCollection: test.homeCollection,
      description: test.description,
      patientId: patientProfile.id,
      bookingType: 'LAB_TEST', // Distinguish from appointments
      fees: {
        testPrice: testPrice,
        registrationFee: registrationFee,
        taxAmount: taxAmount,
        totalAmount: totalAmount
      }
    };

    // Navigate to payment page with lab test data
    navigate('/payment/lab-test', {
      state: {
        labTestData: labTestData,
        test: test,
        totalAmount: totalAmount
      }
    });
  };

  return (
    <div className="pt-28 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Lab Tests</h1>
          <p className="text-gray-600">Order diagnostic tests with home sample collection</p>
        </div>
        
        {/* Categories */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 overflow-x-auto">
          <div className="flex space-x-4">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedCategory === category.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Lab Tests */}
        <div className="space-y-6">
          {filteredTests.map(test => (
            <div key={test.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold">{test.name}</h3>
                    <p className="text-gray-600 mt-1">{test.description}</p>
                    
                    <div className="mt-3 flex flex-wrap gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {test.sampleType}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Results in {test.processingTime}
                      </span>
                      {test.homeCollection && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          <i className="fas fa-home mr-1"></i> Home Collection
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-right mb-2">
                      <span className="text-gray-500 text-sm line-through mr-2">₹{(test.price * 1.2).toFixed(0)}</span>
                      <span className="text-xl font-bold">₹{test.price}</span>
                      <span className="ml-1 text-green-600 text-sm font-medium">20% off</span>
                    </div>
                    <button 
                      className="bg-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-purple-700 transition"
                      onClick={() => handleBookTest(test)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabTestsPage;