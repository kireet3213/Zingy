import * as Form from '@radix-ui/react-form';
import { useNavigate } from 'react-router-dom';
import { post } from '../helpers/axios-client';
import { useRef, useState } from 'react';
import { Maybe } from '../types/utility.ts';
import type { AxiosResponse } from 'axios';
import { FormErrorValidation } from '../components/FormErrorValidation.tsx';
import { ErrorValidation } from '../components/ErrorValidation.tsx';
import logo from '../assets/DALL·E Letter Z Design.webp';

export const RegisterUser = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<boolean>(false);
    const [error, setError] = useState<Maybe<string>>(null);
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <div className="bg-slate-800 min-h-screen content-center">
            <img
                className="rounded-full mx-auto max-w-24 mb-14 cursor-none"
                src={logo}
                alt="Zingy"
            />
            <div className="flex flex-col gap-5 justify-center items-center max-w-80 min-h-96 mx-auto  bg-slate-600 rounded-md">
                <Form.Root
                    ref={formRef}
                    className="flex flex-col items-center justify-center gap-5"
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
                    <Form.Field name="username">
                        <Form.ValidityState>
                            {(validity) => {
                                return (
                                    <>
                                        <Form.Control asChild>
                                            <input
                                                className="rounded p-2 bg-slate-200"
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
                            className="rounded-lg mb-3 w-1/2 p-2 bg-slate-300 hover:bg-slate-400"
                            type="submit"
                            style={{ width: '100%' }}
                        >
                            Register
                        </button>
                    </Form.Submit>
                    {error && <ErrorValidation error={error} />}
                </Form.Root>
                {status && (
                    <p className="text-green-600 bg-green-200 p-3 outline-2 outline-green-600 rounded opacity-90">
                        <span>Registration Successful. </span>
                        <span
                            className="cursor-pointer underline"
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
                    className="self-end mr-1 content-end underline text-slate-800 cursor-pointer"
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
