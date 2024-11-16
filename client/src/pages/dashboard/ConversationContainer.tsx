import { useContext } from 'react';
import { ConversationBox } from './ConversationBox';
import { ConversationContext } from './ConversationContext';
import { useUserEvents } from '../../hooks/useUserEvents.ts';

export function ConversationContainer() {
    //TODO: for search bar functionality
    const { conversationUsers } = useContext(ConversationContext);
    useUserEvents();
    return (
        <div className="conversation-container">
            <ConversationBox conversationUsers={conversationUsers} />
        </div>
    );
}
