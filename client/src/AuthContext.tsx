import React, {
    createContext,
    PropsWithChildren,
    useState,
} from 'react';
import { AuthUser } from './types/user';
import { Maybe } from './types/utility';

type AuthContextProps = PropsWithChildren<{
    authUser?: Maybe<AuthUser>;
    setAuthUser?: React.Dispatch<React.SetStateAction<Maybe<AuthUser>>>;
}>;

export const AuthContext = createContext<AuthContextProps>({
    authUser: null,
    setAuthUser: () => null,
});

export const AuthProvider = ({ children }: AuthContextProps) => {
    const [authUser, setAuthUser] = useState<Maybe<AuthUser>>(
        JSON.parse(localStorage.getItem('auth_user') || 'null')
    );
    return (
        <AuthContext.Provider value={{ authUser, setAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};
