import React, { useState } from 'react';
import { useContacts } from '../context/ContactContext';
import api from '../services/api';
import './Contacts.css';
import Sidebar from '../components/Sidebar';

const Contacts = () => {
  const { contacts, setContacts, loading, setLoading, error, setError} = useContacts();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editContactId, setEditContactId] = useState(null);
  
  // Handle form submission for creating new contact
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    if (!name || !email || !phoneNo) {
      setFormError('Name, email, and phone number are required');
      return;
    }

    try {
      setLoading(true);
      
      if (editMode) {
        // Update existing contact
        const response = await api.put(`/contact/edit/${editContactId}`, {
          name, email, phoneNo, description
        });
        console.log(response.data.contact);
        // Update the contacts list
        setContacts(contacts.map(contact => 
          contact._id === editContactId ? response.data.contact : contact
        ));
        
        setFormSuccess('Contact updated successfully!');
        setEditMode(false);
        setEditContactId(null);
      } else {
        // Create new contact
        const response = await api.post('/contact/new', {
          name, email, phoneNo, description
        });
        
        // Add to contacts list
        setContacts([...contacts, response.data.contact]);
        setFormSuccess('Contact created successfully!');
      }
      
      // Reset form
      setName('');
      setEmail('');
      setPhoneNo('');
      setDescription('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess('');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
        (editMode ? 'Failed to update contact' : 'Failed to create contact');
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete contact
  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        setLoading(true);
        await api.delete(`/contact/delete/${contactId}`);
        
        // Update contacts list
        setContacts(contacts.filter(contact => contact._id !== contactId));
        setFormSuccess('Contact deleted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setFormSuccess('');
        }, 3000);
      } catch (err) {
        setError('Failed to delete contact');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle edit contact (populate form with contact data)
  const handleEdit = (contact) => {
    setName(contact.name);
    setEmail(contact.email);
    setPhoneNo(contact.phoneNo);
    setDescription(contact.description || '');
    setEditMode(true);
    setEditContactId(contact._id);
  };
  
  // Cancel edit mode
  const handleCancelEdit = () => {
    setName('');
    setEmail('');
    setPhoneNo('');
    setDescription('');
    setEditMode(false);
    setEditContactId(null);
  };

  return (
    <div className="contacts-page">
      <Sidebar/>
      <h1>Contact Management</h1>
      
      <div className="contacts-container">
        <div className="contact-form-section">
          <h2>{editMode ? 'Edit Contact' : 'Add New Contact'}</h2>
          {formError && <div className="error-message">{formError}</div>}
          {formSuccess && <div className="success-message">{formSuccess}</div>}
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name*</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contact name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contact email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNo">Phone Number*</label>
              <input
                type="tel"
                id="phoneNo"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                placeholder="Contact phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this contact"
                rows="3"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                {editMode ? 'Update Contact' : 'Add Contact'}
              </button>
              
              {editMode && (
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="contacts-list-section">
          <h2>Your Contacts</h2>
          
          {loading ? (
            <p className="loading-state">Loading contacts...</p>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : contacts.length === 0 ? (
            <p className="empty-state">No contacts found. Add your first contact using the form.</p>
          ) : (
            <div className="table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact._id}>
                      <td>{contact.name || 'Unnamed Contact'}</td>
                      <td>{contact.email || 'No email'}</td>
                      <td>{contact.phoneNo || 'No phone'}</td>
                      <td>{contact.description || '-'}</td>
                      <td className="actions-cell">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(contact)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(contact._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;