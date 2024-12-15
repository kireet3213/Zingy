import { UserConversation } from './types/conversation';
import { NavLink } from 'react-router-dom';
import { Maybe } from '../../types/utility';
import { useMessageEvents } from '../../hooks/useMessageEvents.ts';
import Tooltip from '../../components/Tooltip.tsx';

type ConversationBoxProps = {
    conversationUsers: Maybe<UserConversation[]>;
};
const defaultUrl =
    'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg';
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
        isConnected = false,
        socketId,
        messages,
    } = conversation;
    const lastMessageTime = messages
        ?.at(-1)
        ?.createdAt.split(' ')[4]
        .split(':')
        .slice(0, 2)
        .join(':');
    const lastMessage = messages.at(-1)?.text || '';

    return (
        <NavLink
            to={`/dashboard/${id}`}
            state={{ socketId, isConnected }}
            className={({ isActive }) => {
                return `border-b border-gray-600 p-3 rounded-md overflow-hidden hover:bg-slate-900 ${isActive ? 'bg-slate-800' : 'bg-slate-500'}`;
            }}
        >
            <div className="flex  ">
                <SenderImage
                    profileImageUrl={profileImageUrl}
                    isConnected={isConnected}
                />
                <div className="flex justify-between w-full">
                    <SenderNameAndLastMessage
                        lastMessage={lastMessage}
                        senderName={senderName}
                    />
                    <MessageTimeAndCount
                        lastMessageTime={lastMessageTime}
                        unseenMessageCount={unseenMessageCount}
                    />
                </div>
            </div>
        </NavLink>
    );
};

const MessageTimeAndCount = ({
    unseenMessageCount,
    lastMessageTime,
}: {
    unseenMessageCount: number;
    lastMessageTime: Maybe<string>;
}) => {
    return (
        <div className="flex flex-col justify-between items-center">
            <span className={'text-base text-blue-300'}>{lastMessageTime}</span>
            {unseenMessageCount > 0 && (
                <Tooltip content={unseenMessageCount.toString()}>
                    <span className="p-1 rounded-2xl bg-blue-600 text-center min-w-8 max-w-10 min-h-6 truncate overflow-hidden">
                        {unseenMessageCount}
                    </span>
                </Tooltip>
            )}
        </div>
    );
};
const SenderNameAndLastMessage = ({
    senderName,
    lastMessage,
}: {
    lastMessage: string;
    senderName: string;
}) => {
    return (
        <div className="flex flex-col gap-2.5 max-w-xl text-xs text-slate-200 truncate hover:text-clip">
            <span className={'font-medium text-base'}>{senderName}</span>
            <div className="text-slate-200 ">{lastMessage}</div>
        </div>
    );
};
const SenderImage = ({
    profileImageUrl,
    isConnected,
}: {
    profileImageUrl: string;
    isConnected: boolean;
}) => {
    return (
        <div className="overflow-hidden object-cover hover:cursor-pointer mr-2.5 relative min-w-12">
            <img
                src={profileImageUrl || defaultUrl}
                alt="No Image"
                height="100%"
                className="rounded-full max-w-12"
                onClick={(e) => e.preventDefault()}
            />
            <span
                className={`inline-block rounded-full absolute  min-h-2 min-w-2 bottom-0 right-0  ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
            ></span>
        </div>
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
