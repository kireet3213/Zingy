import { useEffect } from 'react';
import { socket } from '../socket.ts';
import { Message, User } from '@shared-types/socket.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { selectCurrentUser } from '../pages/auth/authSlice.ts';
import {
    selectConversationUsers,
    selectSelectedConversationUserId,
    upsertConversationUser,
} from '../pages/dashboard/conversationSlice.ts';
import { appendMessageForUser } from '../pages/dashboard/messageSlice.ts';

export const useMessageEvents = () => {
    const dispatch = useAppDispatch();
    const authUser = useAppSelector(selectCurrentUser);
    const selectedConversationUserId = useAppSelector(
        selectSelectedConversationUserId
    );
    const conversationUsers = useAppSelector(selectConversationUsers);

    useEffect(() => {
        const handlePrivateMessage = (payload: {
            message: Message;
            from: string;
            to: string;
            fromUser: User | null;
        }) => {
            const conversationUserId = payload.from;
            const isFromSelf = payload.from === authUser?.id;

            if (
                !isFromSelf &&
                payload.fromUser &&
                !conversationUsers.some((u) => u.id === conversationUserId)
            ) {
                dispatch(
                    upsertConversationUser({
                        id: payload.fromUser.id,
                        conversationId: undefined,
                        senderName: payload.fromUser.username,
                        profileImageUrl:
                            payload.fromUser.userProfile?.profileUrl ?? '',
                        isConnected: true,
                        self: false,
                    })
                );
            }

            const newMessage: Message = {
                ...payload.message,
                fromSelf: isFromSelf,
            };
            dispatch(
                appendMessageForUser({
                    userId: conversationUserId,
                    message: newMessage,
                    markUnseen:
                        selectedConversationUserId !== conversationUserId,
                })
            );
        };

        socket.on('private-message', handlePrivateMessage);
        return () => {
            socket.off('private-message', handlePrivateMessage);
        };
    }, [authUser?.id, dispatch, selectedConversationUserId, conversationUsers]);
};
