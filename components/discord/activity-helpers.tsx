import { useLanyard } from "@/hooks/use-lanyard"

export function useActivityHelpers(userId: string) {
const { data, loading, error } = useLanyard(userId)
const mainActivities = data?.activities.filter((a) => a.type !== 4) ?? []

const otherActivities = mainActivities?.filter(
  (a) => a.name !== "Spotify" && a.name !== "Apple Music" && a.name !== "foobar2000" && a.name !== "YouTube" && a.name !== "YouTube Music" && a.name !== "AIMP"
) ?? []

const appleMusicActivity = data?.activities.find(
  (a) =>
    a.name === "Apple Music" ||
    a.assets?.small_text === "Apple Music"
  )
  const foobar2000Activity = data?.activities.find(
    (a) =>
      a.name === "foobar2000"
  )
  const youtubeActivity = data?.activities.find(
    (a) =>
      a.name === "YouTube"
  )

  const youtubemusicActivity = data?.activities.find(
    (a) =>
      a.name === "YouTube Music"
  )  

  const aimpactivity = data?.activities.find(
    (a) =>
      a.name === "AIMP"
  )

  return { data, loading, error, otherActivities, appleMusicActivity, foobar2000Activity, youtubeActivity, youtubemusicActivity, aimpactivity }
}