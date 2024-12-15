import React, { createContext, PropsWithChildren, useState } from 'react';
import { User } from '@shared-types/socket.ts';
import { Maybe } from './types/utility';

type AuthContextProps = PropsWithChildren<{
    authUser?: Maybe<User>;
    setAuthUser: React.Dispatch<React.SetStateAction<Maybe<User>>>;
}>;

export const AuthContext = createContext<AuthContextProps>({
    authUser: null,
    setAuthUser: () => null,
});

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
