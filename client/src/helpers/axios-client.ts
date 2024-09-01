import axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 2000,
    headers: {
        'ZINGY-Custom-Header': 'ZINGGGGED',
        Authorization: `Bearer ${localStorage.getItem('jwt_secret')}`,
    },
});

export function post<T>(url: string, data: T, config?: AxiosRequestConfig) {
    return axiosInstance.post(url, data, { ...config });
}

export function get(url: string, config?: AxiosRequestConfig) {
    return axiosInstance.get(url, { ...config });
}
