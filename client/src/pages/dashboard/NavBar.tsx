import { Avatar, Button, DropdownMenu, TabNav } from '@radix-ui/themes';
import { AuthUser } from '../../types/user';
import { Maybe } from '../../types/utility';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';

export const NavBar = ({ authUser }: { authUser: Maybe<AuthUser> }) => {
    const { setAuthUser } = useContext(AuthContext);
    return (
        <>
            <TabNav.Root justify="end" size="2">
                <TabNav.Link>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <Button
                                style={{ width: 0, background: 'none' }}
                                variant="soft"
                            >
                                <Avatar
                                    size="2"
                                    src=""
                                    fallback={
                                        authUser?.name?.substring(0, 1) || ''
                                    }
                                ></Avatar>
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
                                }}
                            >
                                Logout
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </TabNav.Link>
            </TabNav.Root>
        </>
    );
};
