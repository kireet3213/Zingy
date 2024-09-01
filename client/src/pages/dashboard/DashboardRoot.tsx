/* eslint-disable no-console */
import { Grid } from '@radix-ui/themes';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../AuthContext';
import { ConversationContainer } from './ConversationContainer';
import { Navigate, Outlet } from 'react-router-dom';
import { SideBar } from './SideBar';
import { socket } from '../../socket';
import { Maybe } from '../../types/utility';
import { Socket } from 'socket.io-client';

export function DashboardRoot() {
    const { authUser } = useContext(AuthContext);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [socketErrors, setSocketErrors] = useState<Maybe<Error>>();

    useEffect(() => {
        socket.connect();
        function onConnect() {
            console.log('Connected');
            if (socket.recovered) {
                console.log('Reconnected with server');
                console.log(socket.id);
            }
            setIsConnected(true);
        }

        function onDisconnect(reason: Socket.DisconnectReason) {
            console.log('Disconnected', reason);
            setIsConnected(false);
        }
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', (err) => {
            setSocketErrors(err);
        });

        // socket.on('ping', (data) =>
        //     console.log('received recovered data', data)
        // );

        // forcefully close socket
        // setTimeout(() => {
        //     socket.io.engine.close();
        // }, 10000);

        //reconnect and reconnect_attempt fired before sending remaining recovery messages and connect event
        // socket.io.on('reconnect', () => {
        //     console.log('reconnected success');
        // });
        // socket.io.on('reconnect_attempt', () => {
        //     console.log('reconnection attempting');
        // });

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.disconnect();
        };
    }, []);

    return (
        <div style={{ margin: '1% 5% 5% 5%' }}>
            {/* <Text>{socketErrors?.message}</Text> */}
            {!authUser ? (
                <Navigate to="/"></Navigate>
            ) : (
                <Grid columns="5% 30% 65%" gap="1">
                    <SideBar />
                    <ConversationContainer />
                    <Outlet />
                </Grid>
            )}
        </div>
    );
}
