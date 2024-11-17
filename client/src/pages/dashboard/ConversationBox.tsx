import { UserConversation } from './types/conversation';
import './css/conversation-box.styles.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { Maybe } from '../../types/utility';
import { useMessageEvents } from '../../hooks/useMessageEvents.ts';

type ConversationBoxProps = {
    conversationUsers: Maybe<UserConversation[]>;
};
const UserComponent = ({
    conversation,
}: {
    conversation: UserConversation;
}) => {
    const {
        profileImageUrl,
        senderName,
        unseenMessageCount,
        id,
        isConnected,
        socketId,
        messages,
    } = conversation;
    const lastMessageTime = messages
        ?.at(-1)
        ?.createdAt.split(' ')[4]
        .split(':')
        .slice(0, -3);
    const navigate = useNavigate();

    return (
        <NavLink
            to={`/dashboard/${id}`}
            state={{ socketId, isConnected }}
            className="conversation-box"
        >
            <div className="avatar-image-container">
                <img
                    src={
                        profileImageUrl ||
                        'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'
                    }
                    alt="No Image"
                    height="100%"
                    className="avatar-image"
                    onClick={(e) => e.preventDefault()}
                />
                <span
                    className={`status-icon ${isConnected ? 'online' : 'offline'}`}
                ></span>
            </div>
            <div
                className="conversation-info"
                onClick={() =>
                    navigate('/dashboard/' + id, {
                        state: { socketId, isConnected },
                    })
                }
            >
                <div className="conversation-username-and-last-message-container">
                    <span
                        style={{
                            fontWeight: 500,
                            fontSize: 'var(--space-4)',
                        }}
                    >
                        {senderName || 'UserName'}
                    </span>
                    <div className="last-message">
                        {`${messages.at(-1)?.text || ''}`}
                    </div>
                </div>
                <div className="last-message-timestamp-and-unseen-message-count">
                    <span
                        style={{
                            fontWeight: 300,
                            fontSize: 'var(--space-3)',
                        }}
                    >
                        {lastMessageTime}
                    </span>
                    {unseenMessageCount > 0 ? (
                        <span className="unseen-message-count">
                            {unseenMessageCount}
                        </span>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </NavLink>
    );
};
export const ConversationBox = ({
    conversationUsers,
}: ConversationBoxProps) => {
    useMessageEvents();

    return (conversationUsers || []).map((conversation) => (
        <UserComponent key={conversation.id} conversation={conversation} />
    ));
};
