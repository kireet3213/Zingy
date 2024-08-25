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
} from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import { post } from '../helpers/axios-client';
import { useState } from 'react';

export const RegisterUser = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<number | undefined>();
    return (
        <Container size="1" mt="9">
            <Card variant="classic" size="5" style={{ position: 'relative' }}>
                <Form.Root
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const postData = Object.fromEntries(
                            new FormData(e.currentTarget)
                        );
                        const response = await post('user/register', postData);
                        setStatus(response.status);
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
                </Form.Root>
                {status === 200 && (
                    <Callout.Root color="green">
                        <Callout.Icon>
                            <InfoCircledIcon />
                        </Callout.Icon>
                        <Callout.Text>
                            Registration Successful.{' '}
                            <RadixLink
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
