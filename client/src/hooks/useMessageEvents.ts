import { useContext, useEffect } from 'react';
import { socket } from '../socket.ts';
import { Message } from '@shared-types/socket.ts';
import { ConversationContext } from '../pages/dashboard/ConversationContext.tsx';
import { AuthContext } from '../AuthContext.tsx';
import { useParams } from 'react-router-dom';

export const useMessageEvents = () => {
    const { setConversationUsers } = useContext(ConversationContext);
    const { authUser } = useContext(AuthContext);
    const { conversation_id } = useParams<{ conversation_id: string }>();

    useEffect(() => {
        const handlePrivateMessage = (payload: {
            message: Message;
            from: string;
            to: string;
        }) => {
            setConversationUsers((prev) =>
                prev.map((user) => {
                    if (user.id !== payload.from && user.socketId !== payload.from) {
                        return user;
                    }
                    const messageExists = user.messages.some(
                        (message) => message.id === payload.message.id
                    );
                    if (messageExists) {
                        return user;
                    }
                    const newMessage: Message = {
                        ...payload.message,
                        fromSelf: false,
                    };
                    const unseenIncrement =
                        conversation_id !== payload.from && user.socketId === payload.from
                            ? 1
                            : 0;
                    return {
                        ...user,
                        messages: user.id === payload.from
                            ? [...user.messages, newMessage]
                            : user.messages,
                        unseenMessageCount: user.unseenMessageCount + unseenIncrement,
                    };
                })
            );
        };

        socket.on('private-message', handlePrivateMessage);
        return () => {
            socket.off('private-message', handlePrivateMessage);
        };
    }, [authUser?.id, setConversationUsers, conversation_id]);
};
