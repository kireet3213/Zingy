const turnUsername =
    import.meta.env.VITE_TURN_USERNAME || '';
const turnCredential =
    import.meta.env.VITE_TURN_CREDENTIAL || '';

export const getRtcIceServers = (): RTCIceServer[] => [
    {
        urls: 'stun:stun.relay.metered.ca:80',
    },
    // Public STUN as a backup in case metered's STUN is unreachable.
    // Kept to two: every extra server slows candidate gathering.
    {
        urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
    {
        urls: 'turn:standard.relay.metered.ca:80',
        username: turnUsername,
        credential: turnCredential,
    },
    {
        urls: 'turn:standard.relay.metered.ca:80?transport=tcp',
        username: turnUsername,
        credential: turnCredential,
    },
    {
        urls: 'turn:standard.relay.metered.ca:443',
        username: turnUsername,
        credential: turnCredential,
    },
    {
        urls: 'turns:standard.relay.metered.ca:443?transport=tcp',
        username: turnUsername,
        credential: turnCredential,
    },
];
