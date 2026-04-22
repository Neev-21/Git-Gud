'use client'

import { useState } from 'react'
import { leaveGuild, kickMember, disbandGuild, joinGuild } from '../actions'

type GuildInfo = {
  id: string
  name: string
  description: string | null
  banner_url: string | null
  owner_id: string | null
  max_members: number
}

type Member = {
  userId: string
  username: string
  avatar_url: string | null
  level: number
  exp: number
  class: string | null
  role: string
  joined_at: string
}

export default function GuildDetail({
  guild,
  members,
  totalExp,
  avgLevel,
  currentUserId,
}: {
  guild: GuildInfo
  members: Member[]
  totalExp: number
  avgLevel: number
  currentUserId: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const isOwner = guild.owner_id === currentUserId
  const isMember = members.some(m => m.userId === currentUserId)
  const isFull = members.length >= guild.max_members

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/profile" className="font-mono font-bold text-2xl uppercase tracking-tighter">
              <span className="text-white">Git</span>
              <span className="text-blue-500">Gud</span>
            </a>
            <span className="text-purple-400 font-mono text-sm border border-purple-500/30 bg-purple-500/10 px-3 py-1 rounded-full">🏰 GUILD</span>
          </div>
          <a href="/guilds" className="text-sm text-slate-400 hover:text-white transition-colors font-mono">← All Guilds</a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
        {/* Banner + Info */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-purple-500/30">
          <div className="h-48 bg-gradient-to-br from-purple-900/60 to-slate-800">
            {guild.banner_url && (
              <img src={guild.banner_url} alt="" className="w-full h-full object-cover opacity-50" />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-3xl md:text-4xl font-black font-mono text-white mb-2">{guild.name}</h1>
            {guild.description && (
              <p className="text-slate-300 font-mono text-sm max-w-2xl">{guild.description}</p>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Members', value: `${members.length}/${guild.max_members}`, icon: '👥' },
            { label: 'Total EXP', value: totalExp.toLocaleString(), icon: '⚡' },
            { label: 'Avg Level', value: `Lvl ${avgLevel}`, icon: '📊' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 text-center">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-xl font-black font-mono text-white">{stat.value}</p>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="text-center text-amber-400 font-mono text-sm bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            {feedback}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {!isMember && (
            <button
              onClick={async () => {
                setIsLoading(true)
                setFeedback(null)
                const result = await joinGuild(guild.id)
                if (result.error) setFeedback(result.error)
                setIsLoading(false)
              }}
              disabled={isLoading || isFull}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all font-mono text-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              {isFull ? 'Guild Full' : '⚔️ Join Guild'}
            </button>
          )}
          {isMember && !isOwner && (
            <button
              onClick={async () => {
                if (confirm('Leave this guild?')) {
                  setIsLoading(true)
                  const result = await leaveGuild(guild.id)
                  if (result?.error) setFeedback(result.error)
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
              className="px-8 py-3 border border-red-800 text-red-400 hover:bg-red-900/30 font-bold rounded-xl transition-all font-mono text-sm"
            >
              Leave Guild
            </button>
          )}
          {isOwner && (
            <button
              onClick={async () => {
                if (confirm('Disband this guild? All members will be removed. This cannot be undone.')) {
                  setIsLoading(true)
                  await disbandGuild(guild.id)
                }
              }}
              disabled={isLoading}
              className="px-8 py-3 border border-red-800 text-red-400 hover:bg-red-900/30 font-bold rounded-xl transition-all font-mono text-sm"
            >
              🗑️ Disband Guild
            </button>
          )}
        </div>

        {/* Member Roster */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-mono text-white">Members</h2>
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.userId} className="flex items-center justify-between gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl hover:bg-slate-800/80 transition-colors">
                <a href={`/u/${m.username}`} className="flex items-center gap-4 flex-1 min-w-0">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-11 h-11 rounded-full border-2 border-slate-700" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center text-slate-500 font-mono font-bold">{m.username[0]?.toUpperCase()}</div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold font-mono text-white truncate">{m.username}</p>
                      {m.role === 'leader' && (
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">👑 Owner</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 font-mono">
                      Lvl {m.level} • {m.exp.toLocaleString()} EXP
                      {m.class && ` • ${m.class}`}
                    </p>
                  </div>
                </a>
                {isOwner && m.userId !== currentUserId && (
                  <button
                    onClick={async () => {
                      if (confirm(`Kick ${m.username} from the guild?`)) {
                        setIsLoading(true)
                        const result = await kickMember(guild.id, m.userId)
                        if (result.error) setFeedback(result.error)
                        setIsLoading(false)
                      }
                    }}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-mono font-bold border border-red-800 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors shrink-0"
                  >
                    Kick
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
