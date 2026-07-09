# TURN relay testing

## Why `iceTransportPolicy: "relay"` currently fails

Your earlier coturn setup had two problems:

- It advertised `127.0.0.1` as the external relay address.
- It ran behind the default Docker bridge, so coturn allocated relay sockets on the container IP instead of a stable host-visible mapping.

This compose file now pins coturn to a fixed container IP and maps it to your host LAN IP:

```ini
--relay-ip=172.28.0.2
--external-ip=192.168.1.36/172.28.0.2
```

Update `TURN_EXTERNAL_IP` whenever your Wi-Fi/LAN IP changes.

## How to test coturn locally

1. Start Docker Desktop.
2. Run:

```powershell
$env:TURN_EXTERNAL_IP="192.168.1.36"
docker compose down
docker compose up -d --force-recreate coturn
```

3. Open [tools/turn-relay-test.html](/C:/Users/KiritJoshi/OneDrive%20-%20Leapwork/Desktop/Zingy/server/tools/turn-relay-test.html) in Chrome or Edge.
4. Keep the default values unless your IP or TURN credentials changed.
5. Click `Run Relay Test`.

Expected result:

- Both peers gather `relay` candidates.
- The selected candidate pair in stats is `relay` on both sides.
- The page ends with `PASS: relay-only connection established through TURN.`

## Read the coturn log correctly

Expected runtime characteristics for this local setup:

- `turn:` on port `3478` is supported.
- `turns:` on port `5349` is intentionally disabled in this compose file.
- Relay traffic should be allocated on container IP `172.28.0.2` and advertised externally as your host LAN IP.

If your app uses `turns:` or port `5349`, it will fail with this local setup.

## Separate "TURN is broken" from "same-machine loopback is broken"

There are two different tests:

1. Candidate gathering test:
   Open the browser page and confirm that each peer gathers at least one `relay` candidate.
2. End-to-end media/data path test:
   Confirm that the selected candidate pair is `relay` and the page ends with `PASS`.

If relay candidates appear but the page still fails on the same machine, the remaining issue is usually Docker Desktop UDP hairpinning or Windows Firewall, not TURN authentication.

In that case, test from a second device on the same LAN:

1. Open the same page on another laptop or phone browser.
2. Point it to `turn:192.168.1.36:3478?transport=udp`.
3. If relay candidates appear there, coturn is working and the same-host Docker loopback is the weak link.

## If it still fails

- Do not use `127.0.0.1` or `localhost` in `TURN_EXTERNAL_IP`.
- Use `turn:192.168.1.36:3478?transport=udp` in the client while testing on your LAN.
- Make sure Windows Firewall allows inbound UDP `3478` and `49160-49200`.
- Do not use `turns:` or port `5349` unless you also configure a certificate and private key.
- If you test from another device, both devices must be on the same LAN and able to reach `192.168.1.36`.
