import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import RazorpayService from '../services/RazorpayService';
import LabTestService from '../services/LabTestService';
import HttpClient from '../services/HttpClient'; 

// Lab Test Payment page for handling lab test payments
const LabTestPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { patientProfile } = usePatient();
  
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [labTestData, setLabTestData] = useState(null);
  const [test, setTest] = useState(null);
  const [createdLabTestBooking, setCreatedLabTestBooking] = useState(null);
  
  // Load data passed from lab tests page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/lab-tests');
      return;
    }
    
    if (location.state) {
      const { labTestData: testData, test: testInfo } = location.state;
      
      if (!testData) {
        setError('Lab test data is missing. Please go back and try again.');
        setLoading(false);
        return;
      }
      
      setLabTestData(testData);
      setTest(testInfo);
      setLoading(false);
    } else {
      setError('No lab test data found. Please start the booking process again.');
      setLoading(false);
    }
  }, [location, isAuthenticated, navigate]);
  
  // Create lab test booking in backend before initiating payment
  const createLabTestBooking = async () => {
    try {
      setLoading(true);
      
      // Calculate required financial fields using 'test' instead of 'selectedTest'
      const testPrice = test?.price || labTestData?.fees?.testPrice || 0;
      const registrationFee = 50.0; // Standard registration fee
      const subtotal = testPrice + registrationFee;
      const taxRate = 0.18; // 18% GST
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;
      
      const bookingData = {
        // Test Information
        testId: test?.id || labTestData?.testId,
        testName: test?.name || labTestData?.testName,
        testPrice: testPrice,
        sampleType: test?.sampleType || labTestData?.sampleType || 'Blood',
        processingTime: test?.processingTime || labTestData?.processingTime || '24 hours',
        
        // Patient Information
        patientId: patientProfile?.id,
        patientName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Patient',
        patientEmail: user?.email,
        patientPhone: user?.phoneNumber || patientProfile?.phoneNumber,
        
        // Collection Information (use defaults if not provided)
        homeCollection: labTestData?.collectionType === 'home' || false,
        collectionAddress: labTestData?.collectionType === 'home' ? labTestData?.address : null,
        preferredDate: labTestData?.selectedDate || null,
        preferredTime: labTestData?.selectedTime || null,
        
        // Financial Information - REQUIRED FIELDS
        registrationFee: registrationFee,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        
        // Additional Information
        specialInstructions: labTestData?.notes || null,
        status: 'PENDING'
      };

      console.log('Creating lab test booking with data:', bookingData);
      
      const booking = await LabTestService.createLabTestBooking(bookingData);
      
      // Store booking info for payment
      setCreatedLabTestBooking(booking);
      console.log('Lab test booking created successfully:', booking);
      
      return booking;
    } catch (error) {
      console.error('Error creating lab test booking:', error);
      
      // Show user-friendly error message
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).join(', ');
        setError(`Booking failed: ${errorMessages}`);
      } else {
        setError('Failed to create lab test booking. Please try again.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Process payment
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setError('');
      
      // Create lab test booking first
      let labTestBooking = createdLabTestBooking;
      
      if (!labTestBooking) {
        console.log('Creating new lab test booking...');
        const bookingResponse = await createLabTestBooking();
        labTestBooking = bookingResponse;
      }
      
      if (!labTestBooking) {
        throw new Error('Failed to create lab test booking');
      }
      
      // Handle different response structures
      let bookingId;
      console.log('🔍 Full booking response:', labTestBooking);
      
      if (labTestBooking.data && labTestBooking.data.data && labTestBooking.data.data.id) {
        // Structure: { data: { data: { id: ... } } }
        bookingId = labTestBooking.data.data.id;
        console.log('📋 Extracted booking ID from nested data:', bookingId);
      } else if (labTestBooking.data && labTestBooking.data.id) {
        // Structure: { data: { id: ... } }
        bookingId = labTestBooking.data.id;
        console.log('📋 Extracted booking ID from data:', bookingId);
      } else if (labTestBooking.id) {
        // Structure: { id: ... }
        bookingId = labTestBooking.id;
        console.log('📋 Extracted booking ID directly:', bookingId);
      } else {
        console.error('❌ Could not find booking ID in response:', labTestBooking);
        throw new Error('Could not extract booking ID from response');
      }
      
      if (!bookingId) {
        throw new Error('Booking ID is missing from response');
      }
      
      console.log('✅ Lab test booking ID:', bookingId);
      
      // Calculate total amount
      const testPrice = labTestData?.fees?.testPrice || test?.price || 0;
      const registrationFee = labTestData?.fees?.registrationFee || 50;
      const taxAmount = labTestData?.fees?.taxAmount || Math.round((testPrice + registrationFee) * 0.18);
      const totalAmount = labTestData?.fees?.totalAmount || testPrice + registrationFee + taxAmount;
      
      console.log('Payment details:', { testPrice, registrationFee, taxAmount, totalAmount });
      
      // Add validation before making payment request
      const paymentRequestData = {
        labTestBookingId: bookingId,
        amount: totalAmount,
        currency: 'INR',
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        email: user?.email || '',
        contact: patientProfile?.phoneNumber || user?.phoneNumber || ''
      };
      
      console.log('🎯 Payment request data:', paymentRequestData);
      
      // Validate required fields
      if (!paymentRequestData.labTestBookingId) {
        throw new Error('Lab test booking ID is required');
      }
      if (!paymentRequestData.amount || paymentRequestData.amount <= 0) {
        throw new Error('Valid amount is required');
      }
      if (!paymentRequestData.email) {
        throw new Error('Email is required');
      }
      
      // Create payment order
      const orderResponse = await HttpClient.post('/api/payments/razorpay/lab-test/order', paymentRequestData);
      
      // CRITICAL FIX: Extract the actual data from response
      const orderData = orderResponse.data;
      
      console.log('✅ Razorpay lab test order created:', orderData);
      
      // Validate that we have all required fields from backend
      if (!orderData.orderId || !orderData.keyId || !orderData.amount) {
        console.error('❌ Missing required fields in order response:', orderData);
        throw new Error('Invalid payment order response from server');
      }
      
      // Load Razorpay script
      const scriptLoaded = await RazorpayService.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment system. Please check your internet connection.');
      }
      
      // Configure Razorpay options with correct data extraction
      // Configure Razorpay options with correct data extraction
const options = {
  key: orderData.keyId,           
  amount: orderData.amount,       
  currency: orderData.currency,   
  name: 'MediConnect',
  description: `Lab Test: ${test?.name || 'Diagnostic Test'}`,
  order_id: orderData.orderId,    
  prefill: orderData.prefill,     
  notes: {
    labTestBookingId: bookingId,
    testId: test?.id,
    patientId: patientProfile?.id,
    bookingType: 'LAB_TEST'
  },
  theme: {
    color: '#7C3AED',
  },
  // ✅ FIXED: Handler function properly placed inside options
  handler: async function (response) {
    console.log('💳 Payment successful, verifying...', response);
    
    try {
      const verificationData = await HttpClient.post('/api/payments/razorpay/verify', {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature
      });

      console.log('✅ Lab test payment verification result:', verificationData);

      // 🔧 CRITICAL FIX: Handle the verification response properly
      let verifyResult = verificationData.data;
      
      // Handle different response structures from backend
      if (typeof verifyResult === 'string') {
        try {
          verifyResult = JSON.parse(verifyResult);
          console.log('📋 Parsed verification result:', verifyResult);
        } catch (parseError) {
          console.error('❌ JSON parsing failed:', parseError);
          throw new Error('Failed to parse payment verification response');
        }
      }

      if (verifyResult.success) {
        // 🔧 CRITICAL FIX: Store the ACTUAL amount from verification result
        // Priority: Backend amount > Calculated total amount
        const actualAmount = verifyResult.amount || totalAmount;
        
        console.log('💰 Storing amount for confirmation page:', actualAmount);
        
        // Store lab test data for confirmation page with CORRECT AMOUNT
        localStorage.setItem('labTestPaymentVerificationResult', JSON.stringify({
          labTestBooking: verifyResult.labTestBooking || labTestBooking,
          labTestBookingId: verifyResult.labTestBookingId || bookingId,
          test: test,
          originalLabTestData: labTestData,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          amount: actualAmount, // ✅ Store the actual amount here
          totalAmount: totalAmount, // Also store calculated amount as backup
          timestamp: new Date().toISOString()
        }));
        
        console.log('✅ Payment verification successful, navigating to confirmation...');
        
        // Navigate to confirmation page
        navigate(`/payment/lab-test-confirmation?paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}&labTestBookingId=${bookingId}`);
      } else {
        throw new Error(verifyResult.message || 'Payment verification failed. Please contact support.');
      }
    } catch (verifyError) {
      console.error('Payment verification error:', verifyError);
      setError(verifyError.message || 'Payment verification failed. Please contact support.');
      setPaymentLoading(false);
    }
  },
  modal: {
    ondismiss: function() {
      console.log('Payment cancelled by user');
      setPaymentLoading(false);
    }
  }
};
      
      console.log('🚀 Starting Razorpay payment with options:', options);
      
      // Additional validation before creating Razorpay instance
      if (!options.key) {
        throw new Error('Razorpay key is missing from server response');
      }
      if (!options.order_id) {
        throw new Error('Razorpay order ID is missing from server response');
      }
      if (!options.amount || options.amount <= 0) {
        throw new Error('Invalid payment amount from server response');
      }
      
      // Create and open Razorpay payment
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('💥 Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setPaymentLoading(false);
      });
      
      rzp.open();
      
    } catch (err) {
      console.error('💥 Lab test payment error:', err);
      
      // Enhanced error handling
      if (err.response) {
        console.error('❌ Error response:', err.response);
        console.error('❌ Error status:', err.response.status);
        console.error('❌ Error data:', err.response.data);
        
        if (err.response.data && err.response.data.message) {
          setError(`Payment failed: ${err.response.data.message}`);
        } else {
          setError(`Payment failed with status ${err.response.status}`);
        }
      } else {
        setError(err.message || 'Payment failed. Please try again.');
      }
      
      setPaymentLoading(false);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    navigate(-1);
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
  if (error && !labTestData) {
    return (
      <div className="pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-5xl text-red-500 mb-4">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="text-2xl font-bold mb-4">Error Loading Payment Page</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/lab-tests')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Browse Lab Tests
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate fee details
  const testPrice = labTestData?.fees?.testPrice || test?.price || 0;
  const registrationFee = labTestData?.fees?.registrationFee || 50;
  const taxAmount = labTestData?.fees?.taxAmount || Math.round((testPrice + registrationFee) * 0.18);
  const totalAmount = labTestData?.fees?.totalAmount || testPrice + registrationFee + taxAmount;
  
  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Lab Test Payment</h1>
          <p className="text-gray-600 mb-8">Complete your payment to confirm your lab test booking</p>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Order summary */}
            <div className="w-full md:w-7/12">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-bold mb-4">Lab Test Summary</h2>
                
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                      <i className="fas fa-flask text-white text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold">{test?.name}</h3>
                      <p className="text-sm text-gray-600">{test?.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <div className="w-6 text-purple-600 mr-3">
                      <i className="fas fa-vial"></i>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Sample Type</p>
                      <p className="text-gray-600">{test?.sampleType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 text-purple-600 mr-3">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Processing Time</p>
                      <p className="text-gray-600">{test?.processingTime}</p>
                    </div>
                  </div>
                  
                  {test?.homeCollection && (
                    <div className="flex items-start">
                      <div className="w-6 text-purple-600 mr-3">
                        <i className="fas fa-home"></i>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Collection</p>
                        <p className="text-gray-600">Home Sample Collection Available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold mb-4">Patient Information</h2>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 text-purple-600 mr-3">
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Name</p>
                      <p className="text-gray-600">
                        {patientProfile?.firstName && patientProfile?.lastName 
                          ? `${patientProfile.firstName} ${patientProfile.lastName}`
                          : patientProfile?.fullName || 
                            `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 
                            'Patient'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 text-purple-600 mr-3">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Phone</p>
                      <p className="text-gray-600">
                        {patientProfile?.phoneNumber || user?.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 text-purple-600 mr-3">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Email</p>
                      <p className="text-gray-600">
                        {patientProfile?.email || user?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment details */}
            <div className="w-full md:w-5/12">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6 sticky top-32">
                <h2 className="text-lg font-bold mb-4">Payment Details</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Price</span>
                    <span className="font-medium">₹{testPrice}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lab Registration Fee</span>
                    <span className="font-medium">₹{registrationFee}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">₹{taxAmount}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-bold text-purple-600">₹{totalAmount}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                    <div className="flex">
                      <i className="fas fa-shield-alt text-xl mr-3"></i>
                      <div>
                        <p className="font-medium">Secure Payment</p>
                        <p className="text-sm">Your payment information is securely processed by Razorpay</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button 
                    className={`w-full py-3 rounded-lg font-medium text-center transition
                      ${paymentLoading ? 'bg-purple-300 cursor-not-allowed' : 'bg-gradient-primary hover:shadow-lg'}
                      text-white`}
                    onClick={handlePayment}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <i className="fas fa-credit-card mr-2"></i>
                        Pay ₹{totalAmount}
                      </span>
                    )}
                  </button>
                  
                  <button 
                    className="w-full py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition text-center"
                    onClick={handleBack}
                    disabled={paymentLoading}
                  >
                    Go Back
                  </button>
                  
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                      <div className="flex">
                        <i className="fas fa-exclamation-circle text-xl mr-3"></i>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium mb-3">We Accept</h3>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 rounded p-1 w-12 h-8 flex items-center justify-center">
                      <img src="https://imgs.search.brave.com/hbc7AK08pFTEgMywrAGULusR8A8Wm0HPAMRce7CbMao/rs:fit:32:32:1:0/g:ce/aHR0cDovL2Zhdmlj/b25zLnNlYXJjaC5i/cmF2ZS5jb20vaWNv/bnMvOWY4NWY4NDlj/OWNjN2I1NTBlMTky/MzA1MzQzM2RmOTRh/YmMwMDZkOGMyNjRj/MWU2NjNlYThkNDY5/YTA0ZDQ2Zi93d3cu/dmlzYS5jby5pbi8" alt="Visa" className="h-5" />
                    </div>
                    <div className="bg-gray-100 rounded p-1 w-12 h-8 flex items-center justify-center">
                      <img src="https://imgs.search.brave.com/QZyXFVnYWv99xq3LPaW1BI_NYJUTkqnWDVTVfMwdvvU/rs:fit:32:32:1:0/g:ce/aHR0cDovL2Zhdmlj/b25zLnNlYXJjaC5i/cmF2ZS5jb20vaWNv/bnMvZDU0Yzc2NjE3/NjFjMWQzYmY4NDJl/YzI5ZTBmMGVmYzlh/NjBiNzMzZTRmMWYz/NzY1ZjRjMWZmMmM0/ZjA4ODUzNy93d3cu/bWFzdGVyY2FyZC5j/by5pbi8" alt="MasterCard" className="h-5" />
                    </div>
                    <div className="bg-gray-100 rounded p-1 w-12 h-8 flex items-center justify-center">
                      <img src="https://imgs.search.brave.com/IAZZhbw1lUP1NdOwWgzA8SvvorJO_cH8IQNeQejiUx0/rs:fit:32:32:1:0/g:ce/aHR0cDovL2Zhdmlj/b25zLnNlYXJjaC5i/cmF2ZS5jb20vaWNv/bnMvZjIwY2JkOWMx/NTIyYTQ5NTM2N2Fi/MjQ4NjEzOTg0Nzhi/ZGYwZTEzN2VhOTlk/YzY1OGE2NWYwYjY0/MzJjNGJjYS93d3cu/cnVwYXkuY28uaW4v" alt="RuPay" className="h-5" />
                    </div>
                    <div className="bg-gray-100 rounded p-1 w-12 h-8 flex items-center justify-center">
                      <img src="https://imgs.search.brave.com/gGNJ3ghDXVNPYJSdKKDi_Dv8Bpahq5KJ1p4IjEy9rPw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi82LzZmL1VQ/SV9sb2dvLnN2Zy8y/NTBweC1VUElfbG9n/by5zdmcucG5n" alt="UPI" className="h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabTestPaymentPage;