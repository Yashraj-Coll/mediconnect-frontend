// src/pages/BillsPaymentsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import RazorpayService from '../services/RazorpayService';

const BillsPaymentsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Authentication check - redirect if not logged in
  useEffect(() => {
    console.log('🔍 Checking authentication...', { isAuthenticated, user });
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login?redirect=/bills-payments');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Check if user has PATIENT role
  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role?.toUpperCase().replace('ROLE_', '') || 'PATIENT';
      console.log('🔍 Checking user role:', userRole);
      if (userRole !== 'PATIENT') {
        console.log('❌ User is not a patient, redirecting');
        navigate('/'); // Redirect non-patients to home
        return;
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User authenticated, fetching payment data');
      fetchPaymentData();
    }
  }, [isAuthenticated, user]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching payment history and summary...');
      
       // Fetch both payments and summary in parallel
      const [paymentsResult, summaryResult] = await Promise.all([
        RazorpayService.getUserPayments(),
        RazorpayService.getUserPaymentSummary()
      ]);
      
      console.log('📊 Payment data results:', { paymentsResult, summaryResult });
      
      if (paymentsResult.success) {
        // FIXED: Ensure we're setting an array
        const paymentsData = Array.isArray(paymentsResult.data) ? paymentsResult.data : [];
        setPayments(paymentsData);
        console.log('✅ Payments loaded:', paymentsData.length, 'payments');
        console.log('📋 Sample payment:', paymentsData[0]); // Debug log
      } else {
        console.log('❌ Failed to load payments:', paymentsResult.error);
        setError(paymentsResult.error || 'Failed to load payment history');
        setPayments([]); // Set empty array on error
      }
      
      if (summaryResult.success) {
        setSummary(summaryResult.data || {});
        console.log('✅ Summary loaded:', summaryResult.data);
      } else {
        console.log('❌ Failed to load summary:', summaryResult.error);
        // Don't set error for summary failure, just use default values
        setSummary({});
      }
      
    } catch (err) {
      console.error('❌ Error fetching payment data:', err);
      setError('Failed to load payment data. Please try again.');
      setPayments([]); // Set empty array on error
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (payment) => {
    try {
      console.log('🧾 Downloading receipt for payment:', payment.id);
      const result = await RazorpayService.downloadReceipt(payment.id);
      if (!result.success) {
        alert(result.error || 'Failed to download receipt. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error downloading receipt:', err);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return RazorpayService.formatDate(dateString);
  };

  const formatAmount = (amount) => {
    return RazorpayService.formatAmount(amount);
  };

  const getStatusColor = (status) => {
    return RazorpayService.getStatusColorClass(status);
  };

  const getPaymentTypeIcon = (payment) => {
    if (payment.appointment) {
      return payment.appointment.appointmentType === 'video' ? 
        'fas fa-video text-purple-600' : 'fas fa-hospital text-blue-600';
    } else if (payment.labTestBooking) {
      return 'fas fa-flask text-green-600';
    }
    return 'fas fa-credit-card text-gray-600';
  };

  const getPaymentDescription = (payment) => {
    if (payment.appointment) {
      const doctorName = payment.appointment.doctorName || 
        (payment.appointment.doctor?.user ? 
          `Dr. ${payment.appointment.doctor.user.firstName} ${payment.appointment.doctor.user.lastName}` : 
          'Doctor');
      const type = payment.appointment.appointmentType === 'video' ? 'Video Consultation' : 'In-Person Consultation';
      return `${type} with ${doctorName}`;
    } else if (payment.labTestBooking) {
      return `Lab Test: ${payment.labTestBooking.testName || 'Lab Test'}`;
    }
    return 'Medical Service';
  };

  // Helper function to get filter counts
  const getFilterCount = (filterId) => {
    if (!Array.isArray(payments)) return 0;
    
    switch (filterId) {
      case 'all':
        return payments.length;
      case 'appointments':
        return payments.filter(p => p.appointment).length;
      case 'lab-tests':
        return payments.filter(p => p.labTestBooking).length;
      case 'completed':
        return payments.filter(p => p.status?.toLowerCase() === 'captured').length;
      case 'pending':
        return payments.filter(p => ['created', 'authorized'].includes(p.status?.toLowerCase())).length;
      case 'failed':
        return payments.filter(p => p.status?.toLowerCase() === 'failed').length;
      default:
        return 0;
    }
  };

  // FIXED: Ensure payments is always an array before filtering
  const filteredPayments = Array.isArray(payments) ? payments.filter(payment => {
    if (filter === 'all') return true;
    if (filter === 'appointments') return payment.appointment;
    if (filter === 'lab-tests') return payment.labTestBooking;
    if (filter === 'completed') return payment.status?.toLowerCase() === 'captured';
    if (filter === 'pending') return ['created', 'authorized'].includes(payment.status?.toLowerCase());
    if (filter === 'failed') return payment.status?.toLowerCase() === 'failed';
    return true;
  }) : [];

  const totalSpent = summary.totalSpent || 0;
  const totalTransactions = summary.totalTransactions || 0;
  const successfulPayments = summary.successfulPayments || 0;

  // Return early if not authenticated - show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-16 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  // Return early if user is not a patient
  if (isAuthenticated && user) {
    const userRole = user.role?.toUpperCase().replace('ROLE_', '') || 'PATIENT';
    if (userRole !== 'PATIENT') {
      return (
        <div className="pt-32 pb-16 flex flex-col items-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4">
            <div className="flex">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <p>Access denied. Only patients can view payment history.</p>
            </div>
          </div>
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Bills & Payments</h1>
          <p className="text-purple-100">
            Manage your payment history and download receipts
          </p>
        </div>



        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <i className="fas fa-rupee-sign text-green-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-sm text-gray-600">Total Spent</h3>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(totalSpent)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <i className="fas fa-receipt text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-sm text-gray-600">Total Transactions</h3>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <i className="fas fa-check-circle text-purple-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-sm text-gray-600">Successful Payments</h3>
                <p className="text-2xl font-bold text-gray-900">{successfulPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Payments', icon: 'fas fa-list' },
              { id: 'appointments', label: 'Appointments', icon: 'fas fa-stethoscope' },
              { id: 'lab-tests', label: 'Lab Tests', icon: 'fas fa-flask' },
              { id: 'completed', label: 'Completed', icon: 'fas fa-check' },
              { id: 'pending', label: 'Pending', icon: 'fas fa-clock' },
              { id: 'failed', label: 'Failed', icon: 'fas fa-times' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === item.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
                {/* Show count for each filter */}
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  filter === item.id 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {getFilterCount(item.id)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <div>
                <p>{error}</p>
                <button 
                  onClick={fetchPaymentData}
                  className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment History ({filteredPayments.length} {filter !== 'all' ? `filtered from ${payments.length} total` : 'total'})
            </h2>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-receipt text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? "You haven't made any payments yet." 
                  : `No payments found for the selected filter: ${filter}.`}
              </p>
              {filter === 'all' ? (
                <Link
                  to="/doctors"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition inline-block"
                >
                  Book Your First Appointment
                </Link>
              ) : (
                <button
                  onClick={() => setFilter('all')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Show All Payments
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPayments.map((payment, index) => (
                <div key={payment.id || index} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 rounded-full p-3">
                        <i className={getPaymentTypeIcon(payment)}></i>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {getPaymentDescription(payment)}
                        </h3>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-calendar-alt mr-1"></i>
                            {formatDate(payment.createdAt)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-credit-card mr-1"></i>
                            Payment ID: {payment.razorpayPaymentId || payment.razorpayOrderId || 'N/A'}
                          </p>
                          {payment.paymentMethod && (
                            <p className="text-sm text-gray-600">
                              <i className={`${RazorpayService.getPaymentMethodIcon(payment.paymentMethod)} mr-1`}></i>
                              Method: {payment.paymentMethod.toUpperCase()}
                              {payment.cardLast4 && ` ending in ${payment.cardLast4}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 mb-2">
                        {formatAmount(payment.amount)}
                      </div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </div>
                      
                      {payment.status?.toLowerCase() === 'captured' && (
                        <div className="mt-3 space-x-2">
                          <button
                            onClick={() => downloadReceipt(payment)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <i className="fas fa-download mr-1"></i>
                            Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Details */}
                  {payment.appointment && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Appointment Date:</span>
                          <br />
                          {payment.appointment.appointmentDateTime ? 
                            formatDate(payment.appointment.appointmentDateTime) : 'TBD'}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <br />
                          {payment.appointment.appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <br />
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            payment.appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.appointment.status?.toUpperCase() || 'SCHEDULED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {payment.labTestBooking && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Test Type:</span>
                          <br />
                          {payment.labTestBooking.testName || 'Lab Test'}
                        </div>
                        <div>
                          <span className="font-medium">Collection:</span>
                          <br />
                          {payment.labTestBooking.homeCollection ? 'Home Collection' : 'Lab Visit'}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <br />
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            payment.labTestBooking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.labTestBooking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.labTestBooking.status?.toUpperCase() || 'BOOKED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            <i className="fas fa-question-circle mr-2"></i>
            Need Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-1">Payment Issues</h4>
              <p>If you face any payment-related issues, contact our support team.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Receipt Downloads</h4>
              <p>Click the receipt button to download PDF receipts for completed payments.</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              <i className="fas fa-headset mr-2"></i>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsPaymentsPage;