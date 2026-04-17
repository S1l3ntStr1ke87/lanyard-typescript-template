// app/page.tsx
// ───────────────────────────────────────────────
// Example page showing how to use the DiscordPresence component.
//
// originally pulled from veeλnti's website, https://vee-anti.xyz/
//
// Replace YOUR_DISCORD_USER_ID with your actual Discord user ID.
// You can find your user ID by enabling Developer Mode in Discord
// (Settings → Advanced → Developer Mode) then right-clicking your
// profile and selecting "Copy User ID".
//
// Your account must be in the Lanyard Discord server:
//   https://discord.gg/lanyard
// ───────────────────────────────────────────────

import { LanyardCard } from "@/components/lanyardcard"

// you can remove any of these you dont have to add one or the other for it to work
const users = [
  {
    discordId: "YOUR_DISCORD_ID",
    email: "YOUR_EMAIL",
    reddit: "YOUR_REDDIT",
    github: "YOUR_GITHUB",
    gitlab: "YOUR_GITLAB",
    website: "YOUR_WEBSITE",
  },
  //{ // you can delete this just an example
  //  discordId: "SOMEONE_ELSES_DISCORD_ID",
  //  email: "SOMEONE_ELSES_DISCORD_ID",
  //  reddit: "SOMES_ELSES_REDDIT",
  //  github: "SOMEONE_ELSES_DISCORD_ID",
  //  gitlab: "SOMEONE_ELSES_DISCORD_ID",
  //  website: "SOMEONE_ELSES_DISCORD_ID",
  //}
]

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

        {users.map((member) => (
          <LanyardCard key={member.discordId} member={member} />
        ))}
      </div>
    </main>
  )
}
