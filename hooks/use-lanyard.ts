"use client"

import { useState, useEffect, useCallback, useRef } from "react"

// Lanyard API types
export interface LanyardActivity {
  id: string
  name: string
  type: number
  state?: string
  state_url?: string
  details?: string
  details_url?: string
  timestamps?: {
    start?: number
    end?: number
  }
  assets?: {
    large_image?: string
    large_text?: string
    large_url?: string
    small_image?: string
    small_text?: string
    small_url?: string
  }
  application_id?: string
  sync_id?: string
  session_id?: string
  party?: {
    id?: string
    size?: [number, number]
  }
  flags?: number
  buttons?: string[]
  created_at?: number
}

export interface LanyardSpotify {
  track_id: string
  timestamps: {
    start: number
    end: number
  }
  album: string
  album_art_url: string
  artist: string
  song: string
}

export interface LanyardData {
  spotify: LanyardSpotify | null
  listening_to_spotify: boolean
  discord_user: {
    id: string
    username: string
    avatar: string | null
    discriminator: string
    display_name: string | null
    public_flags: number
    global_name: string | null
  }
  discord_status: "online" | "idle" | "dnd" | "offline"
  activities: LanyardActivity[]
  active_on_discord_web: boolean
  active_on_discord_desktop: boolean
  active_on_discord_mobile: boolean
}

interface LanyardWebSocketMessage {
  op: number
  d: LanyardData | { heartbeat_interval: number } | null
  t?: string
}

const LANYARD_WS_URL = "wss://api.lanyard.rest/socket"
const LANYARD_API_URL = "https://api.lanyard.rest/v1/users"

export function useLanyard(userId: string) {
  const [data, setData] = useState<LanyardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const ws = new WebSocket(LANYARD_WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        if (error !== "user_not_monitored") setError(null)
      }

      ws.onmessage = (event) => {
        const message: LanyardWebSocketMessage = JSON.parse(event.data)

        switch (message.op) {
          case 0: // Event
            if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
              setData(message.d as LanyardData)
              setLoading(false)
            }
            break
          case 1: // Hello
            const { heartbeat_interval } = message.d as { heartbeat_interval: number }

            // Send initial subscribe
            ws.send(
              JSON.stringify({
                op: 2,
                d: { subscribe_to_id: userId },
              })
            )

            // Set up heartbeat
            if (heartbeatIntervalRef.current) {
              clearInterval(heartbeatIntervalRef.current)
            }
            heartbeatIntervalRef.current = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ op: 3 }))
              }
            }, heartbeat_interval)
            break
        }
      }

      ws.onerror = () => {
        setError("WebSocket connection error")
      }

      ws.onclose = () => {
        // Clean up heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
          heartbeatIntervalRef.current = null
        }

        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 5000)
      }
    } catch (err) {
      setError("Failed to connect to Lanyard")
      setLoading(false)
    }
  }, [userId])

  // Fallback to REST API if WebSocket fails
  const fetchData = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${LANYARD_API_URL}/${userId}`)
      const json = await response.json()

      if (json.success) {
        setData(json.data)
        setError(null)
        return true
      } else {
        setError("user_not_monitored")
        return false
      }
    } catch (err) {
      setError("Failed to fetch presence data")
      return false
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData().then((monitored) => {
      if (monitored) { connect() }
    })

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [connect, fetchData])

  return { data, loading, error }
}

// Helper function to get Discord avatar URL
export function getDiscordAvatarUrl(userId: string, avatarHash: string | null, size = 128): string {
  if (!avatarHash) {
    // Default avatar based on user ID
    const defaultAvatarIndex = Number(BigInt(userId) >> BigInt(22)) % 6
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`
  }

  const extension = avatarHash.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=${size}`
}

// Helper function to get activity asset URL
export function getActivityAssetUrl(
  applicationId: string | undefined,
  assetId: string | undefined
): string | null {
  if (!applicationId || !assetId) return null

  // Check if it's an external URL (mp:external/...)
  if (assetId.startsWith("mp:external/")) {
    const externalUrl = assetId.replace("mp:external/", "")
    return `https://media.discordapp.net/external/${externalUrl}`
  }

  if (assetId.startsWith("mp:attachments/")) {
  return `https://media.discordapp.net/attachments/${assetId.replace("mp:attachments/", "")}`
 }

  // Check if it's a Spotify image
  if (assetId.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${assetId.replace("spotify:", "")}`
  }

  return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetId}.png`
}

export async function getAppIconUrl(applicationId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://discord.com/api/v10/applications/${applicationId}/rpc`)
    const json = await res.json()
    if (json.icon) {
      return `https://cdn.discordapp.com/app-icons/${applicationId}/${json.icon}.png`
    }
    return null
  } catch {
    return null
  }
}

export async function getActivityImageUrl(applicationId: string | undefined, assets?: LanyardActivity["assets"]): Promise<string> {
  return (
    getActivityAssetUrl(applicationId, assets?.large_image) ||
    (applicationId ? await getAppIconUrl(applicationId) : null) ||
    "/discord-unknown.png"
  )
}

// Helper to format elapsed time
export function formatElapsedTime(startTimestamp: number): string {
  const now = Date.now()
  const elapsed = now - startTimestamp

  const seconds = Math.floor(elapsed / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  }

  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
}

// Helper to get status color
export function getStatusColor(status: LanyardData["discord_status"]): string {
  switch (status) {
    case "online":
      return "#23a55a"
    case "idle":
      return "#f0b232"
    case "dnd":
      return "#f23f43"
    case "offline":
    default:
      return "#80848e"
  }
}