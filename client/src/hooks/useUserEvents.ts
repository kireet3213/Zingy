import { useCallback, useEffect } from 'react';
import { User } from '@shared-types/socket.ts';
import { UserConversation } from '../pages/dashboard/types/conversation.ts';
import { socket } from '../socket.ts';
import { post } from '../helpers/axios-client.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { selectCurrentUser } from '../pages/auth/authSlice.ts';
import {
    setConversationIdForUser,
    setConversationUsers as setConversationUsersAction,
    setUserConnectionStatus,
    upsertConversationUser,
} from '../pages/dashboard/conversationSlice.ts';

type DirectConversationApiResponse = {
    success: boolean;
    conversationId: number;
    participants: string[];
};

export const useUserEvents = () => {
    const dispatch = useAppDispatch();
    const authUser = useAppSelector(selectCurrentUser);
    const authUserId = authUser?.id ?? null;

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
                dispatch(
                    setConversationIdForUser({
                        userId: targetUserId,
                        conversationId: data.conversationId,
                    })
                );
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to resolve conversation', error);
            }
        },
        [authUserId, dispatch]
    );

    const onNewConnection = useCallback(
        (payload: { id: string; user: User }) => {
            dispatch(
                upsertConversationUser({
                    id: payload.user.id,
                    conversationId: undefined,
                    senderName: payload.user.username,
                    profileImageUrl: payload.user.userProfile.profileUrl,
                    isConnected: true,
                    self: payload.user.id === authUserId,
                } satisfies UserConversation)
            );
            void ensureConversation(payload.user.id);
        },
        [dispatch, authUserId, ensureConversation]
    );
    const onUserDisconnect = useCallback(
        (userId: string) => {
            dispatch(setUserConnectionStatus({ userId, isConnected: false }));
        },
        [dispatch]
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
                        profileImageUrl:
                            userPayload.user.userProfile.profileUrl,
                        isConnected: userPayload.isConnected,
                        self: userPayload.user.id === authUserId,
                    };
                }
            );
            dispatch(setConversationUsersAction(conversationUsers));
            uniqueUsers.forEach((payload) => {
                void ensureConversation(payload.user.id);
            });
        },
        [dispatch, authUserId, ensureConversation]
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
    }, [onConnectedUsers, onNewConnection, onUserDisconnect]);
};
