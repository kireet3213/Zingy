import { useContext, useEffect } from 'react';
import { socket } from '../socket.ts';
import { Message } from '@shared-types/socket.ts';
import { ConversationContext } from '../pages/dashboard/ConversationContext.tsx';
import { AuthContext } from '../AuthContext.tsx';
import { Maybe } from '../types/utility.ts';

export const useMessageEvents = (selectedUserSocketId: Maybe<string>) => {
    const { setConversationUsers } = useContext(ConversationContext);
    const { authUser } = useContext(AuthContext);
    useEffect(() => {
        socket.on('private-message', (payload) => {
            setConversationUsers((prev) => {
                const newMessage = prev.map((user) => {
                    if (user.id === payload.from) {
                        const message: Message = {
                            ...payload.message,
                            fromSelf: false,
                        };
                        user.messages.push(message);
                    }
                    if (
                        selectedUserSocketId !== payload.from &&
                        user.socketId === payload.from
                    ) {
                        user.unseenMessageCount = user.unseenMessageCount + 1;
                    }
                    return user;
                });
                return newMessage;
            });
        });
        return () => {
            socket.off('private-message');
        };
    }, [authUser?.id, setConversationUsers, selectedUserSocketId]);
};
