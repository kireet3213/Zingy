import { UserConversation } from './types/conversation';
import { Maybe } from '../../types/utility';
import { useMessageEvents } from '../../hooks/useMessageEvents.ts';
import Tooltip from '../../components/Tooltip.tsx';
import profilePic from '../../assets/profile.svg';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import {
    selectConversation,
    selectSelectedConversationUserId,
} from './conversationSlice.ts';
import {
    resetUnseenForUser,
    selectMessagesByUserId,
    selectUnseenCountByUserId,
} from './messageSlice.ts';

type ConversationBoxProps = {
    conversationUsers: Maybe<UserConversation[]>;
};
const defaultUrl =
    'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg';

function formatTime(dateInput: string | undefined): string {
    if (!dateInput) return '';
    const parsedDate = new Date(dateInput);
    if (Number.isNaN(parsedDate.getTime())) return '';
    return parsedDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

const UserComponent = ({
    conversation,
}: {
    conversation: UserConversation;
}) => {
    const dispatch = useAppDispatch();
    const selectedConversationUserId = useAppSelector(
        selectSelectedConversationUserId
    );
    const messages = useAppSelector((state) =>
        selectMessagesByUserId(state, conversation.id)
    );
    const unseenMessageCount = useAppSelector((state) =>
        selectUnseenCountByUserId(state, conversation.id)
    );
    const { senderName, id, isConnected = false } = conversation;
    const lastMessageTime = formatTime(messages?.at(-1)?.createdAt);
    const lastMessage = messages.at(-1)?.text || '';

    return (
        <button
            type="button"
            onClick={() => {
                dispatch(selectConversation(id));
                dispatch(resetUnseenForUser(id));
            }}
            className={`px-3 py-3 hover:bg-white/5 transition-all duration-200 text-left w-full ${
                selectedConversationUserId === id
                    ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500'
                    : 'border-l-2 border-l-transparent'
            }`}
        >
            <div className="flex items-center gap-3">
                <SenderImage
                    profileImageUrl={profilePic}
                    isConnected={isConnected}
                />
                <div className="flex justify-between w-full min-w-0">
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
        </button>
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
        <div className="flex flex-col items-end justify-between text-xs ml-2 shrink-0">
            <span className="text-xs text-slate-500">{lastMessageTime}</span>
            {unseenMessageCount > 0 && (
                <Tooltip content={unseenMessageCount.toString()}>
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-medium min-w-[20px] text-center mt-1">
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
            <span className="font-medium text-sm text-slate-200">
                {senderName}
            </span>
            <div className="text-xs text-slate-500 truncate mt-0.5">
                {lastMessage}
            </div>
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
        <div className="relative w-10 h-10 shrink-0">
            <img
                src={profileImageUrl || defaultUrl}
                alt="User"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
            />
            <span
                className={`inline-block rounded-full absolute h-2.5 w-2.5 bottom-0 right-0 ring-2 ring-slate-900 ${isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`}
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
