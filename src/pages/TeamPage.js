import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './TeamPage.css';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const TeamPage = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [members, setMembers] = useState([]);
    const [newContact, setNewContact] = useState({
        name: "",
        email: "",
        phoneNo: "",
        description: ""
    });
    const [editingContact, setEditingContact] = useState(null);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchError, setSearchError] = useState("");
    const [permissions, setPermissions] = useState({
        canCreate: false,
        canEdit: false,
        canDelete: false
    });
    const { user } = useAuth();
    
    // New state for enhanced user management
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        fetchTeam();
        fetchContacts();
        fetchAllUsers(); // Fetch all users for the enhanced user management
    }, [teamId]);

    useEffect(() => {
        if (team && team.permissions) {
            setPermissions({
                canCreate: team.permissions.canCreate || false,
                canEdit: team.permissions.canEdit || false,
                canDelete: team.permissions.canDelete || false
            });
        }
    }, [team]);

    const fetchTeam = async () => {
        try {
            const response = await api.get(`/team/get-team/${teamId}`);
            setTeam(response.data.team);
            setMembers(response.data.team.members);
            // Set selected users based on current members
            if (response.data.team.members) {
                setSelectedUsers(response.data.team.members.map(member => member._id));
            }
        } catch (error) {
            console.error("Error fetching team:", error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await api.get(`/team/team-contact/${teamId}`);
            setContacts(response.data.contacts);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    // Fetch all users for the enhanced user management
    const fetchAllUsers = async () => {
        try {
            const response = await api.get("/user/getAllUsers");
            setAllUsers(response.data.users);
            setFilteredUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching all users:", error);
        }
    };

    const handleCreateContact = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/team/create-team-contact/${teamId}`, {
                teamId,
                ...newContact
            });
            setNewContact({ name: "", email: "", phoneNo: "", description: "" });
            fetchContacts();
        } catch (error) {
            console.error("Error creating contact:", error);
        }
    };

    const handleUpdateContact = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/team/edit-team-contact/${editingContact._id}`, {
                ...editingContact
            });
            setEditingContact(null);
            fetchContacts();
        } catch (error) {
            console.error("Error updating contact:", error);
        }
    };

    const handleDeleteContact = async () => {
        if (!contactToDelete) return;

        try {
            await api.delete(`/team/delete-team-contact/${contactToDelete._id}`);
            setContactToDelete(null);
            fetchContacts();
        } catch (error) {
            console.error("Error deleting contact:", error);
        }
    };

    const handleDeleteTeam = async () => {
        try {
            await api.delete(`/team/delete-team/${teamId}`);
            navigate('/team');
        } catch (error) {
            console.error("Error deleting team:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewContact({
            ...newContact,
            [name]: value
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingContact({
            ...editingContact,
            [name]: value
        });
    };

    const handlePermissionChange = (e) => {
        const { name, checked } = e.target;
        setPermissions({
            ...permissions,
            [name]: checked
        });
    };

    const handleUpdatePermissions = async () => {
        try {
            await api.put(`/team/update-team-permission/${teamId}`, {
                permissions
            });
            fetchTeam();
            setShowPermissionsModal(false);
        } catch (error) {
            console.error("Error updating permissions:", error);
        }
    };

    // Enhanced user search function
    const handleUserSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchTerm(query);

        if (!query) {
            setFilteredUsers(allUsers);
        } else {
            setFilteredUsers(
                allUsers.filter((user) =>
                    user.name.toLowerCase().includes(query) || 
                    (user.email && user.email.toLowerCase().includes(query))
                )
            );
        }
    };

    // Handle user selection with checkbox
    const handleUserSelection = (userId) => {
        setSelectedUsers((prevSelected) => {
            const isSelected = prevSelected.includes(userId);
            return isSelected
                ? prevSelected.filter((id) => id !== userId)
                : [...prevSelected, userId];
        });
    };

    // Save selected members - UPDATED to add multiple members at once
    const saveSelectedMembers = async () => {
        try {
            // Create a new array to hold the user IDs of new members
            const newMemberIds = selectedUsers.filter(userId => 
                // Only include users that aren't already members
                !members.some(member => member._id === userId)
            );

            // If there are new members to add, send them all in a single API call
            if (newMemberIds.length > 0) {
                await api.post(`/team/add-members/${teamId}`, {
                    membersId: newMemberIds // Send array of user IDs instead of single userId
                });
                
                // Refresh team data
                fetchTeam();
            }
            
            setShowAddMembersModal(false);
        } catch (error) {
            console.error("Error updating team members:", error);
            setSearchError("Error adding members to team");
        }
    };


    const startEditingContact = (contact) => {
        setEditingContact({ ...contact });
    };

    const cancelEditingContact = () => {
        setEditingContact(null);
    };

    const confirmDeleteContact = (contact) => {
        setContactToDelete(contact);
    };

    const cancelDeleteContact = () => {
        setContactToDelete(null);
    };

    const handleDeleteMember = async (memberId) => {
        try {
            await api.delete(`/team/delete-members/${teamId}`,{
                data:{memberId}
            });
            fetchTeam();
        } catch (error) {
            console.error("Error deleting member:", error);
        }
    }

    // Check if user has permission to edit or delete
    const hasCreatePermission = team?.permissions?.canCreate || user?._id === team?.creater;
    const hasEditPermission = team?.permissions?.canEdit || user?._id === team?.creater;
    const hasDeletePermission = team?.permissions?.canDelete || user?._id === team?.creater;
    const isTeamCreator = user?._id === team?.creater;

    // Function to toggle between old and new user management interfaces
    const toggleAddMembersInterface = () => {
        // Reset all related states when opening the modal
        setShowAddMembersModal(true);
        setSearchTerm("");
        setSearchResults([]);
        setNewMemberEmail("");
        setSearchError("");
        
        // Set the filteredUsers to all users, minus those already in the team
        if (members && members.length > 0) {
            const memberIds = members.map(member => member._id);
            setFilteredUsers(
                allUsers.filter(user => !memberIds.includes(user._id))
            );
        } else {
            setFilteredUsers(allUsers);
        }
    };

    return (
        <div className="team-page">
            <Sidebar/>
            {team ? (
                <div className="team-container">
                    <div className="team-header">
                        <h1>Team: {team.name}</h1>
                        <div className="team-actions">
                            {isTeamCreator && (
                                <>
                                    <button 
                                        className="add-member-btn"
                                        onClick={toggleAddMembersInterface}
                                    >
                                        Add Members
                                    </button>
                                    <button 
                                        className="permission-btn"
                                        onClick={() => setShowPermissionsModal(true)}
                                    >
                                        Manage Permissions
                                    </button>
                                    <button
                                        className="dtb"
                                        onClick={() => setShowDeleteConfirmation(true)}
                                    >
                                        Delete Team
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {team.description && <p className="team-description">{team.description}</p>}

                    {showDeleteConfirmation && (
                        <div className="delete-confirmation-modal">
                            <div className="modal-content">
                                <h3>Are you sure you want to delete this team?</h3>
                                <p>This action cannot be undone.</p>
                                <div className="modal-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={() => setShowDeleteConfirmation(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="confirm-delete-btn"
                                        onClick={handleDeleteTeam}
                                    >
                                        Delete Team
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showPermissionsModal && (
                        <div className="permission-modal">
                            <div className="modal-content">
                                <h3>Manage Team Permissions</h3>
                                <p>Set what team members can do:</p>
                                <div className="permission-options">
                                    <label className="permission-option">
                                        <input
                                            type="checkbox"
                                            name="canCreate"
                                            checked={permissions.canCreate}
                                            onChange={handlePermissionChange}
                                        />
                                        Members can create contacts
                                    </label>
                                    <label className="permission-option">
                                        <input
                                            type="checkbox"
                                            name="canEdit"
                                            checked={permissions.canEdit}
                                            onChange={handlePermissionChange}
                                        />
                                        Members can edit contacts
                                    </label>
                                    <label className="permission-option">
                                        <input
                                            type="checkbox"
                                            name="canDelete"
                                            checked={permissions.canDelete}
                                            onChange={handlePermissionChange}
                                        />
                                        Members can delete contacts
                                    </label>
                                </div>
                                <div className="modal-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={() => setShowPermissionsModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="save-btn"
                                        onClick={handleUpdatePermissions}
                                    >
                                        Save Permissions
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showAddMembersModal && (
                        <div className="add-members-modal">
                            <div className="modal-content">
                                <h3>Add Team Members</h3>
                                
                                {/* Enhanced User Management Interface */}
                                <div className="search-container">
                                    <input
                                        type="text"
                                        placeholder="Search users by name or email..."
                                        value={searchTerm}
                                        onChange={handleUserSearch}
                                        className="search-input"
                                    />
                                </div>

                                {filteredUsers.length > 0 ? (
                                    <div className="user-list-container">
                                        <ul className="member-list">
                                            {filteredUsers.map((user) => (
                                                <li key={user._id}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(user._id)}
                                                            onChange={() => handleUserSelection(user._id)}
                                                        />
                                                        <span>{user.name}</span>
                                                        {user.email && <span className="user-email">{user.email}</span>}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <div className="selection-summary">
                                            <p>Selected: {selectedUsers.filter(id => 
                                                !members.some(member => member._id === id)
                                            ).length} new users</p>
                                        </div>
                                        
                                        <div className="modal-actions">
                                            <button
                                                className="cancel-btn"
                                                onClick={() => setShowAddMembersModal(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="save-btn"
                                                onClick={saveSelectedMembers}
                                            >
                                                Add Selected Members
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="no-results">No users available to add</p>
                                )}
                                
                               
                                
                            </div>
                        </div>
                    )}

                    {contactToDelete && (
                        <div className="delete-confirmation-modal">
                            <div className="modal-content">
                                <h3>Delete Contact</h3>
                                <p>Are you sure you want to delete the contact: {contactToDelete.name}?</p>
                                <div className="modal-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={cancelDeleteContact}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="confirm-delete-btn"
                                        onClick={handleDeleteContact}
                                    >
                                        Delete Contact
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="section-container">
                        <div className="section">
                            <h2>Members</h2>
                            {members?.length > 0 ? (
                                <ul className="member-list">
                                    {members.map((member) => (
                                        <li key={member._id}>
                                            <div className="member-info">
                                                <span>{member.name}</span>
                                                {member.email && <span className="member-email">{member.email}</span>}
                                            </div>
                                            {isTeamCreator && member._id !== user._id && (
                                                <button 
                                                    className="delete-member-btn"
                                                    onClick={() => handleDeleteMember(member._id)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="empty-state">No members in this team</p>
                            )}      
                        </div>

                        {hasCreatePermission && (
                            <div className="section">
                                <h2>Add Contact</h2>
                                <form className="contact-form" onSubmit={handleCreateContact}>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Contact Name"
                                        value={newContact.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Contact Email"
                                        value={newContact.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="tel"
                                        name="phoneNo"
                                        placeholder="Phone Number"
                                        value={newContact.phoneNo}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="Description (optional)"
                                        value={newContact.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                    />
                                    <button type="submit">Add Contact</button>
                                </form>
                            </div>
                        )}

                        {editingContact && (
                            <div className="section">
                                <h2>Edit Contact</h2>
                                <form className="contact-form" onSubmit={handleUpdateContact}>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Contact Name"
                                        value={editingContact.name}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Contact Email"
                                        value={editingContact.email}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                    <input
                                        type="tel"
                                        name="phoneNo"
                                        placeholder="Phone Number"
                                        value={editingContact.phoneNo}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="Description (optional)"
                                        value={editingContact.description || ""}
                                        onChange={handleEditInputChange}
                                        rows="3"
                                    />
                                    <div className="form-actions">
                                        <button type="button" className="cancel-btn" onClick={cancelEditingContact}>Cancel</button>
                                        <button type="submit" className="save-btn">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="section">
                            <h2>Contacts</h2>
                            {contacts.length > 0 ? (
                                <ul className="contact-list">
                                    {contacts.map((contact) => (
                                        <li key={contact._id}>
                                            <div className="contact-info">
                                                <div className="contact-name">{contact.name}</div>
                                                <div className="contact-details">
                                                    <span>{contact.email}</span>
                                                    <span>{contact.phoneNo}</span>
                                                </div>
                                                {contact.description && (
                                                    <div className="contact-description">{contact.description}</div>
                                                )}
                                            </div>
                                            <div className="contact-actions">
                                                {hasEditPermission && (
                                                    <button
                                                        className="edit-contact-btn"
                                                        onClick={() => startEditingContact(contact)}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {hasDeletePermission && (
                                                    <button
                                                        className="delete-contact-btn"
                                                        onClick={() => confirmDeleteContact(contact)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="empty-state">No contacts added yet</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="loading">Loading...</div>
            )}
        </div>
    );
};

export default TeamPage;