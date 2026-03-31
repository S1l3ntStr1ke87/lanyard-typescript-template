"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Music } from "lucide-react"
import { getActivityAssetUrl, type LanyardActivity } from "@/hooks/use-lanyard"

interface AimpActivityProps {
  activity: LanyardActivity
  progress?: number // optional, allows passing progress from parent
}

export function AimpActivity({ activity }: AimpActivityProps) {
  const largeImageUrl =
    getActivityAssetUrl(activity.application_id, activity.assets?.large_image) || "/discord-unknown.png"

  const songTitle = activity.details || "Unknown Song"
  const artist = activity.state || "Unknown Artist"

  return (
    <div className="rounded-lg p-3 border border-green-500/30 bg-green-500/10">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
          <Image
            src={largeImageUrl}
            alt={songTitle}
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
              Listening to Aimp
            </span>
          </div>
          <p className="text-sm font-medium truncate">{songTitle}</p>
          <p className="text-muted-foreground text-xs truncate">By: {artist}</p>
        </div>
      </div>
    </div>
  )
}