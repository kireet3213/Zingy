import { ChatBubbleIcon, GearIcon } from '@radix-ui/react-icons';
import { Box, Button, DropdownMenu, Tooltip } from '@radix-ui/themes';
import { mockImageUrl } from './mockData/conversations-mock';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { socket } from '../../socket';

export const SideBar = () => {
    const { setAuthUser } = useContext(AuthContext);
    return (
        <Box
            style={{
                backgroundColor: 'var(--gray-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px',
                alignItems: 'center',
            }}
        >
            <Tooltip content="Conversations(Not implemented)" side="right">
                <ChatBubbleIcon
                    style={{
                        minWidth: '50px',
                        minHeight: '30px',
                        marginBottom: 'auto',
                        cursor: 'pointer',
                        marginTop: '10px',
                    }}
                />
            </Tooltip>
            <Tooltip content="Settings" side="right">
                <GearIcon
                    style={{
                        minWidth: '50px',
                        minHeight: '30px',
                        cursor: 'pointer',
                    }}
                />
            </Tooltip>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Button
                        style={{
                            cursor: 'pointer',
                            marginBottom: '10px',
                            background: 0,
                        }}
                        variant="soft"
                    >
                        <img
                            src={mockImageUrl}
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                            }}
                            alt="N/A"
                        />
                    </Button>
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
