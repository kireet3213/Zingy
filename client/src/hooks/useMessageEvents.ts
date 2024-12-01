import { useContext, useEffect } from 'react';
import { socket } from '../socket.ts';
import { Message } from '@shared-types/socket.ts';
import { ConversationContext } from '../pages/dashboard/ConversationContext.tsx';
import { AuthContext } from '../AuthContext.tsx';
import { UserConversation } from '../pages/dashboard/types/conversation.ts';
import { useParams } from 'react-router-dom';

export const useMessageEvents = () => {
    const { setConversationUsers } = useContext(ConversationContext);
    const { authUser } = useContext(AuthContext);
    const params = useParams<{ conversation_id: string }>();

    useEffect(() => {
        const handlePrivateMessage = (payload: {
            message: Message;
            from: string;
            to: string;
        }) => {
            setConversationUsers((prev) => {
                const newUserMap = prev.map((user) => {
                    const userConversation: UserConversation = { ...user };
                    if (user.id === payload.from) {
                        const message: Message = {
                            ...payload.message,
                            fromSelf: false,
                        };
                        userConversation.messages.push(message);
                    }
                    if (
                        params.conversation_id !== payload.from &&
                        user.socketId === payload.from
                    ) {
                        userConversation.unseenMessageCount++;
                    }
                    return userConversation;
                });
                return newUserMap;
            });
        };

        socket.on('private-message', handlePrivateMessage);
        return () => {
            socket.off('private-message', handlePrivateMessage);
        };
    }, [authUser?.id, setConversationUsers, params.conversation_id]);
};
