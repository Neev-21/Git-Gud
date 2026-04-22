'use client'

import { useState, useEffect } from 'react'
import { submitRaidEntry } from '../actions'

type RaidInfo = {
  id: string
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  exp_reward: number
  banner_url: string | null
  max_teams: number | null
  status: string
}

type Submission = {
  id: string
  guild_id: string
  guild_name: string
  guild_banner: string | null
  github_url: string
  score: number
  review_notes: string | null
  submitted_at: string | null
}

const rankMedal: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    if (!targetDate) { setTimeLeft(''); return }
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Time\'s up!'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetDate])
  return timeLeft
}

export default function RaidDetail({
  raid,
  submissions,
  isLeader,
  isInGuild,
  hasSubmitted,
}: {
  raid: RaidInfo
  submissions: Submission[]
  isLeader: boolean
  isInGuild: boolean
  hasSubmitted: boolean
}) {
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [githubUrl, setGithubUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const countdown = useCountdown(raid.status === 'active' ? raid.end_date : raid.status === 'upcoming' ? raid.start_date : null)
  const canSubmit = raid.status === 'active' && isLeader && !hasSubmitted

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFeedback(null)
    const result = await submitRaidEntry(raid.id, githubUrl)
    if (result.error) setFeedback(result.error)
    else {
      setShowSubmitForm(false)
      setGithubUrl('')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/profile" className="font-mono font-bold text-2xl uppercase tracking-tighter">
              <span className="text-white">Git</span>
              <span className="text-blue-500">Gud</span>
            </a>
            <span className="text-red-400 font-mono text-sm border border-red-500/30 bg-red-500/10 px-3 py-1 rounded-full">⚔️ RAID</span>
          </div>
          <a href="/raids" className="text-sm text-slate-400 hover:text-white transition-colors font-mono">← All Raids</a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-red-500/30">
          <div className="h-52 bg-gradient-to-br from-red-900/50 to-slate-800">
            {raid.banner_url && (
              <img src={raid.banner_url} alt="" className="w-full h-full object-cover opacity-50" />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                raid.status === 'active' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                raid.status === 'upcoming' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                'text-slate-400 bg-slate-500/10 border-slate-500/30'
              }`}>
                {raid.status === 'active' ? '🔥 ACTIVE' : raid.status === 'upcoming' ? '⏳ UPCOMING' : '📜 ENDED'}
              </span>
              {countdown && (
                <span className="text-sm font-mono font-bold text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                  {raid.status === 'active' ? `⏱ ${countdown} left` : `Starts in ${countdown}`}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-mono text-white">{raid.title}</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Teams', value: `${submissions.length}${raid.max_teams ? `/${raid.max_teams}` : ''}`, icon: '🏰' },
            { label: 'EXP Reward', value: raid.exp_reward.toLocaleString(), icon: '⚡' },
            { label: raid.status === 'ended' ? 'Ended' : 'Ends', value: raid.end_date ? new Date(raid.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—', icon: '📅' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 text-center">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-xl font-black font-mono text-white">{s.value}</p>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {raid.description && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold font-mono text-white mb-3">📋 Mission Brief</h2>
            <p className="text-slate-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">{raid.description}</p>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="text-center text-amber-400 font-mono text-sm bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            {feedback}
          </div>
        )}

        {/* Submit */}
        {canSubmit && !showSubmitForm && (
          <button
            onClick={() => setShowSubmitForm(true)}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all font-mono text-lg shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.01]"
          >
            ⚔️ Submit Raid Entry
          </button>
        )}

        {!isInGuild && raid.status === 'active' && (
          <p className="text-center text-sm text-slate-400 font-mono bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
            You must be in a <a href="/guilds" className="text-purple-400 hover:underline">guild</a> to participate in raids.
          </p>
        )}

        {isInGuild && !isLeader && raid.status === 'active' && !hasSubmitted && (
          <p className="text-center text-sm text-slate-400 font-mono bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
            Only guild leaders can submit raid entries. Ask your leader to submit!
          </p>
        )}

        {hasSubmitted && raid.status === 'active' && (
          <p className="text-center text-sm text-green-400 font-mono bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
            ✓ Your guild has submitted! Awaiting results.
          </p>
        )}

        {showSubmitForm && (
          <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-red-500/30 rounded-2xl p-6 space-y-4">
            <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">GitHub Repository URL</label>
            <input
              value={githubUrl}
              onChange={e => setGithubUrl(e.target.value)}
              required
              placeholder="https://github.com/your-team/raid-project"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors font-mono"
            />
            <div className="flex gap-3">
              <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl font-mono text-sm">
                {isLoading ? 'Submitting...' : '🚀 Submit'}
              </button>
              <button type="button" onClick={() => setShowSubmitForm(false)} className="px-6 py-3 border border-slate-700 text-slate-400 rounded-xl font-mono text-sm hover:bg-slate-800">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Submissions / Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-mono text-white">🏆 Submissions</h2>
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono border-2 border-dashed border-slate-700 rounded-2xl">
              No submissions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-4 p-4 border-2 rounded-2xl transition-all ${
                  i === 0 && raid.status === 'ended' ? 'border-amber-400/40 bg-amber-500/5' :
                  'border-slate-700/50 bg-slate-800/50'
                }`}>
                  <div className="w-10 text-center font-mono font-black text-lg shrink-0">
                    {rankMedal[i + 1] || <span className="text-slate-500">{i + 1}</span>}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 overflow-hidden shrink-0">
                    {s.guild_banner ? (
                      <img src={s.guild_banner} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🏰</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={`/guilds/${s.guild_id}`} className="font-bold font-mono text-white hover:text-purple-300 transition-colors">{s.guild_name}</a>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      <a href={s.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">{s.github_url}</a>
                    </p>
                    {s.review_notes && <p className="text-xs text-slate-400 font-mono mt-1 italic">&ldquo;{s.review_notes}&rdquo;</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black font-mono text-lg text-amber-400">{s.score}</p>
                    <p className="text-xs font-mono text-slate-500">pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
