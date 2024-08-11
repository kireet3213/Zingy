import { Grid, Text } from '@radix-ui/themes';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../AuthContext';
import { useNavigationHook } from '../../helpers/utility-hooks';
import { NavBar } from './NavBar';
import { ConversationListing } from './ConversationListing';
import { ConversationDetails } from './ConversationDetails';

export function DashboardRoot() {
    const { authUser } = useContext(AuthContext);
    const { navigate } = useNavigationHook();

    useEffect(() => {
        if (!authUser) navigate('/');
    }, [authUser, navigate]);

    return (
        <>
            <NavBar authUser={authUser} />
            <Text size="8">Welcome {authUser?.name}</Text>
            <Grid columns="2" gap="0" width="auto">
                <ConversationListing />
                <ConversationDetails />
            </Grid>
        </>
    );
}
