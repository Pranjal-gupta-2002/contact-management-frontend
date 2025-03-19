import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContactProvider } from './context/ContactContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Contacts from './pages/Contacts';
import Navbar from './components/Navbar';
import api from './services/api';
import './App.css';
import Team from './pages/Team';
import TeamPage from './pages/TeamPage';
import UserManagement from './pages/UsersManagement.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="loading">Loading...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};
const AdminProtectedRoute = ({ children }) => {
  const { user,isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="loading">Loading...</div>;
  
  return isAuthenticated? user.role === 'admin' ? children : <Navigate to="/" /> : <Navigate to="/login" />;
};

function AppContent() {
  const { setUser, setIsAuthenticated, isAuthenticated, setLoading } = useAuth();
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/user/me');
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [setUser, setIsAuthenticated, setLoading]);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to={'/'}/> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to={'/'}/> : <Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            } />
            <Route path="/team/:teamId" element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            } />
            <Route path="/user-management" element={
              <AdminProtectedRoute>
                <UserManagement />
              </AdminProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ContactProvider>
        <AppContent />
      </ContactProvider>
    </AuthProvider>
  );
}

export default App;