import { PaperPlaneIcon } from '@radix-ui/react-icons';
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
    acknowledgementResponse
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
    console.log('ackResponse', acknowledgementResponse);
};

export function ConversationViewContainer() {
    const location = useLocation();
    const state: Maybe<{ socketId: string; isConnected: boolean }> =
        location.state;
    const { authUser } = useContext(AuthContext);

    const [currentMessage, setCurrentMessage] = useState('');
    const sendMessageFieldRef = useRef<HTMLTextAreaElement>(null);
    const messageBoxRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const { conversationUsers, setConversationUsers } =
        useContext(ConversationContext);

    useEffect(() => {
        const user = conversationUsers.find(
            (user) => user.socketId === state?.socketId
        );
        if (user) {
            //eslint-disable-next-line
            setMessages(user.messages);
        }
        //set scroll to bottom
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop =
                messageBoxRef.current.scrollHeight;
        }
    }, [conversationUsers, messages, state?.socketId]);

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
                        acknowledgementCallback
                    );
                if (authUser?.id !== state?.socketId) {
                    setConversationUsers((prev) => {
                        return prev.map((user) => {
                            if (user.id !== state?.socketId) {
                                return user;
                            }

                            const alreadyExists = user.messages.some(
                                (message) => message.id === messageDetails.id
                            );
                            if (alreadyExists) {
                                return user;
                            }

                            return {
                                ...user,
                                messages: [...user.messages, { ...messageDetails }],
                            };
                        });
                    });
                }
            }
            sendMessageFieldRef.current.value = '';
            setCurrentMessage('');
        }
    }

    return (
        <div className="relative flex h-full min-h-0 flex-col bg-transparent">
            <div
                ref={messageBoxRef}
                className="flex flex-1 min-h-0 flex-col justify-center overflow-auto px-2 md:px-6"
            >
                <MessageBox messages={messages} />
            </div>
            <div className="p-2 md:p-4">
                <div className="relative">
                    <textarea
                        className="w-full rounded-2xl border border-white/10 bg-white/5 resize-none px-4 py-3 pr-14 text-sm text-slate-200 placeholder-slate-500 focus:outline-none input-glow transition-all duration-200"
                        ref={sendMessageFieldRef}
                        placeholder="Type a message..."
                        rows={1}
                        onChange={(e) => {
                            setCurrentMessage(e.currentTarget.value);
                        }}
                        defaultValue={undefined}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.shiftKey) return;
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submitMessage();
                            }
                        }}
                    />
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-400 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
                        onClick={submitMessage}
                    >
                        <PaperPlaneIcon className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
