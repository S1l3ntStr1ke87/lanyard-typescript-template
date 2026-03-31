// app/page.tsx
// ───────────────────────────────────────────────
// Example page showing how to use the DiscordPresence component.
//
// Pulled directly from my personal website, https://vee-anti.xyz/
//
// Replace YOUR_DISCORD_USER_ID with your actual Discord user ID.
// You can find your user ID by enabling Developer Mode in Discord
// (Settings → Advanced → Developer Mode) then right-clicking your
// profile and selecting "Copy User ID".
//
// Your account must be in the Lanyard Discord server:
//   https://discord.gg/lanyard
// ───────────────────────────────────────────────

import { DiscordPresence } from "@/components/discord/discord-presence"

const MY_DISCORD_USER_ID = "YOUR_DISCORD_USER_ID"

export default function ExamplePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Discord Presence</h1>
          <p className="text-muted-foreground text-sm">
            Live status powered by{" "}
            <a
              href="https://lanyard.rest"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Lanyard
            </a>
          </p>
        </div>

        {/* Drop the component anywhere you want the presence card to appear */}
        <DiscordPresence userId={MY_DISCORD_USER_ID} />
      </div>
    </main>
  )
}
