import { useCallback, useContext, useEffect } from 'react';
import { ConversationContext } from '../pages/dashboard/ConversationContext.tsx';
import { AuthContext } from '../AuthContext.tsx';
import { User } from '@shared-types/socket.ts';
import { UserConversation } from '../pages/dashboard/types/conversation.ts';
import { socket } from '../socket.ts';

export const useUserEvents = () => {
    const { setConversationUsers } = useContext(ConversationContext);
    const { authUser } = useContext(AuthContext);

    const onNewConnection = useCallback(
        (payload: { id: string; user: User }) => {
            setConversationUsers((prev) => {
                //existing user
                const existingUser = prev.find(
                    (user) => user.id === payload.user.id
                );
                if (existingUser) {
                    const newUserMap = prev.map((user) => {
                        return user.id === payload.user.id
                            ? { ...user, isConnected: true }
                            : user;
                    });
                    return newUserMap;
                }
                //new user
                const conversationUser: UserConversation = {
                    id: payload.user.id,
                    senderName: payload.user.username,
                    unseenMessageCount: 0,
                    profileImageUrl: payload.user.userProfile.profileUrl,
                    isConnected: true,
                    socketId: payload?.id,
                    messages: [],
                    self: payload.id === authUser?.id,
                };
                prev.push(conversationUser);
                return [...prev];
            });
        },
        [setConversationUsers, authUser]
    );
    const onUserDisconnect = useCallback(
        (userId: string) => {
            setConversationUsers((prev) => {
                const newPrev = prev.map((user) => {
                    return user.id === userId
                        ? { ...user, isConnected: false }
                        : user;
                });
                return newPrev;
            });
        },
        [setConversationUsers]
    );
    const onConnectedUsers = useCallback(
        (payload: { id: string; user: User; isConnected: boolean }[]) => {
            const uniqueUsers = payload.reduce<
                { id: string; user: User; isConnected: boolean }[]
            >((acc, current) => {
                if (!acc.some((user) => user.id === current.id)) {
                    acc.push(current);
                }
                return acc;
            }, []);
            const conversationUsers: UserConversation[] = uniqueUsers.map(
                (userPayload) => {
                    return {
                        id: userPayload.user.id,
                        senderName: userPayload.user.username,
                        unseenMessageCount: 0,
                        profileImageUrl:
                            userPayload.user.userProfile.profileUrl ||
                            'https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg',
                        isConnected: userPayload.isConnected,
                        socketId: userPayload?.id,
                        messages: [],
                        self: userPayload.id === authUser?.id,
                    };
                }
            );
            setConversationUsers(conversationUsers);
        },
        [setConversationUsers, authUser]
    );

    useEffect(() => {
        socket.on('connected-users', onConnectedUsers);

        socket.on('new-user-connected', onNewConnection);

        socket.on('user-disconnected', onUserDisconnect);

        return () => {
            socket.off('connected-users');
            socket.off('new-user-connected');
            socket.off('user-disconnected');
        };
    }, [
        onConnectedUsers,
        onNewConnection,
        onUserDisconnect,
        setConversationUsers,
    ]);
};
