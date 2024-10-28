import {
    Avatar,
    Box,
    Button,
    Callout,
    Card,
    Container,
    Link as RadixLink,
    Text,
    TextField,
    Tooltip,
} from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { post } from '../helpers/axios-client';
import { Navigate, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<boolean>(false);
    const { authUser, setAuthUser } = useContext(AuthContext);
    if (!setAuthUser) return;
    return (
        <>
            {authUser ? (
                <Navigate to="/dashboard" />
            ) : (
                <Container size="1" mt="9">
                    <Card
                        variant="classic"
                        size="5"
                        style={{ position: 'relative' }}>
                        <Avatar
                            src="https://cdna.artstation.com/p/assets/images/images/073/539/612/large/michele-marchionni-kratos.jpg?1709889910"
                            size="8"
                            fallback="A"
                            radius="full"
                            style={{
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                display: 'block',
                            }}
                            mb="3"
                        />
                        <Form.Root
                            autoComplete="on"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const postData = Object.fromEntries(
                                    new FormData(e.currentTarget)
                                );
                                const response = await post(
                                    'auth/login',
                                    postData
                                );
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
                            }}>
                            <Form.Field name="email">
                                <Form.ValidityState>
                                    {(validity) => {
                                        return (
                                            <>
                                                <Form.Control asChild>
                                                    <TextField.Root
                                                        style={{
                                                            flexGrow: '1',
                                                        }}
                                                        size="3"
                                                        variant="soft"
                                                        radius="large"
                                                        placeholder="Enter your email"
                                                        mb="3"
                                                        color={
                                                            validity?.valid !==
                                                            false
                                                                ? 'indigo'
                                                                : 'red'
                                                        }
                                                        required
                                                        type="email">
                                                        {validity?.valid ===
                                                        false ? (
                                                            <Tooltip content="Invalid Input">
                                                                <TextField.Slot
                                                                    side="right"
                                                                    color="red">
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
                            <Box style={{ textAlign: 'end' }} mb="3">
                                <RadixLink href="#">Forgot Password?</RadixLink>
                            </Box>
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
                                                            validity?.valid !==
                                                            false
                                                                ? 'indigo'
                                                                : 'red'
                                                        }
                                                        required
                                                        type="password">
                                                        {validity?.valid ===
                                                        false ? (
                                                            <Tooltip content="Invalid Input">
                                                                <TextField.Slot
                                                                    side="right"
                                                                    color="red">
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
                                    style={{ width: '100%' }}>
                                    Login
                                </Button>
                            </Form.Submit>
                            <Text
                                as="div"
                                style={{
                                    textAlign: 'end',
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '50px',
                                }}>
                                New User?{' '}
                                <RadixLink
                                    underline="hover"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                        navigate({ pathname: '/register' })
                                    }>
                                    Register Now
                                </RadixLink>
                            </Text>
                        </Form.Root>
                        {status && (
                            <Callout.Root color="green">
                                <Callout.Icon>
                                    <InfoCircledIcon />
                                </Callout.Icon>
                                <Callout.Text>Login Successful.</Callout.Text>
                            </Callout.Root>
                        )}
                    </Card>
                </Container>
            )}
        </>
    );
};
