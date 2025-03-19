import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import api from '../services/api';
import { useContacts } from '../context/ContactContext';

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated ,setUser} = useAuth();
  const navigate = useNavigate();
  const{setContacts} = useContacts();
  
  const handleLogout = async () => {
    await api.get('/user/logout');
    setUser(null);
    setIsAuthenticated(false);
    setContacts([]);
      navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          CMS
        </Link>
        
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;