import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JitsiMeetComponent from '../components/JitsiMeetComponent';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const BACKEND_BASE_URL = "http://localhost:8080/mediconnect";

const api = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const sessionToken = localStorage.getItem('session_token');
  if (sessionToken) config.headers['X-Session-Id'] = sessionToken;
  return config;
});

const getPatientProfileImage = (patient) => {
  if (patient?.profileImage) {
    return `${BACKEND_BASE_URL}/uploads/${patient.profileImage}`;
  }
  if (patient?.gender === 'FEMALE') {
    return '/images/Profile Photo Woman.jpg';
  }
  return '/images/Profile Photo Man.jpg';
};

const VideoConsultationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [jitsiRoomName, setJitsiRoomName] = useState('');
  const [stompClient, setStompClient] = useState(null);
const [isConnected, setIsConnected] = useState(false);
const [messagesEndRef, setMessagesEndRef] = useState(null);


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/video-consultation/' + id);
      return;
    }
    fetchAppointmentDetails();
  }, [id, isAuthenticated, navigate]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/appointments/${id}/details`);
      if (response.data.success) {
        const appointmentData = response.data.data;
        setAppointmentInfo(appointmentData);

        
        // FIXED: Create a simpler, more reliable room name
        // Use existing video room name from database or create new one
const roomName = appointmentData.videoRoomName || `mediconnect-${appointmentData.id}-${Date.now()}`;
setJitsiRoomName(roomName);

// Only update if room name doesn't exist in database
if (!appointmentData.videoRoomName) {
  await api.put(`/appointments/${id}/video-room`, { videoRoomName: roomName });
}
        
        if (appointmentData.appointmentDateTime) {
  const appointmentTime = new Date(appointmentData.appointmentDateTime);
  const now = new Date();
  const timeToAppointment = appointmentTime - now;
  
  // Allow joining 5 minutes before appointment time
  const allowJoinTime = appointmentTime.getTime() - (5 * 60 * 1000); // 5 minutes before
  
  if (now.getTime() >= allowJoinTime) {
    setCountdown(0); // Allow joining
  } else {
    const minutes = Math.floor(timeToAppointment / (1000 * 60));
    setCountdown(minutes);
  }
}
      } else {
        setError(response.data.message || 'Failed to load appointment details');
      }
    } catch (err) {
      setError('Failed to load appointment details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time countdown update
useEffect(() => {
  if (!appointmentInfo?.appointmentDateTime) return;
  
  const interval = setInterval(() => {
    const appointmentTime = new Date(appointmentInfo.appointmentDateTime);
    const now = new Date();
    const allowJoinTime = appointmentTime.getTime() - (5 * 60 * 1000); // 5 minutes before
    
    if (now.getTime() >= allowJoinTime) {
      setCountdown(0);
    } else {
      const timeToAppointment = appointmentTime - now;
      const minutes = Math.floor(timeToAppointment / (1000 * 60));
      setCountdown(minutes);
    }
  }, 60000); // Update every minute
  
  return () => clearInterval(interval);
}, [appointmentInfo]);

// WebSocket connection setup
useEffect(() => {
  if (!appointmentInfo?.id) return;

  const client = new Client({
    webSocketFactory: () => new SockJS(`${BACKEND_BASE_URL}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    debug: function (str) {
      console.log('🔌 STOMP Debug:', str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = function (frame) {
    console.log('✅ WebSocket Connected:', frame);
    setIsConnected(true);

    // Subscribe to appointment-specific chat room
    const subscription = client.subscribe(
      `/topic/appointment/${appointmentInfo.id}`,
      function (message) {
        console.log('📨 Received message:', message.body);
        try {
          const chatMessage = JSON.parse(message.body);
          const currentUserId = user?.id;
          
          setChatMessages(prev => [...prev, {
            id: chatMessage.id || Date.now(),
            sender: chatMessage.senderId === currentUserId ? 'user' : 'other',
            text: chatMessage.messageText,
            timestamp: new Date(chatMessage.timestamp),
           profile: {
  name: chatMessage.senderName,
  image: chatMessage.senderId === appointmentInfo.doctorUserId 
    ? getDoctorImage(appointmentInfo) 
    : getPatientProfileImage({
        profileImage: appointmentInfo.patientProfileImage,
        gender: appointmentInfo.patientGender
      })
}
          }]);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      }
    );

    // Load chat history
    loadChatHistory();
  };

  client.onStompError = function (frame) {
    console.error('❌ STOMP Error:', frame.headers['message']);
    setIsConnected(false);
  };

  client.onWebSocketClose = function (event) {
    console.log('🔌 WebSocket Closed:', event);
    setIsConnected(false);
  };

  client.activate();
  setStompClient(client);

  return () => {
    if (client) {
      client.deactivate();
      setIsConnected(false);
    }
  };
}, [appointmentInfo?.id, user?.id]);

// Load chat history from backend
const loadChatHistory = async () => {
  try {
    const response = await api.get(`/chat/${appointmentInfo.id}/messages`);
    if (response.data.success) {
      const messages = response.data.data.map(msg => ({
        id: msg.id,
        sender: msg.senderId === user?.id ? 'user' : 'other',
        text: msg.messageText,
        timestamp: new Date(msg.timestamp),
        profile: {
  name: chatMessage.senderName,
  image: chatMessage.senderId === appointmentInfo.doctorUserId 
    ? getDoctorImage(appointmentInfo) 
    : getPatientProfileImage({
        profileImage: appointmentInfo.patientProfileImage,
        gender: appointmentInfo.patientGender
      })
}
      }));
      setChatMessages(messages);
    }
  } catch (error) {
    console.error('❌ Error loading chat history:', error);
  }
};

// Auto-scroll to bottom when new messages arrive
useEffect(() => {
  if (messagesEndRef) {
    messagesEndRef.scrollIntoView({ behavior: 'smooth' });
  }
}, [chatMessages]);

  const joinCall = () => {
    setIsCallActive(true);
    addSystemMessage('You have joined the video consultation.');
  };

  const endCall = () => {
    setIsCallActive(false);
    addSystemMessage('You have left the video consultation.');
  };

  const handleJitsiMeetingEnd = () => {
    setIsCallActive(false);
    addSystemMessage('Video consultation has ended.');
  };

  const handleMessageChange = (e) => setNewMessage(e.target.value);

  const handleSendMessage = (e) => {
  e.preventDefault();
   // 🧪 ADD THESE DEBUG LINES:
  console.log('🚀 SEND MESSAGE CLICKED!');
  console.log('💬 Message content:', newMessage);
  console.log('🔌 STOMP connected:', isConnected);
  console.log('📡 STOMP client:', stompClient);
  if (!newMessage.trim() || !stompClient || !isConnected) {
    console.log('❌ FAILED CONDITIONS:', {
      hasMessage: !!newMessage.trim(),
      hasStompClient: !!stompClient,
      isConnected: isConnected
    });
    return;
  }

  const currentUserId = user?.id;
  const currentUserRole = getUserRole();
  const senderName = currentUserRole === 'doctor' 
    ? appointmentInfo.doctorName 
    : appointmentInfo.patientName;

  const chatMessage = {
    appointmentId: appointmentInfo.id,
    senderId: currentUserId,
    senderType: currentUserRole.toUpperCase(),
    senderName: senderName,
    messageText: newMessage.trim(),
    timestamp: new Date().toISOString()
  };

  try {
    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(chatMessage)
    });
    setNewMessage('');
  } catch (error) {
    console.error('❌ Error sending message:', error);
    // Fallback: add message locally if WebSocket fails
    addUserMessage(newMessage);
    setNewMessage('');
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

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDoctorImage = (appointmentInfo) => {
    if (!appointmentInfo) return '/images/Male Doctor.jpg';
    const profileImage = appointmentInfo.doctorProfileImage;
    const gender = appointmentInfo.doctorGender || 'MALE';
    if (!profileImage || profileImage.trim() === '') {
      return gender === 'FEMALE' ? '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg';
    }
    if (profileImage.includes('default-profile.jpg') || profileImage.includes('/assets/images/')) {
      return gender === 'FEMALE' ? '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg';
    }
    return `${BACKEND_BASE_URL}/uploads/${profileImage}`;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  // FIXED: Enhanced user role detection
  const getUserDisplayName = () => {
    if (!user || !appointmentInfo) return 'User';
    
    // Check if current user is the doctor
    if (user.id === appointmentInfo.doctorUserId) {
      return `Dr. ${appointmentInfo.doctorName}`;
    } else {
      return appointmentInfo.patientName;
    }
  };

  // FIXED: Proper role detection matching your database structure
  const getUserRole = () => {
    if (!user || !appointmentInfo) return 'participant';
    
    console.log('Current user ID:', user.id);
    console.log('Doctor user ID:', appointmentInfo.doctorUserId);
    console.log('Patient user ID:', appointmentInfo.patientUserId);
    
    // Check user roles from your database structure
    if (user.roles) {
      const hasDocRole = user.roles.some(role => 
        role.name === 'ROLE_DOCTOR' || role === 'ROLE_DOCTOR'
      );
      const hasPatientRole = user.roles.some(role => 
        role.name === 'ROLE_PATIENT' || role === 'ROLE_PATIENT'
      );
      
      if (hasDocRole) return 'doctor';
      if (hasPatientRole) return 'patient';
    }
    
    // Fallback: Check by user ID matching
    if (user.id === appointmentInfo.doctorUserId) {
      return 'doctor';
    } else if (user.id === appointmentInfo.patientUserId) {
      return 'patient';
    }
    
    return 'participant';
  };

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !appointmentInfo) {
    return (
      <div className="pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-5xl text-red-500 mb-4">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="text-2xl font-bold mb-4">Error Loading Consultation</h2>
            <p className="text-gray-600 mb-6">{error || 'Appointment not found'}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dateTime = formatDateTime(appointmentInfo.appointmentDateTime);
  const currentUserRole = getUserRole();
  
  console.log('Final user role for Jitsi:', currentUserRole);

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {!isCallActive ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-primary p-6 text-white">
                <h1 className="text-2xl font-bold">Video Consultation</h1>
                <p className="text-indigo-100">
                  {appointmentInfo.doctorName} - {appointmentInfo.doctorSpecialization}
                </p>
                <p className="text-sm text-indigo-200 mt-2">
                  You are joining as: <span className="font-semibold capitalize">{currentUserRole}</span>
                </p>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <img 
                    src={getDoctorImage(appointmentInfo)} 
                    alt={appointmentInfo.doctorName} 
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{appointmentInfo.doctorName}</h2>
                    <p className="text-gray-600">{appointmentInfo.doctorSpecialization}</p>
                    {appointmentInfo.doctorHospitalAffiliation && (
                      <p className="text-sm text-gray-500">{appointmentInfo.doctorHospitalAffiliation}</p>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{dateTime.date}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{dateTime.time}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{appointmentInfo.durationMinutes || 30} minutes</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">
                      {appointmentInfo.appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium">{appointmentInfo.patientName}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
  <span className="text-gray-600">Room ID:</span>
  <span className="font-medium text-sm bg-gray-100 px-2 py-1 rounded">
    {appointmentInfo.videoRoomName || jitsiRoomName}
  </span>
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
          Please wait for the scheduled time to join the consultation.
        </p>
        
        {/* Disabled button when time hasn't reached */}
        <button
          disabled
          className="bg-gray-400 text-white px-8 py-3 rounded-lg font-medium cursor-not-allowed w-full mt-4"
        >
          <i className="fas fa-clock mr-2"></i>
          Consultation Not Started Yet
        </button>
      </div>
    ) : (
      <div>
        <p className="text-green-600 mb-2 font-medium">✅ Your consultation time has arrived!</p>
        
        {/* Active button when time has reached */}
        <button
          onClick={joinCall}
          className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition w-full mt-4"
        >
          <i className="fas fa-video mr-2"></i>
          Join Video Consultation Now
        </button>
      </div>
    )}
  </div>
)}
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 mb-2">Video Call Instructions:</h3>
                  <ul className="text-blue-600 space-y-1 text-sm">
                    <li>• Ensure you have a stable internet connection</li>
                    <li>• Find a quiet, well-lit place for your consultation</li>
                    <li>• Allow camera and microphone permissions when prompted</li>
                    <li>• Test your camera and microphone before joining</li>
                    <li>• Keep your medication list and health records handy</li>
                    <li>• The video call will open in this window</li>
                    <li>• No login required - you'll join directly as a {currentUserRole}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-5rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
              {/* Jitsi Meet Video Area */}
              <div className="lg:col-span-3 bg-black rounded-xl overflow-hidden relative h-full min-h-[70vh]">
                <JitsiMeetComponent
                  roomName={jitsiRoomName}
                  displayName={getUserDisplayName()}
                  email={user?.email || ''}
                  userRole={currentUserRole}
                  doctorName={appointmentInfo.doctorName}
                  patientName={appointmentInfo.patientName}
                  appointmentId={appointmentInfo.id}
                  onMeetingEnd={handleJitsiMeetingEnd}
                  width="100%"
                  height="70vh"
                />
              </div>
              
              {/* Chat and Info Area */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
                {/* Current User Info */}
<div className="p-4 bg-gradient-primary text-white">
  <div className="flex items-center">
    <img 
      src={currentUserRole === 'doctor' 
        ? getDoctorImage(appointmentInfo)
        : getPatientProfileImage({
            profileImage: appointmentInfo.patientProfileImage,
            gender: appointmentInfo.patientGender
          })
      } 
      alt={currentUserRole === 'doctor' ? appointmentInfo.doctorName : appointmentInfo.patientName} 
      className="w-10 h-10 rounded-full object-cover mr-3"
    />
    <div>
      <h3 className="font-bold">
        {currentUserRole === 'doctor' ? appointmentInfo.doctorName : appointmentInfo.patientName}
      </h3>
      <p className="text-xs text-indigo-100">
        {currentUserRole === 'doctor' ? appointmentInfo.doctorSpecialization : 'Patient'}
      </p>
    </div>
  </div>
                  <div className="mt-2 text-xs text-indigo-200">
                    You are: <span className="font-semibold capitalize">{currentUserRole}</span>
                    <div className="mt-1 text-xs">
                    {isConnected ? (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        Chat Connected
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                        Connecting...
                      </span>
                    )}
                  </div>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="space-y-4 overflow-y-auto p-4 h-96">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <i className="fas fa-comments text-3xl text-gray-300 mb-2"></i>
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      chatMessages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : message.sender === 'system' ? 'justify-center' : 'justify-start'}`}
                        >
                          {message.sender === 'system' ? (
                            <div className="bg-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 max-w-[80%]">
                              {message.text}
                            </div>
                          ) : (
                            <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                              <img
                                src={message.profile?.image || '/images/default-avatar.jpg'}
                                alt={message.profile?.name || 'User'}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-3 py-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-800'}`}>
                                  <p className="text-sm">{message.text}</p>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={(el) => setMessagesEndRef(el)} />
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                 <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleMessageChange}
                     placeholder={isConnected ? "Type your message..." : "Connecting to chat..."}
                      disabled={!isConnected}
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || !isConnected}
                      className="bg-gradient-primary text-white p-2 rounded-r-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                  {!isConnected && (
                    <p className="text-xs text-gray-500 mt-1">
                      Connecting to real-time chat...
                    </p>
                  )}
                </div>
                
                {/* End Call Button */}
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={endCall}
                    className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
                  >
                    <i className="fas fa-phone-slash mr-2"></i>
                    End Consultation
                  </button>
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