import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Mock AI responses
const mockAiResponses = {
  greeting: "Namaste! I'm here to assist you with health information, personalised to your medical history. Your well-being is my top priority!",
  symptomResponse: "Based on your symptoms and health history, this could be due to several causes. Let me ask you a few more questions to narrow it down.",
  followUp: "Thank you for that information. Your symptoms suggest a possible migraine or tension headache. I recommend a video consultation with a neurologist for proper diagnosis.",
  disclaimer: "This interaction is for informational purposes only. Always consult a doctor before taking any action."
};

// Suggested questions
const suggestedQuestions = [
  "How can I reduce my risk of developing Diabetes?",
  "What is the best diet for weight loss?",
  "Should I be taking any vitamins or supplements?",
  "How can I improve my sleep quality?",
  "What exercises are best for lower back pain?"
];

const AiChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize chat with greeting
  useEffect(() => {
    setTimeout(() => {
      setMessages([
        { id: 1, text: mockAiResponses.disclaimer, sender: 'system', timestamp: new Date() },
        { id: 2, text: mockAiResponses.greeting, sender: 'ai', timestamp: new Date() }
      ]);
    }, 500);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Focus on input field after sending message
    inputRef.current?.focus();
    
    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: generateAiResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question) => {
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: question,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: generateAiResponse(question),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple response generator
  const generateAiResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('headache') || message.includes('pain') || message.includes('migraine')) {
      return mockAiResponses.symptomResponse;
    } else if (message.includes('one side') || message.includes('light') || message.includes('worse')) {
      return mockAiResponses.followUp;
    } else if (message.includes('diabetes')) {
      return "To reduce your risk of developing diabetes, focus on maintaining a healthy weight, eating a balanced diet rich in fiber and low in simple sugars, exercising regularly (aim for at least 150 minutes per week), limiting alcohol consumption, and avoiding smoking. Regular check-ups to monitor your blood glucose levels are also important, especially if you have a family history of diabetes.";
    } else if (message.includes('weight loss') || message.includes('diet')) {
      return "The best diet for weight loss is one that you can sustain long-term. Focus on whole foods like vegetables, fruits, lean proteins, and whole grains. Limit processed foods, sugary drinks, and excessive calories. Combined with regular physical activity, a calorie deficit of about 500-750 calories per day can lead to a healthy weight loss of 0.5-1 kg per week. Consider consulting with a nutritionist for a personalized plan.";
    } else if (message.includes('vitamin') || message.includes('supplement')) {
      return "Whether you should take vitamins or supplements depends on your individual health needs, diet, and lifestyle. Most people can get necessary nutrients from a balanced diet. However, certain groups may benefit from specific supplements: vitamin D for those with limited sun exposure, vitamin B12 for vegans, iron for some women with heavy menstrual periods, and folic acid for pregnant women. Always consult with a healthcare provider before starting any supplement regimen.";
    } else if (message.includes('sleep')) {
      return "To improve sleep quality, establish a consistent sleep schedule, create a relaxing bedtime routine, make your bedroom comfortable (dark, quiet, cool), limit exposure to screens before bed, avoid caffeine and large meals before sleeping, and get regular exercise (but not too close to bedtime). If you continue to have sleep problems despite these measures, consider consulting a healthcare provider to rule out sleep disorders or other health issues.";
    } else if (message.includes('back pain') || message.includes('exercise')) {
      return "For lower back pain, beneficial exercises include gentle stretching, walking, swimming, and specific core-strengthening exercises like partial crunches, bridge exercises, and bird-dog. Low-impact activities are generally better. Always start slowly and avoid exercises that cause pain. Physical therapy can be very helpful for personalized guidance. For acute or severe pain, consult a healthcare professional before starting any exercise program.";
    } else {
      return "I understand your question about " + message.substring(0, 30) + "... To provide the most accurate information, I'd like to know a bit more about your specific situation. Could you provide additional details about your symptoms or concerns?";
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="pt-28 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">AI Health Assistant</h1>
            <p className="text-gray-600">Get preliminary health information and guidance from our AI assistant</p>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            {/* Chat Header */}
            <div className="bg-gradient-primary p-4 text-white">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-robot text-purple-600"></i>
                </div>
                <div>
                  <h3 className="font-bold">MediConnect AI Health Assistant</h3>
                  <p className="text-sm text-indigo-100">Powered by advanced medical AI</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${message.sender === 'system' ? 'justify-center' : ''}`}
                >
                  {message.sender === 'system' ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded-lg p-3 max-w-lg">
                      {message.text}
                    </div>
                  ) : message.sender === 'ai' ? (
                    <div className="flex items-start max-w-lg">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2 mt-1">
                        <i className="fas fa-robot text-indigo-600 text-sm"></i>
                      </div>
                      <div>
                        <div className="bg-indigo-600 text-white rounded-lg p-3 rounded-tl-none">
                          {message.text}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 ml-2">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start flex-row-reverse max-w-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center ml-2 mt-1">
                        <i className="fas fa-user text-gray-600 text-sm"></i>
                      </div>
                      <div>
                        <div className="bg-white border border-gray-200 text-gray-700 rounded-lg p-3 rounded-tr-none">
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
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2 mt-1">
                      <i className="fas fa-robot text-indigo-600 text-sm"></i>
                    </div>
                    <div className="bg-indigo-600 text-white rounded-lg p-3 rounded-tl-none">
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
              <p className="text-sm text-gray-600 mb-2">Try asking about...</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-sm bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-full px-3 py-1 transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center">
                <input
                  type="text"
                  ref={inputRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder="Type your symptoms or health question..."
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="submit"
                  className="bg-gradient-primary text-white p-3 rounded-r-lg"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                For medical emergencies, please call emergency services immediately.
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Book Consultation Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-video text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Need Expert Opinion?</h3>
                <p className="text-gray-600 mb-4">
                  Connect with a specialist doctor for a detailed diagnosis and treatment plan.
                </p>
                <Link
                  to="/doctors"
                  className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition block text-center"
                >
                  Book Video Consultation
                </Link>
              </div>
            </div>

            {/* Health Assessment Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-heartbeat text-green-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Comprehensive Health Assessment</h3>
                <p className="text-gray-600 mb-4">
                  Take our AI-powered health risk assessment to understand your health status.
                </p>
                <button
                  className="bg-gradient-secondary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition block w-full"
                >
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatPage;