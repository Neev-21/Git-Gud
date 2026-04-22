'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Stats = {
  totalUsers: number
  totalGuilds: number
  totalQuestsCompleted: number
  totalExp: number
}

type Activity = {
  type: 'badge'
  text: string
  time: string
}

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const step = Math.max(1, Math.floor(target / (duration / 16)))
    let val = 0
    const interval = setInterval(() => {
      val = Math.min(val + step, target)
      setCurrent(val)
      if (val >= target) clearInterval(interval)
    }, 16)
    return () => clearInterval(interval)
  }, [target, duration])
  return <>{current.toLocaleString()}</>
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const features = [
  { icon: '⚔️', title: 'RPG Profile', desc: 'Choose your class, level up with EXP, and showcase your dev journey as a character sheet.' },
  { icon: '📜', title: 'Quest Tavern', desc: 'Accept coding bounties, submit your work, and earn EXP + exclusive badges.' },
  { icon: '🏰', title: 'Guild System', desc: 'Create or join a guild. Compete as a team in raids and climb the leaderboard.' },
  { icon: '🔥', title: 'Guild Raids', desc: 'Time-limited hackathon events where guilds battle for massive EXP rewards and glory.' },
]

export default function LandingPage({
  isLoggedIn,
  stats,
  activity,
}: {
  isLoggedIn: boolean
  stats: Stats
  activity: Activity[]
}) {
  const handleLogin = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        console.error("Login error:", error.message)
        alert("Failed to login: " + error.message)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      alert("An unexpected error occurred during login.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="font-mono font-bold text-3xl uppercase tracking-tighter">
          <span className="text-white">Git</span>
          <span className="text-blue-500">Gud</span>
        </div>
        {isLoggedIn ? (
          <a href="/profile" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)] font-mono text-sm">
            Go to Profile →
          </a>
        ) : (
          <button onClick={handleLogin} className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] font-mono text-sm">
            Sign in with GitHub
          </button>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-mono text-sm">
            ⚡ Your code is worth more than commits
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-mono tracking-tight leading-none">
            <span className="text-white">Turn Code Into</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              An Adventure
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed">
            Level up your developer profile. Earn EXP from GitHub commits, conquer quests, join guilds, and compete in raids.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isLoggedIn ? (
              <a href="/profile" className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.4)] font-mono text-lg">
                ⚔️ Enter the Game
              </a>
            ) : (
              <button onClick={handleLogin} className="group flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-bold rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] font-mono text-lg">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                Start Your Journey
              </button>
            )}
            <a href="/leaderboard" className="px-8 py-5 border-2 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 font-bold rounded-2xl transition-all font-mono text-lg">
              🏆 View Leaderboard
            </a>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Adventurers', value: stats.totalUsers, icon: '⚔️' },
            { label: 'Guilds', value: stats.totalGuilds, icon: '🏰' },
            { label: 'Quests Done', value: stats.totalQuestsCompleted, icon: '📜' },
            { label: 'Total EXP', value: stats.totalExp, icon: '⚡' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center hover:bg-slate-800/60 transition-colors">
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="text-3xl font-black font-mono text-white">
                <AnimatedNumber target={s.value} />
              </p>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black font-mono text-white">How It Works</h2>
          <p className="text-slate-400 font-mono mt-3">More than a portfolio. It&apos;s a quest log.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-slate-600 transition-all duration-300 hover:scale-[1.02]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold font-mono text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 font-mono text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Feed */}
      {activity.length > 0 && (
        <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
          <h2 className="text-2xl font-bold font-mono text-white text-center mb-8">🔔 Recent Activity</h2>
          <div className="space-y-3">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <span className="text-lg">🏅</span>
                <p className="flex-1 font-mono text-sm text-slate-300">{a.text}</p>
                <span className="text-xs font-mono text-slate-500 shrink-0">{timeAgo(a.time)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8 text-center">
        <p className="text-sm font-mono text-slate-500">
          Built with Next.js + Supabase •{' '}
          <a href="https://github.com/Neev-21/Git-Gud" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
