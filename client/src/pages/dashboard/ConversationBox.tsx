import { UserConversation } from './types/conversation';
import { NavLink } from 'react-router-dom';
import { Maybe } from '../../types/utility';
import { useMessageEvents } from '../../hooks/useMessageEvents.ts';
import Tooltip from '../../components/Tooltip.tsx';
import profilePic from '../../assets/profile.svg';

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
                return `border-b border-slate-700 p-3 hover:bg-slate-700 transition-colors duration-150 ${
                    isActive ? 'bg-slate-700' : ''
                }`;
            }}
        >
            <div className="flex items-center gap-3">
                <SenderImage
                    profileImageUrl={profilePic}
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
        <div className="flex flex-col items-end justify-between text-xs ml-2">
            <span className={'text-base text-blue-300'}>{lastMessageTime}</span>
            {unseenMessageCount > 0 && (
                <Tooltip content={unseenMessageCount.toString()}>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs min-w-[22px] text-center">
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
        <div className="flex flex-col flex-1 min-w-0">
            <span className={'font-medium text-base'}>{senderName}</span>
            <div className="text-sm text-slate-400 truncate">{lastMessage}</div>
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
        <div className="relative w-12 h-12 shrink-0">
            <img
                src={profileImageUrl || defaultUrl}
                alt="User"
                className="w-12 h-12 rounded-full object-cover"
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
