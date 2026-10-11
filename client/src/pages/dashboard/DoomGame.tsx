import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function Dos(element: HTMLDivElement, options?: Record<string, unknown>): any;
}

const DOOM_BUNDLE_URL =
    'https://cdn.dos.zone/custom/dos/doom.jsdos';

interface DoomGameProps {
    onClose: () => void;
}

export function DoomGame({ onClose }: DoomGameProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dosInstance = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        dosInstance.current = Dos(containerRef.current, {
            url: DOOM_BUNDLE_URL,
            pathPrefix: '/js-dos/emulators/',
            autoStart: true,
            kiosk: true,
        });

        return () => {
            if (dosInstance.current?.stop) {
                dosInstance.current.stop();
            }
            dosInstance.current = null;
        };
    }, []);

    return (
        <div className="absolute inset-4 z-20 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/95 px-4 py-2">
                <span className="text-sm font-semibold text-slate-200">
                    DOOM
                </span>
                <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                    onClick={onClose}
                    title="Close game"
                >
                    <X size={16} />
                </button>
            </div>
            <div
                ref={containerRef}
                className="min-h-0 flex-1"
            />
        </div>
    );
}
