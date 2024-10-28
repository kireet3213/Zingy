import { Conversation } from './types/conversation';
import './css/conversation-box.styles.css';
import { NavLink, useNavigate } from 'react-router-dom';

type ConversationBoxProps = {
    conversation: Conversation;
};
export const ConversationBox = ({ conversation }: ConversationBoxProps) => {
    const { profileImageUrl, senderName, lastMessage, unseenMessageCount, id } =
        conversation;
    const navigate = useNavigate();
    return (
        <NavLink to={`/dashboard/${id}`} className="conversation-box">
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
            </div>
            <div
                className="conversation-info"
                onClick={() => navigate('/dashboard/' + id)}
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
                        {lastMessage ??
                            `This is a last message received from server that might be
                    very long. Lorem ipsum dolor sit, amet consectetur
                    adipisicing elit. Sapiente, distinctio?`}
                    </div>
                </div>
                <div className="last-message-timestamp-and-unseen-message-count">
                    <span
                        style={{
                            fontWeight: 300,
                            fontSize: 'var(--space-3)',
                        }}
                    >
                        13:45
                    </span>
                    <span className="unseen-message-count">
                        {unseenMessageCount ?? undefined}
                    </span>
                </div>
            </div>
        </NavLink>
    );
};
