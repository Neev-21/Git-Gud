'use client'

type BadgeInfo = {
  id: string
  name: string
  description: string
  image_url: string | null
}

type GuildInfo = {
  id: string
  name: string
  banner_url: string | null
  role: string
}

type UserInfo = {
  username: string
  avatar_url: string | null
  level: number
  exp: number
  class: string | null
  created_at: string
}

const classIcons: Record<string, string> = {
  'Frontend Mage': '🧙‍♂️',
  'Backend Knight': '🛡️',
  'Full-Stack Paladin': '⚔️',
  'DevOps Ranger': '🏹',
  'Data Sorcerer': '🔮',
}

function getExpForLevel(level: number) {
  if (level <= 1) return 100
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

export default function PublicProfile({
  user,
  badges,
  guild,
  questsCompleted,
}: {
  user: UserInfo
  badges: BadgeInfo[]
  guild: GuildInfo | null
  questsCompleted: number
}) {
  const expForNext = getExpForLevel(user.level)
  const expIntoLevel = user.exp % expForNext
  const progress = Math.min((expIntoLevel / expForNext) * 100, 100)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/profile" className="font-mono font-bold text-2xl uppercase tracking-tighter">
              <span className="text-white">Git</span>
              <span className="text-blue-500">Gud</span>
            </a>
            <span className="text-slate-400 font-mono text-sm border border-slate-600 bg-slate-800/50 px-3 py-1 rounded-full">👁️ PUBLIC PROFILE</span>
          </div>
          <a href="/leaderboard" className="text-sm text-slate-400 hover:text-white transition-colors font-mono">🏆 Leaderboard</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
        {/* Hero Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-[2rem] p-10 text-center space-y-6">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-28 h-28 rounded-full border-4 border-blue-500/30 mx-auto" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-slate-700 flex items-center justify-center text-3xl font-mono font-bold text-slate-500 mx-auto">
              {user.username[0]?.toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-black font-mono text-white">{user.username}</h1>
            {user.class && (
              <p className="text-blue-400 font-mono text-sm mt-2 inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                {classIcons[user.class] || '🎯'} {user.class}
              </p>
            )}
          </div>

          {/* Level + EXP */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-amber-400 font-mono font-bold text-lg">Level {user.level}</span>
              <span className="text-slate-500 font-mono text-sm">{user.exp.toLocaleString()} EXP</span>
            </div>
            <div className="w-full max-w-xs mx-auto bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-2">{expIntoLevel} / {expForNext} to next level</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700 max-w-md mx-auto">
            <div>
              <p className="text-xl font-black font-mono text-white">{questsCompleted}</p>
              <p className="text-xs font-mono text-slate-500 uppercase">Quests</p>
            </div>
            <div>
              <p className="text-xl font-black font-mono text-white">{badges.length}</p>
              <p className="text-xs font-mono text-slate-500 uppercase">Badges</p>
            </div>
            <div>
              <p className="text-xl font-black font-mono text-white">
                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs font-mono text-slate-500 uppercase">Joined</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badges */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-[2rem] p-8">
            <h2 className="text-xl font-bold font-mono text-white mb-4">🏅 Achievements</h2>
            {badges.length > 0 ? (
              <div className="space-y-3">
                {badges.map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0">
                      {badge.image_url ? (
                        <img src={badge.image_url} alt={badge.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-amber-400">🏅</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-white text-sm truncate">{badge.name}</p>
                      {badge.description && <p className="font-mono text-slate-500 text-xs truncate">{badge.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 font-mono text-sm text-center py-8 border-2 border-dashed border-slate-700 rounded-xl">No badges yet.</p>
            )}
          </div>

          {/* Guild */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-[2rem] p-8">
            <h2 className="text-xl font-bold font-mono text-white mb-4">🏰 Guild</h2>
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
                    {guild.role === 'leader' ? '👑 Owner' : '⚔️ Member'}
                  </p>
                </div>
              </a>
            ) : (
              <p className="text-slate-500 font-mono text-sm text-center py-8 border-2 border-dashed border-slate-700 rounded-xl">Lone wolf — no guild.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
