import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { TextField } from '@radix-ui/themes';
import { useLocation } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { socket } from '../../socket';
import { AcknowledgementCallback, Message } from '@shared-types/socket';
import './css/dashboard.styles.css';
import { ConversationContext } from './ConversationContext';
import { MessageBox } from './MessageBox';
import { v7 as uuidV7 } from 'uuid';
import { AuthContext } from '../../AuthContext';

const sendMessageTone = new Audio('/happy-pop.mp3');

const acknowledgementCallback: AcknowledgementCallback = (
    error,
    acknowlegementResponse
) => {
    if (error) {
        // the other side did not acknowledge the event in the given delay
        // eslint-disable-next-line no-console
        console.error(
            'Timeout Error. Not Acknowledged. Need to send data again',
            error
        );
    }
    // eslint-disable-next-line no-console
    console.log('ackResponse', acknowlegementResponse);
};

export function ConversationViewContainer() {
    const {
        state: { socketId, isConnected } = {
            socketId: null,
            isConnected: null,
        },
    } = useLocation();
    const { authUser } = useContext(AuthContext);

    const [currentMessage, setCurrentMessage] = useState('');
    const sendMessageFieldRef = useRef<HTMLInputElement>(null);
    const messageBoxRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const { conversationUsers, setConversationUsers } =
        useContext(ConversationContext);

    useEffect(() => {
        const user = conversationUsers?.find(
            (user) => user.socketId === socketId
        );
        if (user) {
            setMessages(user.messages);
        }

        //set scroll to bottom
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop =
                messageBoxRef.current.scrollHeight;
        }
    }, [conversationUsers, socketId]);

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
                    return user;
                });
                return newMessage;
            });
        });
        return () => {
            socket.off('private-message');
        };
    }, [authUser?.id, setConversationUsers]);

    async function submitMessage() {
        if (sendMessageFieldRef.current) {
            if (!sendMessageFieldRef.current.value?.trim()) return;
            sendMessageTone.currentTime = 0;
            await sendMessageTone.play();
            const messageDetails: Message = {
                id: uuidV7(),
                createdAt: new Date().toString(),
                updatedAt: new Date().toString(),
                text: currentMessage,
                to: socketId,
                fromSelf: true,
            };
            if (isConnected && socketId) {
                socket
                    .timeout(5000)
                    .emit(
                        'private-message',
                        messageDetails,
                        acknowledgementCallback
                    );
                if (authUser?.id !== socketId) {
                    setConversationUsers((prev) => {
                        const newPrev = prev.map((user) => {
                            if (user.id === socketId) {
                                user.messages.push({ ...messageDetails });
                            }
                            return user;
                        });
                        return newPrev;
                    });
                }
            }
            sendMessageFieldRef.current.value = '';
        }
    }

    return (
        <div className="conversation-view-container">
            <div ref={messageBoxRef} className="message-box-container">
                <MessageBox messages={messages} />
            </div>
            <TextField.Root
                ref={sendMessageFieldRef}
                radius="full"
                size="3"
                placeholder="Reply…"
                onChange={(e) => {
                    setCurrentMessage(e.currentTarget.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) return;
                    if (e.key === 'Enter') {
                        submitMessage();
                    }
                }}
                variant="classic"
            >
                <TextField.Slot side="right">
                    <PaperPlaneIcon cursor="pointer" onClick={submitMessage} />
                </TextField.Slot>
            </TextField.Root>
        </div>
    );
}
