import { PopoverContent, PopoverPortal } from '../../../components/Popover.tsx';
import { User } from '../types/user.ts';
import Spinner from '../../../components/Spinner.tsx';
import { CustomError } from '../../../types/utility.ts';

export default function PopoverUserContent({
    users,
    loading,
    error,
}: {
    users: User[];
    loading: boolean;
    error: CustomError | undefined;
}) {
    return (
        <>
            <PopoverPortal>
                <PopoverContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="bg-slate-200 min-w-[550px] min-h-8 max-h-[300px] overflow-auto rounded-lg shadow-gray-900 flex flex-col"
                    sideOffset={5}
                >
                    {loading && <Spinner className="text-center mx-auto" />}
                    {error && (
                        <span className="text-red-600 text-center text-sm">
                            {error?.message || 'Unexpected error occured.'}
                        </span>
                    )}
                    {users.length === 0 && (
                        <span className="text-slate-800 p-2 overflow-hidden text-center mx-auto">
                            No Results found.
                        </span>
                    )}
                    {users.length > 0 &&
                        users.map((user) => (
                            <UserDetails key={user.id} user={user} />
                        ))}
                </PopoverContent>
            </PopoverPortal>
        </>
    );
}

function UserDetails({ user }: { user: User }) {
    return (
        <div className="p-2 hover:bg-slate-300 hover:cursor-pointer">
            <img
                src={user.userProfile.profileUrl}
                alt="zingy"
                className="max-w-12 rounded-full object-cover inline mr-2"
            />
            <span className="text-slate-800">{user.username}</span>
        </div>
    );
}
