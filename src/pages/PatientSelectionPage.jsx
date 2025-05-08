import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Mock patient data
const mockPatients = [
  {
    id: 1,
    name: 'Yashraj Singh',
    age: 24,
    gender: 'M',
    phone: '91 8777459806',
    relation: 'Self'
  },
  {
    id: 2,
    name: 'Priya Singh',
    age: 22,
    gender: 'F',
    phone: '91 9876543210',
    relation: 'Spouse'
  },
  {
    id: 3,
    name: 'Arjun Singh',
    age: 4,
    gender: 'M',
    phone: '91 8777459806',
    relation: 'Son'
  }
];

const PatientSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentSlot, setAppointmentSlot] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'M',
    phone: '',
    relation: 'Other'
  });

  // Load data from location state
  useEffect(() => {
    if (location.state) {
      const { doctor, date, slot } = location.state;
      setDoctor(doctor);
      setAppointmentDate(date);
      setAppointmentSlot(slot);
    } else {
      // If no state, navigate back to home
      // In a real app, you might want to fetch this data from API based on URL params
      navigate('/');
    }

    // Fetch patients (mock)
    setTimeout(() => {
      setPatients(mockPatients);
      setLoading(false);
    }, 500);
  }, [location, navigate]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

  const handleContinue = () => {
    if (selectedPatient && termsAccepted) {
      // In a real app, you would save the appointment details
      navigate('/payment', { 
        state: { 
          doctor,
          date: appointmentDate,
          slot: appointmentSlot,
          patient: selectedPatient
        } 
      });
    }
  };

  const handleAddPatientChange = (e) => {
    const { name, value } = e.target;
    setNewPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPatientSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would save the new patient to the database
    const newPatientWithId = {
      ...newPatient,
      id: patients.length + 1
    };
    
    setPatients(prev => [...prev, newPatientWithId]);
    setSelectedPatient(newPatientWithId);
    setShowAddPatientForm(false);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Select Patient</h1>
            <p className="text-gray-600">Choose the patient for this appointment</p>
          </div>

          {/* Doctor Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center">
              <img 
                src="/api/placeholder/100/100" 
                alt={doctor?.name} 
                className="w-20 h-20 rounded-full object-cover mr-6"
              />
              <div>
                <h2 className="text-xl font-bold">{doctor?.name}</h2>
                <p className="text-gray-700">{doctor?.specialty}</p>
                <p className="text-purple-600 font-medium">VIDEO CONSULTATION</p>
                <div className="mt-2 flex items-center">
                  <div className="h-5 w-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                    <i className="fas fa-calendar-alt text-xs text-indigo-600"></i>
                  </div>
                  <p className="text-gray-700">
                    {formatDate(appointmentDate)} • {appointmentSlot?.time}
                  </p>
                </div>
                <p className="text-purple-600 font-medium mt-2">
                  Consultation Fee: ₹{doctor?.consultationFee}
                  {doctor?.registrationFee && (
                    <span className="text-xs text-gray-500 ml-1">
                      (Registration Charge ₹{doctor?.registrationFee} included)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Selection Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Select Patient</h3>

              {/* Patient List */}
              {patients.length > 0 && !showAddPatientForm && (
                <div className="space-y-4 mb-6">
                  {patients.map(patient => (
                    <div 
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition
                        ${selectedPatient?.id === patient.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'}
                      `}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4">
                          {selectedPatient?.id === patient.id ? (
                            <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                              <i className="fas fa-check text-white text-xs"></i>
                            </div>
                          ) : (
                            <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{patient.name}</h4>
                              <p className="text-gray-600 text-sm">
                                {patient.age}y • {patient.gender === 'M' ? 'Male' : 'Female'} • {patient.relation}
                              </p>
                            </div>
                            <div className="text-gray-600 text-sm">
                              {patient.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Patient Form */}
              {showAddPatientForm ? (
                <form onSubmit={handleAddPatientSubmit} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={newPatient.name}
                      onChange={handleAddPatientChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Enter patient's full name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        name="age"
                        required
                        value={newPatient.age}
                        onChange={handleAddPatientChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Age in years"
                        min="0"
                        max="120"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        required
                        value={newPatient.gender}
                        onChange={handleAddPatientChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Mobile Number</label>
                    <div className="flex">
                      <div className="bg-gray-100 p-3 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                        +91
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={newPatient.phone}
                        onChange={handleAddPatientChange}
                        className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Relation</label>
                    <select
                      name="relation"
                      required
                      value={newPatient.relation}
                      onChange={handleAddPatientChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="Self">Self</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPatientForm(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition"
                    >
                      Add Patient
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddPatientForm(true)}
                  className="w-full p-4 border border-dashed border-purple-300 rounded-lg text-purple-600 font-medium hover:bg-purple-50 transition flex items-center justify-center"
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  Add New Patient
                </button>
              )}

              {/* Consent Checkbox */}
              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="consent"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={handleTermsChange}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="consent" className="text-gray-700">
                      By clicking on "Pay and Continue", I hereby give my informed <a href="#" className="text-green-500 font-medium">consent</a> for the use of telemedicine in my medical care.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-center">
            <button
              className={`
                py-3 px-8 rounded-lg font-medium transition
                ${selectedPatient && termsAccepted
                  ? 'bg-gradient-primary text-white hover:shadow-lg' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
              `}
              onClick={handleContinue}
              disabled={!selectedPatient || !termsAccepted}
            >
              Pay and Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSelectionPage;