import axios, { AxiosRequestConfig } from 'axios';

const getAxiosInstance = () => {
    const serverUrl = localStorage.getItem('serverUrl') || import.meta.env.VITE_API_URL || '';
    const instance = axios.create({
        baseURL: `${serverUrl}/api`,
        timeout: 2000,
        headers: {
            'ZINGY-Custom-Header': 'ZINGGGGED',
            Authorization: `Bearer ${localStorage.getItem('jwt_secret')}`,
        },
    });

    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            return Promise.reject(error.response.data);
        }
    );

    return instance;
};

export async function post<T>(
    url: string,
    data: T,
    config?: AxiosRequestConfig
) {
    const axiosInstance = getAxiosInstance();
    return axiosInstance.post(url, data, { ...config });
}

export function get(url: string, config?: AxiosRequestConfig) {
    const axiosInstance = getAxiosInstance();
    return axiosInstance.get(url, { ...config });
}
