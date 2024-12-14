import { GearIcon } from '@radix-ui/react-icons';
import { Box, DropdownMenu } from '@radix-ui/themes';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { socket } from '../../socket';

export const SideBar = () => {
    const { setAuthUser } = useContext(AuthContext);
    return (
        <Box
            className="flex flex-col-reverse bg-slate-200 items-center rounded-tl-2xl rounded-bl-2xl "
        >
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <GearIcon
                        className="min-w-12 min-h-7 mb-4 cursor-pointer"
                    />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={() => null}>
                        Edit Profile
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => null}>
                        Change Password
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        onClick={() => {
                            localStorage.clear();
                            if (setAuthUser) setAuthUser(null);
                            socket.close();
                        }}
                    >
                        Logout
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </Box>
    );
};
