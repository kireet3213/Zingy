import * as Form from '@radix-ui/react-form';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
    Card,
    Container,
    Button,
    Tooltip,
    TextField,
    Link as RadixLink,
    Callout,
    Text,
} from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import { post } from '../helpers/axios-client';
import { useState } from 'react';
import { Maybe } from '../types/utility.ts';
import type { AxiosResponse } from 'axios';

export const RegisterUser = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<boolean>(false);
    const [error, setError] = useState<Maybe<string>>(null);

    return (
        <Container size="1" mt="9">
            <Card variant="classic" size="5" style={{ position: 'relative' }}>
                <Form.Root
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
                    }}
                >
                    <Form.Field name="username">
                        <Form.ValidityState>
                            {(validity) => {
                                return (
                                    <>
                                        <Form.Control asChild>
                                            <TextField.Root
                                                size="3"
                                                variant="soft"
                                                radius="large"
                                                placeholder="Enter your username"
                                                mb="3"
                                                color={
                                                    validity?.valid !== false
                                                        ? 'indigo'
                                                        : 'red'
                                                }
                                                required
                                                type="text"
                                            >
                                                {validity?.valid === false ? (
                                                    <Tooltip content="Invalid Input">
                                                        <TextField.Slot
                                                            side="right"
                                                            color="red"
                                                        >
                                                            <InfoCircledIcon />
                                                        </TextField.Slot>
                                                    </Tooltip>
                                                ) : null}
                                            </TextField.Root>
                                        </Form.Control>
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
                                            <TextField.Root
                                                size="3"
                                                variant="soft"
                                                radius="large"
                                                placeholder="Enter your email"
                                                mb="3"
                                                color={
                                                    validity?.valid !== false
                                                        ? 'indigo'
                                                        : 'red'
                                                }
                                                required
                                                type="email"
                                            >
                                                {validity?.valid === false ? (
                                                    <Tooltip content="Invalid Input">
                                                        <TextField.Slot
                                                            side="right"
                                                            color="red"
                                                        >
                                                            <InfoCircledIcon />
                                                        </TextField.Slot>
                                                    </Tooltip>
                                                ) : null}
                                            </TextField.Root>
                                        </Form.Control>
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
                                            <TextField.Root
                                                size="3"
                                                radius="large"
                                                placeholder="Enter your password"
                                                mb="3"
                                                variant="soft"
                                                color={
                                                    validity?.valid !== false
                                                        ? 'indigo'
                                                        : 'red'
                                                }
                                                required
                                                type="password"
                                            >
                                                {validity?.valid === false ? (
                                                    <Tooltip content="Invalid Input">
                                                        <TextField.Slot
                                                            side="right"
                                                            color="red"
                                                        >
                                                            <InfoCircledIcon />
                                                        </TextField.Slot>
                                                    </Tooltip>
                                                ) : null}
                                            </TextField.Root>
                                        </Form.Control>
                                    </>
                                );
                            }}
                        </Form.ValidityState>
                    </Form.Field>

                    <Form.Submit asChild>
                        <Button
                            radius="large"
                            size="4"
                            variant="surface"
                            type="submit"
                            mb="3"
                            style={{ width: '100%' }}
                        >
                            Register
                        </Button>
                    </Form.Submit>
                    {error && (
                        <Text
                            as="p"
                            style={{ textAlign: 'center' }}
                            weight="medium"
                            mt="1"
                            size="2"
                            trim="both"
                            color="red"
                        >
                            {error}
                        </Text>
                    )}
                </Form.Root>
                {status && (
                    <Callout.Root color="green">
                        <Callout.Icon>
                            <InfoCircledIcon />
                        </Callout.Icon>
                        <Callout.Text>
                            Registration Successful.{' '}
                            <RadixLink
                                style={{
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                }}
                                onClick={() => navigate({ pathname: '/' })}
                            >
                                Login Now
                            </RadixLink>
                        </Callout.Text>
                    </Callout.Root>
                )}
            </Card>
        </Container>
    );
};
