import HttpClient from './HttpClient';
import { ADMIN_ENDPOINTS } from '../config/apiConfig';

class AdminService {
  // ==================== USER MANAGEMENT ====================
  
  // Get all users
  async getAllUsers() {
    try {
      const response = await HttpClient.get(ADMIN_ENDPOINTS.USERS);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching all users:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch users.' };
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      const response = await HttpClient.get(ADMIN_ENDPOINTS.USERS_BY_ROLE(role));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch users by role.' };
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const response = await HttpClient.get(ADMIN_ENDPOINTS.STATS);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch stats.' };
    }
  }

  // ==================== PATIENT CRUD ====================
  
  // Get all patients  
  async getAllPatients() {
    try {
      const response = await HttpClient.get(ADMIN_ENDPOINTS.PATIENTS);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patients.' };
    }
  }

  // Create patient
  async createPatient(patientData) {
    try {
      console.log('➕ AdminService: Creating new patient');
      const response = await HttpClient.post('/api/admin/patients', patientData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error creating patient:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to create patient.' };
    }
  }

  // Update patient
  async updatePatient(id, patientData) {
    try {
      console.log('📝 AdminService: Updating patient ID:', id);
      const response = await HttpClient.put(`/api/admin/patients/${id}`, patientData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error updating patient:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update patient.' };
    }
  }

  // Delete patient
  async deletePatient(id) {
    try {
      console.log('🗑️ AdminService: Deleting patient ID:', id);
      const response = await HttpClient.delete(`/api/admin/patients/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error deleting patient:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to delete patient.' };
    }
  }

  // ==================== ADMIN CRUD ====================
  
  // Get all admins
  async getAllAdmins() {
    try {
      console.log('🔍 AdminService: Fetching all admins');
      const response = await HttpClient.get(ADMIN_ENDPOINTS.ADMINS);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error fetching admins:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch admins.' };
    }
  }

  // Get admin by ID
  async getAdminById(adminId) {
    try {
      console.log('🔍 AdminService: Fetching admin by ID:', adminId);
      const response = await HttpClient.get(`/api/admin/admins/${adminId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error fetching admin by ID:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch admin.' };
    }
  }

  // Create new admin
  async createAdmin(adminData) {
    try {
      console.log('➕ AdminService: Creating new admin', adminData);
      const response = await HttpClient.post('/api/admin/admins', adminData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error creating admin:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to create admin.' };
    }
  }

  // Update admin
  async updateAdmin(adminId, adminData) {
    try {
      console.log('📝 AdminService: Updating admin ID:', adminId, adminData);
      const response = await HttpClient.put(`/api/admin/admins/${adminId}`, adminData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error updating admin:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update admin.' };
    }
  }

  // Delete admin with protection for last admin and self-deletion
// Delete admin with protection for last admin and self-deletion
async deleteAdmin(adminId, currentUser = null) {
  try {
    console.log('🗑️ AdminService: Attempting to delete admin ID:', adminId);
    console.log('🔍 Current user:', currentUser);
    
    // CLIENT-SIDE VALIDATION: Check if trying to delete self
    if (currentUser && currentUser.id === adminId) {
      console.warn('⚠️ Cannot delete self');
      return { 
        success: false, 
        error: 'You cannot delete your own admin account.',
        errorCode: 'CANNOT_DELETE_SELF'
      };
    }
    
    // CLIENT-SIDE VALIDATION: Check admin count
    const adminResult = await this.getAllAdmins();
    if (!adminResult.success) {
      return { success: false, error: 'Could not verify admin count' };
    }
    
    const adminCount = adminResult.data.length;
    if (adminCount <= 1) {
      console.warn('⚠️ Cannot delete last admin');
      return { 
        success: false, 
        error: 'Cannot delete the last admin. At least one admin must remain in the system.',
        errorCode: 'CANNOT_DELETE_LAST_ADMIN'
      };
    }
    
    // Create headers with current user ID
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // FIXED: Add current user ID to headers for server-side validation
    if (currentUser && currentUser.id) {
      headers['X-Current-User-Id'] = currentUser.id.toString();
      console.log('📤 Sending current user ID in header:', currentUser.id);
    } else {
      console.warn('⚠️ No current user ID available to send in header');
    }
    
    const response = await HttpClient.delete(`/api/admin/admins/${adminId}`, { headers });
    console.log('✅ Admin deleted successfully');
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error('❌ Error deleting admin:', error);
    
    // Handle specific error responses from server
    if (error.response?.data?.errorCode) {
      return { 
        success: false, 
        error: error.response.data.message,
        errorCode: error.response.data.errorCode
      };
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to delete admin.'
    };
  }
}  // Check if admin can be deleted (helper method)
  // Enhanced method to check if admin can be deleted
async canDeleteAdmin(adminId, currentUser = null) {
  try {
    // Quick client-side checks first
    if (currentUser && currentUser.id === adminId) {
      return { 
        canDelete: false, 
        reason: 'You cannot delete your own admin account',
        errorCode: 'CANNOT_DELETE_SELF'
      };
    }
    
    // Check admin count
    const adminResult = await this.getAllAdmins();
    if (!adminResult.success) {
      return { canDelete: false, reason: 'Could not verify admin count' };
    }
    
    const adminCount = adminResult.data.length;
    if (adminCount <= 1) {
      return { 
        canDelete: false, 
        reason: 'Cannot delete the last admin in the system',
        errorCode: 'CANNOT_DELETE_LAST_ADMIN'
      };
    }
    
    // All checks passed
    return { canDelete: true, reason: null };
    
  } catch (error) {
    console.error('❌ Error checking if admin can be deleted:', error);
    return { canDelete: false, reason: 'Error checking admin deletion permissions' };
  }
}
}

export default new AdminService();