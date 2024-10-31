import { createContext, PropsWithChildren, useState } from 'react';
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
