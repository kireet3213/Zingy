import { Grid, Text } from '@radix-ui/themes';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../AuthContext';
import { useNavigationHook } from '../../helpers/utility-hooks';
import { ConversationContainer } from './ConversationContainer';
import { Outlet } from 'react-router-dom';
import { SideBar } from './SideBar';
import { socket } from '../../socket';

export function DashboardRoot() {
    const { authUser } = useContext(AuthContext);
    const { navigate } = useNavigationHook();
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        if (!authUser) navigate('/');
    }, [authUser, navigate]);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    return (
        <>
            <Text>{isConnected}</Text>
            <Grid columns="5% 30% 65%" gap="1">
                <SideBar />
                <ConversationContainer />
                <Outlet />
            </Grid>
        </>
    );
}
