import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import PopoverUserContent from './PopoverUserContent.tsx';
import { PopoverRoot } from '../../../components/Popover';
import { PopoverAnchor } from '../../../components/Popover';
import { useCallback, useEffect, useState } from 'react';
import { get } from '../../../helpers/axios-client.ts';
import { CustomError } from '../../../types/utility.ts';
import debounce from 'lodash.debounce';
import { User } from '../types/user.ts';

const perPage = 10;

export default function Popover() {
    const [keyword, setKeyword] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<CustomError | undefined>();
    const [users, setUsers] = useState<User[]>([]);

    const getUsers = useCallback(
        debounce(async (keyword: string) => {
            try {
                if (keyword.length > 0) {
                    const response = await get('user/search-users', {
                        params: {
                            keyword,
                            page: 1,
                            perPage,
                        },
                    });
                    setUsers(response.data.users);
                }
            } catch (e) {
                setError(e as CustomError);
            } finally {
                setLoading(false);
            }
        }, 1000),
        []
    );

    useEffect(() => {
        if (keyword.length > 0) {
            getUsers(keyword);
        } else {
            setUsers([]);
            setLoading(false);
        }
        return () => {
            getUsers.cancel();
        };
    }, [keyword, getUsers]);

    return (
        <PopoverRoot open={open}>
            <PopoverAnchor className="relative mt-4 mb-2">
                <input
                    placeholder="Search users..."
                    className="my-input bg-slate-100 focus:outline-none p-2 pl-7 ml-2 min-w-[98%] rounded-full hover:bg-slate-200 focus:bg-slate-200"
                    onFocus={() => {
                        setOpen(true);
                    }}
                    onChange={(e) => {
                        setLoading(true);
                        setKeyword(e.target.value);
                    }}
                    onBlur={() => {
                        setOpen(false);
                    }}
                />
                <MagnifyingGlassIcon className="absolute left-2 transform translate-y-1/2 top-[5px] text-xs min-w-7 text-slate-800" />
            </PopoverAnchor>
            <PopoverUserContent users={users} loading={loading} error={error} />
        </PopoverRoot>
    );
}
