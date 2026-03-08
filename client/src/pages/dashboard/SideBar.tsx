import { GearIcon } from '@radix-ui/react-icons';
import { socket } from '../../socket';
import {
    DropdownContent,
    DropdownItem,
    DropdownPortal,
    DropdownRoot,
    DropdownTrigger,
} from '../../components/Dropdown.tsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAppDispatch } from '../../store/hooks.ts';
import { logout } from '../auth/authSlice.ts';
import { clearConversations } from './conversationSlice.ts';
import { clearMessages } from './messageSlice.ts';

export const SideBar = () => {
    const dispatch = useAppDispatch();
    return (
        <div className="flex md:flex-col-reverse flex-row items-center justify-between md:justify-end bg-slate-900/80 border-b md:border-b-0 md:border-r border-white/5 px-3 py-2 md:px-0 md:py-0 md:w-16 shrink-0">
            <span className="text-indigo-400 font-bold text-lg md:hidden">
                Zingy
            </span>
            <DropdownRoot>
                <DropdownTrigger>
                    <span className="flex h-10 w-10 bg-white/5 hover:bg-indigo-500/20 items-center justify-center cursor-pointer md:mb-4 rounded-xl transition-all duration-200">
                        <GearIcon
                            strokeWidth={1}
                            className="min-w-5 min-h-5 focus:outline-none text-slate-400 hover:text-indigo-400 transition-colors"
                        />
                    </span>
                </DropdownTrigger>
                <DropdownPortal>
                    <DropdownContent
                        side="right"
                        align="end"
                        sideOffset={10}
                        className="bg-slate-800 border border-white/10 rounded-xl p-1.5 flex flex-col shadow-xl shadow-black/30 min-w-[160px]"
                    >
                        <DropdownItem
                            className="cursor-pointer hover:bg-indigo-500/20 px-3 py-2 text-slate-300 text-sm hover:outline-none rounded-lg transition-colors"
                            onClick={() => null}
                        >
                            Edit Profile
                        </DropdownItem>
                        <DropdownItem
                            className="cursor-pointer hover:bg-indigo-500/20 px-3 py-2 text-slate-300 text-sm hover:outline-none rounded-lg transition-colors"
                            onClick={() => null}
                        >
                            Change Password
                        </DropdownItem>
                        <DropdownItem
                            className="cursor-pointer hover:bg-red-500/20 px-3 py-2 text-red-400 text-sm hover:outline-none rounded-lg transition-colors"
                            onClick={async () => {
                                await dispatch(logout());
                                dispatch(clearConversations());
                                dispatch(clearMessages());
                                socket.close();
                            }}
                        >
                            Logout
                        </DropdownItem>
                        <DropdownMenu.Arrow className="fill-slate-800" />
                    </DropdownContent>
                </DropdownPortal>
            </DropdownRoot>
        </div>
    );
};
