import { Heading } from '@radix-ui/themes';
import { Outlet } from 'react-router-dom';
// import { useTheme } from 'next-themes';

function App() {
    return (
        <>
            <Heading color="indigo" size="9" align="center">
                Welcome to Zingy
            </Heading>
            <Outlet />
        </>
    );
}

export default App;
