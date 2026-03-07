import * as Form from '@radix-ui/react-form';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { post } from '../helpers/axios-client';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
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

    useEffect(() => {
        if (authUser) {
            navigate('/dashboard');
        }
    }, [authUser, navigate]);

    return (
        <>
            {
                <div className="chat-gradient min-h-screen flex flex-col items-center justify-center px-4">
                    <h2 className="text-4xl md:text-6xl font-bold text-center text-white mb-6 tracking-tight">
                        Welcome To <span className="text-indigo-400">Zingy</span>
                    </h2>
                    <img
                        className="rounded-full mx-auto w-20 h-20 mb-8 ring-4 ring-indigo-500/30"
                        src={logo}
                        alt="Zingy"
                    />
                    <div className="flex flex-col justify-center items-center w-full max-w-sm min-h-80 mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
                        <Form.Root
                            ref={formRef}
                            className="flex flex-col items-center justify-center gap-4 w-full"
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
                            }}
                        >
                            <Form.Field name="email" className="w-full">
                                <Form.ValidityState>
                                    {(validity) => {
                                        return (
                                            <>
                                                <Form.Control asChild>
                                                    <input
                                                        className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none input-glow transition-all text-sm"
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
                            <Form.Field name="password" className="w-full">
                                <Form.ValidityState>
                                    {(validity) => {
                                        return (
                                            <>
                                                <Form.Control asChild>
                                                    <input
                                                        className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none input-glow transition-all text-sm"
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
                                    className="w-full rounded-xl py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all duration-200 active:scale-[0.98] text-sm"
                                    type="submit"
                                >
                                    Login
                                </button>
                            </Form.Submit>
                            {error && <ErrorValidation error={error} />}
                            <div className="text-slate-400 text-sm">
                                New User?{' '}
                                <a
                                    className="cursor-pointer text-indigo-400 hover:text-indigo-300 underline transition-colors"
                                    onClick={async () =>
                                        await navigate({
                                            pathname: '/register',
                                        })
                                    }
                                >
                                    Register Now
                                </a>
                            </div>
                        </Form.Root>
                    </div>
                    {status && (
                        <p className="mt-4 text-emerald-400 flex items-center gap-2">
                            <InfoCircledIcon />
                            Login Successful
                        </p>
                    )}
                </div>
            }
        </>
    );
};
