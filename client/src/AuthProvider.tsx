import { User } from '@shared-types/socket';
import { AuthContext, AuthContextProps } from './AuthContext';
import { Maybe } from './types/utility';
import { useState } from 'react';

export const AuthProvider = ({ children }: AuthContextProps) => {
    const [authUser, setAuthUser] = useState<Maybe<User>>(
        JSON.parse(localStorage.getItem('auth_user') || 'null')
    );

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};
