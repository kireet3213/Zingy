import * as Form from '@radix-ui/react-form';
import { useNavigate } from 'react-router-dom';
import { post } from '../../helpers/axios-client';
import { useRef, useState } from 'react';
import { Maybe } from '../../types/utility.ts';
import type { AxiosResponse } from 'axios';
import { FormErrorValidation } from '../../components/FormErrorValidation.tsx';
import { ErrorValidation } from '../../components/ErrorValidation.tsx';
import logo from '../../assets/DALL·E Letter Z Design.webp';

export const RegisterUser = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<boolean>(false);
    const [error, setError] = useState<Maybe<string>>(null);
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <div className="chat-gradient min-h-screen flex flex-col items-center justify-center px-4">
            <img
                className="rounded-full mx-auto w-20 h-20 mb-8 ring-4 ring-indigo-500/30"
                src={logo}
                alt="Zingy"
            />
            <div className="flex flex-col gap-5 justify-center items-center w-full max-w-sm mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
                <Form.Root
                    ref={formRef}
                    className="flex flex-col items-center justify-center gap-4 w-full"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setError(null);
                        const postData = Object.fromEntries(
                            new FormData(e.currentTarget)
                        );
                        const response: Maybe<
                            AxiosResponse<{
                                data: Record<string, string>;
                                message: boolean;
                            }>
                        > = await post('user/register', postData).catch(
                            (error) => {
                                setError(error.message);
                                return null;
                            }
                        );
                        if (response) {
                            setStatus(!!response.data.data);
                        }
                        if (formRef.current) {
                            formRef.current.reset();
                        }
                    }}
                >
                    <Form.Field name="username" className="w-full">
                        <Form.ValidityState>
                            {(validity) => {
                                return (
                                    <>
                                        <Form.Control asChild>
                                            <input
                                                className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none input-glow transition-all text-sm"
                                                placeholder="Enter your username"
                                                required
                                                type="text"
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
                                            error) && (
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
                                            error) && (
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
                            Register
                        </button>
                    </Form.Submit>
                    {error && <ErrorValidation error={error} />}
                </Form.Root>
                {status && (
                    <p className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 p-3 rounded-xl text-sm">
                        <span>Registration Successful. </span>
                        <span
                            className="cursor-pointer underline hover:text-emerald-300 transition-colors"
                            onClick={() => {
                                navigate({
                                    pathname: '/',
                                });
                            }}
                        >
                            Login Now
                        </span>
                    </p>
                )}
                <p
                    className="text-slate-500 hover:text-indigo-400 cursor-pointer text-sm underline transition-colors"
                    onClick={() => {
                        navigate(-1);
                    }}
                >
                    Go Back
                </p>
            </div>
        </div>
    );
};
