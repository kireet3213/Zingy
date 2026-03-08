import { GearIcon } from '@radix-ui/react-icons';
import { socket, recreateSocket } from '../../socket';
import { useState } from 'react';
import {
    DropdownContent,
    DropdownItem,
    DropdownPortal,
    DropdownRoot,
    DropdownTrigger,
} from '../../components/Dropdown.tsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { logout } from '../auth/authSlice.ts';
import { clearConversations } from './conversationSlice.ts';
import { clearMessages } from './messageSlice.ts';
import { setServerUrl } from '../../store/settingsSlice.ts';

export const SideBar = () => {
    const dispatch = useAppDispatch();
    const serverUrl = useAppSelector((state) => state.settings.serverUrl);
    const [showServerModal, setShowServerModal] = useState(false);
    const [tempUrl, setTempUrl] = useState(serverUrl);
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
                            className="cursor-pointer hover:bg-indigo-500/20 px-3 py-2 text-slate-300 text-sm hover:outline-none rounded-lg transition-colors"
                            onClick={() => setShowServerModal(true)}
                        >
                            Server Settings
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

            {showServerModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-96 shadow-xl">
                        <h2 className="text-lg font-semibold text-white mb-2">Server Configuration</h2>
                        <p className="text-sm text-slate-400 mb-4">Set the backend server URL for the application</p>
                        <input
                            type="text"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            placeholder="http://localhost:3000"
                            className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mb-4"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setTempUrl(serverUrl);
                                    setShowServerModal(false);
                                }}
                                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    dispatch(setServerUrl(tempUrl));
                                    recreateSocket();
                                    setShowServerModal(false);
                                }}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
