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
                className="flex flex-col gap-2 p-3 md:p-4 flex-1 justify-end"
            >
                {messages?.map((message) => (
                    <div
                        key={message.id}
                        className={clsx(
                            'flex',
                            message.fromSelf ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <span
                            className={clsx(
                                'max-w-[75%] md:max-w-[50%] min-w-20 rounded-2xl hyphens-auto px-4 py-2 relative',
                                message.fromSelf
                                    ? 'msg-sent text-white rounded-bl-sm'
                                    : 'msg-received text-slate-200 rounded-br-sm'
                            )}
                        >
                            <span className="text-sm leading-relaxed">{message.text}</span>
                            <span className={clsx(
                                'text-[10px] block text-end mt-1',
                                message.fromSelf ? 'text-indigo-200/60' : 'text-slate-500'
                            )}>
                                {`${getTime(message.updatedAt)}`}
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        );
    }
);
