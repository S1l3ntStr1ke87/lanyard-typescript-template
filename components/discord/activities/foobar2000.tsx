"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Music } from "lucide-react"
import { getActivityImageUrl } from "@/hooks/use-lanyard"
import type { ActivityProps } from "../activity-helpers"

export function Foobar2000Activity({ activity, progress: parentProgress }: ActivityProps) {
  const [progress, setProgress] = useState<number>(parentProgress ?? 0)

  const hasTimestamps = !!(activity.timestamps?.start && activity.timestamps?.end)
  const showProgress = hasTimestamps

  useEffect(() => {
    if (!showProgress) return
    const updateProgress = () => {
      if (!activity.timestamps?.start || !activity.timestamps?.end) return

      const { start, end } = activity.timestamps
      const now = Date.now()
      const prog = ((now - start) / (end - start)) * 100
      setProgress(Math.min(100, Math.max(0, prog)))
    }

    updateProgress()
    const interval = setInterval(updateProgress, 1000)
    return () => clearInterval(interval)
  }, [activity, showProgress])

  const isKizzy = activity.application_id === "1413566530020446230"
  const [largeImage, setLargeImage] = useState("/discord-unknown.png");

  useEffect(() => {
    getActivityImageUrl(activity.application_id, activity.assets).then(([large]) => { setLargeImage(large);}) }, [activity.application_id, activity.assets]);

  const rawalbumName = isKizzy ? activity.state : (activity.assets?.large_text)
  const albumName = rawalbumName?.startsWith("on ") ? rawalbumName.slice(3) : (rawalbumName ?? "Foobar2000")
  const songTitle = isKizzy ? activity.name : activity.details || "Unknown Song"
  const rawArtist = isKizzy ? activity.details : activity.state
  const artist = rawArtist?.startsWith("by ") ? rawArtist.slice(3) : (rawArtist ?? "Unknown Artist")

  return (
    <div className="rounded-lg p-3 border border-green-500/30 bg-green-500/10">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
          <Image
            src={largeImage}
            alt={albumName || "Album Art"}
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
              Listening to Foobar2000
            </span>
          </div>
          <p className="text-sm font-medium truncate">{songTitle}</p>
          <p className="text-muted-foreground text-xs truncate">On: {albumName}</p>
          <p className="text-muted-foreground text-xs truncate">By: {artist}</p>
        </div>
      </div>
      {showProgress && (
      <div className="mt-2 h-1 bg-green-900/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
    </div>
  )
}