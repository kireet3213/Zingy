/* eslint-disable no-console */
import { Grid } from '@radix-ui/themes';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../AuthContext';
import { ConversationContainer } from './ConversationContainer';
import { Navigate, Outlet } from 'react-router-dom';
import { SideBar } from './SideBar';
import { socket } from '../../socket';
import './css/dashboard.styles.css';
import { ConversationContextProvider } from './ConversationContext';

export function DashboardRoot() {
    const { authUser } = useContext(AuthContext);
    // const [isConnected, setIsConnected] = useState(socket.connected);
    // const [socketErrors, setSocketErrors] = useState<Maybe<Error>>();

    useEffect(() => {
        const token = localStorage.getItem('jwt_secret');
        if (token) {
            socket.auth = {
                token: `Bearer ${localStorage.getItem('jwt_secret')}`,
            };
            socket.connect();
        }

        function onConnect() {
            console.log('connected');

            if (socket.recovered) {
                console.log('Reconnected with server');
                console.log(socket.id);
            }
        }

        socket.on('connect', onConnect);
        socket.on('connect_error', (err) => {
            console.error(err);
            // setSocketErrors(err);
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

        // socket.onAny((event, ...args) => {
        //     console.log('Event', event, args);
        // });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.disconnect();
        };
    }, []);

    return (
        <ConversationContextProvider>
            <div className="dashboard-root">
                {!authUser ? (
                    <Navigate to="/"></Navigate>
                ) : (
                    <Grid columns="minmax(60px,5%) 30% 65%" gap="1">
                        <SideBar />
                        <ConversationContainer />
                        <Outlet />
                    </Grid>
                )}
            </div>
        </ConversationContextProvider>
    );
}
