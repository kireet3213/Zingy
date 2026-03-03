import { useContext } from 'react';
import { ConversationBox } from './ConversationBox';
import { ConversationContext } from './ConversationContext';
import { useUserEvents } from '../../hooks/useUserEvents.ts';

export function ConversationContainer() {
    //TODO: for search bar functionality
    const { conversationUsers } = useContext(ConversationContext);
    useUserEvents();
    return (
        <div className="flex min-h-0 flex-col bg-slate-800 border-r border-slate-700 overflow-y-auto">
            <ConversationBox conversationUsers={conversationUsers} />
        </div>
    );
}
