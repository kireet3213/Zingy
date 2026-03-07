import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { useParams } from 'react-router-dom';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { socket } from '../../socket';
import { AcknowledgementCallback, Message } from '@shared-types/socket';
import { ConversationContext } from './ConversationContext';
import { MessageBox } from './MessageBox';
import { get, post } from '../../helpers/axios-client.ts';

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
    const { conversation_id } = useParams<{ conversation_id: string }>();

    const [currentMessage, setCurrentMessage] = useState('');
    const sendMessageFieldRef = useRef<HTMLTextAreaElement>(null);
    const messageBoxRef = useRef<HTMLDivElement>(null);
    const { conversationUsers, setConversationUsers } =
        useContext(ConversationContext);
    const selectedUser = conversationUsers.find(
        (conversationUser) => conversationUser.id === conversation_id
    );

    type MessageApiPayload = {
        id: string;
        text: string;
        createdAt: string;
        updatedAt: string;
        sender: {
            id: string;
            username: string;
        };
    };

    const ensureConversationId = useCallback(async (): Promise<
        number | null
    > => {
        if (!conversation_id) return null;

        const existingConversationId = selectedUser?.conversationId;
        if (existingConversationId) return existingConversationId;

        try {
            const response = await post<null>(
                `/conversations/direct/${conversation_id}`,
                null
            );
            const data = response.data as {
                success: boolean;
                conversationId: number;
            };
            if (!data?.conversationId) return null;
            setConversationUsers((prev) =>
                prev.map((user) =>
                    user.id === conversation_id
                        ? { ...user, conversationId: data.conversationId }
                        : user
                )
            );
            return data.conversationId;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to resolve conversation id', error);
            return null;
        }
    }, [conversation_id, selectedUser?.conversationId, setConversationUsers]);

    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop =
                messageBoxRef.current.scrollHeight;
        }
    }, [selectedUser?.messages]);

    useEffect(() => {
        if (!conversation_id) return;

        const loadMessages = async () => {
            const conversationId =
                selectedUser?.conversationId || (await ensureConversationId());
            if (!conversationId) return;
            try {
                const response = await get(
                    `/conversations/${conversationId}/messages`,
                    {
                        params: {
                            page: 1,
                            perPage: 100,
                        },
                    }
                );
                const payload = response.data as {
                    success: boolean;
                    messages: MessageApiPayload[];
                };

                const mappedMessages: Message[] = payload.messages.map(
                    (messagePayload) => ({
                        id: messagePayload.id,
                        createdAt: messagePayload.createdAt,
                        updatedAt: messagePayload.updatedAt,
                        text: messagePayload.text,
                        to: conversation_id,
                        fromSelf: messagePayload.sender.id !== conversation_id,
                    })
                );

                setConversationUsers((prev) =>
                    prev.map((user) =>
                        user.id === conversation_id
                            ? {
                                  ...user,
                                  messages: mappedMessages,
                                  unseenMessageCount: 0,
                              }
                            : user
                    )
                );
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to fetch messages', error);
            }
        };

        void loadMessages();
    }, [
        selectedUser?.conversationId,
        conversation_id,
        setConversationUsers,
        ensureConversationId,
    ]);

    async function submitMessage() {
        if (!sendMessageFieldRef.current || !selectedUser) return;
        if (!sendMessageFieldRef.current.value?.trim()) return;
        const conversationId =
            selectedUser.conversationId || (await ensureConversationId());
        if (!conversationId) return;

        try {
            const response = await post(
                `/conversations/${conversationId}/messages`,
                {
                    text: currentMessage.trim(),
                }
            );
            const data = response.data as {
                success: boolean;
                message: MessageApiPayload;
            };
            const persistedMessage: Message = {
                id: data.message.id,
                createdAt: data.message.createdAt,
                updatedAt: data.message.updatedAt,
                text: data.message.text,
                to: selectedUser.id,
                fromSelf: true,
            };

            sendMessageTone.currentTime = 0;
            await sendMessageTone.play();

            setConversationUsers((prev) =>
                prev.map((user) => {
                    if (user.id !== selectedUser.id) {
                        return user;
                    }
                    const alreadyExists = user.messages.some(
                        (message) => message.id === persistedMessage.id
                    );
                    if (alreadyExists) return user;
                    return {
                        ...user,
                        messages: [...user.messages, persistedMessage],
                    };
                })
            );

            if (selectedUser.isConnected) {
                socket
                    .timeout(5000)
                    .emit(
                        'private-message',
                        persistedMessage,
                        acknowledgementCallback
                    );
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to send message', error);
        }

        sendMessageFieldRef.current.value = '';
        setCurrentMessage('');
    }

    return (
        <div className="relative flex h-full min-h-0 flex-col bg-transparent">
            <div
                ref={messageBoxRef}
                className="flex flex-1 min-h-0 flex-col justify-center overflow-auto px-2 md:px-6"
            >
                <MessageBox messages={selectedUser?.messages || []} />
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
