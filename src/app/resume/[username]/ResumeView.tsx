'use client'

type UserInfo = {
  username: string
  level: number
  exp: number
  class: string | null
  created_at: string
}

type BadgeInfo = { name: string; description: string }
type QuestInfo = { title: string; description: string; difficulty: string }
type GuildInfo = { name: string; role: string } | null

const classTitles: Record<string, string> = {
  'Frontend Mage': 'Frontend Developer',
  'Backend Knight': 'Backend Developer',
  'Full-Stack Paladin': 'Full-Stack Developer',
  'DevOps Ranger': 'DevOps Engineer',
  'Data Sorcerer': 'Data Engineer',
}

const difficultyLabels: Record<string, string> = {
  common: 'Starter',
  rare: 'Intermediate',
  legendary: 'Advanced',
}

export default function ResumeView({
  user,
  badges,
  quests,
  guild,
}: {
  user: UserInfo
  badges: BadgeInfo[]
  quests: QuestInfo[]
  guild: GuildInfo
}) {
  const professionalTitle = user.class ? classTitles[user.class] || user.class : 'Software Developer'
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .resume-container { box-shadow: none !important; border: none !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          @page { margin: 0.75in; }
        }
      `}</style>

      {/* Print Button */}
      <div className="no-print fixed top-6 right-6 z-50 flex gap-3">
        <a href={`/u/${user.username}`} className="px-5 py-3 bg-slate-800 text-slate-300 hover:text-white font-mono text-sm font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors">
          ← Public Profile
        </a>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm font-bold rounded-xl shadow-lg transition-all hover:scale-105"
        >
          📄 Print / Save PDF
        </button>
      </div>

      <div className="min-h-screen bg-slate-100 py-12 px-6 print:bg-white print:py-0">
        <div className="resume-container max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-none">
          {/* Header */}
          <header className="px-10 pt-10 pb-8 border-b-2 border-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{user.username}</h1>
            <p className="text-lg text-blue-600 font-medium mt-1">{professionalTitle}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
              <span>Level {user.level} • {user.exp.toLocaleString()} EXP</span>
              <span>•</span>
              <span>Active since {joinDate}</span>
              {guild && (
                <>
                  <span>•</span>
                  <span>{guild.name} ({guild.role === 'leader' ? 'Team Lead' : 'Member'})</span>
                </>
              )}
            </div>
          </header>

          <div className="px-10 py-8 space-y-8">
            {/* Skills / Certifications */}
            {badges.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Skills & Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {badges.map((b, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                      {b.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {quests.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Projects & Achievements</h2>
                <div className="space-y-4">
                  {quests.map((q, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">{q.title}</h3>
                        <span className="text-xs text-slate-400 font-medium uppercase">{difficultyLabels[q.difficulty] || q.difficulty}</span>
                      </div>
                      {q.description && (
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{q.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Team Experience */}
            {guild && (
              <section>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Team Experience</h2>
                <div>
                  <h3 className="font-semibold text-slate-900">{guild.name}</h3>
                  <p className="text-sm text-slate-600">{guild.role === 'leader' ? 'Team Lead' : 'Team Member'} — Collaborative development and guild raid competitions</p>
                </div>
              </section>
            )}

            {/* Summary */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Summary</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {professionalTitle} with demonstrated experience across {quests.length} completed project{quests.length !== 1 ? 's' : ''} and {badges.length} earned certification{badges.length !== 1 ? 's' : ''}.
                Active contributor since {joinDate} with a track record of consistent development activity.
              </p>
            </section>
          </div>

          {/* Footer */}
          <footer className="px-10 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-200 text-center print:bg-white">
            <p className="text-xs text-slate-400">Generated by Git Gud • gitgud.dev/u/{user.username}</p>
          </footer>
        </div>
      </div>
    </>
  )
}
