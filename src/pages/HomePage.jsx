import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="pt-28 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-60 right-40 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-12 md:mb-0 relative">
              <div className="absolute -left-8 -top-8 bg-orange-400 rounded-full h-16 w-16 opacity-20 animate-pulse-slow"></div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                <span className="block">Virtual Care,</span>
                <span className="text-gradient">
                  Exceptional Results
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Connect with India's top medical specialists from the comfort of your home. Advanced AI diagnostics meet personalized healthcare.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/doctors" className="bg-gradient-primary text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition duration-300 transform hover:-translate-y-1 flex items-center justify-center">
                  <i className="fas fa-video mr-2"></i>
                  Book Video Consultation
                </Link>
                <Link to="/services" className="bg-white text-gray-700 px-8 py-4 rounded-full border border-gray-200 font-medium hover:shadow-md transition hover:border-purple-200 flex items-center justify-center">
                  Learn More
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </div>
              <div className="mt-10 flex items-center">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white font-bold">A</div>
                  <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold">B</div>
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold">C</div>
                  <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center text-white font-bold">D</div>
                </div>
                <div className="ml-4">
                  <div className="text-gray-700 font-medium">Trusted by 100,000+ patients</div>
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-400"></i>
                    <i className="fas fa-star text-yellow-400"></i>
                    <i className="fas fa-star text-yellow-400"></i>
                    <i className="fas fa-star text-yellow-400"></i>
                    <i className="fas fa-star text-yellow-400"></i>
                    <span className="ml-1 text-gray-500 text-sm">4.9 (2.5k reviews)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              {/* Hero Image with Decorative Elements */}
              <div className="relative">
                {/* Main Doctor Image */}
                {/* <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:-rotate-1 transition duration-500">
                  <img 
                    src="/api/placeholder/600/400" 
                    alt="Doctor video consultation"
                    className="w-full h-full object-cover"
                  />
                </div> */}
                
                {/* Floating Element - Video Call Interface */}
                <div className="absolute -top-8 -right-8 bg-white p-4 rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition duration-300 animate-float">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <i className="fas fa-video text-purple-600"></i>
                      </div>
                      <span className="ml-2 font-medium text-sm">Live Consultation</span>
                    </div>
                    <div className="bg-red-500 h-2 w-2 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  </div>
                </div>
                
                {/* Floating Element - Appointment */}
                <div className="absolute -bottom-6 -left-6 bg-white p-3 rounded-lg shadow-lg transform -rotate-3 hover:rotate-0 transition duration-300 animate-float">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <i className="fas fa-calendar-alt text-orange-600"></i>
                    </div>
                    <div className="ml-3">
                      <div className="text-xs text-gray-500">Next Appointment</div>
                      <div className="text-sm font-medium">Today, 3:30 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Brands Section */}
        <div className="container mx-auto px-4 pb-2 border-t border-gray-100">
          <p className="text-center text-gray-500 text-sm mb-2">TRUSTED BY LEADING HEALTHCARE PROVIDERS</p>
          <div className="flex justify-center flex-wrap gap-x-12 gap-y-6">
            {/* Apollo Hospitals */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition">
              <img 
                src="src/assets/images/Apollo_Hospitals_Logo.jpg" 
                alt="Apollo Hospitals" 
                className="h-8 w-auto object-contain" 
              />
            </div>
            {/* Fortis Healthcare */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition">
              <img 
                src="src/assets/images/512px-Fortis_Healthcare_logo.webp" 
                alt="Fortis Healthcare" 
                className="h-8 w-auto object-contain" 
              />
            </div>
            {/* Max Healthcare */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition">
              <img 
                src="https://imgs.search.brave.com/9NDBQuklQUih698wskVO5mDrNxngnNj15vnv5J9jspI/rs:fit:32:32:1:0/g:ce/aHR0cDovL2Zhdmlj/b25zLnNlYXJjaC5i/cmF2ZS5jb20vaWNv/bnMvNjExMDFhNDNm/YTU4YzY2Yzc0YmYw/M2NiYzA0MmQ4ODAx/YzRlN2IyY2FmZjRh/MDA0ZGZhZWNlN2Fm/NjQwMWI0Yi93d3cu/bWF4aGVhbHRoY2Fy/ZS5pbi8" 
                alt="Max Healthcare" 
                className="h-8 w-auto object-contain" 
              />
            </div>
            {/* Manipal Hospitals */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition">
              <img 
                src="https://www.narayanahealth.org/assets/images/logo.svg" 
                alt="Narayana Hospital" 
                className="h-8 w-auto object-contain" 
              />
            </div>
            {/* AIIMS */}
            <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition">
              <img 
                src="https://imgs.search.brave.com/N8HbcVCG9bgFyvYAKP6kLupkTroR45nVLKT8HG7Tkjc/rs:fit:32:32:1:0/g:ce/aHR0cDovL2Zhdmlj/b25zLnNlYXJjaC5i/cmF2ZS5jb20vaWNv/bnMvNWE0ZDJhYzE0/OWMzZjIyY2Y0ZGJm/YzNhYjg2YzdiNDY2/ZTBhMzg3MmUyMjVm/YjM0NjM1MzBiMzRk/NjljNmFkZC93d3cu/d29vZGxhbmRzaG9z/cGl0YWwuaW4v" 
                alt="WoodlandsHospital" 
                className="h-8 w-auto object-contain" 
              />
            </div>
          </div>
        </div>
      </div>


      {/* Services Section */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center mb-20 mt-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Comprehensive Health Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Everything you need for your health and wellness journey, accessible from anywhere, anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 -mt-8">
          {/* Service Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 card-hover">
            <div className="p-8">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-video text-3xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Video Consultations</h3>
              <p className="text-gray-600">Connect with specialists through secure HD video calls</p>
              <button className="mt-6 text-purple-600 font-medium flex items-center">
                Learn More
                <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>

          {/* Service Card 2 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 card-hover">
            <div className="p-8">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-heartbeat text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">AI Symptom Analysis</h3>
              <p className="text-gray-600">Get preliminary insights powered by advanced AI</p>
              <button className="mt-6 text-purple-600 font-medium flex items-center">
                Learn More
                <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>

          {/* Service Card 3 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 card-hover">
            <div className="p-8">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-file-medical text-3xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Electronic Health Records</h3>
              <p className="text-gray-600">Access and manage all your medical records in one place</p>
              <button className="mt-6 text-purple-600 font-medium flex items-center">
                Learn More
                <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>

          {/* Service Card 4 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 card-hover">
            <div className="p-8">
              <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-bell text-3xl text-orange-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Medication Reminders</h3>
              <p className="text-gray-600">Never miss your medications with smart reminders</p>
              <button className="mt-6 text-purple-600 font-medium flex items-center">
                Learn More
                <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>

          {/* Service Card 5 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 card-hover">
            <div className="p-8">
              <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-shield-alt text-3xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Medical Support</h3>
              <p className="text-gray-600">Round-the-clock access to medical professionals</p>
              <button className="mt-6 text-purple-600 font-medium flex items-center">
                Learn More
                <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>

          {/* Service Card 6 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 card-hover">
            <div className="p-8">
              <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-pills text-3xl text-indigo-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Online Pharmacy</h3>
              <p className="text-gray-600">Order prescriptions with doorstep delivery</p>
              <button className="mt-6 text-purple-600 font-medium flex items-center">
                Learn More
                <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Section */}
      <div className="bg-gradient-primary py-16 md:py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">AI-Powered Healthcare at Your Fingertips</h2>
              <p className="text-indigo-100 mb-8 text-lg">Our revolutionary AI technology is transforming how patients receive care and how doctors deliver it.</p>
              
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center mr-4">
                      <i className="fas fa-heartbeat text-xl text-white"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Intelligent Symptom Analysis</h3>
                      <p className="text-indigo-100">Advanced AI algorithms analyze your symptoms and health history to provide accurate preliminary assessments.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center mr-4">
                      <i className="fas fa-chart-line text-xl text-white"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Personalized Health Predictions</h3>
                      <p className="text-indigo-100">Get insights into potential health risks based on your profile, habits, and global medical data.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center mr-4">
                      <i className="fas fa-database text-xl text-white"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Medical Image Analysis</h3>
                      <p className="text-indigo-100">Our AI can analyze medical images to assist doctors in identifying potential health concerns.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <div className="bg-indigo-50 p-6 rounded-xl mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-bolt text-lg text-indigo-600"></i>
                    </div>
                    <h3 className="ml-3 font-bold text-indigo-800">AI Health Assistant</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-gray-700">I've been experiencing headaches and mild fever for the last 3 days.</p>
                    </div>
                    <div className="bg-indigo-600 p-3 rounded-lg text-white">
                      <p>Based on your symptoms and health history, this could be due to several causes. Let me ask you a few more questions to narrow it down.</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-gray-700">The headache is mostly on one side and gets worse with light.</p>
                    </div>
                    <div className="bg-indigo-600 p-3 rounded-lg text-white">
                      <p>Thank you for that information. Your symptoms suggest a possible migraine or tension headache. I recommend a video consultation with a neurologist for proper diagnosis.</p>
                      <div className="mt-2 flex">
                        <button className="bg-white text-indigo-600 px-3 py-1 rounded text-sm mr-2">Book Consultation</button>
                        <button className="bg-indigo-700 text-white px-3 py-1 rounded text-sm">More Info</button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 relative">
                    <input 
                      type="text" 
                      placeholder="Describe your symptoms..." 
                      className="w-full p-3 pr-12 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-600">
                      <i className="fas fa-arrow-up transform rotate-45"></i>
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-4">Your data is secure and encrypted. We comply with HIPAA and all applicable healthcare regulations.</p>
                  <button className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition duration-300">
                    Try AI Health Assistant Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-20 mt-8">
 <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Our Specialist Doctors</h2>
 <p className="text-gray-600 max-w-2xl mx-auto">India's leading medical experts available for video consultations on MediConnect.</p>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 -mt-8">
          {/* Doctor Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 card-hover">
            <div className="relative">
              <img 
                src="\src\assets\images\dr.soumya.png" 
                alt="Dr. Rajib De"
                className="w-full h-56 object-cover object-center"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-purple-600 flex items-center">
                <i className="fas fa-star text-yellow-400 mr-1"></i>
                4.9
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800">Dr. Soumya Mukherjee</h3>
              <p className="text-purple-600 font-medium">Haemato-Oncology</p>
              <p className="text-gray-600 text-sm mt-1">MBBS, MD, DM</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-gray-500 text-sm">15+ years experience</span>
                <span className="text-gray-500 text-sm">356 reviews</span>
              </div>
              <button className="mt-6 w-full bg-gradient-primary text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition duration-300">
                Book Appointment
              </button>
            </div>
          </div>

          {/* Doctor Card 2 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 card-hover">
            <div className="relative">
              <img 
                src="\src\assets\images\dr.rajat.png" 
                alt="Dr. Sharat Damodar"
                className="w-full h-56 object-cover object-center"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-purple-600 flex items-center">
                <i className="fas fa-star text-yellow-400 mr-1"></i>
                4.8
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800">Dr. Rajat Kar</h3>
              <p className="text-purple-600 font-medium">Haemato-Oncology</p>
              <p className="text-gray-600 text-sm mt-1">MBBS, DNB, DM</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-gray-500 text-sm">20+ years experience</span>
                <span className="text-gray-500 text-sm">289 reviews</span>
              </div>
              <button className="mt-6 w-full bg-gradient-primary text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition duration-300">
                Book Appointment
              </button>
            </div>
          </div>

          {/* Doctor Card 3 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 card-hover">
            <div className="relative">
              <img 
                src="\src\assets\images\dr.pragati.png" 
                alt="Dr. Sisir Kumar Patra"
                className="w-full h-56 object-cover object-center"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-purple-600 flex items-center">
                <i className="fas fa-star text-yellow-400 mr-1"></i>
                4.7
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800">Dr. Pragati Kumar Patra</h3>
              <p className="text-purple-600 font-medium">Obstretics</p>
              <p className="text-gray-600 text-sm mt-1">MBBS, MD, Fellowship</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-gray-500 text-sm">12+ years experience</span>
                <span className="text-gray-500 text-sm">240 reviews</span>
              </div>
              <button className="mt-6 w-full bg-gradient-primary text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition duration-300">
                Book Appointment
              </button>
            </div>
          </div>

          {/* Doctor Card 4 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 card-hover">
            <div className="relative">
              <img 
                src="\src\assets\images\dr.sujata.png" 
                alt="Dr. Sumanta Chatterjee"
                className="w-full h-56 object-cover object-center"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-purple-600 flex items-center">
                <i className="fas fa-star text-yellow-400 mr-1"></i>
                4.9
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800">Dr. Sujata Chatterjee</h3>
              <p className="text-purple-600 font-medium">Cardiology</p>
              <p className="text-gray-600 text-sm mt-1">MBBS, MD (General Medicine)</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-gray-500 text-sm">12+ years experience</span>
                <span className="text-gray-500 text-sm">325 reviews</span>
              </div>
              <button className="mt-6 w-full bg-gradient-primary text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition duration-300">
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
 <button className="bg-white text-purple-600 px-8 py-4 rounded-full border border-purple-200 font-medium hover:shadow-lg transition duration-300 hover:bg-purple-50">
   View All Doctors <i className="fas fa-arrow-right ml-2"></i>
 </button>
</div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8">Get the latest health tips and updates from our experts</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 p-3 border border-gray-300 rounded-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                className="bg-gradient-primary text-white px-6 py-3 rounded-lg sm:rounded-l-none font-medium hover:shadow-lg transition"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-1 md:py-1 mb-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Patients Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Hear from our satisfied patients about their experience with MediConnect</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 relative">
            <div className="absolute -top-4 left-8 text-purple-600 text-5xl">"</div>
            <div className="pt-4">
              <p className="text-gray-600 mb-6">
                I was skeptical about online consultations, but MediConnect changed my perception completely. The doctors are professional and the platform is very user-friendly.
              </p>
              <div className="flex items-center">
                <img 
                  src="src/assets/images/himanshu.png" 
                  alt="Himanshu Dubey"
                  className="w-12 h-12 rounded-full mr-4 object-cover" 
                />
                <div>
                  <h4 className="font-bold">Himanshu Dubey</h4>
                  <div className="flex text-yellow-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 relative">
            <div className="absolute -top-4 left-8 text-purple-600 text-5xl">"</div>
            <div className="pt-4">
              <p className="text-gray-600 mb-6">
                The AI health assistant provided me with useful information when I needed it most. Later, the doctor was able to see my entire medical history which made the consultation very effective.
              </p>
              <div className="flex items-center">
                <img 
                  src="src/assets/images/prachi.jpg" 
                  alt="Prachi Srivastav"
                  className="w-12 h-12 rounded-full mr-4 object-cover" 
                />
                <div>
                  <h4 className="font-bold">Prachi Srivastav</h4>
                  <div className="flex text-yellow-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 relative">
            <div className="absolute -top-4 left-8 text-purple-600 text-5xl">"</div>
            <div className="pt-4">
              <p className="text-gray-600 mb-6">
                The convenience of booking appointments anytime and the reminder system are fantastic. I never miss my medication now. Thank you MediConnect for making healthcare so accessible!
              </p>
              <div className="flex items-center">
                <img 
                  src="src/assets/images/saitya.png" 
                  alt="Saitya Dhar"
                  className="w-12 h-12 rounded-full mr-4 object-cover" 
                />
                <div>
                  <h4 className="font-bold">Saitya Dhar</h4>
                  <div className="flex text-yellow-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;