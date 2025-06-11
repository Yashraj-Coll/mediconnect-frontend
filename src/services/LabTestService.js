// LabTestService.js - Updated to match your backend endpoints

import httpClient from '../services/HttpClient';

class LabTestService {
    
    // Book a lab test - Updated to match your backend endpoint
    async bookLabTest(bookingData) {
        try {
            console.log('🧪 Booking lab test with data:', bookingData);
            const response = await httpClient.post('/api/lab-tests/book', bookingData);
            console.log('🧪 Lab test booking response:', response);
            return response;
        } catch (error) {
            console.error('❌ Error booking lab test:', error);
            throw error;
        }
    }

    // Alternative method name for compatibility
    async createLabTestBooking(bookingData) {
        return this.bookLabTest(bookingData);
    }

    // Get lab test booking by ID - Updated to match your backend endpoint
    async getLabTestBookingById(bookingId) {
        try {
            console.log('🧪 Fetching lab test booking details for ID:', bookingId);
            const response = await httpClient.get(`/api/lab-tests/booking/${bookingId}`);
            console.log('🧪 Lab test booking details response:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching lab test booking details:', error);
            throw error;
        }
    }

    // Get patient's lab test bookings - Updated to match your backend endpoint
    async getPatientLabTestBookings(patientId) {
        try {
            console.log('🧪 Fetching patient lab test bookings for ID:', patientId);
            const response = await httpClient.get(`/api/lab-tests/patient/${patientId}`);
            console.log('🧪 Patient lab test bookings response:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching patient lab test bookings:', error);
            throw error;
        }
    }

    // Update lab test booking status - Updated to match your backend endpoint
    async updateLabTestBookingStatus(bookingId, status) {
        try {
            console.log('🧪 Updating lab test booking status:', { bookingId, status });
            const response = await httpClient.put(`/api/lab-tests/booking/${bookingId}/status`, { status });
            console.log('🧪 Lab test status update response:', response);
            return response;
        } catch (error) {
            console.error('❌ Error updating lab test booking status:', error);
            throw error;
        }
    }

    // Cancel lab test booking - Updated to match your backend endpoint
    async cancelLabTestBooking(bookingId, reason) {
        try {
            console.log('🧪 Cancelling lab test booking:', { bookingId, reason });
            const response = await httpClient.put(`/api/lab-tests/booking/${bookingId}/cancel`, { reason });
            console.log('🧪 Lab test cancellation response:', response);
            return response;
        } catch (error) {
            console.error('❌ Error cancelling lab test booking:', error);
            throw error;
        }
    }

    // Update payment status - New method to match your backend endpoint
    async updatePaymentStatus(bookingId, isPaid) {
        try {
            console.log('💳 Updating payment status for lab test booking:', { bookingId, isPaid });
            const response = await httpClient.put(`/api/lab-tests/booking/${bookingId}/payment`, { isPaid });
            console.log('💳 Payment status update response:', response);
            return response;
        } catch (error) {
            console.error('❌ Error updating payment status:', error);
            throw error;
        }
    }

    // Get all lab test bookings (admin) - Updated to match your backend endpoint
    async getAllLabTestBookings() {
        try {
            console.log('🧪 Fetching all lab test bookings');
            const response = await httpClient.get('/api/lab-tests/all');
            console.log('🧪 All lab test bookings response:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching all lab test bookings:', error);
            throw error;
        }
    }

    // Static data methods for tests (since you don't have backend endpoints for these yet)
    
    // Get all available lab tests (static data for now)
    getLabTests() {
        console.log('🧪 Getting static lab tests data');
        return Promise.resolve({
            success: true,
            data: this.getStaticLabTests()
        });
    }

    // Get lab test by ID (static data for now)
    getLabTestById(id) {
        console.log('🧪 Getting static lab test by ID:', id);
        const tests = this.getStaticLabTests();
        const test = tests.find(t => t.id === parseInt(id));
        return Promise.resolve({
            success: !!test,
            data: test || null
        });
    }

    // Get lab tests by category (static data for now)
    getLabTestsByCategory(category) {
        console.log('🧪 Getting static lab tests by category:', category);
        const tests = this.getStaticLabTests();
        const filteredTests = category === 'all' ? tests : tests.filter(t => t.category === category);
        return Promise.resolve({
            success: true,
            data: filteredTests
        });
    }

    // Get lab test categories (static data)
    getLabTestCategories() {
        console.log('📂 Getting static lab test categories');
        return Promise.resolve({
            success: true,
            data: [
                { id: 'all', name: 'All Tests' },
                { id: 'blood', name: 'Blood Tests' },
                { id: 'imaging', name: 'Imaging' },
                { id: 'cardiology', name: 'Cardiology' },
                { id: 'diabetes', name: 'Diabetes' },
                { id: 'covid', name: 'COVID-19' }
            ]
        });
    }

    // Static lab tests data
    getStaticLabTests() {
        return [
            { 
                id: 1, 
                name: 'Complete Blood Count (CBC)', 
                price: 599, 
                description: 'Analysis of different blood cells to evaluate overall health and detect disorders.',
                category: 'blood',
                sampleType: 'Blood',
                processingTime: '24 hours',
                homeCollection: true
            },
            { 
                id: 2, 
                name: 'Lipid Profile', 
                price: 799, 
                description: 'Measures the amount of cholesterol and fats in your blood.',
                category: 'blood',
                sampleType: 'Blood',
                processingTime: '24 hours',
                homeCollection: true
            },
            { 
                id: 3, 
                name: 'X-Ray Chest', 
                price: 1299, 
                description: 'Produces images of the heart, lungs, airways, blood vessels and bones in the chest.',
                category: 'imaging',
                sampleType: 'N/A',
                processingTime: '1 hour',
                homeCollection: false
            },
            { 
                id: 4, 
                name: 'ECG', 
                price: 699, 
                description: 'Records the electrical activity of the heart to detect abnormalities.',
                category: 'cardiology',
                sampleType: 'N/A',
                processingTime: 'Immediate',
                homeCollection: true
            },
            { 
                id: 5, 
                name: 'HbA1c', 
                price: 899, 
                description: 'Measures average blood glucose levels over the past 2-3 months.',
                category: 'diabetes',
                sampleType: 'Blood',
                processingTime: '24 hours',
                homeCollection: true
            },
            { 
                id: 6, 
                name: 'COVID-19 RT-PCR Test', 
                price: 1499, 
                description: 'Detects the presence of SARS-CoV-2 virus that causes COVID-19.',
                category: 'covid',
                sampleType: 'Nasal Swab',
                processingTime: '24-48 hours',
                homeCollection: true
            }
        ];
    }

    // Search lab tests (static data for now)
    searchLabTests(query) {
        console.log('🔍 Searching static lab tests with query:', query);
        const tests = this.getStaticLabTests();
        const filteredTests = tests.filter(test => 
            test.name.toLowerCase().includes(query.toLowerCase()) ||
            test.description.toLowerCase().includes(query.toLowerCase()) ||
            test.category.toLowerCase().includes(query.toLowerCase())
        );
        return Promise.resolve({
            success: true,
            data: filteredTests
        });
    }

    // Get popular lab tests (static data for now)
    getPopularLabTests() {
        console.log('⭐ Getting popular lab tests');
        const popularTests = this.getStaticLabTests().slice(0, 3); // First 3 tests as popular
        return Promise.resolve({
            success: true,
            data: popularTests
        });
    }

    // Calculate lab test booking fees
    calculateFees(testPrice, registrationFee = 50, taxRate = 0.18) {
        const subtotal = testPrice + registrationFee;
        const taxAmount = Math.round(subtotal * taxRate);
        const totalAmount = subtotal + taxAmount;

        return {
            testPrice: testPrice,
            registrationFee: registrationFee,
            taxAmount: taxAmount,
            totalAmount: totalAmount
        };
    }

    // Validate lab test booking data
    validateBookingData(bookingData) {
        const errors = {};

        if (!bookingData.patientId) {
            errors.patientId = 'Patient ID is required';
        }

        if (!bookingData.testName) {
            errors.testName = 'Test name is required';
        }

        if (!bookingData.testPrice || bookingData.testPrice <= 0) {
            errors.testPrice = 'Valid test price is required';
        }

        if (!bookingData.totalAmount || bookingData.totalAmount <= 0) {
            errors.totalAmount = 'Valid total amount is required';
        }

        if (!bookingData.patientEmail) {
            errors.patientEmail = 'Patient email is required';
        }

        if (!bookingData.patientPhone) {
            errors.patientPhone = 'Patient phone is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    // Legacy methods for backward compatibility
    async getPatientLabTests(patientId) {
        return this.getPatientLabTestBookings(patientId);
    }

    async updateLabTestStatus(bookingId, status) {
        return this.updateLabTestBookingStatus(bookingId, status);
    }

    async cancelLabTest(bookingId, reason) {
        return this.cancelLabTestBooking(bookingId, reason);
    }

    // Placeholder methods for features not yet implemented in backend
    async getLabTestReports(bookingId) {
        console.log('📄 Lab test reports feature not implemented yet');
        return Promise.resolve({
            success: false,
            message: 'Lab test reports feature not implemented yet'
        });
    }

    async downloadLabTestReport(bookingId, reportId) {
        console.log('⬇️ Lab test report download feature not implemented yet');
        return Promise.resolve({
            success: false,
            message: 'Lab test report download feature not implemented yet'
        });
    }

    async getAvailableSlots(date, area) {
        console.log('🕐 Time slots feature not implemented yet');
        return Promise.resolve({
            success: false,
            message: 'Time slots feature not implemented yet'
        });
    }

    async validateCoupon(couponCode, testId) {
        console.log('🎟️ Coupon validation feature not implemented yet');
        return Promise.resolve({
            success: false,
            message: 'Coupon validation feature not implemented yet'
        });
    }
}

export default new LabTestService();