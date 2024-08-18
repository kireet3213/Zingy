import { ConversationBox } from './ConversationBox';
import { Conversations } from './mockData/conversations-mock';

export function ConversationContainer() {
    return (
        <div
            style={{
                borderRadius: '10px',
                overflow: 'auto',
                scrollbarGutter: 'stable',
                overflowX: 'hidden',
                scrollbarColor: 'var(--gray-8) #fff',
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth',
                height: '100%',
                minHeight: '99vh',
                maxHeight: '99vh',
            }}
        >
            {Conversations.map((conversation) => (
                <ConversationBox
                    key={conversation.id}
                    conversation={conversation}
                />
            ))}
        </div>
    );
}
