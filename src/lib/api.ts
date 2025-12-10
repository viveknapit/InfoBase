import axios from "axios";
import { TOKEN_KEY } from "../services/Payload";

//const API_BASE = "https://infobase-backend-81qv.onrender.com";

const API_BASE = "http://localhost:8080"

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if(token && config.headers){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;