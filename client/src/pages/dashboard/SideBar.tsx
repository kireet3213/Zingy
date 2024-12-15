import { GearIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { socket } from '../../socket';
import {
    DropdownContent,
    DropdownItem,
    DropdownRoot,
    DropdownTrigger,
} from '../../components/Dropdown.tsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const SideBar = () => {
    const { setAuthUser } = useContext(AuthContext);
    return (
        <div className="flex flex-col-reverse bg-slate-400 items-center rounded-tl-lg rounded-bl-lg">
            <DropdownRoot>
                <DropdownTrigger>
                    <span className="flex h-10 w-10 bg-slate-500 hover:bg-slate-600 items-center justify-center cursor-pointer mb-3 rounded-full">
                        <GearIcon
                            strokeWidth={1}
                            className="min-w-8 min-h-6 focus:outline-none text-slate-800"
                        />
                    </span>
                </DropdownTrigger>
                <DropdownContent className="bg-slate-400 rounded p-2 flex flex-col">
                    <DropdownItem
                        className="cursor-pointer hover:bg-slate-500 p-2 text-slate-800 hover:outline-none rounded"
                        onClick={() => null}
                    >
                        Edit Profile
                    </DropdownItem>
                    <DropdownItem
                        className="cursor-pointer hover:bg-slate-500 p-2 text-slate-800 hover:outline-none rounded"
                        onClick={() => null}
                    >
                        Change Password
                    </DropdownItem>
                    <DropdownItem
                        className="cursor-pointer hover:bg-slate-500 p-2 text-slate-800 hover:outline-none rounded"
                        onClick={() => {
                            localStorage.clear();
                            if (setAuthUser) setAuthUser(null);
                            socket.close();
                        }}
                    >
                        Logout
                    </DropdownItem>
                    <DropdownMenu.Arrow className="DropdownMenuArrow" />
                </DropdownContent>
            </DropdownRoot>
        </div>
    );
};
