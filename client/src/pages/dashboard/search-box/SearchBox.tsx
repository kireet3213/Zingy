import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import SearchPopover from './SearchPopover.tsx';

export default function SearchBox() {
    return (
        <div className="relative mt-1">
            <input
                placeholder="Search users..."
                className="block bg-slate-100 focus:outline-none p-2 pl-7 ml-2 min-w-[98%] rounded-full"
                onFocus={() => null}
            />
            <span className="min-w-3.5">
                <MagnifyingGlassIcon className="absolute left-2 transform translate-y-1/2 top-[5px] text-xs min-w-7 text-slate-800" />
            </span>
            <SearchPopover />
        </div>
    );
}
