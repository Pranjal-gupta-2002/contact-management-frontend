import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation(); // Get the current route

    return (
        <div className="sidebar">
            <div className={`sidebar-item ${location.pathname === "/contacts" ? "active" : ""}`}>
                <Link to="/contacts" className='link'>
                    <i className="fas fa-address-book"></i> <span className="icon">Contacts</span>
                </Link>
            </div>

            <div className={`sidebar-item ${location.pathname.includes("/team") ? "active" : ""}`}>
                <Link to="/team" className='link'>
                    <i className="fas fa-plus-circle"></i> <span className="icon">Create Team</span>
                </Link>
            </div>

            {user?.role === "admin" && (
                <div className={`sidebar-item ${location.pathname === "/user-management" ? "active" : ""}`}>
                    <Link to="/user-management"className='link'>
                        <i className="fas fa-user-cog"></i> <span className="icon">Users Management</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Sidebar;