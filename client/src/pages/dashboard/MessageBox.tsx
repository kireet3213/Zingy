import { forwardRef } from 'react';
import { Maybe } from '../../types/utility';
import './css/message-container.styles.css';
import { Message } from '@shared-types/socket.ts';

type MessageBoxProps = {
    messages: Maybe<Message[]>;
};
function getTime(date: string): Maybe<string> {
    if (!date) return null;
    const parts = date.split(' ')[4];
    const hourAndMinutes = parts.split(':');
    const hour = hourAndMinutes[0];
    const minutes = hourAndMinutes[1];
    return `${hour}:${minutes}`;
}
export const MessageBox = forwardRef<HTMLDivElement, MessageBoxProps>(
    function MessageBox(props, ref) {
        const { messages } = props;

        return (
            <div
                ref={ref}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    padding: '10px',
                    flex: 1,
                    justifyContent: 'end',
                }}
            >
                {messages?.map((message) => (
                    <span
                        key={message.id}
                        className={`message-box ${message.fromSelf ? 'current-user-message' : ''}`}
                    >
                        <span>
                            {message.text ??
                                `There are forces at work that Lorem ipsum dolor, sit amet`}
                        </span>
                        <img className="sent-icon" src="/sent.svg" alt="" />
                        <span className="message-time">
                            {`${getTime(message.updatedAt)}`}
                        </span>
                    </span>
                ))}
            </div>
        );
    }
);
