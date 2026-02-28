import router from '@/router';
import useAuthStore from '@/stores/auth';
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';


// Create axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_BASE_URL,
    headers: {
        'Accept': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use((response: AxiosResponse<any>) => {
    return response;
}, (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
        const authStore = useAuthStore();
        authStore.clearUser();
        router.push('/login')
    }
    if (error.response?.status === 403) {
        router.push('/403')
    }
    return Promise.reject(error);
});



export default axiosInstance;