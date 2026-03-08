import { useEffect } from 'react';
import { socket } from '../socket.ts';
import { Message } from '@shared-types/socket.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { selectCurrentUser } from '../pages/auth/authSlice.ts';
import { selectSelectedConversationUserId } from '../pages/dashboard/conversationSlice.ts';
import { appendMessageForUser } from '../pages/dashboard/messageSlice.ts';

export const useMessageEvents = () => {
    const dispatch = useAppDispatch();
    const authUser = useAppSelector(selectCurrentUser);
    const selectedConversationUserId = useAppSelector(
        selectSelectedConversationUserId
    );

    useEffect(() => {
        const handlePrivateMessage = (payload: {
            message: Message;
            from: string;
            to: string;
        }) => {
            const conversationUserId = payload.from;
            const isFromSelf = payload.from === authUser?.id;
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
    }, [authUser?.id, dispatch, selectedConversationUserId]);
};
