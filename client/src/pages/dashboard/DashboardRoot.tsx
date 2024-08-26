import { Grid, Text } from '@radix-ui/themes';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../AuthContext';
import { useNavigationHook } from '../../helpers/utility-hooks';
import { ConversationContainer } from './ConversationContainer';
import { Outlet } from 'react-router-dom';
import { SideBar } from './SideBar';
import { socket } from '../../socket';
import { Maybe } from '../../types/utility';

export function DashboardRoot() {
    const { authUser } = useContext(AuthContext);
    const { navigate } = useNavigationHook();
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [socketErrors, setSocketErrors] = useState<Maybe<Error>>();

    useEffect(() => {
        if (!authUser) navigate('/');
    }, [authUser, navigate]);

    useEffect(() => {
        socket.connect();
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', (err) => {
            setSocketErrors(err);
        });
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.disconnect();
        };
    }, []);

    return (
        <>
            <Text>{`${isConnected}`}</Text>
            <Text>{socketErrors?.message}</Text>
            <Grid columns="5% 30% 65%" gap="1">
                <SideBar />
                <ConversationContainer />
                <Outlet />
            </Grid>
        </>
    );
}
