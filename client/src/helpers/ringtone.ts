let audioContext: AudioContext | null = null;
let oscillatorNode: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let ringInterval: ReturnType<typeof setInterval> | null = null;

export function startRingtone() {
    stopRingtone();

    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioContext.destination);

    oscillatorNode = audioContext.createOscillator();
    oscillatorNode.type = 'sine';
    oscillatorNode.frequency.value = 440;
    oscillatorNode.connect(gainNode);
    oscillatorNode.start();

    // Ring pattern: 400ms on, 200ms off, 400ms on, 1500ms off (repeats)
    let step = 0;
    const pattern = [
        { gain: 0.3, freq: 440, duration: 400 },
        { gain: 0, freq: 440, duration: 200 },
        { gain: 0.3, freq: 480, duration: 400 },
        { gain: 0, freq: 480, duration: 1500 },
    ];

    function playStep() {
        if (!gainNode || !oscillatorNode) return;
        const { gain, freq, duration } = pattern[step % pattern.length];
        gainNode.gain.value = gain;
        oscillatorNode.frequency.value = freq;
        step++;
        ringInterval = setTimeout(playStep, duration);
    }

    playStep();
}

export function playHangupTone() {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 480;
    osc.connect(gain);
    osc.start();

    // Quick descending beep: 480Hz → 350Hz over 400ms, then silence
    osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 0.4);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
        ctx.close();
    };
}

export function stopRingtone() {
    if (ringInterval) {
        clearTimeout(ringInterval);
        ringInterval = null;
    }
    if (oscillatorNode) {
        oscillatorNode.stop();
        oscillatorNode.disconnect();
        oscillatorNode = null;
    }
    if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
}
