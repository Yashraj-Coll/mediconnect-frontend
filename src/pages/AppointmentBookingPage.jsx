import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data for doctor
const mockDoctor = {
  id: 1,
  name: 'Dr. Rajib De',
  specialty: 'Haemato-Oncology',
  qualifications: 'MBBS, MD (Medicine), DM (Clinical Haematology)',
  experience: '15+ years',
  hospital: 'Narayana Superspeciality Hospital, Howrah',
  languages: ['English', 'Hindi', 'Bengali'],
  licenseNo: 'WBMC 53827',
  rating: 4.9,
  reviews: 356,
  consultationFee: 800,
  registrationFee: 350
};

const AppointmentBookingPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Load doctor data on component mount
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setDoctor(mockDoctor);
      setLoading(false);
      
      // Generate random available slots
      const slots = [];
      const slotTimes = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
                          '02:00 PM', '03:30 PM', '04:30 PM', '05:30 PM', '06:30 PM'];
      
      // Randomly select 4-6 slots
      const numSlots = Math.floor(Math.random() * 3) + 4;
      const randomSlots = slotTimes.sort(() => 0.5 - Math.random()).slice(0, numSlots);
      
      randomSlots.forEach(time => {
        slots.push({
          id: time.replace(/[: ]/g, ''),
          time,
          available: true
        });
      });
      
      setAvailableSlots(slots.sort((a, b) => {
        // Sort by time
        const timeA = a.time;
        const timeB = b.time;
        return new Date(`2000/01/01 ${timeA}`) - new Date(`2000/01/01 ${timeB}`);
      }));
    }, 500);
  }, [doctorId]);

  // Generate dates for the selection
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const dates = generateDates();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    // In a real app, you would fetch available slots for this date
    
    // Simulate generating new slots for a different date
    const slots = [];
    const slotTimes = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
                        '02:00 PM', '03:30 PM', '04:30 PM', '05:30 PM', '06:30 PM'];
    
    // Randomly select 4-6 slots
    const numSlots = Math.floor(Math.random() * 3) + 4;
    const randomSlots = slotTimes.sort(() => 0.5 - Math.random()).slice(0, numSlots);
    
    randomSlots.forEach(time => {
      slots.push({
        id: time.replace(/[: ]/g, ''),
        time,
        available: true
      });
    });
    
    setAvailableSlots(slots.sort((a, b) => {
      // Sort by time
      const timeA = a.time;
      const timeB = b.time;
      return new Date(`2000/01/01 ${timeA}`) - new Date(`2000/01/01 ${timeB}`);
    }));
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      // In a real app, you would store the selected slot and date
      // Then navigate to the patient selection page
      navigate('/patient-selection', { 
        state: { 
          doctor, 
          date: selectedDate, 
          slot: selectedSlot 
        } 
      });
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Get day name (e.g., "Mon", "Tue")
  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Get day number (e.g., "1", "15")
  const getDayNumber = (date) => {
    return date.getDate();
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is selected
  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Calendar Month display
  const getMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
            <h1 className="text-2xl font-bold">Select Date & Time Slot</h1>
            <p className="text-gray-600">Choose your preferred appointment date and time slot</p>
          </div>

          {/* Doctor Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center">
              <img 
                src="/api/placeholder/100/100" 
                alt={doctor.name} 
                className="w-20 h-20 rounded-full object-cover mr-6"
              />
              <div>
                <h2 className="text-xl font-bold">{doctor.name}</h2>
                <p className="text-gray-700">{doctor.specialty}</p>
                <p className="text-gray-600 text-sm">{doctor.qualifications}</p>
                <p className="text-gray-600 text-sm mt-1">License No: {doctor.licenseNo}</p>
                <div className="mt-1 flex items-center">
                  <p className="text-gray-600 text-sm">Languages: </p>
                  <p className="text-gray-700 text-sm ml-1">{doctor.languages.join(', ')}</p>
                </div>
                <p className="text-gray-600 text-sm mt-1">Hospital: {doctor.hospital}</p>
                <p className="text-purple-600 font-medium mt-2">Consultation Fee: ₹{doctor.consultationFee + doctor.registrationFee} <span className="text-xs text-gray-500">(Registration Charge ₹{doctor.registrationFee} included)</span></p>
              </div>
            </div>
          </div>

          {/* Video Consultation Banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8 flex items-center">
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <i className="fas fa-video text-purple-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-purple-800">VIDEO CONSULTATION</h3>
              <p className="text-purple-700 text-sm">This is an online consultation via secure video call</p>
            </div>
          </div>

          {/* Date Selection Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Select Date</h3>
                
                {/* Calendar Toggle Button */}
                <div 
                  className="relative"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setCalendarOpen(false);
                    }
                  }}
                >
                  <button 
                    className="flex items-center text-gray-600 hover:text-purple-600"
                    onClick={() => setCalendarOpen(!calendarOpen)}
                  >
                    <span className="mr-2">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <i className="fas fa-calendar-alt"></i>
                  </button>
                  
                  {/* Calendar Dropdown */}
                  {calendarOpen && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl z-10 p-4 border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <button className="text-gray-600 hover:text-purple-600">
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        <div className="font-medium">{getMonthYear(selectedDate)}</div>
                        <button className="text-gray-600 hover:text-purple-600">
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                      
                      {/* Days of week */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center text-gray-500 text-xs font-medium">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Calendar days */}
                      <div className="grid grid-cols-7 gap-1">
                        {/* Example calendar - would need proper calendar logic in real app */}
                        {Array.from({ length: 35 }, (_, i) => {
                          const date = new Date(selectedDate);
                          // This is simplified - doesn't account for month boundaries
                          date.setDate(1 + i - 5); // Start 5 days before 1st of month
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                if (date >= new Date()) {
                                  handleDateSelect(date);
                                  setCalendarOpen(false);
                                }
                              }}
                              disabled={date < new Date()}
                              className={`
                                h-8 w-8 rounded-full flex items-center justify-center text-sm
                                ${date < new Date() ? 'text-gray-300' : 'text-gray-700 hover:bg-purple-100'}
                                ${isSelected(date) ? 'bg-purple-600 text-white hover:bg-purple-600' : ''}
                              `}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Date Quick Selection */}
              <div className="flex overflow-x-auto pb-2">
                {dates.map((date, index) => (
                  <button
                    key={index}
                    className={`
                      flex-shrink-0 mr-3 last:mr-0 flex flex-col items-center p-3 rounded-lg border transition
                      ${isSelected(date) 
                        ? 'border-purple-600 bg-purple-600 text-white' 
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'}
                    `}
                    onClick={() => handleDateSelect(date)}
                  >
                    <span className="text-xs font-medium mb-1">
                      {isToday(date) ? 'Today' : getDayName(date)}
                    </span>
                    <span className="text-lg font-bold">
                      {getDayNumber(date)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Select Time Slot</h3>
              
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.id}
                      className={`
                        p-3 rounded-lg border text-center transition
                        ${selectedSlot?.id === slot.id 
                          ? 'border-purple-600 bg-purple-600 text-white' 
                          : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50 text-gray-700'}
                      `}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No slots available for this date. Please select another date.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-center">
            <button
              className={`
                py-3 px-8 rounded-lg font-medium transition
                ${selectedSlot 
                  ? 'bg-gradient-primary text-white hover:shadow-lg' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
              `}
              onClick={handleContinue}
              disabled={!selectedSlot}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;