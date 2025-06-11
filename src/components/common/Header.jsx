import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when navigation occurs
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Get user's first name or default to "User"
  const firstName = user?.firstName || "User";
  
  // Get first letter of first name for avatar
  const firstLetter = firstName.charAt(0).toUpperCase();

  // FIXED: Properly extract and normalize user role
  const getUserRole = () => {
    if (!user?.role) return 'PATIENT';
    
    let role = user.role.toUpperCase();
    // Remove ROLE_ prefix if present
    if (role.startsWith('ROLE_')) {
      role = role.substring(5);
    }
    return role;
  };

  const userRole = getUserRole();

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return null;
    
    const dashboardRoutes = {
      'PATIENT': { path: '/patient-dashboard', label: 'Patient Dashboard', icon: 'fas fa-user' },
      'DOCTOR': { path: '/doctor-dashboard', label: 'Doctor Dashboard', icon: 'fas fa-user-md' },
      'ADMIN': { path: '/admin-dashboard', label: 'Admin Dashboard', icon: 'fas fa-user-shield' }
    };

    const dashboard = dashboardRoutes[userRole];
    
    if (!dashboard) {
      // Fallback to generic dashboard
      return (
        <Link to="/dashboard" className="hidden md:flex items-center text-gray-700 hover:text-purple-600">
          <div className="relative">
            <span className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium">
              {firstLetter}
            </span>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <span className="ml-2 font-medium hidden lg:inline-block">
            Dashboard
          </span>
        </Link>
      );
    }

    return (
      <Link to={dashboard.path} className="hidden md:flex items-center text-gray-700 hover:text-purple-600">
        <div className="relative">
          <span className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium">
            <i className={dashboard.icon}></i>
          </span>
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <span className="ml-2 font-medium hidden lg:inline-block">
          {firstName}
        </span>
      </Link>
    );
  };

  const getUserRoleDisplay = () => {
    if (!user?.role) return firstName;
    
    const roleDisplayMap = {
      'PATIENT': firstName,
      'DOCTOR': `Dr. ${firstName}`,
      'ADMIN': `Admin ${firstName}`
    };
    
    return roleDisplayMap[userRole] || firstName;
  };

  const handleLogout = () => {
    logout();
    navigate('/logout');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleBooking = () => {
    navigate('/doctors');
  };

  // FIXED: Get appropriate dashboard path based on user role
  const getDashboardPath = () => {
    switch (userRole) {
      case 'PATIENT':
        return '/patient-dashboard';
      case 'DOCTOR':
        return '/doctor-dashboard';
      case 'ADMIN':
        return '/admin-dashboard';
      default:
        return '/dashboard';
    }
  };

  // FIXED: Get appropriate icon based on user role
  const getUserIcon = () => {
    switch (userRole) {
      case 'DOCTOR':
        return 'fas fa-user-md';
      case 'ADMIN':
        return 'fas fa-user-shield';
      default:
        return 'fas fa-user';
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition duration-300 ${isScrolled ? 'bg-white bg-opacity-95 shadow-md py-3' : 'bg-white py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center">
              <div className="bg-gradient-primary text-white font-bold text-2xl h-10 w-10 rounded-lg flex items-center justify-center mr-2">
                M<span className="text-orange-400">+</span>
              </div>
              <div>
                <span className="font-bold text-gradient text-xl">MediConnect</span>
                <span className="text-orange-500 text-xs ml-1 font-semibold">HEALTH</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium transition">Home</Link>
            <Link to="/doctors" className="text-gray-700 hover:text-purple-600 font-medium transition">Doctors</Link>
            <Link to="/services" className="text-gray-700 hover:text-purple-600 font-medium transition">Services</Link>
            <Link to="/about" className="text-gray-700 hover:text-purple-600 font-medium transition">About</Link>
            <Link to="/blog" className="text-gray-700 hover:text-purple-600 font-medium transition">Blog</Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {getDashboardLink()}
                <button 
                  onClick={handleLogout}
                  className="hidden md:block bg-white text-purple-600 px-4 py-2 rounded-full border border-purple-200 hover:bg-purple-50 font-medium transition shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={handleLogin}
                className="hidden md:block bg-white text-purple-600 px-4 py-2 rounded-full border border-purple-200 hover:bg-purple-50 font-medium transition shadow-sm"
              >
                Login
              </button>
            )}
            <button 
              onClick={handleBooking}
              className="bg-gradient-primary text-white px-6 py-2.5 rounded-full hover:shadow-lg font-medium transition duration-300 transform hover:-translate-y-0.5"
            >
              Book Now
            </button>
            <div 
              className="md:hidden text-gray-600 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className="fas fa-bars text-xl"></i>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white mt-4 py-4 px-2 rounded-lg shadow-lg">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2 hover:bg-gray-50 rounded-md">Home</Link>
              <Link to="/doctors" className="text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2 hover:bg-gray-50 rounded-md">Doctors</Link>
              <Link to="/specialities" className="text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2 hover:bg-gray-50 rounded-md">Specialities</Link>
             
             {/* 🆕 ADD THIS: Bills & Payments link for authenticated patients */}
      {isAuthenticated && userRole === 'PATIENT' && (
        <Link 
          to="/bills-payments" 
          className="flex items-center text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2 hover:bg-gray-50 rounded-md"
        >
          <i className="fas fa-receipt mr-3 text-purple-600"></i>
          Bills & Payments
        </Link>
      )}
              {isAuthenticated && (
                <Link 
                  to={getDashboardPath()} 
                  className="flex items-center text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2 hover:bg-gray-50 rounded-md"
                >
                  <span className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium mr-2">
                    <i className={getUserIcon()}></i>
                  </span>
                  {getUserRoleDisplay()} Dashboard
                </Link>
              )}
              <Link to="/ai-chat" className="text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2 hover:bg-gray-50 rounded-md">AI Health</Link>
              
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="text-left text-red-600 font-medium px-4 py-2 hover:bg-red-50 rounded-md"
                >
                  Logout
                </button>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="text-left text-purple-600 font-medium px-4 py-2 hover:bg-purple-50 rounded-md"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
      
      {/* Service Navigation - Based on the first image */}
      <div className="hidden lg:block bg-white border-t border-gray-100 mt-1">
        <div className="container mx-auto">
          <div className="flex justify-between text-center text-sm">
            <Link to="/doctors" className="py-2 px-2 flex flex-col items-center text-gray-600 hover:text-purple-600 transition">
              <span className="font-medium">BOOK APPOINTMENT</span>
            </Link>
            <Link to="/specialities" className="py-2 px-2 flex flex-col items-center text-gray-600 hover:text-purple-600 transition">
  <span className="font-medium text-purple-600">SPECIALITIES</span>
</Link>
            <Link to="/lab-tests" className="py-2 px-2 flex flex-col items-center text-gray-600 hover:text-purple-600 transition">
              <span className="font-medium">BOOK TESTS</span>
            </Link>
            <Link to="/bills-payments" className="py-2 px-2 flex flex-col items-center text-gray-600 hover:text-purple-600 transition">
              <span className="font-medium">BILLS & PAYMENTS</span>
            </Link>
            <Link to="/health-records" className="py-2 px-2 flex flex-col items-center bg-green-500 text-white rounded-full mx-2 hover:bg-green-600 transition">
              <span className="font-medium">HEALTH RECORDS</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;