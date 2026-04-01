# Lanyard Discord Presence – Next.js Template

A plug-and-play Discord presence card for **Next.js** (App Router) sites, powered by the [Lanyard](https://lanyard.rest) API.

Displays:
- Discord avatar with live status indicator (online / idle / DND / offline)
- Display name, username, and custom status
- Active platform badges (Desktop / Mobile / Web)
- Spotify listening card with real-time progress bar
- Any other Discord Rich Presence activity (game, app, etc.) with artwork and elapsed time

---

## Prerequisites

1. **Join the Lanyard Discord server** — this is required for Lanyard to track your presence.  
   → [discord.gg/lanyard](https://discord.gg/lanyard)

2. **Find your Discord User ID**  
   - Open Discord → Settings → Advanced → enable **Developer Mode**  
   - Right-click your profile anywhere → **Copy User ID**

3. Your Next.js project must use the **App Router** (`app/` directory).

---

## Files

```
lanyard-discord-presence-template/
├── hooks/
│   └── use-lanyard.ts # WebSocket hook + REST fallback + helper utilities
├── components/
│   └── discord/
│       │││└── activity-card.tsx
│       ││└── activity-helpers.tsx
│       │└── discord-presence.tsx # Ready-to-use React component
│       └── activites/
│           ││││││││└── aimp.tsx
│           ││││││└── applemusic.tsx
│           │││││└── foobar2000.tsx
│           ││││└── soundcloud.tsx
│           │││└── spotify.tsx
│           ││└── twitch.tsx
│           │└── youtube.tsx
│           └── youtubemusic.tsx
├── app/
│   └── page.tsx # Minimal usage example
├── public/
│   └── discord-unkown.png # Discord missing presence image, image
└── README.md
```

---

## Installation

### 1. Copy the files into your project

```
public/discord-unkown.png → public/discord-unkown.png
hooks/use-lanyard.ts → hooks/use-lanyard.ts
components/discord/ → components/discord/
```

### 2. Install dependencies

The component uses [shadcn/ui](https://ui.shadcn.com/) primitives (`Card`, `Skeleton`) and [lucide-react](https://lucide.dev/) icons.

```bash
# npm
npx shadcn@latest init
npx shadcn@latest add card skeleton
npm install lucide-react

# bun
bunx shadcn@latest init
bunx shadcn@latest add card skeleton
bun add lucide-react
```

> **Don't use shadcn/ui?**  
> Replace the `Card` / `Skeleton` imports in `discord-presence.tsx` with your own UI primitives or plain `<div>` elements. The logic lives entirely in `use-lanyard.ts` and is UI-agnostic.

### 3. Configure `next.config` for Discord CDN images

Add the Discord and Spotify CDN domains to your `next.config.mjs` (or `.js`) so `next/image` can load avatars and artwork:

```js
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "media.discordapp.net" },
      { protocol: "https", hostname: "i.scdn.co" }, // Spotify album art
    ],
  },
}

export default nextConfig
```

---

## Usage

```tsx
// app/page.tsx  (or any Server / Client component)
import { DiscordPresence } from "@/components/discord-presence"

const MY_DISCORD_USER_ID = "123456789012345678" // ← your ID here

export default function HomePage() {
  return (
    <main>
      <DiscordPresence userId={MY_DISCORD_USER_ID} />
    </main>
  )
}
```

The component is a **Client Component** (`"use client"`) and handles its own WebSocket connection lifecycle — no server-side setup required.

---

## How it works

| Step | Detail |
|------|--------|
| **WebSocket** | Connects to `wss://api.lanyard.rest/socket`, subscribes to your user ID, and receives real-time `PRESENCE_UPDATE` events. |
| **Heartbeat** | Automatically sends `op: 3` pings at the interval provided by the server. |
| **Auto-reconnect** | If the socket closes, it retries after 5 seconds. |
| **REST fallback** | If no data arrives within 3 seconds (e.g. WebSocket blocked), it falls back to a one-time `GET https://api.lanyard.rest/v1/users/{id}` request. |
| **Elapsed time** | A `setInterval` ticks every second to update the activity elapsed time and Spotify progress bar. |

---

## Exported helpers (`use-lanyard.ts`)

| Export | Description |
|--------|-------------|
| `useLanyard(userId)` | React hook — returns `{ data, loading, error }` |
| `getDiscordAvatarUrl(userId, avatarHash, size?)` | Builds the CDN URL for a user's avatar (handles animated avatars and default fallbacks) |
| `getActivityAssetUrl(applicationId, assetId)` | Resolves activity artwork URLs (supports `mp:external/` and `spotify:` prefixes) |
| `formatElapsedTime(startTimestamp)` | Returns `"H:MM:SS"` or `"M:SS"` string from a Unix ms timestamp |
| `getStatusColor(status)` | Returns the hex colour for a Discord status string |

---

## Customisation

The component ships with **neutral shadcn/ui styling** so it fits any colour scheme out of the box.  
To match a custom theme (like the orange HUD aesthetic from the original site), override the Tailwind classes inside `discord-presence.tsx` — every section is clearly commented.

---

## TypeScript types

All Lanyard API shapes are exported from `use-lanyard.ts`:

- `LanyardData`
- `LanyardActivity`
- `LanyardSpotify`

---

## License

MIT — free to use, modify, and redistribute.
