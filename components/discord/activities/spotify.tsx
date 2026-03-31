"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Music } from "lucide-react"
import { LanyardSpotify } from "@/hooks/use-lanyard"

interface SpotifyActivityProps {
  spotify: LanyardSpotify
  progress?: number
}

export function SpotifyActivity({ spotify, progress: parentProgress }: SpotifyActivityProps) {
  const [progress, setProgress] = useState<number>(parentProgress ?? 0)

  useEffect(() => {
    const updateProgress = () => {
      const { start, end } = spotify.timestamps
      if (start && end) {
        const now = Date.now()
        const prog = ((now - start) / (end - start)) * 100
        setProgress(Math.min(100, Math.max(0, prog)))
      }
    }

    updateProgress()
    const interval = setInterval(updateProgress, 1000)
    return () => clearInterval(interval)
  }, [spotify])

  return (
    <div className="rounded-lg p-3 border border-green-500/30 bg-green-500/10">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
          <Image
            src={spotify.album_art_url}
            alt={spotify.album}
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
          <p className="text-sm font-medium truncate">{spotify.song}</p>
          <p className="text-muted-foreground text-xs truncate">On: {spotify.album}</p>
          <p className="text-muted-foreground text-xs truncate">By: {spotify.artist}</p>
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