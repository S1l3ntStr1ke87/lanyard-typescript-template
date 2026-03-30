"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useLanyard,
  getDiscordAvatarUrl,
  getActivityAssetUrl,
  formatElapsedTime,
  getStatusColor,
  type LanyardActivity,
} from "../hooks/use-lanyard"
import { Music, Gamepad2, Monitor, Smartphone, Globe } from "lucide-react"

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
  const { data, loading, error } = useLanyard(userId)
  const [elapsedTime, setElapsedTime] = useState<string>("")
  const [spotifyProgress, setSpotifyProgress] = useState<number>(0)
  const [appleMusicProgress, setAppleMusicProgress] = useState<number>(0)
  const appleMusicActivity = data?.activities.find(
  (a) =>
    a.name === "Apple Music" ||
    a.assets?.small_text === "Apple Music"
  )

  // Update elapsed time every second
  useEffect(() => {
    if (!data) return

    const updateTimes = () => {
      // Update activity elapsed time
      const mainActivity = data.activities.find((a) => a.type !== 4 && a.timestamps?.start)
      if (mainActivity?.timestamps?.start) {
        setElapsedTime(formatElapsedTime(mainActivity.timestamps.start))
      }

      // Update Spotify progress
      if (data.listening_to_spotify && data.spotify) {
        const { start, end } = data.spotify.timestamps
        const now = Date.now()
        const progress = ((now - start) / (end - start)) * 100
        setSpotifyProgress(Math.min(100, Math.max(0, progress)))
      }

      // Update Apple Music progress
      if (appleMusicActivity && appleMusicActivity.timestamps) {
        if (appleMusicActivity?.timestamps?.start && appleMusicActivity?.timestamps?.end) {
          const { start, end } = appleMusicActivity.timestamps
          const now = Date.now()
          const progress = ((now - start) / (end - start)) * 100
          setAppleMusicProgress(Math.min(100, Math.max(0, progress)))
        } 
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
  const mainActivity = data.activities.find((a) => a.type !== 4)
  const customStatus = data.activities.find((a) => a.type === 4)

  // Collect active platform indicators
  const platforms = []
  if (data.active_on_discord_desktop) platforms.push({ icon: Monitor, label: "Desktop" })
  if (data.active_on_discord_mobile) platforms.push({ icon: Smartphone, label: "Mobile" })
  if (data.active_on_discord_web) platforms.push({ icon: Globe, label: "Web" })

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
          <div className="rounded-lg p-3 border border-green-500/30 bg-green-500/10">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={data.spotify.album_art_url}
                  alt={data.spotify.album}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Music className="w-3 h-3 text-green-500" />
                  <span className="text-green-500 text-xs uppercase font-semibold">
                    Listening to Spotify
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{data.spotify.song}</p>
                <p className="text-muted-foreground text-xs truncate">On: {data.spotify.album}</p>
                <p className="text-muted-foreground text-xs truncate">By: {data.spotify.artist}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 bg-green-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                style={{ width: `${spotifyProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Apple Music Activity ── */}
        {appleMusicActivity && (
          <div className="rounded-lg p-3 border border-green-500/30 bg-green-500/10">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={getActivityAssetUrl(appleMusicActivity.application_id, appleMusicActivity.assets?.large_image) || "/default-apple-music.png"}
                  alt={appleMusicActivity.assets?.large_text || "Apple Music"}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Music className="w-3 h-3 text-green-500" />
                  <span className="text-green-500 text-xs uppercase font-semibold">
                    Listening to Apple Music
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{appleMusicActivity?.details}</p>
                <p className="text-muted-foreground text-xs truncate">On: {appleMusicActivity?.assets?.large_text}</p>
                <p className="text-muted-foreground text-xs truncate">By: {appleMusicActivity?.state}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 bg-green-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                style={{ width: `${appleMusicProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Other Activities ── */}
        {mainActivity &&
          mainActivity.name !== "Spotify" &&
          mainActivity.name !== "Apple Music" && (
            <ActivityCard activity={mainActivity} elapsedTime={elapsedTime} />
          )
        }

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

// ─────────────────────────────────────────────────────────────────────────────
// ActivityCard – renders a single non-Spotify Discord activity
// ─────────────────────────────────────────────────────────────────────────────

interface ActivityCardProps {
  activity: LanyardActivity
  elapsedTime: string
}

function ActivityCard({ activity, elapsedTime }: ActivityCardProps) {
  const largeImageUrl = getActivityAssetUrl(activity.application_id, activity.assets?.large_image)
  const smallImageUrl = getActivityAssetUrl(activity.application_id, activity.assets?.small_image)

  const getActivityTypeLabel = (type: number): string => {
    switch (type) {
      case 0:
        return "Playing"
      case 1:
        return "Streaming"
      case 2:
        return "Listening to"
      case 3:
        return "Watching"
      case 5:
        return "Competing in"
      default:
        return "Playing"
    }
  }

  const getActivityIcon = (type: number) => {
    switch (type) {
      case 0:
      case 5:
        return Gamepad2
      case 2:
        return Music
      default:
        return Gamepad2
    }
  }

  const ActivityIcon = getActivityIcon(activity.type)

  return (
    <div className="rounded-lg p-3 border bg-muted/40">
      <div className="flex items-start gap-3">
        {largeImageUrl ? (
          <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
            <Image
              src={largeImageUrl}
              alt={activity.assets?.large_text || activity.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
              unoptimized
            />
            {smallImageUrl && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-background">
                <Image
                  src={smallImageUrl}
                  alt={activity.assets?.small_text || ""}
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        ) : (
          <div className="w-14 h-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <ActivityIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ActivityIcon className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground text-xs uppercase font-semibold">
              {getActivityTypeLabel(activity.type)}
            </span>
          </div>
          <p className="text-sm font-bold truncate">{activity.name}</p>
          {activity.details && (
            <p className="text-muted-foreground text-xs truncate">{activity.details}</p>
          )}
          {activity.state && (
            <p className="text-muted-foreground text-xs truncate">{activity.state}</p>
          )}
          {elapsedTime && activity.timestamps?.start && (
            <p className="text-muted-foreground text-xs mt-1">{elapsedTime} elapsed</p>
          )}
        </div>
      </div>
    </div>
  )
}
