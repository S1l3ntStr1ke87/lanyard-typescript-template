"use client"

import Image from "next/image"
import { Music } from "lucide-react"
import { getActivityImageUrl, type LanyardActivity } from "@/hooks/use-lanyard"
import { useEffect, useState } from "react"

interface TwitchActivityProps {
  activity: LanyardActivity
  progress?: number // optional, allows passing progress from parent
}

export function TwitchActivity({ activity }: TwitchActivityProps) {
  const [largeImage, setLargeImage] = useState("/discord-unknown.png");

  useEffect(() => {
    getActivityImageUrl(activity.application_id, activity.assets).then(([large]) => { setLargeImage(large);}) }, [activity.application_id, activity.assets]);

  const videoTitle = activity.details || "Unknown Video"
  const channelName = activity.state || "Unknown Channel"

  return (
    <div className="rounded-lg p-3 border border-green-500/30 bg-green-500/10">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
          <Image
            src={largeImage}
            alt={channelName}
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
              Watching Twitch
            </span>
          </div>
          <p className="text-sm font-medium truncate">{videoTitle}</p>
          <p className="text-muted-foreground text-xs truncate">By: {channelName}</p>
        </div>
      </div>
    </div>
  )
}