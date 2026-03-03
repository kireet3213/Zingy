import { createContext, PropsWithChildren } from 'react';
import { UserConversation } from './types/conversation';

type ConversationContextProps = PropsWithChildren<{
    conversationUsers: UserConversation[];
    setConversationUsers: React.Dispatch<
        React.SetStateAction<UserConversation[]>
    >;
}>;

export const ConversationContext = createContext<ConversationContextProps>({
    conversationUsers: [],
    setConversationUsers: () => {},
});
