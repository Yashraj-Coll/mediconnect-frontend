import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import DoctorListPage from './pages/DoctorListPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import PatientSelectionPage from './pages/PatientSelectionPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VideoConsultationPage from './pages/VideoConsultationPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import AiChatPage from './pages/AiChatPage';
import SpecialitiesPage from './pages/SpecialitiesPage';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

// Custom styles
import './styles/animations.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PatientProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Component */}
            <Header />
            
            {/* Main Content */}
            <main className="flex-grow pt-20">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/doctors" element={<DoctorListPage />} />
                <Route path="/doctors/:id" element={<DoctorDetailPage />} />
                <Route path="/specialities" element={<SpecialitiesPage />} />
                
                {/* Protected Routes */}
                <Route path="/appointment" element={
                  <ProtectedRoute>
                    <AppointmentBookingPage />
                  </ProtectedRoute>
                } />
                <Route path="/patient-selection" element={
                  <ProtectedRoute>
                    <PatientSelectionPage />
                  </ProtectedRoute>
                } />
                <Route path="/payment" element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                } />
                <Route path="/video-consultation/:id" element={
                  <ProtectedRoute>
                    <VideoConsultationPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <PatientDashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/ai-chat" element={
                  <ProtectedRoute>
                    <AiChatPage />
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