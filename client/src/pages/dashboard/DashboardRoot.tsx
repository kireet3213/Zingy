/* eslint-disable no-console */
import { useEffect } from 'react';
import { ConversationContainer } from './ConversationContainer';
import { Navigate, Outlet } from 'react-router-dom';
import { SideBar } from './SideBar';
import { socket } from '../../socket';
import { useAppSelector } from '../../store/hooks.ts';
import { selectCurrentUser } from '../auth/authSlice.ts';

export function DashboardRoot() {
    const authUser = useAppSelector(selectCurrentUser);
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
        <div className="h-screen chat-gradient overflow-hidden">
            {!authUser ? (
                <Navigate to="/"></Navigate>
            ) : (
                <div className="h-full flex flex-col md:flex-row">
                    <SideBar />
                    <div className="flex flex-1 min-h-0 flex-col md:flex-row">
                        <ConversationContainer />
                        <div className="flex flex-col flex-1 min-h-0 min-w-0">
                            <Outlet />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
