import { Grid } from '@radix-ui/themes';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../AuthContext';
import { useNavigationHook } from '../../helpers/utility-hooks';
import { NavBar } from './NavBar';
import { ConversationContainer } from './ConversationContainer';
import { Outlet } from 'react-router-dom';

export function DashboardRoot() {
    const { authUser } = useContext(AuthContext);
    const { navigate } = useNavigationHook();

    useEffect(() => {
        if (!authUser) navigate('/');
    }, [authUser, navigate]);

    return (
        <>
            <NavBar authUser={authUser} />
            <Grid columns="30% 70%" gap="1">
                <ConversationContainer />
                <Outlet />
            </Grid>
        </>
    );
}
