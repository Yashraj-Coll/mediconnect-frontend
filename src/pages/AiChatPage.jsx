import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { Globe, Mic, MicOff, Paperclip, Send, Volume2, Languages, User, Bot } from 'lucide-react';

import HttpClient from '../services/HttpClient';

// Enhanced mock responses with multi-language support
const mockResponses = {
  en: {
    greeting: "Namaste! I'm your AI Health Assistant. I can help you with health information in English, Hindi, Hinglish, and Bengali. How can I assist you today?",
    disclaimer: "⚠️ This is for informational purposes only. Always consult a healthcare professional for medical advice."
  },
  hi: {
    greeting: "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूँ। मैं आपकी स्वास्थ्य संबंधी जानकारी में मदद कर सकता हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
    disclaimer: "⚠️ यह केवल जानकारी के लिए है। चिकित्सा सलाह के लिए हमेशा डॉक्टर से सलाह लें।"
  },
  hinglish: {
    greeting: "Namaste! Main aapka AI Health Assistant hun. Main aapki health ke baare mein Hindi, English, aur Hinglish mein help kar sakta hun. Aaj main aapki kaise madad kar sakta hun?",
    disclaimer: "⚠️ Ye sirf information ke liye hai. Medical advice ke liye hamesha doctor se consult kariye."
  },
  bn: {
    greeting: "নমস্কার! আমি আপনার AI স্বাস্থ্য সহায়ক। আমি বাংলা, ইংরেজি এবং হিন্দিতে আপনার স্বাস্থ্য সম্পর্কিত তথ্যে সাহায্য করতে পারি। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    disclaimer: "⚠️ এটি শুধুমাত্র তথ্যের জন্য। চিকিৎসার পরামর্শের জন্য সর্বদা ডাক্তারের সাথে পরামর্শ করুন।"
  }
};

// Language options
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'hinglish', name: 'Hinglish', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' }
];

// Enhanced suggested questions in multiple languages
const suggestedQuestions = {
  en: [
    "How can I reduce my diabetes risk?",
    "What are the symptoms of high blood pressure?",
    "Best diet for weight loss?",
    "How to improve sleep quality?",
    "What exercises are good for back pain?"
  ],
  hi: [
    "मधुमेह का खतरा कैसे कम करें?",
    "उच्च रक्तचाप के लक्षण क्या हैं?",
    "वजन घटाने के लिए सबसे अच्छा आहार?",
    "नींद की गुणवत्ता कैसे सुधारें?",
    "कमर दर्द के लिए कौन सी एक्सरसाइज अच्छी है?"
  ],
  hinglish: [
    "Diabetes ka risk kaise kam karu?",
    "High BP ke symptoms kya hain?",
    "Weight loss ke liye best diet kya hai?",
    "Sleep quality kaise improve karu?",
    "Back pain ke liye kaun si exercise achhi hai?"
  ],
  bn: [
    "ডায়াবেটিসের ঝুঁকি কিভাবে কমাবো?",
    "উচ্চ রক্তচাপের লক্ষণ কি?",
    "ওজন কমানোর জন্য সেরা খাবার?",
    "ঘুমের মান কিভাবে উন্নত করব?",
    "কোমর ব্যথার জন্য কোন ব্যায়াম ভাল?"
  ]
};

const AiChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
const audioChunksRef = useRef([]);
const [isRecording, setIsRecording] = useState(false);
const [error, setError] = useState('');

  

  // Initialize chat and fetch user profile
  useEffect(() => {
    fetchUserProfile();
    initializeChat();
    
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUserProfile = async () => {
  try {
    const response = await HttpClient.get('/api/ai/profile');
    console.log('Profile response:', response);
    
    if (response.data && response.data.success) {
      setUserProfile(response.data.data);
    } else if (response.data) {
      setUserProfile(response.data);
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
  }
};
  const initializeChat = () => {
    setTimeout(() => {
      setMessages([
        { 
          id: 1, 
          text: mockResponses[currentLanguage].disclaimer, 
          sender: 'system', 
          timestamp: new Date(),
          language: currentLanguage 
        },
        { 
          id: 2, 
          text: mockResponses[currentLanguage].greeting, 
          sender: 'ai', 
          timestamp: new Date(),
          language: currentLanguage 
        }
      ]);
    }, 500);
  };

  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      
      // Set language based on current selection
      const langMap = { 'en': 'en-US', 'hi': 'hi-IN', 'hinglish': 'hi-IN', 'bn': 'bn-BD' };
      recognition.current.lang = langMap[currentLanguage] || 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const handleSendMessage = async (messageText = null) => {
  const textToSend = messageText || inputMessage;
  if (!textToSend.trim()) return;
  
  const userMessage = {
    id: Date.now(),
    text: textToSend,
    sender: 'user',
    timestamp: new Date(),
    language: currentLanguage
  };
  
  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsTyping(true);
  
  try {
    const response = await HttpClient.post('/api/ai/chat', {
      message: textToSend,
      language: currentLanguage,
      context: 'health_consultation'
    });

    let aiResponseText = '';
    if (response.data && response.data.success) {
      aiResponseText = response.data.data.response;
    } else if (response.data && response.data.response) {
      aiResponseText = response.data.response;
    } else {
      aiResponseText = 'Received response but could not parse it.';
    }

    const aiMessage = {
      id: Date.now() + 1,
      text: aiResponseText,
      sender: 'ai',
      timestamp: new Date(),
      language: currentLanguage
    };
    setMessages(prev => [...prev, aiMessage]);
    
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = {
      id: Date.now() + 1,
      text: getErrorMessage(currentLanguage),
      sender: 'ai',
      timestamp: new Date(),
      language: currentLanguage,
      isError: true
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};

  const getErrorMessage = (lang) => {
    const errors = {
      en: "I'm experiencing technical difficulties. Please try again or consult a healthcare professional.",
      hi: "मुझे तकनीकी समस्या हो रही है। कृपया फिर से कोशिश करें या डॉक्टर से सलाह लें।",
      hinglish: "Mujhe technical problem ho rahi hai. Please try again ya doctor se consult kariye.",
      bn: "আমার প্রযুক্তিগত সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন বা ডাক্তারের সাথে পরামর্শ করুন।"
    };
    return errors[lang] || errors.en;
  };

  // In your React component (AiChatPage.jsx)
const handleVoiceInput = async () => {
  if (isRecording) {
    // Stop recording
    console.log('🛑 Stopping recording...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks to release microphone
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => {
          track.stop();
          console.log('🔇 Stopped track:', track.kind);
        });
      }
    }
    
    setIsRecording(false);
    setIsListening(false);
    return;
  }

  try {
    console.log('🎤 Requesting microphone access...');
    
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      } 
    });
    
    console.log('✅ Microphone access granted');

   
// CRITICAL FIX: Force OGG format which your server accepts
let mimeType = 'audio/ogg;codecs=opus';

// Only use OGG formats that your server supports
if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
  mimeType = 'audio/ogg;codecs=opus';
} else if (MediaRecorder.isTypeSupported('audio/ogg')) {
  mimeType = 'audio/ogg';
} else {
  console.warn('⚠️ OGG format not supported, will try default');
  mimeType = undefined; // Let browser choose, but this might not work with your server
}

console.log('🎵 Using mime type:', mimeType);

// CREATE the MediaRecorder FIRST
mediaRecorderRef.current = new MediaRecorder(stream, 
  mimeType ? { mimeType } : undefined
);

console.log('🎵 MediaRecorder created with actual mime type:', mediaRecorderRef.current.mimeType);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      console.log('📦 Data chunk received:', {
        size: event.data.size,
        type: event.data.type
      });
      
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      } else {
        console.warn('⚠️ Received empty data chunk!');
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      console.log('🛑 Recording stopped');
      console.log('📊 Total chunks collected:', audioChunksRef.current.length);
      
      if (audioChunksRef.current.length === 0) {
        console.error('❌ No audio chunks collected!');
        setError('No audio data recorded. Please try again.');
        return;
      }

      // Use the recorder's actual mime type for the blob
      const actualMimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
      
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: actualMimeType
      });
      
      console.log('📁 Final audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type,
        chunks: audioChunksRef.current.length
      });

      if (audioBlob.size === 0) {
        console.error('❌ Audio blob is empty!');
        setError('Recording failed - no audio captured. Please try again.');
        return;
      }

      // Minimum size check (should be at least a few KB for any real audio)
      if (audioBlob.size < 1000) {
        console.warn('⚠️ Audio file seems very small:', audioBlob.size, 'bytes');
      }

      try {
        const formData = new FormData();
        
        // Create filename with proper extension based on mime type
       
// Always use OGG filename since that's what server expects
// Match filename to actual audio format
let filename = 'recording.ogg';  // Default
if (actualMimeType.includes('webm')) {
  filename = 'recording.webm';
} else if (actualMimeType.includes('ogg')) {
  filename = 'recording.ogg';
} else if (actualMimeType.includes('mp4')) {
  filename = 'recording.mp4';
} else if (actualMimeType.includes('wav')) {
  filename = 'recording.wav';
} else {
  // Fallback - browser usually defaults to webm
  filename = 'recording.webm';
}
        formData.append('audio', audioBlob, filename);
        
        console.log('🚀 Sending audio to server...', {
          size: audioBlob.size,
          type: actualMimeType,
          filename: filename
        });
        
        setIsTyping(true);
        
        const response = await HttpClient.post('/api/ai/speech-to-text', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('✅ Speech-to-text response:', response.data);

// Try multiple possible locations for the transcribed text
let transcribedText = '';
if (response.data && response.data.success && response.data.data) {
  // Check if text is in response.data.data.text
  transcribedText = response.data.data.text || response.data.data.transcription || response.data.data.transcript;
} else if (response.data && response.data.text) {
  // Check if text is directly in response.data.text
  transcribedText = response.data.text;
}

if (transcribedText && transcribedText.trim()) {
  console.log('📝 Transcribed text:', transcribedText);
  setInputMessage(transcribedText);
} else {
  console.warn('⚠️ No text in response structure:', response.data);
  console.warn('⚠️ Available data keys:', Object.keys(response.data.data || {}));
  setError('No text was detected in the audio');
}
      } catch (error) {
        console.error('❌ Speech-to-text error:', error);
        console.error('Error response:', error.response?.data);
        setError(`Voice input failed: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsTyping(false);
        setIsRecording(false);
        setIsListening(false);
        
        // Clean up
        audioChunksRef.current = [];
      }
    };

    mediaRecorderRef.current.onerror = (event) => {
      console.error('❌ MediaRecorder error:', event);
      setError('Recording error occurred');
      setIsRecording(false);
      setIsListening(false);
    };

    // CRITICAL: Start with timeslice to ensure data events
    mediaRecorderRef.current.start(100); // Request data every 100ms for better responsiveness
    setIsRecording(true);
    setIsListening(true);
    setError('');
    console.log('🎤 Started recording with timeslice...');
    
  } catch (error) {
    console.error('❌ Failed to start recording:', error);
    if (error.name === 'NotAllowedError') {
      setError('Microphone access denied. Please allow microphone access and try again.');
    } else if (error.name === 'NotFoundError') {
      setError('No microphone found. Please check your microphone connection.');
    } else {
      setError(`Failed to access microphone: ${error.message}`);
    }
    setIsRecording(false);
    setIsListening(false);
  }
};
  const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setIsTyping(true);
  try {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = file.type.startsWith('image/') ? '/api/ai/analyze-image' : '/api/ai/analyze-document';
    
    const response = await HttpClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    const fileMessage = {
      id: Date.now(),
      text: `📎 Uploaded: ${file.name}`,
      sender: 'user',
      timestamp: new Date(),
      language: currentLanguage,
      isFile: true
    };
    
    setMessages(prev => [...prev, fileMessage]);

    let analysisText = '';
    if (response.data && response.data.success) {
      analysisText = response.data.data.analysis || response.data.data.summary || 'File processed successfully';
    } else if (response.data) {
      analysisText = response.data.analysis || response.data.summary || 'File processed successfully';
    }

    const aiMessage = {
      id: Date.now() + 1,
      text: analysisText,
      sender: 'ai',
      timestamp: new Date(),
      language: currentLanguage
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
  } catch (error) {
    console.error('File upload error:', error);
    const errorMessage = {
      id: Date.now() + 1,
      text: getErrorMessage(currentLanguage),
      sender: 'ai',
      timestamp: new Date(),
      language: currentLanguage,
      isError: true
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
    setShowFileUpload(false);
    event.target.value = '';
  }
};


  const translateMessage = async (message, targetLang) => {
  if (message.language === targetLang) return message.text;
  
  setIsTranslating(true);
  try {
    const response = await HttpClient.post('/api/ai/translate', {
      text: message.text,
      sourceLanguage: message.language,
      targetLanguage: targetLang
    });

    if (response.data && response.data.success) {
      return response.data.data.translatedText || response.data.data.translation;
    } else if (response.data) {
      return response.data.translatedText || response.data.translation;
    }
  } catch (error) {
    console.error('Translation failed:', error);
  } finally {
    setIsTranslating(false);
  }
  
  return message.text;
};
  const changeLanguage = (newLang) => {
    setCurrentLanguage(newLang);
    setShowLanguageMenu(false);
    
    // Update speech recognition language
    if (recognition.current) {
      const langMap = { 'en': 'en-US', 'hi': 'hi-IN', 'hinglish': 'hi-IN', 'bn': 'bn-BD' };
      recognition.current.lang = langMap[newLang] || 'en-US';
    }
    
    // Re-initialize chat with new language
    setTimeout(() => {
      initializeChat();
    }, 100);
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice based on language
      const voices = speechSynthesis.getVoices();
      const langMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'hinglish': 'en-IN',
        'bn': 'bn-BD'
      };
      
      const preferredLang = langMap[currentLanguage] || 'en-US';
      const voice = voices.find(v => v.lang.startsWith(preferredLang.split('-')[0]));
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentLanguageData = () => {
    return {
      name: languages.find(l => l.code === currentLanguage)?.name || 'English',
      flag: languages.find(l => l.code === currentLanguage)?.flag || '🇺🇸'
    };
  };

  return (
    <div className="pt-28 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">🤖 AI Health Assistant</h1>
                <p className="text-gray-600">
                  Multi-language health guidance • {getCurrentLanguageData().flag} {getCurrentLanguageData().name}
                </p>
              </div>
              
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
                >
                  <Languages className="w-4 h-4" />
                  <span>{getCurrentLanguageData().flag}</span>
                  <span className="hidden sm:inline">{getCurrentLanguageData().name}</span>
                </button>
                
                {showLanguageMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border min-w-[160px] z-10">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 ${
                          currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          {userProfile && (
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {userProfile.firstName?.charAt(0)}{userProfile.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{userProfile.firstName} {userProfile.lastName}</h3>
                  <p className="text-sm text-gray-600">
                    {userProfile.age && `Age: ${userProfile.age}`} 
                    {userProfile.gender && ` • ${userProfile.gender}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Container */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">MediConnect AI Assistant</h3>
                    <p className="text-sm text-blue-100">
                      {isTranslating ? 'Translating...' : `Speaking ${getCurrentLanguageData().name}`}
                    </p>
                  </div>
                </div>
                <div className="text-2xl">{getCurrentLanguageData().flag}</div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  } ${message.sender === 'system' ? 'justify-center' : ''}`}
                >
                  {message.sender === 'system' ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded-lg p-3 max-w-lg">
                      {message.text}
                    </div>
                  ) : message.sender === 'ai' ? (
                    <div className="flex items-start max-w-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-1">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className={`rounded-lg p-3 rounded-tl-none ${
                          message.isError ? 'bg-red-100 text-red-800' : 'bg-blue-600 text-white'
                        }`}>
                          {message.text}
                        </div>
                        <div className="flex items-center space-x-2 mt-1 ml-2">
                          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                          <button
                            onClick={() => speakMessage(message.text)}
                            className="text-gray-400 hover:text-blue-600 transition"
                            title="Read aloud"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start flex-row-reverse max-w-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center ml-2 mt-1">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className={`rounded-lg p-3 rounded-tr-none ${
                          message.isFile ? 'bg-green-100 text-green-800' : 'bg-white border border-gray-200 text-gray-700'
                        }`}>
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

              {/* AI Typing Indicator */}
              {isTyping && (
                <div className="mb-4 flex justify-start">
                  <div className="flex items-start max-w-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-1">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-blue-600 text-white rounded-lg p-3 rounded-tl-none">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce delay-75"></div>
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            <div className="p-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">
                {currentLanguage === 'en' && 'Try asking...'}
                {currentLanguage === 'hi' && 'पूछने की कोशिश करें...'}
                {currentLanguage === 'hinglish' && 'Ye questions try kariye...'}
                {currentLanguage === 'bn' && 'এই প্রশ্নগুলি করে দেখুন...'}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions[currentLanguage]?.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    className="text-sm bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-full px-3 py-1 transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                {/* File Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-blue-600 transition"
                  title="Upload document or image"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                {/* Voice Input */}
                <button
                  onClick={handleVoiceInput}
                  className={`p-2 transition ${
                  isRecording ? 'text-red-600 animate-pulse' : 'text-gray-500 hover:text-blue-600'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Voice input'}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Message Input */}
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex-1 flex">
                  <input
                    type="text"
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      currentLanguage === 'en' ? 'Type your health question...' :
                      currentLanguage === 'hi' ? 'अपना स्वास्थ्य प्रश्न लिखें...' :
                      currentLanguage === 'hinglish' ? 'Apna health question type kariye...' :
                      currentLanguage === 'bn' ? 'আপনার স্বাস্থ্য প্রশ্ন লিখুন...' :
                      'Type your health question...'
                    }
                    className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-r-lg hover:shadow-lg transition disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mt-2 text-sm">
                {error}
              </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                {currentLanguage === 'en' && 'For medical emergencies, call emergency services immediately.'}
                {currentLanguage === 'hi' && 'चिकित्सा आपातकाल के लिए तुरंत आपातकालीन सेवाओं को कॉल करें।'}
                {currentLanguage === 'hinglish' && 'Medical emergency ke liye turant emergency services ko call kariye.'}
                {currentLanguage === 'bn' && 'চিকিৎসা জরুরি অবস্থার জন্য অবিলম্বে জরুরি সেবায় কল করুন।'}
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Book Consultation Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {currentLanguage === 'en' && 'Need Expert Opinion?'}
                  {currentLanguage === 'hi' && 'विशेषज्ञ की राय चाहिए?'}
                  {currentLanguage === 'hinglish' && 'Expert opinion chahiye?'}
                  {currentLanguage === 'bn' && 'বিশেষজ্ঞের মতামত প্রয়োজন?'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {currentLanguage === 'en' && 'Connect with specialist doctors for detailed diagnosis and treatment plans.'}
                  {currentLanguage === 'hi' && 'विस्तृत निदान और उपचार योजना के लिए विशेषज्ञ डॉक्टरों से जुड़ें।'}
                  {currentLanguage === 'hinglish' && 'Detailed diagnosis aur treatment plan ke liye specialist doctors se connect kariye.'}
                  {currentLanguage === 'bn' && 'বিস্তারিত নির্ণয় এবং চিকিৎসা পরিকল্পনার জন্য বিশেষজ্ঞ ডাক্তারদের সাথে যোগাযোগ করুন।'}
                </p>
                <Link
                  to="/doctors"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition block text-center"
                >
                  {currentLanguage === 'en' && 'Book Video Consultation'}
                  {currentLanguage === 'hi' && 'वीडियो परामर्श बुक करें'}
                  {currentLanguage === 'hinglish' && 'Video Consultation Book Kariye'}
                  {currentLanguage === 'bn' && 'ভিডিও পরামর্শ বুক করুন'}
                </Link>
              </div>
            </div>

            {/* Health Assessment Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {currentLanguage === 'en' && 'AI Health Assessment'}
                  {currentLanguage === 'hi' && 'AI स्वास्थ्य मूल्यांकन'}
                  {currentLanguage === 'hinglish' && 'AI Health Assessment'}
                  {currentLanguage === 'bn' && 'AI স্বাস্থ্য মূল্যায়ন'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {currentLanguage === 'en' && 'Take our comprehensive AI-powered health risk assessment in your preferred language.'}
                  {currentLanguage === 'hi' && 'अपनी पसंदीदा भाषा में हमारा व्यापक AI-संचालित स्वास्थ्य जोखिम मूल्यांकन लें।'}
                  {currentLanguage === 'hinglish' && 'Apni pasandida language mein comprehensive AI health risk assessment lijiye.'}
                  {currentLanguage === 'bn' && 'আপনার পছন্দের ভাষায় আমাদের ব্যাপক AI-চালিত স্বাস্থ্য ঝুঁকি মূল্যায়ন নিন।'}
                </p>
                <button className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition block w-full">
                  {currentLanguage === 'en' && 'Start Assessment'}
                  {currentLanguage === 'hi' && 'मूल्यांकन शुरू करें'}
                  {currentLanguage === 'hinglish' && 'Assessment Start Kariye'}
                  {currentLanguage === 'bn' && 'মূল্যায়ন শুরু করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
        className="hidden"
      />
    </div>
  );
};

export default AiChatPage;