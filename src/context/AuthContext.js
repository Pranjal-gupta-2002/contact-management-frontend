import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Logout function - keep this in context as it's used across multiple components


  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      isAuthenticated, 
      setIsAuthenticated,
      loading, 
      setLoading,
      
    }}>
      {children}
    </AuthContext.Provider>
  );
};