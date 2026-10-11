import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getRtcIceServers } from '../../helpers/ice-servers';

export type DoomSession =
    | { mode: 'host' }
    | { mode: 'join'; netPeerId: string };

interface DoomGameProps {
    session: DoomSession;
    onHostReady?: (netPeerId: string) => void;
    onClose: () => void;
}

export function DoomGame({ session, onHostReady, onClose }: DoomGameProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const src =
        session.mode === 'host'
            ? '/doom.html?mode=host'
            : `/doom.html?mode=join&peer=${encodeURIComponent(session.netPeerId)}`;

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.source !== iframeRef.current?.contentWindow) return;
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'doom-host-ready') {
                onHostReady?.(event.data.peerId);
            } else if (event.data?.type === 'doom-request-ice-servers') {
                // Same STUN/TURN as the video call so the game connects through strict NATs
                iframeRef.current?.contentWindow?.postMessage(
                    {
                        type: 'doom-ice-servers',
                        iceServers: getRtcIceServers(),
                    },
                    window.location.origin
                );
            }
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onHostReady]);

    return (
        <div className="absolute inset-4 z-20 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/95 px-4 py-2">
                <span className="text-sm font-semibold text-slate-200">
                    DOOM
                    <span className="ml-2 text-xs font-normal text-slate-400">
                        {session.mode === 'host'
                            ? 'Hosting co-op'
                            : 'Joined co-op'}
                    </span>
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
            {/* js-dos runs in an iframe so its global CSS can't leak into the app.
                Unmounting the iframe tears down the emulator. */}
            <iframe
                ref={iframeRef}
                src={src}
                title="DOOM"
                className="min-h-0 w-full flex-1 border-0"
                allow="autoplay; fullscreen"
            />
        </div>
    );
}
