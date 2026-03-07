import { useCallback, useContext, useEffect } from 'react';
import { ConversationContext } from '../pages/dashboard/ConversationContext.tsx';
import { AuthContext } from '../AuthContext.tsx';
import { User } from '@shared-types/socket.ts';
import { UserConversation } from '../pages/dashboard/types/conversation.ts';
import { socket } from '../socket.ts';
import { post } from '../helpers/axios-client.ts';

type DirectConversationApiResponse = {
    success: boolean;
    conversationId: number;
    participants: string[];
};

export const useUserEvents = () => {
    const { setConversationUsers } = useContext(ConversationContext);
    const { authUser } = useContext(AuthContext);
    const authUserId = authUser?.id;

    const ensureConversation = useCallback(
        async (targetUserId: string) => {
            if (!authUserId) return;
            try {
                const response = await post<null>(
                    `/conversations/direct/${targetUserId}`,
                    null
                );
                const data = response.data as DirectConversationApiResponse;
                if (!data?.conversationId) return;
                setConversationUsers((prev) =>
                    prev.map((user) =>
                        user.id === targetUserId
                            ? { ...user, conversationId: data.conversationId }
                            : user
                    )
                );
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to resolve conversation', error);
            }
        },
        [authUserId, setConversationUsers]
    );

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
                    conversationId: undefined,
                    senderName: payload.user.username,
                    unseenMessageCount: 0,
                    profileImageUrl: payload.user.userProfile.profileUrl,
                    isConnected: true,
                    messages: [],
                    self: payload.user.id === authUserId,
                };
                prev.push(conversationUser);
                return [...prev];
            });
            void ensureConversation(payload.user.id);
        },
        [setConversationUsers, authUserId, ensureConversation]
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
                if (!acc.some((user) => user.user.id === current.user.id)) {
                    acc.push(current);
                }
                return acc;
            }, []);
            const conversationUsers: UserConversation[] = uniqueUsers.map(
                (userPayload) => {
                    return {
                        id: userPayload.user.id,
                        conversationId: undefined,
                        senderName: userPayload.user.username,
                        unseenMessageCount: 0,
                        profileImageUrl:
                            userPayload.user.userProfile.profileUrl,
                        isConnected: userPayload.isConnected,
                        messages: [],
                        self: userPayload.user.id === authUserId,
                    };
                }
            );
            setConversationUsers(conversationUsers);
            uniqueUsers.forEach((payload) => {
                void ensureConversation(payload.user.id);
            });
        },
        [setConversationUsers, authUserId, ensureConversation]
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
