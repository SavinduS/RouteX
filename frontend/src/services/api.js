import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5003/api',
});

// පස්සේ මෙතනට JWT token එක දාන්න පුළුවන්
export default API;