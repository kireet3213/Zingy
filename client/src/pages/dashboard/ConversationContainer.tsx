import { ConversationBox } from './ConversationBox';
import { useUserEvents } from '../../hooks/useUserEvents.ts';
import { useAppSelector } from '../../store/hooks.ts';
import { selectConversationUsers } from './conversationSlice.ts';
import { selectCurrentUser } from '../auth/authSlice.ts';

export function ConversationContainer() {
    //TODO: for search bar functionality
    const conversationUsers = useAppSelector(selectConversationUsers);
    const authUser = useAppSelector(selectCurrentUser);
    useUserEvents();
    return (
        <div className="flex min-h-0 flex-col bg-slate-900/60 border-r border-white/5 overflow-y-auto w-full md:w-80 md:shrink-0 max-h-[35vh] md:max-h-none">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Messages
                </h2>
                {authUser && (
                    <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                        {authUser.username}
                    </span>
                )}
            </div>
            <ConversationBox conversationUsers={conversationUsers} />
        </div>
    );
}
