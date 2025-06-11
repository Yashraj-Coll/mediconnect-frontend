import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import DoctorListPage from './pages/DoctorListPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import PatientSelectionPage from './pages/PatientSelectionPage';
import PaymentPage from './pages/PaymentPage';
import PaymentConfirmationPage from './pages/PaymentConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LogoutPage from './pages/LogoutPage';
import BillsPaymentsPage from './pages/BillsPaymentsPage';

// 🔑 PASSWORD RESET IMPORTS - ADD THESE
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import VideoConsultationPage from './pages/VideoConsultationPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import DoctorForm from './pages/DoctorForm';
import AdminDashboard from './pages/AdminDashboard'; 
import AiChatPage from './pages/AiChatPage';
import SpecialitiesPage from './pages/SpecialitiesPage';
import { PatientProvider } from './context/PatientContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lab Test Pages
import LabTestsPage from './pages/LabTestsPage';
import LabTestPaymentPage from './pages/LabTestPaymentPage';
import LabTestConfirmationPage from './pages/LabTestConfirmationPage';

// Other Service Pages
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import HealthRecordsPage from './pages/HealthRecordsPage';

import './App.css';
import './styles/animations.css';

// 🚀 ADD THIS COMPONENT - ONE-LINE SOLUTION
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Temporary Components for Missing Routes
const ExpertOpinionPage = () => (
  <div className="pt-28 pb-16">
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Expert Opinion</h1>
      <p>This page is under construction. Check back soon!</p>
    </div>
  </div>
);

const VaccinationPage = () => (
  <div className="pt-28 pb-16">
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Vaccination</h1>
      <p>This page is under construction. Check back soon!</p>
    </div>
  </div>
);
const PharmacyPage = () => (
  <div className="pt-28 pb-16">
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Online Pharmacy</h1>
      <p>This page is under construction. Check back soon!</p>
    </div>
  </div>
);

// FIXED Role-Based Redirect Component
const RoleBasedRedirect = () => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  console.log('RoleBasedRedirect - User:', user);
  console.log('RoleBasedRedirect - User Role:', user?.role);
  console.log('RoleBasedRedirect - Loading:', loading);
  console.log('RoleBasedRedirect - IsAuthenticated:', isAuthenticated);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // FIXED: Properly handle role field from different possible sources
  const userRole = user.role || user.userRole || user.type || 'PATIENT';
  let normalizedRole = userRole.toUpperCase();
  
  // Remove ROLE_ prefix if present
  if (normalizedRole.startsWith('ROLE_')) {
    normalizedRole = normalizedRole.substring(5);
  }
  
  console.log('RoleBasedRedirect - Detected Role:', normalizedRole);

  switch (normalizedRole) {
    case 'PATIENT':
      return <Navigate to="/patient-dashboard" replace />;
    case 'DOCTOR':
      return <Navigate to="/doctor-dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/admin-dashboard" replace />;
    default:
      console.warn('Unknown user role, defaulting to patient:', normalizedRole);
      return <Navigate to="/patient-dashboard" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <PatientProvider>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Component */}
            <Header />
            
            {/* Main Content */}
            <main className="flex-grow pt-20">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/logout" element={<LogoutPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* 🔑 PASSWORD RESET ROUTES - ADD THESE */}
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                
                <Route path="/doctors" element={<DoctorListPage />} />
                <Route path="/doctors/:id" element={<DoctorDetailPage />} />
                <Route path="/specialities" element={<SpecialitiesPage />} />
                
                {/* Public Service Routes */}
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/blog" element={<BlogPage />} />
                
                {/* Lab Tests - Public Route */}
                <Route path="/lab-tests" element={<LabTestsPage />} />
                
                {/* Role-Based Dashboard Route */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <RoleBasedRedirect />
                  </ProtectedRoute>
                } />
                
                {/* Specific Dashboard Routes with Role Protection */}
                <Route path="/patient-dashboard" element={
                  <ProtectedRoute requiredRole="PATIENT">
                    <PatientDashboardPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/doctor-dashboard" element={
                  <ProtectedRoute requiredRole="DOCTOR">
                    <DoctorDashboardPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/doctors/add" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <DoctorForm />
                  </ProtectedRoute>
                } />

                <Route path="/admin/doctors/edit/:id" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <DoctorForm isEdit={true} />
                  </ProtectedRoute>
                } />  

                {/* Updated Admin Dashboard Route */}
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Protected Appointment Routes */}
                <Route path="/appointment/:doctorId" element={
                  <ProtectedRoute>
                    <AppointmentBookingPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/in-person-appointment/:doctorId" element={
                  <ProtectedRoute>
                    <AppointmentBookingPage />
                  </ProtectedRoute>
                } />

                <Route path="/patient-selection" element={
                  <ProtectedRoute>
                    <PatientSelectionPage />
                  </ProtectedRoute>
                } />
                
                {/* Payment Routes */}
                <Route path="/payment/new" element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/payment/confirmation" element={
                  <ProtectedRoute>
                    <PaymentConfirmationPage />
                  </ProtectedRoute>
                } />

                {/* 🩺 Lab Test Payment Routes - FIXED */}
                <Route path="/payment/lab-test" element={
                  <ProtectedRoute>
                    <LabTestPaymentPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/payment/lab-test-confirmation" element={
                  <ProtectedRoute>
                    <LabTestConfirmationPage />
                  </ProtectedRoute>
                } />

                <Route path="/video-consultation/:id" element={
                  <ProtectedRoute>
                    <VideoConsultationPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/ai-chat" element={
                  <ProtectedRoute>
                    <AiChatPage />
                  </ProtectedRoute>
                } />
                
                {/* Additional Protected Routes */}
                <Route path="/health-records" element={
                  <ProtectedRoute>
                    <HealthRecordsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/expert-opinion" element={
                  <ProtectedRoute>
                    <ExpertOpinionPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/vaccination" element={
                  <ProtectedRoute>
                    <VaccinationPage />
                  </ProtectedRoute>
                } />
                
               <Route path="/bills-payments" element={
  <ProtectedRoute requiredRole="PATIENT">
    <BillsPaymentsPage />
  </ProtectedRoute>
} />

<Route path="/payments" element={
  <ProtectedRoute requiredRole="PATIENT">
    <BillsPaymentsPage />
  </ProtectedRoute>
} />
                
                <Route path="/pharmacy" element={
                  <ProtectedRoute>
                    <PharmacyPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>

            
            
            {/* Footer */}
            <Footer />
          </div>
        </PatientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;