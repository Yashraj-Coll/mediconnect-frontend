import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentSlot, setAppointmentSlot] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Load data from location state
  useEffect(() => {
    if (location.state) {
      const { doctor, date, slot, patient } = location.state;
      setDoctor(doctor);
      setAppointmentDate(date);
      setAppointmentSlot(slot);
      setPatient(patient);
      setLoading(false);
    } else {
      // If no state, navigate back to home
      navigate('/');
    }
  }, [location, navigate]);

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleDiscountCodeChange = (e) => {
    setDiscountCode(e.target.value);
  };

  const handleApplyDiscount = () => {
    if (discountCode.trim() === 'WELCOME20') {
      // 20% discount
      const discountValue = Math.round(getTotalAmount() * 0.2);
      setDiscountAmount(discountValue);
      setDiscountApplied(true);
    } else {
      // Show error - invalid code
      setDiscountApplied(false);
      setDiscountAmount(0);
      alert('Invalid discount code');
    }
  };

  const handleProcessPayment = () => {
    setProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentSuccess(true);
      
      // Navigate to success page after a delay
      setTimeout(() => {
        navigate('/dashboard', { state: { paymentSuccess: true } });
      }, 2000);
    }, 2000);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Calculate total amount
  const getTotalAmount = () => {
    if (!doctor) return 0;
    
    let total = doctor.consultationFee;
    if (doctor.registrationFee) {
      total += doctor.registrationFee;
    }
    
    return total;
  };

  // Calculate final amount after discount
  const getFinalAmount = () => {
    const total = getTotalAmount();
    return total - discountAmount;
  };

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-3xl text-green-600"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your appointment with {doctor.name} has been booked for {formatDate(appointmentDate)} at {appointmentSlot.time}.
          </p>
          <p className="text-gray-600">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Payment</h1>
            <p className="text-gray-600">Complete your payment to confirm your appointment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Payment Methods Section */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold mb-4">Select Payment Method</h3>
                  
                  {/* Payment Method Tabs */}
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      className={`px-4 py-2 ${selectedPaymentMethod === 'card' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
                      onClick={() => handlePaymentMethodChange('card')}
                    >
                      <i className="far fa-credit-card mr-2"></i>
                      Credit/Debit Card
                    </button>
                    <button
                      className={`px-4 py-2 ${selectedPaymentMethod === 'upi' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
                      onClick={() => handlePaymentMethodChange('upi')}
                    >
                      <i className="fas fa-mobile-alt mr-2"></i>
                      UPI
                    </button>
                    <button
                      className={`px-4 py-2 ${selectedPaymentMethod === 'netbanking' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
                      onClick={() => handlePaymentMethodChange('netbanking')}
                    >
                      <i className="fas fa-university mr-2"></i>
                      Net Banking
                    </button>
                  </div>

                  {/* Card Payment Form */}
                  {selectedPaymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">CVV</label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            placeholder="123"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Name on Card</label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI Payment Form */}
                  {selectedPaymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-1">UPI ID</label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                          placeholder="yourname@upi"
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button className="p-3 border border-gray-200 rounded-lg">
                          <img src="/api/placeholder/50/20" alt="Google Pay" className="h-6" />
                        </button>
                        <button className="p-3 border border-gray-200 rounded-lg">
                          <img src="/api/placeholder/50/20" alt="PhonePe" className="h-6" />
                        </button>
                        <button className="p-3 border border-gray-200 rounded-lg">
                          <img src="/api/placeholder/50/20" alt="Paytm" className="h-6" />
                        </button>
                        <button className="p-3 border border-gray-200 rounded-lg">
                          <img src="/api/placeholder/50/20" alt="Amazon Pay" className="h-6" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Net Banking Form */}
                  {selectedPaymentMethod === 'netbanking' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-1">Select Bank</label>
                        <select
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="">Select a bank</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                          <option value="kotak">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Discount Code Section */}
                <div className="p-6">
                  <h3 className="text-md font-bold mb-3">Apply Discount Code</h3>
                  <div className="flex">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={handleDiscountCodeChange}
                      className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Enter discount code"
                      disabled={discountApplied}
                    />
                    <button
                      onClick={handleApplyDiscount}
                      disabled={!discountCode.trim() || discountApplied}
                      className={`px-4 py-2 rounded-r-lg font-medium ${
                        !discountCode.trim() || discountApplied
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                  {discountApplied && (
                    <div className="mt-2 text-green-600 text-sm">
                      <i className="fas fa-check-circle mr-1"></i>
                      Discount code applied successfully! You saved ₹{discountAmount}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-32">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                  
                  {/* Appointment Details */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img 
                          src="/api/placeholder/50/50" 
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{doctor.name}</h4>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><i className="fas fa-calendar-alt mr-2 text-gray-500"></i>{formatDate(appointmentDate)}</p>
                      <p><i className="fas fa-clock mr-2 text-gray-500"></i>{appointmentSlot.time}</p>
                      <p><i className="fas fa-user mr-2 text-gray-500"></i>{patient.name}</p>
                    </div>
                  </div>

                  {/* Price Details */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Consultation Fee</span>
                      <span>₹{doctor.consultationFee}</span>
                    </div>
                    {doctor.registrationFee > 0 && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Registration Fee</span>
                        <span>₹{doctor.registrationFee}</span>
                      </div>
                    )}
                    {discountApplied && (
                      <div className="flex justify-between mb-2 text-green-600">
                        <span>Discount</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold mt-3 pt-3 border-t border-gray-100">
                      <span>Total Amount</span>
                      <span>₹{getFinalAmount()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="p-6">
                  <button
                    onClick={handleProcessPayment}
                    disabled={processingPayment}
                    className="w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-lg transition duration-300"
                  >
                    {processingPayment ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Pay ₹${getFinalAmount()}`
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    By clicking the pay button, you agree to our <a href="#" className="text-purple-600">Terms and Conditions</a>
                  </p>
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