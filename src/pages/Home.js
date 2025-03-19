import React from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <div className="dashboard-container">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="main-content">
          <header className="dashboard-header">
            Dashboard
          </header>

          <div className="profile-section">
            <div className="profile-card">
              <h2 className="section-title">Profile</h2>

              <div className="profile-info">
                <div className="info-group">
                  <span className="info-label">Name</span>
                  <span className="info-value">{user?.name || "Undefined"}</span>
                </div>

                <div className="info-group">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email || "Undefined"}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Role</span>
                  <span className="info-value">{user?.role || "User"}</span>
                </div>

                <div className="info-group">
                  <span className="info-label">Joined</span>
                  <span className="info-value">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "25/02/2025"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default Home;
