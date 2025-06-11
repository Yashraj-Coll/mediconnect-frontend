import React, { useState } from 'react';

const ServicesPage = () => {
  const [activeService, setActiveService] = useState(null);

  const services = [
    {
      id: 1,
      title: "Video Consultation",
      icon: "fas fa-video",
      description: "Connect with top specialists from the comfort of your home through our secure video platform.",
      features: [
        "HD Video & Audio Quality",
        "Digital Prescription", 
        "24/7 Availability",
        "Secure & Encrypted"
      ],
      price: "Starting ₹299",
      gradient: "from-purple-500 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      category: "Telemedicine",
      rating: 4.9,
      patients: "10K+"
    },
    {
      id: 2,
      title: "In-Person Appointments",
      icon: "fas fa-clinic-medical",
      description: "Book appointments at our partner hospitals and clinics with verified healthcare professionals.",
      features: [
        "Verified Expert Doctors",
        "500+ Partner Locations", 
        "Smart Queue Management",
        "Insurance Integration"
      ],
      price: "Starting ₹199",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      category: "Clinical Care",
      rating: 4.8,
      patients: "25K+"
    },
    {
      id: 3,
      title: "Lab Tests & Diagnostics",
      icon: "fas fa-flask",
      description: "Comprehensive diagnostic testing with home sample collection and detailed digital reports.",
      features: [
        "Home Sample Collection",
        "NABL Certified Labs",
        "Digital Reports in 6-24hrs",
        "Expert Analysis"
      ],
      price: "Starting ₹150",
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100", 
      iconColor: "text-blue-600",
      category: "Diagnostics",
      rating: 4.9,
      patients: "15K+"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
      rating: 5,
      service: "Video Consultation",
      comment: "Amazing experience! Got expert cardiac advice from a top specialist without leaving my home."
    },
    {
      name: "Rajesh Kumar",
      role: "Business Owner", 
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
      rating: 5,
      service: "In-Person Appointment",
      comment: "Booked an orthopedic consultation easily. No waiting, great facilities, and excellent service."
    },
    {
      name: "Anita Patel",
      role: "Teacher",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80", 
      rating: 5,
      service: "Lab Tests",
      comment: "Home sample collection was so convenient! Got my reports digitally within 12 hours."
    }
  ];

  const processes = [
    {
      step: "01",
      title: "Choose Service", 
      description: "Select video consultation, in-person appointment, or lab tests",
      icon: "fas fa-hand-pointer",
      color: "purple"
    },
    {
      step: "02", 
      title: "Book & Schedule",
      description: "Pick your preferred doctor, time slot, and location easily",
      icon: "fas fa-calendar-check", 
      color: "blue"
    },
    {
      step: "03",
      title: "Get Expert Care",
      description: "Receive world-class medical care from verified specialists",
      icon: "fas fa-heartbeat",
      color: "green"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <i className="fas fa-stethoscope text-white mr-3"></i>
              <span className="text-white font-medium">Premium Healthcare Services</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Healthcare <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Reimagined</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience world-class medical care through our innovative platform. From consultations to diagnostics.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-blue-100">Expert Doctors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">50K+</div>
                <div className="text-blue-100">Happy Patients</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-100">Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">99%</div>
                <div className="text-blue-100">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-purple-100 rounded-full px-6 py-3 mb-8">
              <i className="fas fa-heart text-purple-600 mr-3"></i>
              <span className="text-purple-800 font-medium">Our Core Services</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Healthcare Services <span className="text-purple-600">Made Simple</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three powerful services designed to revolutionize your healthcare experience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <div 
                key={service.id}
                className={`bg-gradient-to-br ${service.bgGradient} rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group border border-gray-100 relative`}
                onMouseEnter={() => setActiveService(service.id)}
                onMouseLeave={() => setActiveService(null)}
              >
                {/* Category Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-white/80 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                    {service.category}
                  </span>
                </div>

                {/* Service Content */}
                <div className="p-8">
                  <div className={`w-20 h-20 ${service.iconBg} ${service.iconColor} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`${service.icon} text-3xl`}></i>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{service.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed mb-6">{service.description}</p>

                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <div className={`w-2 h-2 bg-gradient-to-r ${service.gradient} rounded-full mr-3 flex-shrink-0`}></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <i className="fas fa-star text-yellow-400 mr-1"></i>
                        <span className="text-lg font-bold text-gray-900">{service.rating}</span>
                      </div>
                      <span className="text-gray-600 text-xs">Rating</span>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{service.patients}</div>
                      <span className="text-gray-600 text-xs">Patients</span>
                    </div>
                  </div>

                  {/* Price and CTA */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-4">{service.price}</div>
                    <button className={`w-full bg-gradient-to-r ${service.gradient} text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                      <i className="fas fa-calendar-check mr-2"></i>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-green-100 rounded-full px-6 py-3 mb-6">
              <i className="fas fa-cogs text-green-600 mr-3"></i>
              <span className="text-green-800 font-medium">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple Steps to <span className="text-green-600">Better Health</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting healthcare has never been easier with our streamlined process
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {processes.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Connection Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gray-300 z-0"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className={`w-32 h-32 bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <i className={`${step.icon} text-4xl text-white`}></i>
                    </div>
                    <div className={`absolute -top-3 -right-3 w-12 h-12 bg-${step.color}-100 rounded-full flex items-center justify-center`}>
                      <span className={`text-${step.color}-600 font-bold text-lg`}>{step.step}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <i className="fas fa-heart text-pink-400 mr-3"></i>
              <span className="text-white font-medium">Patient Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our <span className="text-yellow-400">Patients Say</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real experiences from people who trust MediConnect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white/30 group-hover:border-white/50 transition-all duration-300"
                  />
                  <div className="ml-4">
                    <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-300">{testimonial.role}</p>
                    <span className="inline-block bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full text-xs mt-1">
                      {testimonial.service}
                    </span>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="fas fa-star text-yellow-400 mr-1"></i>
                  ))}
                </div>
                
                <p className="text-gray-200 italic leading-relaxed">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Healthcare?
            </h2>
            <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto">
              Join thousands of patients who trust MediConnect. Start with a free consultation today.
            </p>

            <button className="bg-white text-purple-600 px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              <i className="fas fa-video mr-3"></i>
              Start Free Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
};

export default ServicesPage;