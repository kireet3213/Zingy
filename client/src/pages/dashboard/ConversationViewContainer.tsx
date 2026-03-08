import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../../socket';
import { AcknowledgementCallback, Message } from '@shared-types/socket';
import { MessageBox } from './MessageBox';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { selectCurrentUser } from '../auth/authSlice.ts';
import {
    selectSelectedConversationUser,
    setConversationIdForUser,
} from './conversationSlice.ts';
import { appendMessageForUser, setMessagesForUser } from './messageSlice.ts';
import {
    mapApiMessageToSocketMessage,
    useGetConversationMessagesQuery,
    useResolveDirectConversationMutation,
    useSendConversationMessageMutation,
} from '../../apiSlice.ts';

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
    const dispatch = useAppDispatch();
    const authUser = useAppSelector(selectCurrentUser);
    const selectedUser = useAppSelector(selectSelectedConversationUser);
    const [currentMessage, setCurrentMessage] = useState('');
    const sendMessageFieldRef = useRef<HTMLTextAreaElement>(null);
    const messageBoxRef = useRef<HTMLDivElement>(null);
    const messages = useAppSelector((state) =>
        selectedUser ? (state.messages.byUserId[selectedUser.id] ?? []) : []
    );

    const [resolveDirectConversation] = useResolveDirectConversationMutation();
    const [sendConversationMessage] = useSendConversationMessageMutation();

    const { data: messagesResponse } = useGetConversationMessagesQuery(
        {
            conversationId: selectedUser?.conversationId ?? 0,
            page: 1,
            perPage: 100,
        },
        {
            skip: !selectedUser?.conversationId,
            refetchOnMountOrArgChange: true,
        }
    );

    const ensureConversationId = useCallback(async (): Promise<
        number | null
    > => {
        if (!selectedUser) return null;

        const existingConversationId = selectedUser?.conversationId;
        if (existingConversationId) return existingConversationId;

        try {
            const data = await resolveDirectConversation({
                userId: selectedUser.id,
            }).unwrap();
            if (!data?.conversationId) return null;
            dispatch(
                setConversationIdForUser({
                    userId: selectedUser.id,
                    conversationId: data.conversationId,
                })
            );
            return data.conversationId;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to resolve conversation id', error);
            return null;
        }
    }, [dispatch, resolveDirectConversation, selectedUser]);

    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop =
                messageBoxRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!selectedUser?.id || !messagesResponse?.messages) return;
        const mappedMessages: Message[] = messagesResponse.messages.map(
            (messagePayload) =>
                mapApiMessageToSocketMessage(
                    messagePayload,
                    authUser?.id,
                    selectedUser.id
                )
        );
        dispatch(
            setMessagesForUser({
                userId: selectedUser.id,
                messages: mappedMessages,
            })
        );
    }, [authUser?.id, dispatch, messagesResponse, selectedUser?.id]);

    async function submitMessage() {
        if (!sendMessageFieldRef.current || !selectedUser) return;
        if (!sendMessageFieldRef.current.value?.trim()) return;
        const conversationId =
            selectedUser.conversationId || (await ensureConversationId());
        if (!conversationId) return;

        try {
            const data = await sendConversationMessage({
                conversationId,
                text: currentMessage.trim(),
            }).unwrap();
            const persistedMessage = mapApiMessageToSocketMessage(
                data.message,
                authUser?.id,
                selectedUser.id
            );

            sendMessageTone.currentTime = 0;
            await sendMessageTone.play();

            dispatch(
                appendMessageForUser({
                    userId: selectedUser.id,
                    message: persistedMessage,
                    markUnseen: false,
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
