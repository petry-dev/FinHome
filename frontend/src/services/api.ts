import axios from 'axios';

const api = axios.create({
  // Porta exposta no docker-compose
  baseURL: 'http://localhost:5000',
});

export default api;