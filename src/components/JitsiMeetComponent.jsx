import React, { useEffect, useRef, useState, useCallback } from 'react';

const JitsiMeetComponent = ({ 
  roomName, 
  displayName, 
  email,
  onMeetingEnd,
  userRole = 'participant',
  doctorName = '',
  patientName = '',
  appointmentId = '',
  width = '100%',
height = '100vh'
}) => {
  const jitsiContainerRef = useRef(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  // Use refs to track state for event handlers
  const isLoadingRef = useRef(true);
  const connectionTimeoutRef = useRef(null);

  // Stable callback to handle successful connection
  const handleConnectionSuccess = useCallback(() => {
    console.log('🎉 JITSI: Connection success handler called');
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    setConnectionStatus('connected');
    setIsLoading(false);
    setError(null);
    isLoadingRef.current = false;
  }, []);

  useEffect(() => {
    if (!roomName || !displayName) {
      setError('Room name and display name are required');
      setIsLoading(false);
      return;
    }

    // Load Jitsi Meet External API script from community server
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.ffmuc.net/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        setConnectionStatus('loading-script');
        await loadJitsiScript();
        
        if (jitsiContainerRef.current) {
          jitsiContainerRef.current.innerHTML = '';

          setConnectionStatus('initializing');
          const domain = 'meet.ffmuc.net';
          
          const options = {
            roomName: roomName,
            width: width,
            height: height,
            parentNode: jitsiContainerRef.current,
            userInfo: {
              displayName: displayName,
              email: email || ''
            },
            configOverwrite: {
              prejoinPageEnabled: false,
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              requireDisplayName: false,
              resolution: 720,
              constraints: {
                video: {
                  height: { ideal: 720, max: 720, min: 240 },
                  width: { ideal: 1280, max: 1280, min: 320 },
                  frameRate: { ideal: 15, max: 30 }
                }
              },
              toolbarButtons: [
                'microphone', 
                'camera', 
                'chat', 
                'desktop',
                'fullscreen',
                'hangup',
                'settings'
              ],
              enableP2P: true,
              p2p: {
                enabled: true,
                stunServers: [
                  { urls: 'stun:stun.l.google.com:19302' }
                ]
              }
            },
            interfaceConfigOverwrite: {
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              FILMSTRIP_ENABLED: true,
              HIDE_INVITE_MORE_HEADER: true,
              INITIAL_TOOLBAR_TIMEOUT: 20000,
              PROVIDER_NAME: 'MediConnect',
              SETTINGS_SECTIONS: ['devices', 'language'],
              SHOW_BRAND_WATERMARK: false,
              SHOW_JITSI_WATERMARK: false,
              SHOW_POWERED_BY: false,
              TOOLBAR_ALWAYS_VISIBLE: false,
              TOOLBAR_TIMEOUT: 4000,
              VIDEO_LAYOUT_FIT: 'both'
            }
          };

          console.log('🔥 JITSI: Creating API with community server:', domain);
          console.log('🔥 JITSI: Room:', roomName, 'User:', displayName);
          
          const api = new window.JitsiMeetExternalAPI(domain, options);
          setJitsiApi(api);

          // 🎯 ADD THIS CODE BLOCK HERE:
// Force iframe height after Jitsi creates it
setTimeout(() => {
  const iframe = jitsiContainerRef.current?.querySelector('iframe');
  if (iframe) {
    iframe.style.height = '560px';
    iframe.style.minHeight = '560px';
    iframe.style.maxHeight = '560px';
    console.log('🎯 FIXED: Forced iframe height to 600px');
  }
}, 2000); // Wait 2 seconds for iframe to be fully created

// Keep fixing it if Jitsi tries to change it back
setInterval(() => {
  const iframe = jitsiContainerRef.current?.querySelector('iframe');
  if (iframe && iframe.style.height !== '560px') {
    iframe.style.height = '560px';
    iframe.style.minHeight = '560px';
    iframe.style.maxHeight = '560px';
  }
}, 3000); // Check every 3 seconds

          // Set up connection timeout
          connectionTimeoutRef.current = setTimeout(() => {
            if (isLoadingRef.current) {
              console.log('⏰ JITSI: Connection timeout triggered');
              setError('Connection timeout. Please check your internet connection and try again.');
              setIsLoading(false);
              isLoadingRef.current = false;
            }
          }, 25000); // 25 seconds timeout

          // Primary success event - this is the most reliable
          api.addEventListener('videoConferenceJoined', (participant) => {
            console.log('✅ JITSI: videoConferenceJoined event - Success!', participant);
            handleConnectionSuccess();
          });

          // Alternative success events for reliability
          api.addEventListener('participantJoined', (participant) => {
            console.log('👥 JITSI: participantJoined:', participant);
            // If this is the current user and we're still loading, mark as success
            if (isLoadingRef.current && participant.id === api.getMyUserId()) {
              console.log('✅ JITSI: Current user joined via participantJoined');
              handleConnectionSuccess();
            }
          });

          // Handle conference events that indicate successful connection
          api.addEventListener('conferenceJoined', () => {
            console.log('✅ JITSI: conferenceJoined event');
            if (isLoadingRef.current) {
              handleConnectionSuccess();
            }
          });

          // Exit events
          api.addEventListener('videoConferenceLeft', () => {
            console.log('👋 JITSI: Left the meeting');
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
            }
            if (onMeetingEnd) {
              onMeetingEnd();
            }
          });

          api.addEventListener('readyToClose', () => {
            console.log('🚪 JITSI: Ready to close');
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
            }
            if (onMeetingEnd) {
              onMeetingEnd();
            }
          });

          // Connection status events
          api.addEventListener('connectionEstablished', () => {
            console.log('🔗 JITSI: Connection established');
            setConnectionStatus('connecting-to-room');
          });

          api.addEventListener('connectionFailed', () => {
            console.error('❌ JITSI: Connection failed');
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
            }
            setError('Failed to connect to the video call. Please check your internet connection.');
            setIsLoading(false);
            isLoadingRef.current = false;
          });

          // Aggressive fallback - force success after iframe loads
          setTimeout(() => {
            if (isLoadingRef.current) {
              console.log('🚀 JITSI: Aggressive fallback - iframe should be loaded');
              // Check if iframe exists and has content
              const iframe = jitsiContainerRef.current?.querySelector('iframe');
              if (iframe) {
                console.log('✅ JITSI: Iframe detected, assuming success');
                handleConnectionSuccess();
              }
            }
          }, 8000); // 8 second fallback

          // Send welcome message after joining
          setTimeout(() => {
            if (api && doctorName && patientName) {
              try {
                api.executeCommand('sendChatMessage', 
                  `🏥 MediConnect Consultation\n` +
                  `👨‍⚕️ Doctor: ${doctorName}\n` +
                  `👤 Patient: ${patientName}\n` +
                  `🆔 Appointment ID: ${appointmentId}\n` +
                  `Welcome to your secure consultation!`
                );
              } catch (e) {
                console.log('💬 JITSI: Could not send welcome message:', e);
              }
            }
          }, 12000); // Send after 12 seconds to ensure connection

        }
      } catch (err) {
        console.error('❌ JITSI: Error initializing:', err);
        setError('Failed to initialize video call. Please refresh the page and try again.');
        setIsLoading(false);
        isLoadingRef.current = false;
        setConnectionStatus('error');
      }
    };

    initializeJitsi();

    // Cleanup function
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (jitsiApi) {
        try {
          console.log('🧹 JITSI: Cleaning up API');
          jitsiApi.dispose();
        } catch (e) {
          console.log('⚠️ JITSI: Error disposing API:', e);
        }
      }
    };
  }, [roomName, displayName, email, userRole, doctorName, patientName, appointmentId, handleConnectionSuccess]);

  const retryConnection = () => {
    window.location.reload();
  };

  const getConnectionMessage = () => {
    switch (connectionStatus) {
      case 'loading-script':
        return 'Loading video call system...';
      case 'initializing':
        return 'Setting up video call...';
      case 'connecting-to-room':
        return 'Joining the consultation room...';
      case 'connected':
        return 'Connected successfully!';
      default:
        return 'Connecting to video call...';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center p-6">
          <div className="text-red-500 text-4xl mb-4">
            ⚠️
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Video Call Error</h3>
          <p className="text-red-600 mb-4 max-w-md">{error}</p>
          <div className="space-x-3">
            <button 
              onClick={retryConnection} 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              🔄 Retry Connection
            </button>
            <button 
              onClick={() => window.history.back()} 
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 border border-gray-200 rounded-lg z-10">
          <div className="text-center p-6">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                🎥
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {getConnectionMessage()}
            </h3>
            <p className="text-sm text-gray-600 mb-4">Room: {roomName}</p>
            
            {/* Progress indicator */}
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: connectionStatus === 'loading-script' ? '25%' :
                         connectionStatus === 'initializing' ? '50%' :
                         connectionStatus === 'connecting-to-room' ? '75%' :
                         connectionStatus === 'connected' ? '100%' : '10%'
                }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              ✅ Community server connected - joining room...
            </p>
            
            {/* Show estimated time */}
            <p className="text-xs text-green-600 mt-2">
              🚀 Usually takes 5-10 seconds
            </p>
          </div>
        </div>
      )}
      
      <div 
  ref={jitsiContainerRef} 
  className="w-full rounded-lg overflow-hidden border border-gray-200 bg-black"
  style={{ 
    height: '100vh',
    width: '100%'
  }}
/>
    </div>
  );
};

export default JitsiMeetComponent;