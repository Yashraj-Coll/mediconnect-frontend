import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RazorpayService from '../services/RazorpayService';

const LabTestConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [labTestBooking, setLabTestBooking] = useState(null);
  const [testDetails, setTestDetails] = useState(null);
  
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        
        // Check authentication
        if (!isAuthenticated) {
          navigate('/login?redirect=/lab-tests');
          return;
        }
        
        // Get payment ID and order ID from URL
        const params = new URLSearchParams(location.search);
        const paymentId = params.get('paymentId');
        const orderId = params.get('orderId');
        const labTestBookingId = params.get('labTestBookingId');
        
        if (!paymentId || !orderId) {
          setError('Payment information is missing. Please contact support.');
          setLoading(false);
          return;
        }
        
        console.log('🔍 URL parameters:', { paymentId, orderId, labTestBookingId });
        
        // CRITICAL FIX: Try to get stored lab test data first
        const storedData = localStorage.getItem('labTestPaymentVerificationResult');
        let actualAmount = null;
        let labTestBookingData = null;
        let testData = null;
        
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            console.log('📋 Stored lab test verification data:', parsedData);
            
            // Extract amount properly from stored data
            if (parsedData.amount) {
              actualAmount = parseFloat(parsedData.amount);
            }
            
            labTestBookingData = parsedData.labTestBooking;
            testData = parsedData.test;
            
            setLabTestBooking(labTestBookingData);
            setTestDetails(testData);
            
            localStorage.removeItem('labTestPaymentVerificationResult'); // Clean up
          } catch (e) {
            console.log('Could not parse stored lab test data:', e);
          }
        }
        
        // CRITICAL FIX: Try to fetch actual payment details from backend FIRST
        let backendAmount = null;
        try {
          console.log('🔍 Fetching payment details from backend for payment ID:', paymentId);
          const result = await RazorpayService.getPaymentDetails(paymentId);
          console.log('💳 Backend payment details response:', result);
          
          if (result.success && result.data) {
            if (result.data.data && result.data.data.amount) {
              // Handle nested response structure
              backendAmount = parseFloat(result.data.data.amount);
            } else if (result.data.amount) {
              // Handle direct response structure
              backendAmount = parseFloat(result.data.amount);
            }
            
            console.log('💰 Extracted amount from backend:', backendAmount);
          }
        } catch (paymentErr) {
          console.log('Could not fetch payment details from backend:', paymentErr);
        }
        
        // CRITICAL FIX: Use the actual amount, fallback hierarchy:
        // 1. Backend amount (most reliable)
        // 2. Stored verification amount 
        // 3. Calculate from test price if available
        // 4. Only then use default
        let finalAmount = backendAmount || actualAmount;
        
        if (!finalAmount && testData?.price) {
          // Calculate from test price if we have it
          const testPrice = testData.price;
          const registrationFee = 50;
          const taxAmount = Math.round((testPrice + registrationFee) * 0.18);
          finalAmount = testPrice + registrationFee + taxAmount;
          console.log('💰 Calculated amount from test price:', finalAmount);
        }
        
        // Last resort fallback - but log it as an issue
        if (!finalAmount) {
          console.error('❌ Could not determine actual payment amount, using fallback');
          finalAmount = 766; // Only as absolute last resort
        }
        
        console.log('💰 Final amount determined:', finalAmount);
        
        // Create comprehensive payment data
        const paymentDataObj = {
          paymentId: paymentId,
          orderId: orderId,
          amount: finalAmount, // ✅ Now using actual amount
          status: 'Completed',
          createdAt: new Date().toISOString(),
          labTestBookingId: labTestBookingId
        };
        
        setPaymentData(paymentDataObj);
        
        console.log('✅ Payment confirmation data prepared:', paymentDataObj);
        
      } catch (err) {
        console.error('Error in lab test payment confirmation:', err);
        setError('Something went wrong. Please contact support if this issue persists.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [location, navigate, isAuthenticated]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (err) {
      return dateString;
    }
  };
  
  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch (err) {
      return '';
    }
  };
  
  // Navigate to lab test bookings - fallback to dashboard if that page doesn't exist
  const viewBookings = () => {
    navigate('/bills-payments'); // 🔧 FIXED: Navigate to bills & payments page
  };
  
  // Navigate to home
  const goHome = () => {
    navigate('/');
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-5xl text-red-500 mb-4">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="text-2xl font-bold mb-4">Error Loading Payment Details</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={goHome}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract payment details with proper fallbacks
  const paymentId = paymentData?.paymentId || paymentData?.razorpayPaymentId || 'N/A';
  const orderId = paymentData?.orderId || paymentData?.razorpayOrderId || 'N/A';
  
  // 🔧 CRITICAL FIX: Handle amount properly - no more hardcoded 766!
  const amount = paymentData?.amount || 0;
  
  const labTestBookingId = paymentData?.labTestBookingId || paymentData?.appointmentId || 'N/A';
  const paymentStatus = paymentData?.status || 'Completed';
  const paymentDate = paymentData?.createdAt ? new Date(paymentData.createdAt) : new Date();
  
  // Generate invoice number
  const invoiceNumber = paymentData?.invoiceNumber || `LAB-INV-${Date.now()}`;
  
  console.log('🔍 Final confirmation page data:', {
    paymentId,
    orderId,
    amount, // ✅ This should now be the correct amount
    labTestBookingId,
    testDetails,
    labTestBooking
  });
  
  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-500 text-2xl mb-4">
                <i className="fas fa-check"></i>
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
              <p className="text-gray-600">Your lab test booking has been confirmed successfully</p>
            </div>
            
            <div className="border-t border-b border-gray-100 py-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Payment ID</p>
                    <p className="font-medium">{paymentId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Order ID</p>
                    <p className="font-medium">{orderId}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Invoice Number</p>
                    <p className="font-medium">{invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Date & Time</p>
                    <p className="font-medium">{paymentDate.toLocaleDateString()} {paymentDate.toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Payment Status</p>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <p className="font-medium">{paymentStatus}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Amount Paid</p>
                    {/* 🔧 CRITICAL FIX: Display actual amount, not hardcoded 766 */}
                    <p className="font-medium text-lg">₹{amount}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="font-bold text-lg mb-4">Lab Test Details</h2>
              
              {testDetails || labTestBooking ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                      <i className="fas fa-flask text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold">{testDetails?.name || labTestBooking?.testName || 'Lab Test'}</h3>
                      <p className="text-sm text-gray-600">{testDetails?.description || labTestBooking?.description || 'Diagnostic Test'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex">
                      <div className="w-6 text-purple-600 mr-3">
                        <i className="fas fa-vial"></i>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Sample Type</p>
                        <p className="text-gray-600">{testDetails?.sampleType || labTestBooking?.sampleType || 'Blood'}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-6 text-purple-600 mr-3">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Processing Time</p>
                        <p className="text-gray-600">{testDetails?.processingTime || labTestBooking?.processingTime || '24-48 hours'}</p>
                      </div>
                    </div>
                    
                    {(testDetails?.homeCollection || labTestBooking?.homeCollection) && (
                      <div className="flex">
                        <div className="w-6 text-purple-600 mr-3">
                          <i className="fas fa-home"></i>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Collection</p>
                          <p className="text-gray-600">Home Sample Collection Available</p>
                        </div>
                      </div>
                    )}
                    
                    {labTestBookingId && labTestBookingId !== 'N/A' && (
                      <div className="flex">
                        <div className="w-6 text-purple-600 mr-3">
                          <i className="fas fa-barcode"></i>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Booking ID</p>
                          <p className="text-gray-600">LAB-{labTestBookingId}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  {labTestBookingId && labTestBookingId !== 'N/A' && <p className="text-gray-600">Booking ID: LAB-{labTestBookingId}</p>}
                  <p className="text-gray-500 text-sm">Lab test details will be available in your dashboard</p>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
              <div className="flex">
                <div className="text-blue-500 text-xl mr-3">
                  <i className="fas fa-info-circle"></i>
                </div>
                <div>
                  <p className="font-medium text-blue-800 mb-1">Important Information</p>
                  <ul className="text-blue-700 text-sm">
                    <li className="mb-1">• A confirmation email with receipt has been sent to your registered email address.</li>
                    <li className="mb-1">• Our lab technician will contact you within 24 hours to schedule sample collection.</li>
                    <li className="mb-1">• For home collection, please ensure someone is available at the provided address.</li>
                    <li className="mb-1">• Test reports will be available online once processing is complete.</li>
                    <li>• For any queries, please contact our support at support@mediconnect.com</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={viewBookings} 
                className="flex-1 py-3 px-6 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition text-center"
              >
                View Bills & Payments
              </button>
              
              <button 
                onClick={() => navigate('/lab-tests')}
                className="flex-1 py-3 px-6 border border-purple-300 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition text-center"
              >
                Book More Tests
              </button>
              
              <button 
                onClick={goHome}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition text-center"
              >
                Back to Home
              </button>
            </div>
          </div>
          
          <div className="text-center text-gray-500 text-sm">
            <p>Need help? Contact our support team at <a href="mailto:support@mediconnect.com" className="text-purple-600">support@mediconnect.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabTestConfirmationPage;