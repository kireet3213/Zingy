import axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    timeout: 2000,
    headers: {
        'ZINGY-Custom-Header': 'ZINGGGGED',
        Authorization: `Bearer ${localStorage.getItem('jwt_secret')}`,
    },
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error.response.data);
    }
);

export async function post<T>(
    url: string,
    data: T,
    config?: AxiosRequestConfig
) {
    return axiosInstance.post(url, data, { ...config });
}

export function get(url: string, config?: AxiosRequestConfig) {
    return axiosInstance.get(url, { ...config });
}
