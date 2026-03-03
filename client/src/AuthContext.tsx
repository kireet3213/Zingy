import React, { createContext, PropsWithChildren } from 'react';
import { User } from '@shared-types/socket.ts';
import { Maybe } from './types/utility';

export type AuthContextProps = PropsWithChildren<{
    authUser?: Maybe<User>;
    setAuthUser: React.Dispatch<React.SetStateAction<Maybe<User>>>;
}>;

export const AuthContext = createContext<AuthContextProps>({
    authUser: null,
    setAuthUser: () => null,
});
