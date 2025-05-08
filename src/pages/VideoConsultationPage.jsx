import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VideoConsultationPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [doctorJoined, setDoctorJoined] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Mock doctor info
  const mockDoctor = {
    id: 1,
    name: 'Dr. Rajib De',
    specialty: 'Haemato-Oncology',
    image: '/api/placeholder/80/80'
  };

  // Mock appointment info
  const mockAppointment = {
    id: id || '123',
    patientName: 'Yashraj Singh',
    doctorName: mockDoctor.name,
    doctorSpecialty: mockDoctor.specialty,
    doctorImage: mockDoctor.image,
    date: new Date(),
    scheduledTime: '03:30 PM',
    duration: 15, // in minutes
    status: 'scheduled', // scheduled, ongoing, completed, cancelled
    meetingLink: 'https://meet.example.com/abc123'
  };

  useEffect(() => {
    // Simulate API call to fetch appointment details
    setTimeout(() => {
      setAppointmentInfo(mockAppointment);
      setLoading(false);
      
      // Check how much time is left before the appointment
      const now = new Date();
      const appointmentTime = new Date(now);
      // Parse the time from the string format (03:30 PM)
      const [hourMin, period] = mockAppointment.scheduledTime.split(' ');
      const [hour, minute] = hourMin.split(':');
      let hourNum = parseInt(hour);
      if (period === 'PM' && hourNum < 12) hourNum += 12;
      if (period === 'AM' && hourNum === 12) hourNum = 0;
      
      appointmentTime.setHours(hourNum, parseInt(minute), 0);
      
      const timeToAppointment = appointmentTime - now;
      if (timeToAppointment > 0) {
        // If appointment is in the future, set countdown
        const minutes = Math.floor(timeToAppointment / (1000 * 60));
        setCountdown(minutes);
      } else {
        // If appointment time has passed, allow to join call
        setCountdown(0);
      }
    }, 1000);
    
    // Cleanup
    return () => {
      // In a real app, you'd clean up any WebRTC connections here
    };
  }, [id]);

  // Simulate doctor joining after 5 seconds of patient joining
  useEffect(() => {
    if (isCallActive && !doctorJoined) {
      const timer = setTimeout(() => {
        setDoctorJoined(true);
        addSystemMessage('Dr. Rajib De has joined the consultation.');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isCallActive, doctorJoined]);

  const joinCall = () => {
    setIsCallActive(true);
    addSystemMessage('You have joined the consultation. Waiting for the doctor to join...');
  };

  const endCall = () => {
    // In a real app, you'd disconnect from the call here
    setIsCallActive(false);
    addSystemMessage('You have left the consultation.');
  };

  const toggleCamera = () => {
    // In a real app, you'd control the actual camera here
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    // In a real app, you'd control the actual microphone here
    setIsMicOn(!isMicOn);
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Add user message to chat
    addUserMessage(newMessage);
    setNewMessage('');
    
    // Simulate doctor response after 2 seconds
    if (doctorJoined) {
      setTimeout(() => {
        addDoctorMessage(generateDoctorResponse(newMessage));
      }, 2000);
    }
  };

  const addSystemMessage = (text) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'system',
      text,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date()
    }]);
  };

  const addDoctorMessage = (text) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'doctor',
      text,
      timestamp: new Date()
    }]);
  };

  const generateDoctorResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pain') || lowerMessage.includes('headache')) {
      return "How long have you been experiencing this pain? Can you describe its intensity on a scale of 1-10?";
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
      return "Have you been taking your medications regularly as prescribed? Any side effects you've noticed?";
    } else if (lowerMessage.includes('feeling better') || lowerMessage.includes('improved')) {
      return "I'm glad to hear that. Let's continue with the current treatment and see how you progress in the next few days.";
    } else if (lowerMessage.includes('not better') || lowerMessage.includes('worse')) {
      return "I'm sorry to hear that. We might need to adjust your treatment plan. Let's discuss some alternatives.";
    } else if (lowerMessage.includes('test') || lowerMessage.includes('report')) {
      return "Have you received all your test results? If yes, please share them with me through the health records section.";
    } else {
      return "Thank you for sharing that information. Is there anything specific concerning you about your condition that you'd like to discuss further?";
    }
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {!isCallActive ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-primary p-6 text-white">
                <h1 className="text-2xl font-bold">Video Consultation</h1>
                <p className="text-indigo-100">
                  {appointmentInfo.doctorName} - {appointmentInfo.doctorSpecialty}
                </p>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <img 
                    src={appointmentInfo.doctorImage} 
                    alt={appointmentInfo.doctorName} 
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{appointmentInfo.doctorName}</h2>
                    <p className="text-gray-600">{appointmentInfo.doctorSpecialty}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{appointmentInfo.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{appointmentInfo.scheduledTime}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{appointmentInfo.duration} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium">{appointmentInfo.patientName}</span>
                  </div>
                </div>
                
                {countdown !== null && (
                  <div className="mt-6 text-center">
                    {countdown > 0 ? (
                      <div>
                        <p className="text-gray-600 mb-2">Your consultation will start in approximately:</p>
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.floor(countdown / 60) > 0 && `${Math.floor(countdown / 60)} hours `}
                          {countdown % 60} minutes
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          You can join the call 10 minutes before the scheduled time.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={joinCall}
                        className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition w-full"
                      >
                        Join Video Consultation Now
                      </button>
                    )}
                  </div>
                )}
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 mb-2">Preparation Tips:</h3>
                  <ul className="text-blue-600 space-y-1 text-sm">
                    <li>• Ensure you have a stable internet connection</li>
                    <li>• Find a quiet, well-lit place for your consultation</li>
                    <li>• Keep your medication list and health records handy</li>
                    <li>• Test your camera and microphone before joining</li>
                    <li>• Write down any questions you want to ask the doctor</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-5rem)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {/* Video Call Area */}
              <div className="md:col-span-2 bg-black rounded-xl overflow-hidden relative">
                {/* Doctor Video (Large) */}
                <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                  {doctorJoined ? (
                    <img 
                      src="/api/placeholder/640/480" 
                      alt="Doctor video" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-white">
                      <div className="animate-pulse mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">Waiting for doctor to join...</p>
                    </div>
                  )}
                </div>
                
                {/* Patient Video (Small, Picture-in-Picture) */}
                <div className="absolute bottom-4 right-4 w-1/4 h-1/4 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
                  {isCameraOn ? (
                    <img 
                      src="/api/placeholder/160/120" 
                      alt="Your video" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Call Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 flex justify-center space-x-4">
                  <button 
                    onClick={toggleMic}
                    className={`${isMicOn ? 'bg-gray-700' : 'bg-red-600'} h-12 w-12 rounded-full flex items-center justify-center hover:opacity-90 transition`}
                  >
                    {isMicOn ? (
                      <i className="fas fa-microphone text-white"></i>
                    ) : (
                      <i className="fas fa-microphone-slash text-white"></i>
                    )}
                  </button>
                  
                  <button 
                    onClick={toggleCamera}
                    className={`${isCameraOn ? 'bg-gray-700' : 'bg-red-600'} h-12 w-12 rounded-full flex items-center justify-center hover:opacity-90 transition`}
                  >
                    {isCameraOn ? (
                      <i className="fas fa-video text-white"></i>
                    ) : (
                      <i className="fas fa-video-slash text-white"></i>
                    )}
                  </button>
                  
                  <button 
                    onClick={endCall}
                    className="bg-red-600 h-12 w-28 rounded-full flex items-center justify-center hover:bg-red-700 transition"
                  >
                    <i className="fas fa-phone-slash text-white mr-2"></i>
                    <span className="text-white font-medium">End Call</span>
                  </button>
                </div>
              </div>
              
              {/* Chat and Info Area */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
                {/* Doctor Info */}
                <div className="p-4 bg-gradient-primary text-white">
                  <div className="flex items-center">
                    <img 
                      src={appointmentInfo.doctorImage} 
                      alt={appointmentInfo.doctorName} 
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h3 className="font-bold">{appointmentInfo.doctorName}</h3>
                      <p className="text-xs text-indigo-100">{appointmentInfo.doctorSpecialty}</p>
                    </div>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  <div className="space-y-4">
                    {chatMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${message.sender === 'system' ? 'justify-center' : ''}`}
                      >
                        {message.sender === 'system' ? (
                          <div className="bg-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 max-w-[80%]">
                            {message.text}
                          </div>
                        ) : message.sender === 'doctor' ? (
                          <div className="flex items-start max-w-[80%]">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2">
                              <img 
                                src={appointmentInfo.doctorImage} 
                                alt={appointmentInfo.doctorName} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="bg-purple-100 text-purple-800 rounded-lg px-3 py-2 rounded-tl-none">
                                {message.text}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 ml-2">
                                {formatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start flex-row-reverse max-w-[80%]">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center ml-2">
                              <i className="fas fa-user text-gray-600 text-sm"></i>
                            </div>
                            <div>
                              <div className="bg-blue-600 text-white rounded-lg px-3 py-2 rounded-tr-none">
                                {message.text}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 mr-2 text-right">
                                {formatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleMessageChange}
                      placeholder="Type your message..."
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                      type="submit"
                      className="bg-gradient-primary text-white p-2 rounded-r-lg"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConsultationPage;