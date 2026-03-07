import { useContext } from 'react';
import { ConversationBox } from './ConversationBox';
import { ConversationContext } from './ConversationContext';
import { useUserEvents } from '../../hooks/useUserEvents.ts';

export function ConversationContainer() {
    //TODO: for search bar functionality
    const { conversationUsers } = useContext(ConversationContext);
    useUserEvents();
    return (
        <div className="flex min-h-0 flex-col bg-slate-900/60 border-r border-white/5 overflow-y-auto w-full md:w-80 md:shrink-0 max-h-[35vh] md:max-h-none">
            <div className="px-4 py-3 border-b border-white/5">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Messages</h2>
            </div>
            <ConversationBox conversationUsers={conversationUsers} />
        </div>
    );
}
