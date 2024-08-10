import { Container, Heading, Text } from '@radix-ui/themes';
import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError();

    return (
        <Container
            id="error-page"
            style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%,50%)',
            }}
        >
            <Heading size="8">Oops!</Heading>
            <Text size="7" as="p" mb="6">
                Sorry, an unexpected error has occurred.
            </Text>
            <Text style={{ textAlign: 'center' }} size="7" as="p">
                {error.statusText || error.message}
            </Text>
        </Container>
    );
}
