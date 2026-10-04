# Zingy

Zingy is a real-time chat app:
- `client`: React + Vite + Redux Toolkit + RTK Query
- `server`: Express + Socket.IO + Sequelize (MySQL)

## Repo Structure

- `client/` - frontend app
- `server/` - backend API, sockets, DB models/migrations
- `shared-types/` - shared TypeScript contracts
- `.github/workflows/` - CI workflows

## Tech Stack

- Frontend: React 19, React Router, Redux Toolkit, RTK Query, Tailwind CSS
- Backend: Express 5, Socket.IO, Sequelize, Umzug migrations
- Database: MySQL
- Package manager: `pnpm`

## Prerequisites

- Node.js 20+
- `pnpm` 9+
- MySQL running locally or remotely

## Environment Variables

Create/update:
- `server/.env`
- `client/.env`

### `server/.env` (example)

```env
PORT=3000
DB_DIALECT=mysql
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=zingy_db
DB_LOGGER=true
JWT_SECRET=change_me
DB_PORT=3306
CLIENT_URL=http://localhost:5173
```

### `client/.env` (example)

```env
VITE_API_URL=http://localhost:3000
VITE_TURN_URL=
```

## Install

From repo root:

```bash
pnpm install
pnpm run install-shared
```

## Run Locally

Start server:

```bash
pnpm --filter zingy-server dev
```

Start client:

```bash
pnpm --filter zingy-client dev
```

## Database Migrations

Run migrations:

```bash
pnpm --filter zingy-server migration:run
```

Refresh migrations (drops and reruns, use carefully):

```bash
pnpm --filter zingy-server migration:refresh
```

Seed data:

```bash
pnpm --filter zingy-server seed --seedUsers
```

## Scripts

Root:

```bash
pnpm run lint
pnpm run check-types
pnpm run format
```

Per package:

```bash
pnpm --filter zingy-client lint
pnpm --filter zingy-client check-types
pnpm --filter zingy-server lint
pnpm --filter zingy-server check-types
```

## State Management (Frontend)

Redux Toolkit manages core app state:
- RTK Query:


## CI

GitHub Actions runs lint and type checks on pushes/PRs to `main`.
Dependabot is configured under `.github/dependabot.yml`.

## Video Calling

Video calls use WebRTC with signaling over Socket.IO:

1. Caller clicks the Video button — a **ring signal** is sent to the peer.
2. Peer sees an incoming call modal with a ringtone and can **Accept** or **Decline**.
3. On accept, the caller creates a WebRTC offer and the SDP/ICE exchange begins.
4. Either party can hang up at any time.

For calls across different networks (or when direct peer-to-peer fails), a TURN relay is needed.

### coturn configuration

The TURN server config lives in `server/turnserver.conf` and is mounted into the Docker container. The only value that needs to change per-machine is the external IP, which is passed via the `TURN_EXTERNAL_IP` environment variable at startup.

| Platform | Get LAN IP |
|----------|------------|
| macOS    | `ipconfig getifaddr en0` |
| Linux    | `hostname -I \| awk '{print $1}'` |
| Windows  | `(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress` |

## Setting Up coturn (TURN Server) on macOS

### 1. Find your Mac's LAN IP

```sh
ipconfig getifaddr en0
```

This returns something like `192.168.1.42`. You'll use this as `TURN_EXTERNAL_IP`.

### 2. Start coturn with Docker Compose

```sh
cd server

export TURN_EXTERNAL_IP=$(ipconfig getifaddr en0)
docker compose up -d coturn
```

This starts a coturn container with:
- **TURN port:** `3478` (TCP + UDP)
- **Relay ports:** `49160–49200` (UDP)
- **Credentials:** `devuser` / `devpass`
- **Realm:** `local`

### 3. Verify coturn is running

```sh
docker logs coturn
```

You should see output indicating the server started on port `3478` with your LAN IP as the external address.

### 4. Point the client at the TURN server

The client auto-derives the TURN URL from the server URL by default. To override explicitly, set in `client/.env`:

```
VITE_TURN_URL=turn:192.168.1.42:3478?transport=udp
```

Replace `192.168.1.42` with your actual LAN IP.

### 5. Restarting after IP change

Your LAN IP changes when you switch Wi-Fi networks. When that happens:

```sh
cd server
export TURN_EXTERNAL_IP=$(ipconfig getifaddr en0)
docker compose up -d --force-recreate coturn
```

Update `VITE_TURN_URL` in `client/.env` if you set it explicitly.

### Testing from a second device

To test video calls between two devices on the same network:

1. Both devices must be on the same Wi-Fi/LAN.
2. On the second device, open `http://<your-mac-ip>:5173`.
3. Make sure `VITE_API_URL` points to `http://<your-mac-ip>:8080` (or configure via the login page settings modal).
4. The TURN server should be reachable at `turn:<your-mac-ip>:3478`.

### macOS firewall note

If incoming connections are blocked, allow them in **System Settings > Network > Firewall**, or temporarily disable the firewall for testing. Docker Desktop for Mac handles port forwarding, but the macOS firewall can still block connections from other LAN devices.

### Troubleshooting (macOS)

- **No relay candidates gathered** — check `docker logs coturn` and confirm `TURN_EXTERNAL_IP` is your actual LAN IP, not `127.0.0.1`.
- **Relay candidates appear but connection fails on same machine** — this is a known Docker Desktop UDP hairpin issue. Test from a second device instead.
- **`turns:` (TLS) is not supported** — this local setup intentionally disables TLS. Only use `turn:` (plain) URLs.
- **Credentials rejected** — the default credentials are `devuser`/`devpass`, set in `server/turnserver.conf`.

## Setting Up coturn (TURN Server) on Windows

### 1. Find your LAN IP

Open PowerShell and run:

```powershell
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress
```

This returns something like `192.168.1.36`. You'll use this as `TURN_EXTERNAL_IP`.

### 2. Start coturn with Docker Compose

```powershell
cd server

$env:TURN_EXTERNAL_IP = "192.168.1.36"
docker compose up -d coturn
```

Replace `192.168.1.36` with your actual LAN IP from step 1.

This starts a coturn container with:
- **TURN port:** `3478` (TCP + UDP)
- **Relay ports:** `49160–49200` (UDP)
- **Credentials:** `devuser` / `devpass`
- **Realm:** `local`

### 3. Verify coturn is running

```powershell
docker logs coturn
```

You should see output indicating the server started on port `3478` with your LAN IP as the external address.

### 4. Point the client at the TURN server

Same as macOS — the client auto-derives the TURN URL from the server URL. To override explicitly, set in `client/.env`:

```
VITE_TURN_URL=turn:192.168.1.36:3478?transport=udp
```

Replace `192.168.1.36` with your actual LAN IP.

### 5. Restarting after IP change

Your LAN IP changes when you switch networks. When that happens:

```powershell
cd server
$env:TURN_EXTERNAL_IP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress
docker compose up -d --force-recreate coturn
```

Update `VITE_TURN_URL` in `client/.env` if you set it explicitly.

### Testing from a second device

Same as macOS:

1. Both devices must be on the same Wi-Fi/LAN.
2. On the second device, open `http://<your-pc-ip>:5173`.
3. Make sure `VITE_API_URL` points to `http://<your-pc-ip>:8080` (or configure via the login page settings modal).
4. The TURN server should be reachable at `turn:<your-pc-ip>:3478`.

### Windows Firewall note

Make sure Windows Firewall allows inbound connections on:
- **UDP/TCP `3478`** — TURN signaling
- **UDP `49160–49200`** — relay media ports

To add rules via PowerShell (run as Administrator):

```powershell
New-NetFirewallRule -DisplayName "coturn TURN" -Direction Inbound -Protocol UDP -LocalPort 3478 -Action Allow
New-NetFirewallRule -DisplayName "coturn TURN TCP" -Direction Inbound -Protocol TCP -LocalPort 3478 -Action Allow
New-NetFirewallRule -DisplayName "coturn relay" -Direction Inbound -Protocol UDP -LocalPort 49160-49200 -Action Allow
```

### Troubleshooting (Windows)

- **No relay candidates gathered** — check `docker logs coturn` and confirm `TURN_EXTERNAL_IP` is your actual LAN IP, not `127.0.0.1`.
- **Relay candidates appear but connection fails on same machine** — this is a known Docker Desktop UDP hairpin issue. Test from a second device instead.
- **`turns:` (TLS) is not supported** — this local setup intentionally disables TLS. Only use `turn:` (plain) URLs.
- **Credentials rejected** — the default credentials are `devuser`/`devpass`, set in `server/turnserver.conf`.
- **`Get-NetIPAddress` returns multiple IPs** — specify the exact adapter alias (e.g. `"Wi-Fi"`, `"Ethernet"`), or pick the correct IP manually with `ipconfig`.

## Setting Up coturn (TURN Server) on Linux

### 1. Find your LAN IP

```sh
hostname -I | awk '{print $1}'
```

This returns something like `192.168.1.50`. You'll use this as `TURN_EXTERNAL_IP`.

### 2. Start coturn with Docker Compose

```sh
cd server

export TURN_EXTERNAL_IP=$(hostname -I | awk '{print $1}')
docker compose up -d coturn
```

This starts a coturn container with:
- **TURN port:** `3478` (TCP + UDP)
- **Relay ports:** `49160–49200` (UDP)
- **Credentials:** `devuser` / `devpass`
- **Realm:** `local`

### 3. Verify coturn is running

```sh
docker logs coturn
```

You should see output indicating the server started on port `3478` with your LAN IP as the external address.

### 4. Point the client at the TURN server

Same as other platforms — the client auto-derives the TURN URL from the server URL. To override explicitly, set in `client/.env`:

```
VITE_TURN_URL=turn:192.168.1.50:3478?transport=udp
```

Replace `192.168.1.50` with your actual LAN IP.

### 5. Restarting after IP change

Your LAN IP changes when you switch networks. When that happens:

```sh
cd server
export TURN_EXTERNAL_IP=$(hostname -I | awk '{print $1}')
docker compose up -d --force-recreate coturn
```

Update `VITE_TURN_URL` in `client/.env` if you set it explicitly.

### Testing from a second device

1. Both devices must be on the same Wi-Fi/LAN.
2. On the second device, open `http://<your-linux-ip>:5173`.
3. Make sure `VITE_API_URL` points to `http://<your-linux-ip>:8080` (or configure via the login page settings modal).
4. The TURN server should be reachable at `turn:<your-linux-ip>:3478`.

### Linux firewall note

If you use `ufw`:

```sh
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp
sudo ufw allow 49160:49200/udp
```

If you use `firewalld`:

```sh
sudo firewall-cmd --permanent --add-port=3478/tcp
sudo firewall-cmd --permanent --add-port=3478/udp
sudo firewall-cmd --permanent --add-port=49160-49200/udp
sudo firewall-cmd --reload
```

### Troubleshooting (Linux)

- **No relay candidates gathered** — check `docker logs coturn` and confirm `TURN_EXTERNAL_IP` is your actual LAN IP, not `127.0.0.1`.
- **Relay candidates appear but connection fails on same machine** — try testing from a second device on the LAN.
- **`turns:` (TLS) is not supported** — this local setup intentionally disables TLS. Only use `turn:` (plain) URLs.
- **Credentials rejected** — the default credentials are `devuser`/`devpass`, set in `server/turnserver.conf`.
- **`hostname -I` returns multiple IPs** — pick the one on your LAN subnet, or use `ip addr show` to identify the correct interface.

## Notes

- Do not commit real credentials in `.env` files.
- Socket events are used for realtime delivery; messages are persisted via API.
