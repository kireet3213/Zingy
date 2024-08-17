import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { TextField } from '@radix-ui/themes';
import { useParams } from 'react-router-dom';
import { conversationMessages } from './mockData/conversation-messages';
import { MessageBox } from './MessageBox';
import { useEffect, useRef, useState } from 'react';
import { ConversationMessage } from './types/messages';
const sendMessageTone = new Audio('/happy-pop.mp3');

export function ConversationViewContainer() {
    const { conversation_id } = useParams<{ conversation_id: string }>();
    const [selectedConversation, setSelectedConverstaion] = useState<
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
        setSelectedConverstaion(selectedConversation);
    }, [conversation_id, selectedConversation]);

    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop =
                messageBoxRef.current.scrollHeight;
        }
    }, [selectedConversation?.messages]);

    async function submitMessage() {
        if (sendMessageFieldRef.current && messageBoxRef.current) {
            if (!sendMessageFieldRef.current.value?.trim()) return;
            await sendMessageTone.play();
            setSelectedConverstaion((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    messages: [
                        ...prev.messages,
                        {
                            id: prev?.messages.length + 1,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            senderId: 1,
                            text: currentMessage,
                        },
                    ],
                };
            });
            sendMessageFieldRef.current.value = '';
            messageBoxRef.current.scrollIntoView({
                behavior: 'smooth',
            });
        }
    }
    return (
        <div
            style={{
                display: 'flex',
                alignContent: 'center',
                justifyContent: 'space-between',
                flexDirection: 'column',
                backgroundColor: 'var(--gray-5)',
                height: '100%',
                minHeight: '96vh',
                maxHeight: '96vh',
            }}
        >
            <MessageBox
                ref={messageBoxRef}
                conversation={selectedConversation}
            />
            <TextField.Root
                ref={sendMessageFieldRef}
                radius="full"
                size="3"
                placeholder="Reply…"
                onChange={(e) => {
                    setCurrentMessage(e.currentTarget.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        submitMessage();
                    }
                }}
                variant="classic"
                style={{ minHeight: '40px', maxWidth: '99.7%' }}
            >
                <TextField.Slot side="right">
                    <PaperPlaneIcon cursor="pointer" onClick={submitMessage} />
                </TextField.Slot>
            </TextField.Root>
        </div>
    );
}
