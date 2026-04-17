import { Card, CardContent } from "@/components/ui/card"
import { Globe, ExternalLink, LucideProps, Mail } from "lucide-react"
import { DiscordPresence } from "@/components/discord/discord-presence"
import { ForwardRefExoticComponent, RefAttributes } from "react"

const Gitlab: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> = require("lucide-react").Gitlab
const Github: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> = require("lucide-react").Github

interface User {
  discordId: string
  email: string
  github?: string
  gitlab?: string
  reddit?: string
  website?: string
}

interface LanyardCardProps {
  member: User
}

export function LanyardCard({ member }: LanyardCardProps) {
  const hasLinks = Boolean(member.github || member.reddit || member.gitlab)

  return (
    <Card className="group overflow-hidden rounded-3xl glass shadow-xl transition-all duration-500 h-full flex flex-col">
      <CardContent className="p-5 flex-1 flex flex-col gap-4">
        <DiscordPresence userId={member.discordId} />

        {hasLinks && (
          <div className="pt-3 border-t border-white/[.07] flex flex-wrap gap-x-4 gap-y-2">
            {member.github && (
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
              </a>
            )}
            {member.gitlab && (
              <a
                href={member.gitlab}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <Gitlab className="h-3.5 w-3.5" />
                GitLab
              </a>
            )}
            {member.reddit && (
              <a
                href={member.reddit}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Reddit
              </a>
            )}
            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
