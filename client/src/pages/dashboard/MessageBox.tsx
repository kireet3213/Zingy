import { forwardRef, useContext } from 'react';
import { Maybe } from '../../types/utility';
import './css/message-container.styles.css';
import { ConversationMessage } from './types/messages';
import { AuthContext } from '../../AuthContext';

type MessageBoxProps = {
    conversation: Maybe<ConversationMessage>;
};
export const MessageBox = forwardRef<HTMLDivElement, MessageBoxProps>(
    function MessageBox(props, ref) {
        const { authUser } = useContext(AuthContext);
        const { conversation } = props;
        return (
            <div
                ref={ref}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    padding: '10px',
                    overflowY: 'auto',
                    flex: 1,
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--gray-8) #fff',
                }}
            >
                {conversation?.messages.map((message) => (
                    <span
                        key={message.id}
                        className={`message-box ${authUser?.id === message.senderId ? 'current-user-message' : ''}`}
                    >
                        {message.text ??
                            `There are forces at work that Lorem ipsum dolor, sit amet
         consectetur adipisicing elit. Laboriosam unde voluptatem sint,
         incidunt aliquid sunt earum eaque, dolorem beatae natus, eos magni
         temporibus tenetur facere deleniti aspernatur! Laudantium mollitia
         debitis quisquam quas labore ab perferendis tempore ratione
         necessitatibus corrupti autem quae, dolore, placeat dolor ipsum
         nihil molestiae dignissimos earum voluptas!`}
                    </span>
                ))}
            </div>
        );
    }
);
