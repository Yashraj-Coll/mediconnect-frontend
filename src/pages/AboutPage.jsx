import React from 'react';

const AboutUsPage = () => {
  const teamMembers = [
    {
      name: "Yashraj Singh",
      role: "Founder & Lead Architect",
      description: "Visionary founder who conceptualized and architected MediConnect from the ground up. Leading the development with expertise in full-stack technologies and a passion for transforming healthcare through innovation.",
      image: "/src/assets/images/yashraj.jpg",
      skills: ["Full-Stack Development", "System Architecture", "Project Leadership", "Healthcare Tech"],
      isFounder: true,
      social: {
        linkedin: "#",
        github: "#",
        twitter: "#"
      }
    },
    {
      name: "Prachi Srivastav",
      role: "Frontend Developer & UI/UX Designer",
      description: "Passionate about creating intuitive user experiences and bringing designs to life with modern web technologies.",
      image: "/src/assets/images/prachi.jpg",
      skills: ["React", "UI/UX Design", "Tailwind CSS", "Figma"],
      social: {
        linkedin: "#",
        github: "#",
        twitter: "#"
      }
    },
    {
      name: "Himanshu Dubey",
      role: "Full Stack Developer",
      description: "Experienced in building scalable web applications with a focus on clean code and efficient architecture.",
      image: "/src/assets/images/himanshu.png",
      skills: ["Node.js", "React", "MongoDB", "Express"],
      social: {
        linkedin: "#",
        github: "#",
        twitter: "#"
      }
    },
    {
      name: "Saitya Dhar",
      role: "Backend Developer & Database Architect",
      description: "Specialized in server-side development and database optimization for high-performance applications.",
      image: "/src/assets/images/saitya.png",
      skills: ["Python", "PostgreSQL", "API Development", "Cloud Services"],
      social: {
        linkedin: "#",
        github: "#",
        twitter: "#"
      }
    },
    {
      name: "Sulagna Mukherjee",
      role: "Frontend Developer & Quality Assurance",
      description: "Focused on creating responsive designs and ensuring seamless user interactions across all devices.",
      image: "/src/assets/images/sulagna.jpg",
      skills: ["JavaScript", "CSS3", "Testing", "Responsive Design"],
      social: {
        linkedin: "#",
        github: "#",
        twitter: "#"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <i className="fas fa-users text-white mr-3"></i>
              <span className="text-white font-medium">Meet the Team Behind MediConnect</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Our <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Visionary</span><br />
              Team
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Led by founder Yashraj, we're five passionate developers united by a mission to revolutionize healthcare through innovative technology solutions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">5</div>
                <div className="text-blue-100">Dedicated Developers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">200+</div>
                <div className="text-blue-100">Hours Invested</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">1</div>
                <div className="text-blue-100">Shared Vision</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-10 opacity-20">
          <div className="w-20 h-20 bg-white rounded-full animate-bounce animation-delay-1000"></div>
        </div>
        <div className="absolute bottom-20 left-10 opacity-20">
          <div className="w-16 h-16 bg-yellow-300 rounded-full animate-bounce animation-delay-3000"></div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-purple-100 rounded-full px-6 py-3 mb-8">
              <i className="fas fa-bullseye text-purple-600 mr-3"></i>
              <span className="text-purple-800 font-medium">Our Mission</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Transforming Healthcare Through <span className="text-purple-600">Innovation</span>
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Founded by Yashraj with a vision to make healthcare accessible to all, MediConnect represents our commitment to breaking down barriers between patients and quality medical care. Through cutting-edge AI technology, intuitive design, and secure telemedicine solutions, we're building the future of healthcare today.
            </p>
          </div>
        </div>
      </div>

      {/* Founder Spotlight */}
      <div className="py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-purple-600 text-white rounded-full px-6 py-3 mb-8">
              <i className="fas fa-crown mr-3"></i>
              <span className="font-medium">Meet Our Founder</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">The Visionary Behind MediConnect</h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-purple-200 relative">
              {/* Premium Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full shadow-lg border-4 border-white">
                  <div className="flex items-center">
                    <i className="fas fa-crown mr-3 text-yellow-300"></i>
                    <span className="font-bold text-lg">FOUNDER & VISIONARY</span>
                  </div>
                </div>
              </div>

              <div className="lg:flex">
                {/* Image Side */}
                <div className="lg:w-2/5 relative">
                  <div className="h-96 lg:h-full bg-gradient-to-br from-purple-500 to-indigo-600 relative overflow-hidden">
                    <img 
                      src={teamMembers[0].image}
                      alt={teamMembers[0].name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent"></div>
                    
                    {/* Floating Decoration */}
                    <div className="absolute top-6 right-6 w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm animate-pulse"></div>
                    <div className="absolute bottom-6 left-6 w-12 h-12 bg-yellow-400/30 rounded-full backdrop-blur-sm animate-pulse animation-delay-2000"></div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:w-3/5 p-12 lg:p-16">
                  <div className="text-center lg:text-left">
                    <h3 className="text-5xl font-bold text-gray-900 mb-4">{teamMembers[0].name}</h3>
                    <div className="text-2xl text-purple-600 font-semibold mb-6 flex items-center justify-center lg:justify-start">
                      <i className="fas fa-rocket mr-3"></i>
                      {teamMembers[0].role}
                    </div>
                    
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                      {teamMembers[0].description}
                    </p>

                    {/* Skills with Premium Design */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center lg:justify-start">
                        <i className="fas fa-cogs mr-2 text-purple-600"></i>
                        Core Expertise
                      </h4>
                      <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        {teamMembers[0].skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Social Links with Premium Design */}
                    <div className="flex justify-center lg:justify-start space-x-4">
                      <a 
                        href={teamMembers[0].social.linkedin} 
                        className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                      >
                        <i className="fab fa-linkedin-in text-xl"></i>
                      </a>
                      <a 
                        href={teamMembers[0].social.github} 
                        className="w-14 h-14 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                      >
                        <i className="fab fa-github text-xl"></i>
                      </a>
                      <a 
                        href={teamMembers[0].social.twitter} 
                        className="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                      >
                        <i className="fab fa-twitter text-xl"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 rounded-full px-6 py-3 mb-8">
              <i className="fas fa-users text-blue-600 mr-3"></i>
              <span className="text-blue-800 font-medium">Our Development Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet Our Talented <span className="text-blue-600">Developers</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each team member brings specialized skills and passion to create an exceptional healthcare platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {teamMembers.slice(1).map((member, index) => (
              <div 
                key={index} 
                className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group border border-gray-100"
              >
                {/* Image with Overlay Effect */}
                <div className="relative overflow-hidden">
                  <div className="h-64 bg-gradient-to-br from-purple-400 to-blue-500 relative">
                    <img 
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    
                    {/* Floating Social Icons on Hover */}
                    <div className="absolute inset-0 bg-purple-600/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="flex space-x-4">
                        <a 
                          href={member.social.linkedin} 
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 hover:text-purple-800 transition-colors duration-300 transform hover:scale-110"
                        >
                          <i className="fab fa-linkedin-in"></i>
                        </a>
                        <a 
                          href={member.social.github} 
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 hover:text-purple-800 transition-colors duration-300 transform hover:scale-110"
                        >
                          <i className="fab fa-github"></i>
                        </a>
                        <a 
                          href={member.social.twitter} 
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 hover:text-purple-800 transition-colors duration-300 transform hover:scale-110"
                        >
                          <i className="fab fa-twitter"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Element */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-purple-100">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 pt-10 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-purple-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{member.description}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.skills.map((skill, skillIndex) => (
                      <span 
                        key={skillIndex}
                        className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 rounded-full px-6 py-3 mb-8">
              <i className="fas fa-heart text-green-600 mr-3"></i>
              <span className="text-green-800 font-medium">Our Core Values</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Drives Us <span className="text-green-600">Forward</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The fundamental principles that guide our development process and shape our healthcare solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <i className="fas fa-heart text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Patient-Centric</h3>
              <p className="text-gray-600 leading-relaxed">Every feature we build prioritizes the patient experience, ensuring healthcare is accessible, intuitive, and compassionate.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-10 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <i className="fas fa-shield-alt text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Security First</h3>
              <p className="text-gray-600 leading-relaxed">We maintain the highest standards of data security and privacy protection, ensuring patient information is always safe.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-10 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <i className="fas fa-lightbulb text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600 leading-relaxed">We constantly explore new technologies and methodologies to improve healthcare delivery and patient outcomes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <i className="fas fa-envelope text-white mr-3"></i>
              <span className="text-white font-medium">Get In Touch</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to Connect?
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              We'd love to hear from you! Whether you have questions about MediConnect, want to collaborate, or just want to say hello.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                <i className="fas fa-envelope mr-3"></i>
                Get in Touch
              </button>
              <button className="bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-full border-2 border-white/20 font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
                <i className="fab fa-github mr-3"></i>
                View Our Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
};

export default AboutUsPage;