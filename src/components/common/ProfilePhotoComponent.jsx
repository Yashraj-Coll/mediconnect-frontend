import React, { useState, useRef } from 'react';
import axios from 'axios';

const ProfilePhotoComponent = ({ 
  profileImage, 
  patientId, 
  gender, 
  onPhotoUpdate, 
  className = "w-32 h-32" 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Default images based on gender
  const defaultMaleImage = '/assets/images/Profile Photo Man.jpg';
  const defaultFemaleImage = '/assets/images/Profile Photo Woman.jpg';
  
  // Get appropriate default image based on gender
  const getDefaultImage = () => {
    return gender?.toUpperCase() === 'FEMALE' ? defaultFemaleImage : defaultMaleImage;
  };

  // Get the image source to display
  const getImageSource = () => {
    // If profileImage starts with http or /, use it directly
    if (profileImage && (profileImage.startsWith('http') || profileImage.startsWith('/'))) {
      return profileImage;
    } 
    // If profileImage is a filename, construct API URL
    else if (profileImage) {
      return `/api/patients/${patientId}/profile-image/${profileImage}`;
    } 
    // Otherwise use default based on gender
    else {
      return getDefaultImage();
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Reset error
    setError(null);
    setLoading(true);

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload profile photo
      const response = await axios.post(
        `/api/patients/${patientId}/profile-image`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Call the callback with updated profile image path
      if (onPhotoUpdate && response.data) {
        onPhotoUpdate(response.data.fileName);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      setError('Failed to upload profile photo. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`${className} relative rounded-full overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-purple-400 transition`}
        onClick={handleClick}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : null}
        
        <img 
          src={getImageSource()} 
          alt="Profile" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = getDefaultImage();
          }}
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition">
          <div className="text-transparent hover:text-white">
            <i className="fas fa-camera text-2xl"></i>
          </div>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
      
      {error ? (
        <p className="text-red-600 text-xs mt-2">{error}</p>
      ) : (
        <button className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-3">
          Change Photo
        </button>
      )}
    </div>
  );
};

export default ProfilePhotoComponent;