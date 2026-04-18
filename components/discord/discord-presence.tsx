"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getDiscordAvatarUrl, formatElapsedTime, getStatusColor } from "@/hooks/use-lanyard"
import { Monitor, Smartphone, Globe, RectangleGoggles, Gamepad2 } from "lucide-react"
import { ActivityCard } from "./activity-card"
import { SpotifyActivity } from "./activities/spotify"
import { AppleMusicActivity } from "./activities/applemusic"
import { Foobar2000Activity } from "./activities/foobar2000"
import { useActivityHelpers } from "./activity-helpers"
import { YoutubeActivity } from "./activities/youtube"
import { YoutubeMusicActivity } from "./activities/youtubemusic"
import { AimpActivity } from "./activities/aimp"
import { SoundcloudActivity } from "./activities/soundcloud"
import { TwitchActivity } from "./activities/twitch"
import { PlexActivity } from "./activities/plex"
import { FooyinActivity } from "./activities/fooyin"

// ─────────────────────────────────────────────────────────────────────────────
// DiscordPresence
//
// Drop-in component that shows a user's live Discord presence via Lanyard.
//
// Usage:
//   <DiscordPresence userId="YOUR_DISCORD_USER_ID" />
//
// Requirements:
//   • Your Discord account must be in the Lanyard Discord server:
//     https://discord.gg/lanyard
//   • Pass your Discord user ID (not username) as the `userId` prop.
// ─────────────────────────────────────────────────────────────────────────────

interface DiscordPresenceProps {
  userId: string
}

export function DiscordPresence({ userId }: DiscordPresenceProps) {
  const { data, loading, error, otheractivities, applemusicactivity, foobar2000activity, youtubeactivity, youtubemusicactivity, aimpactivity, soundcloudactivity, twitchactivity, spotifyactivity, plexactivity, fooyinactivity } = useActivityHelpers(userId)
  const [elapsedTime, setElapsedTime] = useState<string>("")

  // Update elapsed time every second
  useEffect(() => {
    if (!data) return

    const updateTimes = () => {
      const mainActivity = data.activities.find((a) => a.type !== 4)
      if (mainActivity?.timestamps?.start) {
        setElapsedTime(formatElapsedTime(mainActivity.timestamps.start))
      }
    }
    updateTimes()
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <Monitor className="w-4 h-4" />
            Discord Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading || (!error && !data)) return
  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <Monitor className="w-4 h-4" />
            Discord Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Unable to fetch Discord presence</p>
        </CardContent>
      </Card>
    )
  }

  const statusColor = getStatusColor(data.discord_status)
  const avatarUrl = getDiscordAvatarUrl(data.discord_user.id, data.discord_user.avatar)
  const displayName =
    data.discord_user.global_name || data.discord_user.display_name || data.discord_user.username

  // Get the main activity (not custom status, which is type 4)
  const mainActivities = data.activities.filter((a) => a.type !== 4)
  const mainActivity = mainActivities[0] // keep for elapsed time hook
  const customStatus = data.activities.find((a) => a.type === 4)

  // Collect active platform indicators
  const platforms = []
  if (data.active_on_discord_desktop) platforms.push({ icon: Monitor, label: "Desktop" })
  if (data.active_on_discord_mobile) platforms.push({ icon: Smartphone, label: "Mobile" })
  if (data.active_on_discord_web) platforms.push({ icon: Globe, label: "Web" })
  if (data.active_on_discord_embedded) platforms.push({ icon: Gamepad2, label: "Embedded" })
  if (data.active_on_discord_vr) platforms.push({ icon: RectangleGoggles, label: "VR" })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <Monitor className="w-4 h-4" />
          Discord Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ── User Info ── */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <Image
                src={avatarUrl}
                alt={displayName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            {/* Status dot */}
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center"
              style={{ backgroundColor: statusColor }}
            >
              {data.discord_status === "dnd" && (
                <div className="w-2 h-0.5 bg-background rounded-full" />
              )}
              {data.discord_status === "idle" && (
                <div
                  className="w-2 h-2 bg-background rounded-full absolute top-0.5 left-0.5"
                  style={{ clipPath: "circle(50% at 100% 0%)" }}
                />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate">{displayName}</h3>
            <p className="text-muted-foreground text-sm">@{data.discord_user.username}</p>
            {customStatus?.state && (
              <p className="text-sm mt-1 truncate">{customStatus.state}</p>
            )}
          </div>

          {/* Platform icons */}
          {platforms.length > 0 && (
            <div className="flex gap-1">
              {platforms.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="w-6 h-6 rounded flex items-center justify-center bg-muted"
                  title={label}
                >
                  <Icon className="w-3 h-3 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Spotify Activity ── */}
        {data.listening_to_spotify && data.spotify && (
          <SpotifyActivity spotify={data.spotify} />
        )}

        {/* ── Apple Music Activity ── */}
        {applemusicactivity && (
          <AppleMusicActivity activity={applemusicactivity} />
        )}
        
        {/* ── Foobar2000 Activity ── */}
        {foobar2000activity && (
          <Foobar2000Activity activity={foobar2000activity} />
        )}

        {/* ── Youtube Activity ── */}
        {youtubeactivity && (
          <YoutubeActivity activity={youtubeactivity} />
        )}

        {/* ── Twitch Activity ── */}
        {twitchactivity && (
          <TwitchActivity activity={twitchactivity} />
        )}

        {/* ── Youtube Music Activity ── */}
        {youtubemusicactivity && (
          <YoutubeMusicActivity activity={youtubemusicactivity} />
        )}

        {/* ── AIMP Activity ── */}
        {aimpactivity && (
          <AimpActivity activity={aimpactivity} />
        )}

        {/* ── SoundCloud Activity ── */}
        {soundcloudactivity && (
          <SoundcloudActivity activity={soundcloudactivity} />
        )}

        {/* ── Plex Activity ── */}
        {plexactivity && (
          <PlexActivity activity={plexactivity} />
        )}

        {/* ── Plex Activity ── */}
        {fooyinactivity && (
          <FooyinActivity activity={fooyinactivity} />
        )}

        {/* ── Other Activities ── */}
        {otheractivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              elapsedTime={elapsedTime}
            />
          ))}

        {/* ── Idle / Offline fallback ── */}
        {!mainActivity && !data.listening_to_spotify && (
          <div className="text-center py-2">
            <p className="text-muted-foreground text-sm">
              {data.discord_status === "offline" ? "Currently offline" : "No active activity"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
