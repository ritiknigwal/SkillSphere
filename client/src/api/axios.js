import axios from "axios";

const isLocalhost = window.location.hostname === "localhost";

const API = axios.create({
  baseURL: isLocalhost
    ? "http://localhost:5050/api"
    : "https://skillsphere-1k44.onrender.com/api",
  withCredentials: false,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;