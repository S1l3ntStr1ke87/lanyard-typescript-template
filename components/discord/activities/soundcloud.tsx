"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Music } from "lucide-react"
import { getActivityImageUrl, type LanyardActivity } from "@/hooks/use-lanyard"

interface SoundcloudActivityProps {
  activity: LanyardActivity
  progress?: number // optional, allows passing progress from parent
}

export function SoundcloudActivity({ activity, progress: parentProgress }: SoundcloudActivityProps) {
  const [progress, setProgress] = useState<number>(parentProgress ?? 0)

  useEffect(() => {
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
  }, [activity])

  const [largeImage, setLargeImage] = useState("/discord-unknown.png");

  useEffect(() => {
    getActivityImageUrl(activity.application_id, activity.assets).then(([large]) => { setLargeImage(large);}) }, [activity.application_id, activity.assets]);

  const songTitle = activity.details || "Unknown Song"
  const largeImageUrl = activity.assets?.large_url || "/"
  const artist = activity.state || "Unknown Artist"

  return (
    <div className="rounded-lg p-3 border border-green-500/30 bg-green-500/10">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
        <a href={largeImageUrl} target="_blank" rel="noopener noreferrer">
          <Image
            src={largeImage}
            alt={songTitle}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        </a>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Music className="w-3 h-3 text-green-500" />
            <span className="text-green-500 text-xs uppercase font-semibold">
              Listening to Soundcloud
            </span>
          </div>
          <p className="text-sm font-medium truncate">{songTitle}</p>
          <p className="text-muted-foreground text-xs truncate">By: {artist}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 bg-green-900/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}