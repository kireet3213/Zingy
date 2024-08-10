import { Heading } from '@radix-ui/themes';
// import { useTheme } from 'next-themes';
import { LoginPage } from './pages/LoginPage';

function App() {
    return (
        <>
            <Heading color="indigo" size="9" align="center">
                Welcome to Zingy
            </Heading>
            <LoginPage />
        </>
    );
}

export default App;
