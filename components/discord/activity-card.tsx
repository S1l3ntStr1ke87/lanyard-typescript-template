import Image from "next/image"
import { Music, Gamepad2 } from "lucide-react"
import { getActivityImageUrl } from "@/hooks/use-lanyard"
import { useEffect, useState } from "react"
import type { ActivityCardProps } from "./activity-helpers"

// ─────────────────────────────────────────────────────────────────────────────
// ActivityCard – renders a single non-Spotify Discord activity
// ─────────────────────────────────────────────────────────────────────────────

export function ActivityCard({ activity, elapsedTime }: ActivityCardProps) {
  const [largeImage, setLargeImage] = useState("/discord-unknown.png");
  const [smallImage, setSmallImage] = useState("");
  useEffect(() => {
    getActivityImageUrl(activity.application_id, activity.assets).then(
      ([large, small]) => {
        setLargeImage(large);
        setSmallImage(small === large ? "" : small);
      }
    );
  }, [activity.application_id, activity.assets]);

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
        {largeImage ? (
          <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
            <Image
              src={largeImage}
              alt={activity.assets?.large_text || activity.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
              unoptimized
            />
            {smallImage && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-background">
                <Image
                  src={smallImage}
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
