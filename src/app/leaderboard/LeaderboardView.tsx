'use client'

import { useState } from 'react'

type Player = {
  id: string
  username: string
  avatar_url: string | null
  level: number
  exp: number
  class: string | null
  badge_count: number
}

type Guild = {
  id: string
  name: string
  banner_url: string | null
  member_count: number
  max_members: number
  total_exp: number
  avg_level: number
}

type Tab = 'players' | 'guilds'

const rankMedal: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const rankBorder: Record<number, string> = {
  1: 'border-amber-400/60 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  2: 'border-slate-400/50 bg-slate-400/5 shadow-[0_0_15px_rgba(148,163,184,0.1)]',
  3: 'border-orange-600/40 bg-orange-500/5 shadow-[0_0_15px_rgba(234,88,12,0.1)]',
}

const classIcons: Record<string, string> = {
  'Frontend Mage': '🧙‍♂️',
  'Backend Knight': '🛡️',
  'Full-Stack Paladin': '⚔️',
  'DevOps Ranger': '🏹',
  'Data Sorcerer': '🔮',
}

export default function LeaderboardView({
  players,
  guilds,
  currentUserId,
}: {
  players: Player[]
  guilds: Guild[]
  currentUserId: string
}) {
  const [tab, setTab] = useState<Tab>('players')

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/profile" className="font-mono font-bold text-2xl uppercase tracking-tighter">
              <span className="text-white">Git</span>
              <span className="text-blue-500">Gud</span>
            </a>
            <span className="text-amber-400 font-mono text-sm border border-amber-500/30 bg-amber-500/10 px-3 py-1 rounded-full">🏆 LEADERBOARD</span>
          </div>
          <a href="/profile" className="text-sm text-slate-400 hover:text-white transition-colors font-mono">← Profile</a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-black font-mono text-white tracking-tight">Leaderboard</h1>
          <p className="text-slate-400 font-mono text-lg">The strongest adventurers rise to the top.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700">
          {[
            { key: 'players' as Tab, label: '⚔️ Players', count: players.length },
            { key: 'guilds' as Tab, label: '🏰 Guilds', count: guilds.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold font-mono transition-all ${
                tab === t.key
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Players Tab */}
        {tab === 'players' && (
          <div className="space-y-3">
            {players.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono border-2 border-dashed border-slate-700 rounded-2xl">
                No adventurers yet.
              </div>
            ) : (
              players.map((p, i) => {
                const rank = i + 1
                const isMe = p.id === currentUserId
                return (
                  <a
                    key={p.id}
                    href={`/u/${p.username}`}
                    className={`flex items-center gap-4 p-4 border-2 rounded-2xl transition-all hover:scale-[1.01] ${
                      isMe
                        ? 'border-blue-500/40 bg-blue-500/5'
                        : rankBorder[rank] || 'border-slate-700/50 bg-slate-800/50'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-10 text-center font-mono font-black text-lg shrink-0">
                      {rankMedal[rank] || <span className="text-slate-500">{rank}</span>}
                    </div>

                    {/* Avatar */}
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="w-11 h-11 rounded-full border-2 border-slate-700 shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center text-slate-500 font-mono font-bold shrink-0">
                        {p.username[0]?.toUpperCase()}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold font-mono text-white truncate">{p.username}</p>
                        {isMe && (
                          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full shrink-0">YOU</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 font-mono">
                        {p.class && `${classIcons[p.class] || '🎯'} ${p.class} • `}
                        Lvl {p.level}
                        {p.badge_count > 0 && ` • 🏅 ${p.badge_count}`}
                      </p>
                    </div>

                    {/* EXP */}
                    <div className="text-right shrink-0">
                      <p className="font-black font-mono text-lg text-amber-400">{p.exp.toLocaleString()}</p>
                      <p className="text-xs font-mono text-slate-500">EXP</p>
                    </div>
                  </a>
                )
              })
            )}
          </div>
        )}

        {/* Guilds Tab */}
        {tab === 'guilds' && (
          <div className="space-y-3">
            {guilds.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono border-2 border-dashed border-slate-700 rounded-2xl">
                No guilds yet. <a href="/guilds" className="text-purple-400 hover:underline">Create one!</a>
              </div>
            ) : (
              guilds.map((g, i) => {
                const rank = i + 1
                return (
                  <a
                    key={g.id}
                    href={`/guilds/${g.id}`}
                    className={`flex items-center gap-4 p-4 border-2 rounded-2xl transition-all hover:scale-[1.01] ${
                      rankBorder[rank] || 'border-slate-700/50 bg-slate-800/50'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-10 text-center font-mono font-black text-lg shrink-0">
                      {rankMedal[rank] || <span className="text-slate-500">{rank}</span>}
                    </div>

                    {/* Banner */}
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 overflow-hidden shrink-0">
                      {g.banner_url ? (
                        <img src={g.banner_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🏰</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold font-mono text-white truncate">{g.name}</p>
                      <p className="text-sm text-slate-400 font-mono">
                        👥 {g.member_count}/{g.max_members} • Avg Lvl {g.avg_level}
                      </p>
                    </div>

                    {/* EXP */}
                    <div className="text-right shrink-0">
                      <p className="font-black font-mono text-lg text-purple-400">{g.total_exp.toLocaleString()}</p>
                      <p className="text-xs font-mono text-slate-500">TOTAL EXP</p>
                    </div>
                  </a>
                )
              })
            )}
          </div>
        )}
      </main>
    </div>
  )
}
