import { LanyardSpotify, type LanyardActivity } from "@/hooks/use-lanyard"
import { useLanyard } from "@/hooks/use-lanyard"

export interface ActivityCardProps {
  activity: LanyardActivity
  elapsedTime: string
}

export interface ActivityProps {
  activity: LanyardActivity
  progress?: number
}

export interface SpotifyActivityProps {
  spotify: LanyardSpotify
  progress?: number
}

export function useActivityHelpers(userId: string) {
const { data, loading, error } = useLanyard(userId)
const mainActivities = data?.activities.filter((a) => a.type !== 4) ?? []

  const applemusicActivity = data?.activities.find(
    (a) =>
      a.name === "Apple Music" ||
      a.assets?.small_text === "Apple Music" ||
      a.assets?.large_text === "Apple Music"
  )

  const foobar2000Activity = data?.activities.find(
    (a) =>
      a.name === "foobar2000" ||
      a.assets?.small_text === "foobar2000" ||
      a.assets?.large_text === "foobar2000"
  )

  const youtubeActivity = data?.activities.find(
    (a) =>
      a.name === "YouTube"
  )

  const twitchactivity = data?.activities.find(
    (a) =>
      a.name === "Twitch" ||
      a.application_id === "802958789555781663"
  )

  const youtubemusicActivity = data?.activities.find(
    (a) =>
      a.name === "YouTube Music"
  )  

  const aimpactivity = data?.activities.find(
    (a) =>
      a.name === "AIMP" ||
      a.assets?.small_text === "AIMP" ||
      a.assets?.large_text === "AIMP"
  )

  const soundcloudactivity = data?.activities.find(
    (a) =>
      a.name === "SoundCloud"
  )

  const spotifyactivity = data?.activities.find(
    (a) =>
      a.name === "Spotify"
  )

  const plexactivity = data?.activities.find(
    (a) =>
      a.name === "Plex"
  )

const activities = [
  applemusicActivity,
  foobar2000Activity,
  youtubeActivity,
  youtubemusicActivity,
  aimpactivity,
  soundcloudactivity,
  twitchactivity,
  spotifyactivity,
  plexactivity
].filter(Boolean)

const otherActivities = mainActivities.filter(
  (a) => !activities.some((s) => s?.id === a.id)
)

  return { data, loading, error, otherActivities, applemusicActivity, foobar2000Activity, youtubeActivity, youtubemusicActivity, aimpactivity, soundcloudactivity, twitchactivity, spotifyactivity, plexactivity }
}