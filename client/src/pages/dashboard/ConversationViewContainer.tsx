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
        <div className="relative flex flex-col justify-between bg-slate-400 min-h-[95vh] max-h-[95vh] rounded-tr-lg rounded-br-lg">
            <div
                ref={messageBoxRef}
                className="flex flex-col justify-center max-h-[89vh] min-h-[89vh] overflow-auto "
            >
                <MessageBox messages={messages} />
            </div>
            <div className="relative mx-1 -mb-1">
                <textarea
                    className="rounded-lg w-full border-2 focus:border-slate-500 resize-none content-center focus:outline-none pl-2 pr-14 max-h-[5vh] min-h-[30px] break-all"
                    ref={sendMessageFieldRef}
                    placeholder="Send message…"
                    onChange={(e) => {
                        setCurrentMessage(e.currentTarget.value);
                    }}
                    defaultValue={undefined}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) return;
                        if (e.key === 'Enter') {
                            submitMessage();
                        }
                    }}
                />
                <button
                    className="bg-slate-300 min-w-8 min-h-[60%] max-h-[10%] max-w-[2%] absolute right-2 bottom-3.5 -translate-1/2 rounded-full flex items-center justify-center hover:bg-slate-400"
                    onClick={submitMessage}
                >
                    <PaperPlaneIcon
                        color=" #fbbf24"
                        stroke="currentColor"
                        strokeWidth={1}
                        fill="red"
                        className="cursor-pointer text-slate-800"
                        cursor="pointer"
                    />
                </button>
            </div>
        </div>
    );
}
