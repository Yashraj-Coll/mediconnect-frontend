import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Spinner, 
  Alert 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import PatientService from '../services/PatientService';
import { useAuth } from '../context/AuthContext';

const PatientSelectionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Fetch patient data
  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Get only the primary patient
      if (user && user.id) {
        console.log('Fetching patient for user ID:', user.id);
        const response = await PatientService.getPatientByUserId(user.id);
        console.log('Patient API response:', response);
        
        if (response.success && response.data) {
          console.log('Patient data received:', response.data);
          const primaryPatient = {
            id: response.data.id,
            name: `${response.data.user?.firstName || user.firstName} ${response.data.user?.lastName || user.lastName}`,
            age: calculateAge(response.data.dateOfBirth),
            gender: response.data.gender === 'MALE' ? 'M' : response.data.gender === 'FEMALE' ? 'F' : 'O',
            phone: response.data.user?.phoneNumber || user.phoneNumber || '',
            relation: 'Self'
          };
          
          console.log('Processed patient data:', primaryPatient);
          setPatients([primaryPatient]);
          setSelectedPatient(primaryPatient); // Auto-select the primary patient
        } else {
          // No patient profile found
          console.warn('No patient profile found or API call unsuccessful', response);
          setError("No patient profile found. Please create your profile.");
        }
      } else {
        console.warn('User or user ID is missing, cannot fetch patient profile');
        setError("Unable to load your profile. Please try logging in again.");
      }
    } catch (err) {
      console.error("Error fetching patient:", err);
      setError("Failed to load patient data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('PatientSelectionPage - user data:', user);
    fetchPatients();
  }, [user]);

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  // Navigate to dashboard with selected patient
  const handleContinue = () => {
    if (selectedPatient) {
      console.log('Navigating to dashboard with patient ID:', selectedPatient.id);
      navigate(`/patient-dashboard/${selectedPatient.id}`);
    } else {
      setError("Please select a patient to continue.");
    }
  };

  // Navigate to create new patient profile
  const handleCreateNewProfile = () => {
    console.log('Navigating to create patient profile page');
    navigate('/create-patient-profile');
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Header as="h4" className="bg-primary text-white">
          Select Patient Profile
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {patients.length > 0 ? (
            <>
              <Row className="mb-4">
                <Col>
                  <p className="text-muted">
                    Select a patient profile to continue:
                  </p>
                </Col>
              </Row>
              
              <Row>
                {patients.map((patient) => (
                  <Col key={patient.id} md={6} lg={4} className="mb-3">
                    <Card 
                      className={`h-100 cursor-pointer ${selectedPatient?.id === patient.id ? 'border-primary' : ''}`}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex align-items-center mb-3">
                          <div className="me-3">
                            <FontAwesomeIcon 
                              icon={faUser} 
                              className="text-primary" 
                              size="2x" 
                            />
                          </div>
                          <div>
                            <h5 className="mb-0">{patient.name}</h5>
                            <p className="text-muted mb-0">
                              {patient.relation}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="mb-1"><strong>Age:</strong> {patient.age}</p>
                          <p className="mb-1"><strong>Gender:</strong> {patient.gender}</p>
                          {patient.phone && (
                            <p className="mb-0"><strong>Phone:</strong> {patient.phone}</p>
                          )}
                        </div>
                        <div className="mt-auto pt-3">
                          <Form.Check
                            type="radio"
                            id={`patient-${patient.id}`}
                            label="Select this profile"
                            checked={selectedPatient?.id === patient.id}
                            onChange={() => handlePatientSelect(patient)}
                            className="user-select-none"
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              <Row className="mt-4">
                <Col className="d-flex justify-content-between">
                  <Button 
                    variant="outline-secondary"
                    onClick={handleCreateNewProfile}
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Create New Profile
                  </Button>
                  
                  <Button 
                    variant="primary"
                    onClick={handleContinue}
                    disabled={!selectedPatient}
                  >
                    Continue
                  </Button>
                </Col>
              </Row>
            </>
          ) : (
            <div className="text-center py-5">
              <FontAwesomeIcon icon={faUserPlus} className="text-muted mb-3" size="3x" />
              <h5>No Patient Profiles Found</h5>
              <p className="text-muted">
                You don't have any patient profiles yet. Create your first profile to continue.
              </p>
              <Button 
                variant="primary"
                onClick={handleCreateNewProfile}
              >
                Create Patient Profile
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PatientSelectionPage;