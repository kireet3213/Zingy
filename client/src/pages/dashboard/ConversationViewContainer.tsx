import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { TextField } from '@radix-ui/themes';
import { useLocation } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { socket } from '../../socket';
import { AcknowledgementCallback, Message } from '@shared-types/socket';
import { ConversationContext } from './ConversationContext';
import { MessageBox } from './MessageBox';
import { v7 as uuidV7 } from 'uuid';
import { AuthContext } from '../../AuthContext';
import { Maybe } from '../../types/utility.ts';

const sendMessageTone = new Audio('/happy-pop.mp3');

const acknowledgementCallback: AcknowledgementCallback = (
    error,
    acknowledgementResponse,
) => {
    if (error) {
        // the other side did not acknowledge the event in the given delay
        // eslint-disable-next-line no-console
        console.error(
            'Timeout Error. Not Acknowledged. Need to send data again',
            error,
        );
    }
    // eslint-disable-next-line no-console
    console.log('ackResponse', acknowledgementResponse);
};

export function ConversationViewContainer() {
    const location = useLocation();
    const state: Maybe<{ socketId: string; isConnected: boolean }> =
        location.state;
    const { authUser } = useContext(AuthContext);

    const [currentMessage, setCurrentMessage] = useState('');
    const sendMessageFieldRef = useRef<HTMLInputElement>(null);
    const messageBoxRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const { conversationUsers, setConversationUsers } =
        useContext(ConversationContext);

    useEffect(() => {
        const user = conversationUsers.find(
            (user) => user.socketId === state?.socketId,
        );
        if (user) {
            setMessages(user.messages);
        }
        //set scroll to bottom
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop =
                messageBoxRef.current.scrollHeight;
        }
    }, [conversationUsers,messages, state?.socketId]);

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
                to: state?.socketId || '',
                fromSelf: true,
            };
            if (state?.isConnected && state?.socketId) {
                socket
                    .timeout(5000)
                    .emit(
                        'private-message',
                        messageDetails,
                        acknowledgementCallback,
                    );
                if (authUser?.id !== state?.socketId) {
                    setConversationUsers((prev) => {
                        const newPrev = prev.map((user) => {
                            if (user.id === state?.socketId) {
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
        <div className="flex flex-col justify-between bg-gray-400 min-h-[95vh] max-h-[95vh]">
            <div ref={messageBoxRef} className="flex flex-col justify-center max-h-[89vh] min-h-[89vh] overflow-auto ">
                <MessageBox messages={messages} />
            </div>
            <TextField.Root
                ref={sendMessageFieldRef}
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
                className="rounded-full border mb-0.5"
                variant="classic"
            >
                <TextField.Slot side="right">
                    <PaperPlaneIcon cursor="pointer" onClick={submitMessage} />
                </TextField.Slot>
            </TextField.Root>
        </div>
    );
}
