import { forwardRef } from 'react';
import { Maybe } from '../../types/utility';
import { Message } from '@shared-types/socket.ts';
import clsx from 'clsx';

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
                        className={clsx('bg-slate-100 max-w-[50%] rounded-md hyphens-auto p-2 relative self-start',message.fromSelf && 'self-end bg-slate-200 ')}
                    >
                        <span>
                            {message.text}
                        </span>
                        <img className="absolute w-4 h-4 bottom-0 right-0" src="/sent.svg" alt="" />
                        <span className="text-xs font-extralight block text-end -mb-0.5 mx-2">
                            {`${getTime(message.updatedAt)}`}
                        </span>
                    </span>
                ))}
            </div>
        );
    },
);
