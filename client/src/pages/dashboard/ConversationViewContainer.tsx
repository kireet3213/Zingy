import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { TextField } from '@radix-ui/themes';
import { useParams } from 'react-router-dom';
import { conversationMessages } from './mockData/conversation-messages';
import { MessageBox } from './MessageBox';
import { useEffect, useRef, useState } from 'react';
import { ConversationMessage } from './types/messages';
import { socket } from '../../socket';
import { AcknowledgementCallback } from '../../types/socket';
import './css/dashboard.styles.css'


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
    const { conversation_id } = useParams<{ conversation_id: string }>();
    const [selectedConversation, setSelectedConversation] = useState<
        ConversationMessage | undefined
    >();

    const [currentMessage, setCurrentMessage] = useState('');
    const sendMessageFieldRef = useRef<HTMLInputElement>(null);
    const messageBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const selectedConversation = conversationMessages.find(
            (conversation) =>
                conversation.conversationId === parseInt(conversation_id || '')
        );
        setSelectedConversation(selectedConversation);
    }, [conversation_id, selectedConversation]);

    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop =
                messageBoxRef.current.scrollHeight;
        }
    }, [selectedConversation?.messages]);

    async function submitMessage() {
        if (sendMessageFieldRef.current) {
            if (!sendMessageFieldRef.current.value?.trim()) return;
            sendMessageTone.currentTime = 0;
            await sendMessageTone.play();
            const messageDetails = {
                createdAt: new Date(),
                updatedAt: new Date(),
                senderId: 'e5156d09-e552-47a6-99b0-858327a6379f',
                text: currentMessage,
            };
            setSelectedConversation((prev) => {
                if (!prev) return prev;
                const newMessage = {
                    id: (prev?.messages.length + 1).toString(),
                    ...messageDetails,
                };
                conversationMessages[0].messages.push(newMessage);
                return {
                    ...prev,
                    messages: [...prev.messages, newMessage],
                };
            });
            socket
                .timeout(5000)
                .emit('message', messageDetails, acknowledgementCallback);
            sendMessageFieldRef.current.value = '';
        }
    }
    return (
        <div
            className='conversation-view-container'
        >
            <div
                ref={messageBoxRef}
                style={{
                   
                }}
                className='message-box-container'
            >
                <MessageBox conversation={selectedConversation} />
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
