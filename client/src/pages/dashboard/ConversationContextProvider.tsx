import { PropsWithChildren, useState } from 'react';
import { UserConversation } from './types/conversation';
import { ConversationContext } from './ConversationContext';

export const ConversationContextProvider = ({
    children,
}: PropsWithChildren) => {
    const [conversationUsers, setConversationUsers] = useState<
        UserConversation[]
    >([]);

    return (
        <ConversationContext.Provider
            value={{
                conversationUsers,
                setConversationUsers,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};
