import { useNavigate } from 'react-router-dom';

export const useNavigationHook = () => {
    const navigate = useNavigate();
    return { navigate };
};
