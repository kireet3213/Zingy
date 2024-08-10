import {
    Avatar,
    Box,
    Button,
    Card,
    Container,
    Link,
    Text,
    TextField,
    Tooltip,
} from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import { InfoCircledIcon } from '@radix-ui/react-icons';

export const LoginPage = () => {
    return (
        <Container size="1" mt="9">
            <Card variant="classic" size="5" style={{ position: 'relative' }}>
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
                <Form.Root>
                    <Form.Field name="email">
                        <Form.ValidityState>
                            {(validity) => {
                                return (
                                    <>
                                        <Form.Control asChild>
                                            <TextField.Root
                                                style={{ flexGrow: '1' }}
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
                    <Box style={{ textAlign: 'end' }} mb="3">
                        <Link href="#">Forgot Password?</Link>
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
                                                    validity?.valid !== false
                                                        ? 'indigo'
                                                        : 'red'
                                                }
                                                required
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
                            Login
                        </Button>
                    </Form.Submit>
                    <Text
                        as="div"
                        style={{
                            textAlign: 'end',
                            position: 'absolute',
                            bottom: '10px',
                            right: '20px',
                        }}
                    >
                        New User? <Link href="#">Register Now</Link>
                    </Text>
                </Form.Root>
            </Card>
        </Container>
    );
};
