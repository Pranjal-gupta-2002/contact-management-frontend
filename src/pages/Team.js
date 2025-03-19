import { useState, useEffect } from "react";
import api from "../services/api";
import "./Team.css";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";


export default function Team() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered users
  const { user } = useAuth()
  console.log(user)
  const [newTeam, setNewTeam] = useState({
    teamName: "",
    teamDescription: "",
    permissions: { canEdit: false, canDelete: false, canCreate: false },
    teamMembers: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  async function fetchTeams() {
    const response = await api.get("team/get-teams");
    setTeams(response.data.teams);
  }

  async function fetchUsers() {
    const response = await api.get("user/getAllUsers");
    setUsers(response.data.users);
    setFilteredUsers(response.data.users); // Set initial filtered users list
  }

  async function addTeam(e) {
    e.preventDefault();
    newTeam.teamMembers.push(user._id)
    await api.post("team/create-team", newTeam);
    fetchTeams();
    setNewTeam({
      teamName: "",
      teamDescription: "",
      permissions: { canEdit: false, canDelete: false, canCreate: false },
      teamMembers: [],
    });
  }

  function handlePermissionChange(e) {
    setNewTeam({
      ...newTeam,
      permissions: { ...newTeam.permissions, [e.target.name]: e.target.checked },
    });
  }

  function handleMemberSelection(userId) {
    setNewTeam((prevTeam) => {
      const isSelected = prevTeam.teamMembers.includes(userId);
      return {
        ...prevTeam,
        teamMembers: isSelected
          ? prevTeam.teamMembers.filter((id) => id !== userId)
          : [...prevTeam.teamMembers, userId],
      };
    });
  }

  function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);

    if (!query) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) =>
          user.name.toLowerCase().includes(query)
        )
      );
    }
  }

  return (
    <div className="team-container">
      <Sidebar/>
      <h1 className="team-title">Team Management</h1>

      <div className="team-content">
        {/* Left Side - Team Creation Form */}
        <div className="team-form-container">
          <h2>Create a Team</h2>
          <form onSubmit={addTeam} className="team-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Team Name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <textarea
                placeholder="Team Description"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, teamDescription: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-group">
              <h3>Permissions</h3>
              <div className="permissions-container">
                <label>
                  <input
                    type="checkbox"
                    name="canEdit"
                    checked={newTeam.permissions.canEdit}
                    onChange={handlePermissionChange}
                  />
                  Edit
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="canDelete"
                    checked={newTeam.permissions.canDelete}
                    onChange={handlePermissionChange}
                  />
                  Delete
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="canCreate"
                    checked={newTeam.permissions.canCreate}
                    onChange={handlePermissionChange}
                  />
                  Create
                </label>
              </div>
            </div>

            <div className="form-group">
              <span className="members-label">
                Selected Members: {newTeam.teamMembers.length}
              </span>
              <button
                type="button"
                className="add-members-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Select Members
              </button>
            </div>

            <button type="submit" className="create-btn">
              Create Team
            </button>
          </form>
        </div>

        {/* Right Side - Team List */}
        <div className="team-list-container">
          <h2>Team List</h2>
          {teams.length === 0 ? (
            <div className="empty-message">
              <p>No teams created yet</p>
            </div>
          ) : (
            <div className="team-list">
              {teams.map((team) => (
                <div key={team._id} className="team-item">
                 <Link to={`/team/${team._id}`} className="hi">
                 <div className="team-item-content">
                    <h3>{team.name}</h3>
                    <p>{team.description}</p>
                    <div className="team-meta">
                      <span>{team.members.length} members</span>
                    </div>
                  </div></Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Selecting Members */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Members</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            {/* Search Bar */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>

            <div className="modal-body">
              <ul className="member-list">
                {filteredUsers.length === 0 ? (
                  <p className="no-results">No users found</p>
                ) : (
                  filteredUsers.map((user) => (
                    <li key={user._id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={newTeam.teamMembers.includes(user._id)}
                          onChange={() => handleMemberSelection(user._id)}
                        />
                        {user.name}
                      </label>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="modal-footer">
              <button className="done-btn" onClick={() => setIsModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
