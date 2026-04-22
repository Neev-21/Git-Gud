'use client'

type Raid = {
  id: string
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  exp_reward: number
  banner_url: string | null
  max_teams: number | null
  team_count: number
  status: 'active' | 'upcoming' | 'ended' | 'inactive'
}

const statusConfig: Record<string, { label: string; color: string; glow: string }> = {
  active: { label: '🔥 ACTIVE', color: 'text-red-400 bg-red-500/10 border-red-500/30', glow: 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]' },
  upcoming: { label: '⏳ UPCOMING', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', glow: 'border-amber-500/30' },
  ended: { label: '📜 ENDED', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', glow: 'border-slate-700' },
  inactive: { label: 'DRAFT', color: 'text-slate-500 bg-slate-500/10 border-slate-600/30', glow: 'border-slate-700' },
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function RaidBoard({ raids }: { raids: Raid[] }) {
  const active = raids.filter(r => r.status === 'active')
  const upcoming = raids.filter(r => r.status === 'upcoming')
  const ended = raids.filter(r => r.status === 'ended')

  const renderRaid = (raid: Raid) => {
    const cfg = statusConfig[raid.status]
    return (
      <a
        key={raid.id}
        href={`/raids/${raid.id}`}
        className={`group relative bg-slate-800/60 backdrop-blur-sm border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${cfg.glow} ${raid.status === 'active' ? 'animate-pulse-subtle' : ''}`}
      >
        <div className="h-32 bg-gradient-to-br from-red-900/30 to-slate-800 overflow-hidden">
          {raid.banner_url && (
            <img src={raid.banner_url} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
          )}
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
            <span className="text-xs font-mono text-slate-500">⚡ {raid.exp_reward.toLocaleString()} EXP</span>
          </div>
          <h3 className="text-lg font-bold font-mono text-white group-hover:text-red-300 transition-colors">{raid.title}</h3>
          {raid.description && (
            <p className="text-sm text-slate-400 font-mono line-clamp-2">{raid.description}</p>
          )}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2 border-t border-slate-700">
            <span>🏰 {raid.team_count}{raid.max_teams ? `/${raid.max_teams}` : ''} teams</span>
            <span>{raid.start_date ? formatDate(raid.start_date) : 'No date set'}</span>
          </div>
        </div>
      </a>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/profile" className="font-mono font-bold text-2xl uppercase tracking-tighter">
              <span className="text-white">Git</span>
              <span className="text-blue-500">Gud</span>
            </a>
            <span className="text-red-400 font-mono text-sm border border-red-500/30 bg-red-500/10 px-3 py-1 rounded-full">⚔️ RAIDS</span>
          </div>
          <a href="/profile" className="text-sm text-slate-400 hover:text-white transition-colors font-mono">← Profile</a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-black font-mono text-white tracking-tight">Guild Raids</h1>
          <p className="text-slate-400 font-mono text-lg">Time-limited team challenges. Rally your guild. Claim glory.</p>
        </div>

        {active.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono text-red-400 flex items-center gap-2">🔥 Active Raids</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{active.map(renderRaid)}</div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono text-amber-400 flex items-center gap-2">⏳ Upcoming</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{upcoming.map(renderRaid)}</div>
          </section>
        )}

        {ended.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono text-slate-400 flex items-center gap-2">📜 Past Raids</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{ended.map(renderRaid)}</div>
          </section>
        )}

        {raids.length === 0 && (
          <div className="text-center py-20 text-slate-500 font-mono border-2 border-dashed border-slate-700 rounded-2xl">
            No raids yet. Check back soon!
          </div>
        )}
      </main>
    </div>
  )
}
