'use client'

import { useState } from 'react'
import { Briefcase, Gamepad2, Shield, Sword, Trophy, Star, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { calculateLevelFromExp } from '@/utils/expEngine'

type UserData = {
  id: string
  email: string | undefined
  username: string
  avatar_url: string
  level: number
  exp: number
  rpgClass: string
  isAdmin: boolean
}

type BadgeData = {
  id: string
  name: string
  description: string
  image_url: string | null
  earnedAt: string
}

type GuildData = {
  id: string
  name: string
  banner_url: string | null
  role: string
} | null

export default function ProfileClient({ user, badges = [], guild = null }: { user: UserData; badges?: BadgeData[]; guild?: GuildData }) {
  const [isResumeView, setIsResumeView] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Use the new escalating EXP curve
  const { expToNextLevel, currentLevelBaseExp } = calculateLevelFromExp(user.exp)
  const totalExpRequiredForNextLevel = currentLevelBaseExp + expToNextLevel
  const progressInCurrentLevel = user.exp - currentLevelBaseExp
  const expProgress = Math.min((progressInCurrentLevel / expToNextLevel) * 100, 100)

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isResumeView ? 'bg-slate-50 text-slate-900 font-sans' : 'bg-slate-900 text-slate-100 font-sans'}`}>
      {/* Top Navbar */}
      <nav className={`p-4 border-b transition-colors duration-500 ${isResumeView ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50'}`}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="font-mono font-bold text-2xl uppercase tracking-tighter">
            <span className={isResumeView ? 'text-slate-900' : 'text-white'}>Git</span>
            <span className="text-blue-500">Gud</span>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="/tavern"
              className={`px-4 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
                isResumeView
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-amber-400 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
              }`}
            >
              ⚔️ Tavern
            </a>
            <a
              href="/guilds"
              className={`px-4 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
                isResumeView
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-purple-400 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20'
              }`}
            >
              🏰 Guilds
            </a>
            <a
              href="/raids"
              className={`px-4 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
                isResumeView
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
              }`}
            >
              🔥 Raids
            </a>
            <a
              href="/leaderboard"
              className={`px-4 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
                isResumeView
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-amber-400 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
              }`}
            >
              🏆 Ranks
            </a>
            {user.isAdmin && (
              <a
                href="/admin"
                className={`px-4 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
                  isResumeView
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                Admin
              </a>
            )}
            <button
              onClick={() => setIsResumeView(!isResumeView)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all duration-300 ${
                isResumeView 
                  ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
              }`}
            >
              {isResumeView ? <Gamepad2 className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
              {isResumeView ? 'Gamer Mode' : 'Resume Mode'}
            </button>
            
            <button onClick={handleLogout} className={`p-2.5 rounded-full transition-colors ${isResumeView ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`} aria-label="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
        {isResumeView ? (
          /* Resume View */
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              {user.avatar_url && (
                <img src={user.avatar_url} alt={user.username} className="w-32 h-32 rounded-full border-4 border-slate-100 shadow-sm" />
              )}
              <div className="space-y-3 flex-1">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">{user.username}</h1>
                <p className="text-xl text-slate-500 flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
                  <span className="font-semibold text-slate-700">Software Engineer</span>
                  <span className="hidden md:inline text-slate-300">•</span> 
                  <span>Specialization: {user.rpgClass.replace('-', ' ')}</span>
                </p>
                <div className="flex gap-4 pt-3 justify-center md:justify-start">
                  <a href={`https://github.com/${user.username}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                    GitHub Profile
                  </a>
                </div>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Experience Level</h3>
                <p className="text-4xl font-black text-slate-900">Lvl {user.level}</p>
              </div>
              <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Contributions</h3>
                <p className="text-4xl font-black text-slate-900">{user.exp.toLocaleString()} XP</p>
              </div>
              <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Core Skillset</h3>
                <p className="text-2xl font-black text-slate-900 leading-tight">{user.rpgClass}</p>
              </div>
            </section>
          </div>
        ) : (
          /* Gamer View */
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-800/80 backdrop-blur-md border-2 border-slate-700 hover:border-slate-600 transition-colors rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
              {/* Background glow */}
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-500/30 transition-colors duration-700" />
              
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40 animate-pulse" />
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="relative w-36 h-36 rounded-full border-4 border-slate-800 z-10" />
                ) : (
                  <div className="relative w-36 h-36 rounded-full border-4 border-slate-800 bg-slate-700 flex items-center justify-center z-10">
                    <Sword className="w-16 h-16 text-slate-500" />
                  </div>
                )}
                <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white font-bold font-mono text-sm px-4 py-1.5 rounded-full border-[3px] border-slate-800 z-20 shadow-lg">
                  LVL {user.level}
                </div>
              </div>
              
              <div className="flex-1 space-y-6 text-center md:text-left z-10 w-full">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-mono text-white tracking-tight drop-shadow-md">{user.username}</h1>
                  <p className="text-xl md:text-2xl text-blue-400 font-mono mt-2 flex items-center justify-center md:justify-start gap-2 font-semibold">
                    <Shield className="w-6 h-6" /> The {user.rpgClass}
                  </p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm md:text-base font-mono font-bold text-slate-400">
                    <span className="tracking-widest">EXPERIENCE</span>
                    <span className="text-white">{user.exp.toLocaleString()} <span className="text-slate-500">/ {totalExpRequiredForNextLevel.toLocaleString()}</span></span>
                  </div>
                  <div className="w-full h-5 bg-slate-900 rounded-full overflow-hidden border-2 border-slate-700 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 relative rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]"
                      style={{ width: `${expProgress}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_1s_linear_infinite]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-[2rem] hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold font-mono text-white">Achievements</h2>
                </div>
                {badges.length > 0 ? (
                  <div className="space-y-3">
                    {badges.map(badge => (
                      <div key={badge.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg overflow-hidden bg-amber-500/10 border border-amber-500/20">
                          {badge.image_url ? (
                            <img src={badge.image_url} alt={badge.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-amber-400">🏅</span>
                          )}
                        </div>
                        <div>
                          <p className="font-mono font-bold text-white text-sm">{badge.name}</p>
                          {badge.description && <p className="font-mono text-slate-500 text-xs">{badge.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-12 border-2 border-dashed border-slate-700 rounded-xl font-mono text-sm">
                    No achievements yet.
                    <br />Complete quests at the <a href="/tavern" className="text-amber-400 hover:underline">Tavern</a> to earn badges!
                  </div>
                )}
              </div>
              <div className="p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-[2rem] hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20">
                    <Star className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold font-mono text-white">Guild Affiliation</h2>
                </div>
                {guild ? (
                  <a
                    href={`/guilds/${guild.id}`}
                    className="flex items-center gap-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl hover:bg-purple-500/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 overflow-hidden shrink-0">
                      {guild.banner_url ? (
                        <img src={guild.banner_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🏰</div>
                      )}
                    </div>
                    <div>
                      <p className="font-mono font-bold text-white">{guild.name}</p>
                      <p className="font-mono text-xs text-purple-400">
                        {guild.role === 'leader' ? '👑 Guild Owner' : '⚔️ Member'}
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className="text-slate-400 text-center py-12 border-2 border-dashed border-slate-700 rounded-xl font-mono text-sm">
                    You are a lone wolf.
                    <br /><a href="/guilds" className="text-purple-400 hover:underline">Browse guilds</a> to find your crew!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
