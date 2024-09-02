// import { useEffect, useState } from 'react';
import { ConversationBox } from './ConversationBox';
import { Conversations } from './mockData/conversations-mock';
// import { get } from '../../helpers/axios-client';
// import { AuthUser } from '../../types/user';
// import { Maybe } from '../../types/utility';

export function ConversationContainer() {
    //TODO: for search bar functionality
    // const [users, setUsers] = useState<Maybe<AuthUser[]>>([]);
    // useEffect(() => {
    //     fetchUsers();
    // }, []);
    // useEffect(() => {
    //     console.log(users);
    // }, [users]);
    // const fetchUsers = async () => {
    //     const response = await get('/user/search-users',{
    //         params: {
    //             keyword: 'paul',
    //         },
    //     });
    //     setUsers(response.data.users);
    // };
    return (
        <div
            style={{
                overflow: 'auto',
                scrollbarGutter: 'stable',
                overflowX: 'hidden',
                scrollbarColor: 'var(--gray-8) var(--gray-11)',
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth',
                height: '100%',
                minHeight: '95dvh',
                maxHeight: '95dvh',
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
