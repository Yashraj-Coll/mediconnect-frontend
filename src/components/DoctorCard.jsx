import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";

// Profile image ka same logic
const getImageUrl = (profileImage, gender) => {
  if (!profileImage) {
    return gender === "FEMALE"
      ? "/images/Female Doctor.jpg"
      : "/images/Male Doctor.jpg";
  }
  if (
    profileImage.includes("default-profile.jpg") ||
    profileImage.includes("/assets/images/")
  ) {
    return gender === "FEMALE"
      ? "/images/Female Doctor.jpg"
      : "/images/Male Doctor.jpg";
  }
  return `${API_BASE_URL}/uploads/${profileImage}`;
};

const DoctorCard = ({ doctor }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Yeh pehle profileImage nikal lo
  const photoUrl = getImageUrl(doctor.profileImage, doctor.gender);

  const handleBook = (type) => {
  if (!isAuthenticated) {
    navigate(`/login?redirect=/appointment/${doctor.id}`);
  } else {
    navigate(`/appointment/${doctor.id}`, { state: { doctor, appointmentType: type } });
  }
};


  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px #0001",
        padding: 24,
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
      className="doctor-card"
    >
      {/* Profile Image */}
      <img
        src={photoUrl}
        alt={doctor.name}
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          objectFit: "cover",
          background: "#F5F6FA",
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            doctor.gender === "FEMALE"
              ? "/images/Female Doctor.jpg"
              : "/images/Male Doctor.jpg";
        }}
      />

      {/* Doctor Details */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 20 }}>{doctor.name}</div>
        <div style={{ color: "#7B61FF", fontWeight: 500, fontSize: 16 }}>
          {doctor.specialization}
        </div>
        <div style={{ color: "#555", margin: "2px 0 8px 0" }}>
          {doctor.education || "MD"}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span
            style={{
              color: "#3CC665",
              fontWeight: 500,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
            }}
          >
            <i className="fas fa-star" style={{ marginRight: 4 }} />{" "}
            {doctor.rating || "4.8"}
          </span>
          <span
            style={{
              color: "#555",
              background: "#F5F6FA",
              borderRadius: 6,
              padding: "2px 10px",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
            }}
          >
            <i className="fas fa-briefcase" style={{ marginRight: 4 }} />
            {doctor.yearsOfExperience || "10"} years
          </span>
          <span
            style={{
              color: "#4B51C1",
              background: "#E9F0FF",
              borderRadius: 6,
              padding: "2px 10px",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}
          >
            <i className="fas fa-id-card" style={{ marginRight: 4 }} />
            {doctor.licenseNumber || "MED12345"}
          </span>
        </div>
        {doctor.languages && doctor.languages.length > 0 && (
          <div style={{ color: "#888", fontSize: 14 }}>
            Languages: {doctor.languages.join(", ")}
          </div>
        )}
        {doctor.hospitalAffiliation && (
          <div style={{ color: "#888", fontSize: 14 }}>
            {doctor.hospitalAffiliation}
          </div>
        )}
      </div>
      {/* Fee, buttons */}
      <div style={{ minWidth: 180, textAlign: "right" }}>
        <div style={{ color: "#7B61FF", fontWeight: 700, fontSize: 20 }}>
          ₹{doctor.consultationFee}
        </div>
        <div style={{ color: "#888", fontWeight: 400, fontSize: 13 }}>
          + ₹350 (registration)
        </div>
        <button
          style={{
            background: "#7B61FF",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            marginTop: 12,
            width: "100%",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
          onClick={() => handleBook("VIDEO")}
        >
          Book Video Consultation
        </button>
        <button
          style={{
            background: "#fff",
            color: "#7B61FF",
            border: "1.5px solid #7B61FF",
            borderRadius: 8,
            padding: "10px 20px",
            marginTop: 8,
            width: "100%",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
          onClick={() => handleBook("PHYSICAL")}
        >
          Book In-person Visit
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
