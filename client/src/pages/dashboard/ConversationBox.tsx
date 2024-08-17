import { Conversation } from './types/conversation';
import './css/conversation-box.styles.css';
import { useNavigate } from 'react-router-dom';

type ConversationBoxProps = {
    conversation: Conversation;
};
export const ConversationBox = ({ conversation }: ConversationBoxProps) => {
    const { profileImageUrl, senderName, lastMessage, unseenMessageCount, id } =
        conversation;
    const navigate = useNavigate();
    return (
        <div className="conversation-box">
            <div style={{ width: '20%', textAlign: 'center' }}>
                <img
                    src={
                        profileImageUrl ||
                        'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'
                    }
                    alt="No Image"
                    height="50px"
                    className="avatar-image"
                />
            </div>
            <div
                className="conversation-info"
                onClick={() => navigate('/dashboard/' + id)}
            >
                <div className="conversation-user">
                    <span
                        style={{
                            fontWeight: 500,
                            fontSize: 'var(--space-4)',
                        }}
                    >
                        {senderName || 'UserName'}
                    </span>
                    <span
                        style={{
                            fontWeight: 300,
                            fontSize: 'var(--space-3)',
                        }}
                    >
                        13:45
                    </span>
                </div>
                <div className="message-info">
                    <div className="last-message">
                        {lastMessage ??
                            `This is a last message received from server that might be
                    very long. Lorem ipsum dolor sit, amet consectetur
                    adipisicing elit. Sapiente, distinctio?`}
                    </div>
                    <span className="unseen-message">
                        {unseenMessageCount ?? undefined}
                    </span>
                </div>
            </div>
        </div>
    );
};
