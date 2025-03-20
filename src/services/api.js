import axios from 'axios';

const api = axios.create({
  baseURL: 'https://contact-management-backend-4nz3.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;