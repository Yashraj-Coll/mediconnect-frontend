import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import RazorpayService from '../services/RazorpayService';
import AppointmentService from '../services/AppointmentService';

// Payment page for handling appointment payments
const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { patientProfile } = usePatient();
  
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentData, setAppointmentData] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  
  // Load data passed from appointment booking page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/payment/new');
      return;
    }
    
    if (location.state) {
      const { appointmentData: apptData, doctor: docData, date: dateData, slot: slotData } = location.state;
      
      if (!apptData) {
        setError('Appointment data is missing. Please go back and try again.');
        setLoading(false);
        return;
      }
      
      setAppointmentData(apptData);
      setDoctor(docData);
      setDate(dateData ? new Date(dateData) : null);
      setSlot(slotData);
      setLoading(false);
    } else {
      setError('No appointment data found. Please start the booking process again.');
      setLoading(false);
    }
  }, [location, isAuthenticated, navigate]);
  
  // Create appointment in backend before initiating payment
  const createAppointment = async () => {
    try {
      setPaymentLoading(true);
      
      // Check if we have required data
      if (!appointmentData || !appointmentData.doctorId || !patientProfile?.id) {
        throw new Error('Missing required appointment information');
      }
      
      // Make sure patient ID is correctly set
      const finalAppointmentData = {
        ...appointmentData,
        patientId: patientProfile.id
      };
      
      console.log('Creating appointment with data:', finalAppointmentData);
      console.log("doctor object in PaymentPage:", doctor);
      console.log("doctorId in PaymentPage:", doctor?.id);
      console.log("patientProfile in PaymentPage:", patientProfile);
      console.log("patientProfile.id in PaymentPage:", patientProfile?.id);
      
      // Create appointment in backend
      const result = await AppointmentService.createAppointment(finalAppointmentData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create appointment');
      }
      
      setCreatedAppointment(result.data);
      return result.data;
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Failed to create appointment. Please try again.');
      setPaymentLoading(false);
      return null;
    }
  };
  
  // Process payment
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setError('');
      
      // First create appointment in the backend if not already created
      const appointment = createdAppointment || await createAppointment();
      if (!appointment) return;
      
      // Calculate fee details
      const consultationFee = doctor?.consultationFee || 0;
      const registrationFee = doctor?.registrationFee || 350;
      const taxAmount = Math.round((consultationFee + registrationFee) * 0.18);
      const totalAmount = consultationFee + registrationFee + taxAmount;
      
      console.log('💰 Payment calculation:', {
        consultationFee,
        registrationFee,
        taxAmount,
        totalAmount
      });
      
      // Create order in backend
      const orderResult = await RazorpayService.createOrder({
        appointmentId: appointment.id,
        amount: totalAmount, // Amount in rupees
        currency: 'INR',
        receipt: `appointment-${appointment.id}`
      });
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create payment order');
      }
      
      // Make sure Razorpay script is loaded
      const scriptLoaded = await RazorpayService.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment system. Please check your internet connection.');
      }
      
      // Configure Razorpay options
      const options = {
        key: 'rzp_test_oCj7e2CACazlHk', // Replace with your Razorpay key ID
        amount: totalAmount,
        currency: 'INR',
        name: 'MediConnect',
        description: `Appointment with ${doctor.name || 'Doctor'}`,
        order_id: orderResult.data.orderId,
        prefill: {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          contact: patientProfile?.phoneNumber || '',
        },
        notes: {
          appointmentId: appointment.id,
          doctorId: doctor.id,
          patientId: patientProfile.id,
          appointmentType: appointmentData.appointmentType
        },
        theme: {
          color: '#7C3AED', // Purple color matching your theme
        },
        handler: async function (response) {
          console.log('💳 Payment successful, verifying...', response);
          
          try {
            // Verify payment with backend
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
            
            const verificationResult = await RazorpayService.verifyPayment({
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
              signature: razorpay_signature,
              appointmentId: appointment.id
            });

            console.log('Payment verification result:', verificationResult);

            if (verificationResult.success) {
              // ✅ FIXED: Store complete payment data for confirmation page
              console.log('Storing appointment data for confirmation page');
              const confirmationData = {
                // Payment details - STORE IN RUPEES
                success: verificationResult.success,
                transactionId: verificationResult.transactionId || razorpay_payment_id,
                amount: totalAmount, // ✅ Store in rupees (e.g., 1350)
                email: verificationResult.email || user?.email,
                
                // Appointment details
                appointmentId: verificationResult.appointmentId || appointment.id,
                appointment: verificationResult.appointment || {
                  id: appointment.id,
                  appointmentType: appointmentData.appointmentType,
                  appointmentDateTime: appointmentData.appointmentDateTime,
                  fee: consultationFee,
                  doctorName: getDoctorName(doctor),
                  doctorSpecialization: doctor?.specialization,
                  doctorProfileImage: doctor?.profileImage,
                  doctorGender: doctor?.gender,
                  doctorHospitalAffiliation: doctor?.hospitalAffiliation,
                  doctorAddress: doctor?.address,
                  patientName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                },
                
                // Additional data
                doctor: doctor,
                originalAppointmentData: appointmentData,
                paymentBreakdown: {
                  consultationFee: consultationFee,
                  registrationFee: registrationFee,
                  taxAmount: taxAmount,
                  totalAmount: totalAmount // ✅ Store as rupees
                },
                timestamp: new Date().toISOString(),
                type: 'APPOINTMENT'
              };
              
              localStorage.setItem('paymentVerificationResult', JSON.stringify(confirmationData));
              console.log('💾 Stored appointment payment data:', confirmationData);
              
              // Payment successful, navigate to confirmation page
              navigate(`/payment/confirmation?paymentId=${razorpay_payment_id}&orderId=${razorpay_order_id}&appointmentId=${appointment.id}`);
            } else {
              throw new Error(verificationResult.error || 'Payment verification failed. Please contact support.');
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
        throw new Error('Razorpay key is missing from configuration');
      }
      if (!options.order_id) {
        throw new Error('Razorpay order ID is missing from server response');
      }
      if (!options.amount || options.amount <= 0) {
        throw new Error('Invalid payment amount');
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
      console.error('Payment error:', err);
      
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
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Format doctor name
  const getDoctorName = (doctor) => {
    if (!doctor) return 'Doctor';
    
    if (doctor.name) return doctor.name;
    
    if (doctor.user) {
      return `Dr. ${doctor.user.firstName || ''} ${doctor.user.lastName || ''}`.trim();
    }
    
    return `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
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
  if (error && !appointmentData) {
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
              onClick={() => navigate('/doctors')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Browse Doctors
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate fee details
  const consultationFee = doctor?.consultationFee || 0;
  const registrationFee = doctor?.registrationFee || 350;
  const taxAmount = Math.round((consultationFee + registrationFee) * 0.18);
  const totalAmount = consultationFee + registrationFee + taxAmount;
  
  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Payment</h1>
          <p className="text-gray-600 mb-8">Complete your payment to confirm your appointment</p>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Order summary */}
            <div className="w-full md:w-7/12">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-bold mb-4">Appointment Summary</h2>
                
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mr-4">
                      <img 
                        src={doctor?.profileImage || '/images/Male Doctor.jpg'}
                        alt={getDoctorName(doctor)}
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
                    <div>
                      <h3 className="font-bold">{getDoctorName(doctor)}</h3>
                      <p className="text-sm text-gray-600">{doctor?.specialization || 'Specialist'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <div className="w-6 text-purple-600 mr-3">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Date & Time</p>
                      <p className="text-gray-600">{formatDate(date)}</p>
                      <p className="text-gray-600">{slot?.time || 'Selected time slot'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 text-purple-600 mr-3">
                      <i className={appointmentData?.appointmentType === 'video' ? 'fas fa-video' : 'fas fa-hospital'}></i>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Appointment Type</p>
                      <p className="text-gray-600">
                        {appointmentData?.appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                      </p>
                    </div>
                  </div>
                  
                  {appointmentData?.appointmentType !== 'VIDEO' && (
                    <div className="flex items-start">
                      <div className="w-6 text-purple-600 mr-3">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Location</p>
                        <p className="text-gray-600">{doctor?.hospitalAffiliation || 'Doctor\'s Clinic'}</p>
                        <p className="text-gray-600">{doctor?.address}</p>
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
                    <span className="text-gray-600">Consultation Fee</span>
                    <span className="font-medium">₹{consultationFee}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration Fee</span>
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

export default PaymentPage;