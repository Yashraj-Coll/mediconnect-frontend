import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DoctorService from '../services/DoctorService';
import { API_BASE_URL } from '../config/apiConfig';

const AppointmentBookingPage = () => {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialType = location.state?.appointmentType || "VIDEO";
  const [selectedType, setSelectedType] = useState(initialType);
  const { isAuthenticated, user } = useAuth();
  
  // Get appointment type from URL (video or in-person)
  const appointmentTypeFromPath = location.pathname.includes('in-person') ? 'inPerson' : 'video';
  
  // State for doctor data
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for appointment selection
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [appointmentType, setAppointmentType] = useState(appointmentTypeFromPath);
  
  // Check auth and redirect if needed
  useEffect(() => {
    if (!isAuthenticated) {
      // If not authenticated, redirect to login page with redirect back info
      navigate(`/login?redirect=${location.pathname}`);
    }
  }, [isAuthenticated, navigate, location.pathname]);
  
  // Set immediate mock data to avoid buffering
  useEffect(() => {
    // Show mock data immediately
    const mockDoctor = {
      id: doctorId || 1,
      firstName: "John",
      lastName: "Doe",
      specialization: "Cardiologist",
      consultationFee: 800,
      registrationFee: 350,
      yearsOfExperience: 15,
      hospitalAffiliation: "City Hospital",
      gender: "MALE"
    };
    
    setDoctor(mockDoctor);
    setLoading(false);
    
    // Fetch appointment types and doctor data
    fetchAppointmentTypes();
    if (doctorId) {
      fetchDoctorDetails();
    }
  }, []);
  
  // Helper function to get the correct image URL
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

  // Fetch appointment types
  const fetchAppointmentTypes = async () => {
  try {
    // Use default appointment types (API endpoint doesn't exist)
    setAppointmentTypes([
      { id: 1, typeName: 'Video Consultation', typeCode: 'VIDEO' },
      { id: 2, typeName: 'In-person Visit', typeCode: 'IN_PERSON' }
    ]);
    console.log('Using default appointment types');
  } catch (error) {
    console.error('Error setting appointment types:', error);
  }
};
  
  // Fetch doctor availability with guaranteed data (mock fallback)
  const fetchDoctorAvailability = async (doctorId, date) => {
    try {
      // Format date for API request
      const formattedDate = date.toISOString().split('T')[0];

      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      // Convert appointmentType to proper format for API
      let apiAppointmentType = appointmentType;
      if (appointmentType === 'video') {
        apiAppointmentType = 'video';
      } else if (appointmentType === 'inPerson') {
        apiAppointmentType = 'inPerson';
      }

      console.log('Fetching availability with params:', {
        doctorId,
        date: formattedDate,
        type: apiAppointmentType
      });

      // Make API call to get doctor availability WITH Authorization header
      const response = await fetch(
        `${API_BASE_URL}/api/doctors/${doctorId}/availability?date=${formattedDate}&type=${apiAppointmentType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('Availability API response:', data);

      if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Transform API response to our slot format
        const slots = data.data.map(slot => ({
          id: slot.id,
          time: format12HourTime(slot.startTime),
          available: slot.available !== false, // Default to true if not specified
          startTime: slot.startTime,
          endTime: slot.endTime,
          appointmentType: slot.appointmentType || apiAppointmentType
        }));

        console.log('Processed slots:', slots);
        setAvailableSlots(slots);
      } else {
        console.log('No slots available from API, using mock data');
        // If no data available, generate mock slots
        generateMockSlotsForDate(date);
      }
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      // Fallback to generating mock slots
      console.log('Falling back to mock slots due to error');
      generateMockSlotsForDate(date);
    }
  };

  // Fetch doctor data
  const fetchDoctorDetails = async () => {
    try {
      console.log('Fetching doctor details for ID:', doctorId);
      
      // Try using the service
      try {
        const result = await DoctorService.getDoctorById(doctorId);
        
        if (result.success) {
          // Set the doctor data
          const doctorData = result.data;
          
          // Update the profileImage path if it exists
          if (doctorData) {
            doctorData.profileImage = getImageUrl(doctorData.profileImage, doctorData.gender);
          }
          
          setDoctor(doctorData);
          
          // Fetch doctor availability for selected date
          fetchDoctorAvailability(doctorData.id, selectedDate);
        } else {
          console.error(result.error || 'Failed to fetch doctor details');
          // Fetch availability even if doctor details fail
          fetchDoctorAvailability(doctorId, selectedDate);
        }
      } catch (serviceError) {
        console.error('Service error fetching doctor:', serviceError);
        
        // Direct API call as fallback
        try {
          const response = await fetch(`${API_BASE_URL}/api/doctors/public/${doctorId}`);
          const data = await response.json();
          
          if (data.success) {
            const doctorData = data.data;
            if (doctorData) {
              doctorData.profileImage = getImageUrl(doctorData.profileImage, doctorData.gender);
              setDoctor(doctorData);
              fetchDoctorAvailability(doctorData.id, selectedDate);
            }
          } else {
            // Fetch availability even if doctor details fail
            fetchDoctorAvailability(doctorId, selectedDate);
          }
        } catch (fetchError) {
          console.error('Direct API call error:', fetchError);
          // Fetch availability even if doctor details fail
          fetchDoctorAvailability(doctorId, selectedDate);
        }
      }
    } catch (err) {
      console.error('Error fetching doctor:', err);
      // Fetch availability even if doctor details fail
      fetchDoctorAvailability(doctorId, selectedDate);
    }
  };
  
  // Format time from "HH:MM" to "H:MM AM/PM"
  const format12HourTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };
  
  // Generate availability data - always provides data even if API fails
  const generateMockSlotsForDate = (date) => {
    const slots = [];
    const currentDate = new Date();
    const isToday = date.toDateString() === currentDate.toDateString();
    const currentHour = currentDate.getHours();
    
    // Morning slots (9 AM - 12 PM)
    for (let hour = 9; hour < 12; hour++) {
      // Skip past times for today
      if (isToday && hour <= currentHour) continue;
      
      for (let minute of [0, 30]) {
        const available = Math.random() > 0.3; // 70% chance of availability
        const time = `${hour}:${minute === 0 ? '00' : '30'}`;
        const timeStr = `${hour}:${minute === 0 ? '00' : '30'} AM`;
        
        slots.push({
          id: `${date.toISOString().split('T')[0]}_${time}`,
          startTime: time,
          endTime: minute === 0 ? `${hour}:30` : `${hour + 1}:00`,
          time: timeStr,
          available
        });
      }
    }
    
    // Afternoon slots (12 PM - 5 PM)
    for (let hour = 12; hour < 17; hour++) {
      if (isToday && hour <= currentHour) continue;
      
      for (let minute of [0, 30]) {
        const available = Math.random() > 0.3;
        const time = `${hour}:${minute === 0 ? '00' : '30'}`;
        const timeStr = `${hour === 12 ? 12 : hour % 12}:${minute === 0 ? '00' : '30'} PM`;
        
        slots.push({
          id: `${date.toISOString().split('T')[0]}_${time}`,
          startTime: time,
          endTime: minute === 0 ? `${hour}:30` : `${hour + 1}:00`,
          time: timeStr,
          available
        });
      }
    }
    
    // Evening slots (5 PM - 8 PM)
    for (let hour = 17; hour < 20; hour++) {
      if (isToday && hour <= currentHour) continue;
      
      for (let minute of [0, 30]) {
        const available = Math.random() > 0.3;
        const time = `${hour}:${minute === 0 ? '00' : '30'}`;
        const timeStr = `${hour % 12}:${minute === 0 ? '00' : '30'} PM`;
        
        slots.push({
          id: `${date.toISOString().split('T')[0]}_${time}`,
          startTime: time,
          endTime: minute === 0 ? `${hour}:30` : `${hour + 1}:00`,
          time: timeStr,
          available
        });
      }
    }
    
    setAvailableSlots(slots);
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    
    // Fetch availability for the new date
    if (doctor) {
      fetchDoctorAvailability(doctor.id, date);
    } else {
      fetchDoctorAvailability(doctorId, date);
    }
    
    setShowCalendar(false);
  };
  
  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };
  
  // Handle appointment type selection
  const handleAppointmentTypeChange = (type) => {
    setAppointmentType(type);
    setSelectedSlot(null);
    
    // Fetch availability for the new appointment type
    if (doctor) {
      fetchDoctorAvailability(doctor.id, selectedDate);
    } else {
      fetchDoctorAvailability(doctorId, selectedDate);
    }
  };
  
  // Handle continue to next step
  const handleContinue = () => {
    if (!selectedSlot) return;
    
    // Create appointment data object
    const appointmentData = {
      doctorId: doctor.id,
      patientId: user.patientId,
      appointmentDateTime: formatDateTimeForBackend(selectedDate, selectedSlot.startTime),
      appointmentType: appointmentType === 'video' ? 'video' : 'physical',
      duration: 30, // Default duration in minutes
      fee: doctor.consultationFee + (doctor.registrationFee || 350),
      status: 'upcoming'
    };
    console.log("doctor in BookingPage:", doctor);
    console.log("doctorId in BookingPage:", doctor?.id);
    console.log("user in BookingPage:", user);
    console.log("user.patientId in BookingPage:", user?.patientId);

    // Navigate to payment page with appointment data
    navigate(`/payment/new`, { 
      state: { 
        appointmentData,
        doctor,
        date: selectedDate,
        slot: selectedSlot
      }
    });
  };
  
  // Format date and time for backend
  const formatDateTimeForBackend = (date, timeString) => {
    const [hours, minutes] = timeString.split(':');
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return newDate.toISOString();
  };
  
  // Get days in month for calendar
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month (0-6, where 0 is Sunday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };
  
  // Check if date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Format date for display (short)
  const formatDateShort = (date) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Format date for display (full)
  const formatDateFull = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Format month and year for calendar header
  const formatMonthYear = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Format doctor name
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
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setMonthOffset(monthOffset - 1);
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setMonthOffset(monthOffset + 1);
  };
  
  // Generate next 7 days for quick selection
  const generateDateStrip = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Generate calendar grid
  const generateCalendarGrid = () => {
    const today = new Date();
    const calendarDate = new Date();
    calendarDate.setMonth(today.getMonth() + monthOffset);
    
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const grid = [];
    let day = 1;
    
    // Create weeks
    for (let i = 0; i < 6; i++) {
      const week = [];
      
      // Create days in each week
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDay) || day > daysInMonth) {
          // Empty cell
          week.push(null);
        } else {
          // Create date object for this cell
          const date = new Date(year, month, day);
          week.push(date);
          day++;
        }
      }
      
      grid.push(week);
      
      // Break if we've reached the end of the month
      if (day > daysInMonth) break;
    }
    
    return grid;
  };
  
  // Generate time slots grid
  const generateTimeGrid = () => {
    const morningSlots = availableSlots.filter(slot => slot.time.includes('AM'));
    const afternoonSlots = availableSlots.filter(slot => 
      slot.time.includes('PM') && parseInt(slot.time.split(':')[0]) < 5
    );
    const eveningSlots = availableSlots.filter(slot => 
      slot.time.includes('PM') && parseInt(slot.time.split(':')[0]) >= 5
    );
    
    return [
      { title: 'Morning', slots: morningSlots },
      { title: 'Afternoon', slots: afternoonSlots },
      { title: 'Evening', slots: eveningSlots }
    ];
  };
  
  // Get date strip for quick selection
  const dateStrip = generateDateStrip();
  
  // Loading state
  if (loading) {
    return (
      <div className="pt-32 pb-16 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading doctor information...</p>
        <p className="text-gray-500 text-sm mt-2">This should only take a moment</p>
        
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
            <h2 className="text-2xl font-bold mb-2">Error Loading Appointment Page</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Get doctor information
  const doctorName = formatDoctorName(doctor);
  const specialization = doctor?.specialization || 'General Practice';
  const qualifications = doctor?.education || 'MD';
  const experience = doctor?.yearsOfExperience ? `${doctor.yearsOfExperience} years` : '10+ years';
  const hospital = doctor?.hospitalAffiliation || 'City Hospital';
  const consultationFee = doctor?.consultationFee || 500;
  const registrationFee = doctor?.registrationFee || 350;
  
  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Book Appointment</h1>
          <p className="text-gray-600 mb-8">Select your preferred date and time slot</p>
          
          {/* Doctor Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4 md:mb-0 md:mr-6">
                <img 
                  src={doctor?.profileImage || (doctor?.gender === 'FEMALE' ? '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg')}
                  alt={doctorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    const fallbackImage = doctor?.gender === 'FEMALE' ? 
                      '/images/Female Doctor.jpg' : 
                      '/images/Male Doctor.jpg';
                    e.target.src = fallbackImage;
                  }}
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold">{doctorName}</h2>
                <p className="text-purple-600">{specialization}</p>
                <p className="text-gray-600 text-sm">{qualifications}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                    <i className="fas fa-star text-yellow-400 mr-1"></i> {doctor?.averageRating || '4.8'}
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    <i className="fas fa-user-md mr-1"></i> {experience}
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    <i className="fas fa-id-card mr-1"></i> {doctor?.licenseNumber || 'MED12345'}
                  </span>
                </div>
              </div>
              
              <div className="ml-auto mt-4 md:mt-0 text-right">
                <p className="text-gray-600 text-sm">Consultation Fee</p>
                <p className="text-purple-600 font-bold text-xl">₹{consultationFee}</p>
                <p className="text-gray-500 text-xs">+ ₹{registrationFee} (registration)</p>
              </div>
            </div>
          </div>
          
          {/* Appointment Type Selection */}
          <div className="bg-white rounded-xl shadow-md mb-8">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Select Appointment Type</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointmentTypes.map((type) => (
                  <button 
                    key={type.id}
                    className={`flex items-center p-4 border rounded-lg transition
                      ${appointmentType === type.typeCode.toLowerCase() || 
                        (appointmentType === 'video' && type.typeCode === 'VIDEO') ||
                        (appointmentType === 'inPerson' && type.typeCode === 'IN_PERSON')
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'}`}
                    onClick={() => handleAppointmentTypeChange(type.typeCode.toLowerCase())}
                  >
                    <div className={`rounded-full p-3 mr-4
                      ${appointmentType === type.typeCode.toLowerCase() || 
                        (appointmentType === 'video' && type.typeCode === 'VIDEO') ||
                        (appointmentType === 'inPerson' && type.typeCode === 'IN_PERSON')
                        ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                      <i className={`fas ${type.typeCode === 'VIDEO' ? 'fa-video' : 'fa-hospital'}`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium">{type.typeName}</h4>
                      <p className="text-gray-500 text-sm">
                        {type.typeCode === 'VIDEO' 
                          ? 'Consult with doctor via secure video call'
                          : `Visit the doctor at ${hospital}`
                        }
                      </p>
                    </div>
                    {(appointmentType === type.typeCode.toLowerCase() || 
                      (appointmentType === 'video' && type.typeCode === 'VIDEO') ||
                      (appointmentType === 'inPerson' && type.typeCode === 'IN_PERSON')) && (
                      <div className="ml-auto text-purple-600">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Date and Time Selection */}
          <div className="bg-white rounded-xl shadow-md mb-8">
            {/* Date Selection */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Select Date</h3>
                
                <div className="relative">
                  <button 
                    className="flex items-center bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <span>{formatDateFull(selectedDate)}</span>
                    <i className="fas fa-calendar-alt ml-2"></i>
                  </button>
                  
                  {/* Calendar Popup */}
                  {showCalendar && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl z-10 w-64 sm:w-80 p-4 border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <button 
                          onClick={goToPreviousMonth}
                          disabled={monthOffset <= 0}
                          className={`p-1 rounded hover:bg-gray-100 ${monthOffset <= 0 ? 'text-gray-300 cursor-not-allowed' : ''}`}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        <div className="font-medium">
                          {formatMonthYear(new Date(new Date().setMonth(new Date().getMonth() + monthOffset)))}
                        </div>
                        <button 
                          onClick={goToNextMonth}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                      
                      {/* Calendar Grid */}
                      <div className="mb-2 grid grid-cols-7 gap-0 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                          <div key={day} className="text-gray-500 text-xs font-medium py-1">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {generateCalendarGrid().map((week, weekIndex) => (
                        <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-0">
                          {week.map((date, dayIndex) => {
                            if (!date) {
                              return <div key={`empty-${weekIndex}-${dayIndex}`} className="p-1"></div>;
                            }
                            
                            const isPast = isPastDate(date);
                            const isSelected = isSameDay(date, selectedDate);
                            const isToday = isSameDay(date, new Date());
                            
                            return (
                              <div 
                                key={`day-${date.getDate()}`}
                                className="p-1 text-center"
                              >
                                <button
                                  onClick={() => !isPast && handleDateSelect(date)}
                                  disabled={isPast}
                                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm
                                    ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-purple-100'}
                                    ${isSelected ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}
                                    ${isToday && !isSelected ? 'border border-purple-600 text-purple-600' : ''}
                                  `}
                                >
                                  {date.getDate()}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
               {/* Quick Date Selection Strip */}
              <div className="flex overflow-x-auto py-2 scrollbar-hide">
                {dateStrip.map((date, index) => {
                  const isSelected = isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, new Date());
                  
                  return (
                    <button
                      key={`strip-${index}`}
                      className={`flex-shrink-0 mr-3 flex flex-col items-center p-3 rounded-lg border transition
                        ${isSelected 
                          ? 'border-purple-600 bg-purple-600 text-white' 
                          : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'}
                      `}
                      onClick={() => handleDateSelect(date)}
                    >
                      <span className="text-xs font-medium mb-1">
                        {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-bold">
                        {date.getDate()}
                      </span>
                      <span className="text-xs">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Time Slot Selection */}
            <div className="p-6">
              <h3 className="text-lg font-bold mb-6">Select Time Slot</h3>
              
              {availableSlots.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-3">😔</div>
                  <h4 className="text-lg font-medium mb-2">No slots available</h4>
                  <p className="text-gray-500">Please select a different date or try again later</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {generateTimeGrid().map((timeGroup, index) => (
                    timeGroup.slots.length > 0 && (
                      <div key={`group-${index}`}>
                        <h4 className="text-gray-600 font-medium mb-3">{timeGroup.title}</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {timeGroup.slots.map(slot => (
                            <button
                              key={slot.id}
                              disabled={!slot.available}
                              className={`py-3 px-2 rounded-lg text-center transition
                                ${!slot.available 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' 
                                  : selectedSlot?.id === slot.id
                                    ? 'bg-purple-600 text-white'
                                    : 'border border-gray-200 hover:border-purple-300 hover:bg-purple-50'}
                              `}
                              onClick={() => slot.available && handleSlotSelect(slot)}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              className="px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition"
              onClick={() => navigate(`/doctors/${doctorId}`)}
            >
              Back to Doctor Profile
            </button>
            
            <button
              className={`px-8 py-3 rounded-lg font-medium transition ${
                selectedSlot 
                  ? 'bg-gradient-primary text-white hover:shadow-lg' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!selectedSlot}
              onClick={handleContinue}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;
                