import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import PatientService from '../services/PatientService';
import axios from 'axios';

const HealthRecordsPage = () => {
  const { user, token } = useAuth();
  const { patientProfile, updatePatientProfile } = usePatient(); // Add updatePatientProfile
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: '',
    file: null,
    notes: '',
    hospital: ''
  });
  const [uploading, setUploading] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  
  useEffect(() => {
    fetchHealthRecords();
  }, [user, token, patientProfile]);
  
  const fetchHealthRecords = async () => {
    if (!user || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let patientId = patientProfile?.id;
      
      // If no patient profile, try to get/create patient info
      if (!patientId) {
        console.log('No patient profile found, fetching/creating via API...');
        try {
          const result = await PatientService.getPatientByUserId(user.id);

if (result.success && result.data && result.data.id) {
  patientId = result.data.id;
  setCurrentPatientId(patientId);
  
  // Update the patient context if available
  if (updatePatientProfile) {
    updatePatientProfile(result.data);
  }
  
  console.log('✅ Patient profile found/created with ID:', patientId);
} else {
  throw new Error(result.error || 'Invalid patient data received');
}
          
        } catch (patientError) {
          console.error('❌ Error fetching/creating patient:', patientError);
          
          if (patientError.response?.status === 403) {
            setError('Access denied. Please ensure you have the correct permissions.');
          } else if (patientError.response?.status === 404) {
            setError('User account not found. Please contact support.');
          } else {
            setError('Failed to set up patient profile. Please try refreshing the page or contact support.');
          }
          setLoading(false);
          return;
        }
      } else {
        setCurrentPatientId(patientId);
      }
      
      console.log('🔍 Fetching medical records for patient ID:', patientId);
      
      // Fetch health records using the patient ID
      try {
        const recordsResponse = await axios.get(`/api/medical-records/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📋 Medical records response:', recordsResponse.data);
        setRecords(Array.isArray(recordsResponse.data) ? recordsResponse.data : []);
        
      } catch (recordsError) {
        console.error('⚠️ Error fetching medical records:', recordsError);
        
        if (recordsError.response?.status === 404) {
          // This is fine - just means no records exist yet
          console.log('ℹ️ No medical records found (this is normal for new patients)');
          setRecords([]);
        } else {
          console.error('❌ Failed to fetch medical records:', recordsError);
          setRecords([]);
          // Don't show error for missing records, just log it
        }
      }
      
    } catch (err) {
      console.error('❌ General error in fetchHealthRecords:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get record categories with counts
  const getRecordCategories = () => {
    const categories = {
      all: { label: 'All Records', count: records.length, icon: 'fas fa-folder-open' },
      prescription: { label: 'Prescriptions', count: 0, icon: 'fas fa-prescription-bottle-alt' },
      lab_report: { label: 'Lab Reports', count: 0, icon: 'fas fa-flask' },
      discharge_summary: { label: 'Discharge Summaries', count: 0, icon: 'fas fa-file-medical-alt' },
      consultation: { label: 'Consultations', count: 0, icon: 'fas fa-stethoscope' },
      other: { label: 'Other', count: 0, icon: 'fas fa-file' }
    };

    records.forEach(record => {
      const type = (record.type || '').toLowerCase();
      if (categories[type]) {
        categories[type].count++;
      } else {
        categories.other.count++;
      }
    });

    return categories;
  };

  // Filter and sort records
  const getFilteredRecords = () => {
    let filtered = records;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(record => {
        const type = (record.type || '').toLowerCase();
        return type === activeCategory || (activeCategory === 'other' && !['prescription', 'lab_report', 'discharge_summary', 'consultation'].includes(type));
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        (record.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort records
    filtered.sort((a, b) => {
      const dateA = new Date(a.recordDate || 0);
      const dateB = new Date(b.recordDate || 0);
      
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return filtered;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format record type for display
  const formatRecordType = (type) => {
    if (!type) return 'Other';
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.title || !uploadForm.type || !uploadForm.file) {
      alert('Please fill all required fields');
      return;
    }

    const patientId = currentPatientId || patientProfile?.id;
    if (!patientId) {
      alert('Patient profile not found. Please refresh the page.');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      
      // Use the correct API path for upload
      const uploadResponse = await axios.post(`/api/medical-records/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        params: {
          patientId: patientId,
          doctorId: 1, // You might want to get this from context or form
          title: uploadForm.title,
          type: uploadForm.type,
          hospital: uploadForm.hospital || '',
          notes: uploadForm.notes || ''
        }
      });

      if (uploadResponse.data) {
        setUploadModalOpen(false);
        setUploadForm({ title: '', type: '', file: null, notes: '', hospital: '' });
        fetchHealthRecords(); // Refresh the records
        alert('Record uploaded successfully!');
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 404) {
        alert('Upload service not available. Please contact support.');
      } else {
        alert('Failed to upload record. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Handle download
  const handleDownload = async (record) => {
    if (!record.documentPath) {
      alert('No document available for download');
      return;
    }

    try {
      // Extract filename from documentPath
      const filename = record.documentPath.split('/').pop();
      
      const response = await axios.get(`/api/medical-records/download/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  const filteredRecords = getFilteredRecords();
  const categories = getRecordCategories();

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your health records...</p>
          <p className="text-gray-500 text-sm mt-2">Setting up your patient profile...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="pt-32 pb-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-lg p-8">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-circle text-red-500 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Records</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={fetchHealthRecords}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-refresh mr-2"></i>
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                <i className="fas fa-file-medical text-purple-600 mr-3"></i>
                Health Records
              </h1>
              <p className="text-gray-600 text-lg">Manage your medical documents securely</p>
              {currentPatientId && (
                <p className="text-sm text-green-600 mt-1">
                  <i className="fas fa-check-circle mr-1"></i>
                  Patient Profile Active (ID: {currentPatientId})
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={() => setUploadModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                disabled={!currentPatientId}
              >
                <i className="fas fa-upload mr-2"></i>
                Upload Record
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(categories).slice(0, 4).map(([key, category]) => (
            <div 
              key={key}
              className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
                activeCategory === key ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-purple-200'
              }`}
              onClick={() => setActiveCategory(key)}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeCategory === key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <i className={category.icon}></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{category.count}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700 mt-2">{category.label}</p>
            </div>
          ))}
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Title</option>
              </select>

              {/* View Mode */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === key
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={`${category.icon} mr-2`}></i>
                {category.label}
                {category.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeCategory === key ? 'bg-white text-purple-600' : 'bg-white text-gray-600'
                  }`}>
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Records Display */}
        {filteredRecords.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredRecords.map(record => (
              <div 
                key={record.id} 
                className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-purple-200 ${
                  viewMode === 'list' ? 'flex items-center p-4' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                          {record.title || `Medical Record #${record.id}`}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(record.recordDate)}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (record.type || '').toLowerCase() === 'prescription' ? 'bg-green-100 text-green-700' :
                        (record.type || '').toLowerCase() === 'lab_report' ? 'bg-blue-100 text-blue-700' :
                        (record.type || '').toLowerCase() === 'discharge_summary' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {formatRecordType(record.type)}
                      </div>
                    </div>

                    {/* Content */}
                    {record.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {record.notes}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="fas fa-user-md mr-2 text-purple-500"></i>
                        <span>Dr. {record.doctorName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="fas fa-hospital mr-2 text-blue-500"></i>
                        <span>{record.hospital || 'Not specified'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      {record.documentPath ? (
                        <button 
                          onClick={() => handleDownload(record)}
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center"
                        >
                          <i className="fas fa-download mr-1"></i>
                          Download
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No file attached</span>
                      )}
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fas fa-ellipsis-h"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  // List view
                  <>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {record.title || `Medical Record #${record.id}`}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          (record.type || '').toLowerCase() === 'prescription' ? 'bg-green-100 text-green-700' :
                          (record.type || '').toLowerCase() === 'lab_report' ? 'bg-blue-100 text-blue-700' :
                          (record.type || '').toLowerCase() === 'discharge_summary' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {formatRecordType(record.type)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatDate(record.recordDate)}</span>
                        <span>Dr. {record.doctorName || 'N/A'}</span>
                        <span>{record.hospital || 'Not specified'}</span>
                      </div>
                    </div>
                    {record.documentPath ? (
                      <button 
                        onClick={() => handleDownload(record)}
                        className="ml-4 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center"
                      >
                        <i className="fas fa-download mr-2"></i>
                        Download
                      </button>
                    ) : (
                      <span className="ml-4 text-gray-400 text-sm">No file</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file-medical-alt text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No records found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 
                `No records match "${searchTerm}"` : 
                activeCategory === 'all' ? 
                  "You don't have any medical records yet." : 
                  `You don't have any ${categories[activeCategory]?.label.toLowerCase()} yet.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Search
                </button>
              )}
              {activeCategory !== 'all' && (
                <button 
                  onClick={() => setActiveCategory('all')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View All Records
                </button>
              )}
              <button 
                onClick={() => setUploadModalOpen(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                disabled={!currentPatientId}
              >
                <i className="fas fa-upload mr-2"></i>
                Upload New Record
              </button>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {uploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Upload Medical Record</h3>
                <button 
                  onClick={() => setUploadModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter document title..."
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select 
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="prescription">Prescription</option>
                    <option value="lab_report">Lab Report</option>
                    <option value="discharge_summary">Discharge Summary</option>
                    <option value="consultation">Consultation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital/Clinic
                  </label>
                  <input
                    type="text"
                    placeholder="Enter hospital or clinic name..."
                    value={uploadForm.hospital}
                    onChange={(e) => setUploadForm({...uploadForm, hospital: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                    <p className="text-gray-600">Click to select a file</p>
                    <p className="text-sm text-gray-500 mt-1">Supports PDF, JPG, PNG files up to 10MB</p>
                    <input 
                      type="file" 
                      onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                      className="mt-2" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {uploadForm.file && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {uploadForm.file.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Add any additional notes..."
                    rows="3"
                    value={uploadForm.notes}
                    onChange={(e) => setUploadForm({...uploadForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={uploading || !currentPatientId}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload mr-2"></i>
                        Upload Record
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthRecordsPage;
                