import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ContactContext = createContext();

export const useContacts = () => useContext(ContactContext);

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuth();

  // Fetch all contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/contact/get');
      console.log(response.data.contacts);
      setContacts(response.data.contacts || []);
      return response.data.contacts || [];
    } catch (err) {
      setError('Failed to fetch contacts');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load contacts on mount
  useEffect(() => {
    fetchContacts();
  }, [isAuthenticated]);

  return (
    <ContactContext.Provider value={{
      contacts,
      setContacts,
      loading,
      setLoading,
      error,
      setError,
      fetchContacts
    }}>
      {children}
    </ContactContext.Provider>
  );
};

export default ContactContext;