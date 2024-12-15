import { useContext } from 'react';
import { ConversationBox } from './ConversationBox';
import { ConversationContext } from './ConversationContext';
import { useUserEvents } from '../../hooks/useUserEvents.ts';

export function ConversationContainer() {
    //TODO: for search bar functionality
    const { conversationUsers } = useContext(ConversationContext);
    useUserEvents();
    return (
        <div className=" flex flex-col bg-slate-500 overflow-auto overflow-x-hidden h-[100vh] lg:h-[95vh]">
            <ConversationBox conversationUsers={conversationUsers} />
        </div>
    );
}
