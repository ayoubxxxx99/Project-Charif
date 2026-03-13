import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});


api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


api.interceptors.response.use(
    res => res,
    err => {
        const isAuthRoute = err.config?.url?.includes('/login') || 
                            err.config?.url?.includes('/register');

        if (err.response?.status === 401 && !isAuthRoute) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_name');
            window.location.href = '/login';
        }

        return Promise.reject(err);
    }
);

export default api;