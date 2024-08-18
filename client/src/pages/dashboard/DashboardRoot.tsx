import { Grid } from '@radix-ui/themes';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../AuthContext';
import { useNavigationHook } from '../../helpers/utility-hooks';
import { ConversationContainer } from './ConversationContainer';
import { Outlet } from 'react-router-dom';
import { SideBar } from './SideBar';

export function DashboardRoot() {
    const { authUser } = useContext(AuthContext);
    const { navigate } = useNavigationHook();

    useEffect(() => {
        if (!authUser) navigate('/');
    }, [authUser, navigate]);

    return (
        <>
            <Grid columns="5% 30% 65%" gap="1">
                <SideBar />
                <ConversationContainer />
                <Outlet />
            </Grid>
        </>
    );
}
