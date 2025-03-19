import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./UserManagement.css";
import Sidebar from "../components/Sidebar";

const UserManagement = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get("/user/getAllUsers");
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await api.delete(`/user/delete/${userId}`);
            setUsers(users.filter((user) => user._id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const changeUserRole = async (userId) => {
        try {
            const response = await api.put(`/user/changeRole/${userId}`);
            setUsers(users.map(user =>
                user._id === userId ? { ...user, role: user.role === "user" ? "admin" : "user" } : user
            ));
            alert(response.data.message);
        } catch (error) {
            console.error("Error changing role:", error);
            alert("Failed to change role");
        }
    };

    return (
        <div className="admin-container">
            <Sidebar/>
            <h1>Manage Users</h1>
            {users.length > 0 ? (
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td className="actions-cell">
                                    <button className="role-btn" onClick={() => changeUserRole(user._id)}>
                                        Toggle Role
                                    </button>
                                    <button className="delete-btn" onClick={() => deleteUser(user._id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No users found.</p>
            )}
        </div>
    );
};

export default UserManagement;
