import { Heading } from '@radix-ui/themes';
import { Outlet } from 'react-router-dom';
// import { useTheme } from 'next-themes';

function App() {
    return (
        <div>
            <Heading color="indigo" size="9" align="center">
                Welcome to Zingy
            </Heading>
            <Outlet />
        </div>
    );
}

export default App;
