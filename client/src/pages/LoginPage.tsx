import * as Form from '@radix-ui/react-form';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { post } from '../helpers/axios-client';
import { Navigate, useNavigate } from 'react-router-dom';
import { useContext, useRef, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { Maybe } from '../types/utility.ts';
import { User } from '@shared-types/socket.ts';
import type { AxiosResponse } from 'axios';
import logo from '../assets/DALL·E Letter Z Design.webp';
import { FormErrorValidation } from '../components/FormErrorValidation.tsx';
import { ErrorValidation } from '../components/ErrorValidation.tsx';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useContext(AuthContext);
    const [status, setStatus] = useState<boolean>(false);
    const [error, setError] = useState<Maybe<string>>(null);
    const formRef = useRef<HTMLFormElement>(null);
    return (
        <>
            {authUser ? (
                <Navigate to="/" />
            ) : (
                <div className=" bg-slate-800 min-h-screen">
                    <h2 className="text-7xl text-center text-slate-200 mb-14">
                        Welcome To Zingy
                    </h2>
                    <img
                        className="rounded-full mx-auto max-w-24 mb-14 cursor-none"
                        src={logo}
                        alt="Zingy"
                    />
                    <div className="flex flex-col justify-center items-center max-w-80 min-h-96 mx-auto  bg-slate-600 rounded-md">
                        <Form.Root
                            ref={formRef}
                            className="flex flex-col items-center justify-center gap-5"
                            autoComplete="on"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const postData = Object.fromEntries(
                                    new FormData(e.currentTarget)
                                );
                                const response: Maybe<
                                    AxiosResponse<{
                                        authUser: User;
                                        secret: string;
                                        success: boolean;
                                    }>
                                > = await post('auth/login', postData)
                                    .catch((error) => {
                                        setError(error.message);
                                        e.currentTarget.reset();
                                        return null;
                                    })
                                    .finally(() => {
                                        if (formRef.current) {
                                            formRef.current.reset();
                                        }
                                    });
                                if (!response) return;
                                setStatus(response.data.success);
                                localStorage.setItem(
                                    'jwt_secret',
                                    response.data.secret
                                );
                                localStorage.setItem(
                                    'auth_user',
                                    JSON.stringify(response.data.authUser)
                                );
                                setAuthUser(response.data.authUser);
                                navigate('/dashboard');
                            }}
                        >
                            <Form.Field name="email">
                                <Form.ValidityState>
                                    {(validity) => {
                                        return (
                                            <>
                                                <Form.Control asChild>
                                                    <input
                                                        className="rounded p-2 bg-slate-200"
                                                        placeholder="Enter your email"
                                                        required
                                                        type="email"
                                                    />
                                                </Form.Control>
                                                {(validity?.valid === false ||
                                                    !!error) && (
                                                    <FormErrorValidation
                                                        state={validity}
                                                    />
                                                )}
                                            </>
                                        );
                                    }}
                                </Form.ValidityState>
                            </Form.Field>
                            <Form.Field name="password">
                                <Form.ValidityState>
                                    {(validity) => {
                                        return (
                                            <>
                                                <Form.Control asChild>
                                                    <input
                                                        className="rounded p-2 bg-slate-200"
                                                        placeholder="Enter your password"
                                                        required
                                                        type="password"
                                                    />
                                                </Form.Control>
                                                {(validity?.valid === false ||
                                                    !!error) && (
                                                    <FormErrorValidation
                                                        state={validity}
                                                    />
                                                )}
                                            </>
                                        );
                                    }}
                                </Form.ValidityState>
                            </Form.Field>
                            <Form.Submit asChild>
                                <button
                                    className="rounded-lg mb-3 w-1/2 p-2 bg-slate-300 hover:bg-slate-400"
                                    type="submit"
                                >
                                    Login
                                </button>
                            </Form.Submit>
                            {error && <ErrorValidation error={error} />}
                            <div className="items-end text-slate-900">
                                New User?{' '}
                                <a
                                    className="cursor-pointer underline"
                                    onClick={() =>
                                        navigate({ pathname: '/register' })
                                    }
                                >
                                    Register Now
                                </a>
                            </div>
                        </Form.Root>
                    </div>
                    {status && (
                        <p>
                            <InfoCircledIcon />
                            Login Successful
                        </p>
                    )}
                </div>
            )}
        </>
    );
};
