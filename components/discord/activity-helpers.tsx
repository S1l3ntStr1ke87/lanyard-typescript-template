import { useLanyard } from "@/hooks/use-lanyard"

export function useActivityHelpers(userId: string) {
const { data, loading, error } = useLanyard(userId)

const appleMusicActivity = data?.activities.find(
  (a) =>
    a.name === "Apple Music" ||
    a.assets?.small_text === "Apple Music"
  )
  const foobar2000Activity = data?.activities.find(
    (a) =>
      a.name === "foobar2000"
  )
  
  return { data, loading, error, appleMusicActivity, foobar2000Activity }
}