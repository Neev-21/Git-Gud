'use client'

import { useState } from 'react'
import { claimQuest, submitQuest } from './actions'

type Quest = {
  id: string
  title: string
  description: string | null
  difficulty: string
  exp_reward: number
  max_completions: number | null
  created_at: string
}

type MySubmission = {
  id: string
  quest_id: string | null
  status: string
  github_url: string
}

const DIFFICULTY_CONFIG: Record<string, { label: string; border: string; bg: string; text: string; glow: string; icon: string }> = {
  common: { label: 'Common', border: 'border-slate-500/50', bg: 'bg-slate-500/10', text: 'text-slate-400', glow: '', icon: '⚪' },
  rare: { label: 'Rare', border: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]', icon: '🟣' },
  legendary: { label: 'Legendary', border: 'border-amber-500/50', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]', icon: '🟡' },
}

type FilterType = 'all' | 'common' | 'rare' | 'legendary'

export default function QuestBoard({
  quests,
  mySubmissions,
  isAdmin,
}: {
  quests: Quest[]
  mySubmissions: MySubmission[]
  isAdmin: boolean
}) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [submitUrl, setSubmitUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Build a map of quest_id -> submission for quick lookup
  const submissionMap = new Map<string, MySubmission>()
  mySubmissions.forEach(s => {
    if (s.quest_id) submissionMap.set(s.quest_id, s)
  })

  const filteredQuests = filter === 'all' ? quests : quests.filter(q => q.difficulty === filter)

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Quests' },
    { key: 'common', label: '⚪ Common' },
    { key: 'rare', label: '🟣 Rare' },
    { key: 'legendary', label: '🟡 Legendary' },
  ]

  const handleClaim = async (questId: string) => {
    setIsLoading(true)
    setFeedback(null)
    const result = await claimQuest(questId)
    if (result.error) setFeedback(result.error)
    setIsLoading(false)
  }

  const handleSubmit = async (submissionId: string) => {
    if (!submitUrl.trim()) return
    setIsLoading(true)
    setFeedback(null)
    const result = await submitQuest(submissionId, submitUrl.trim())
    if (result.error) {
      setFeedback(result.error)
    } else {
      setSelectedQuest(null)
      setSubmitUrl('')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Bar */}
      <nav className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/profile" className="font-mono font-bold text-2xl uppercase tracking-tighter">
              <span className="text-white">Git</span>
              <span className="text-blue-500">Gud</span>
            </a>
            <span className="text-amber-400 font-mono text-sm border border-amber-500/30 bg-amber-500/10 px-3 py-1 rounded-full">⚔️ TAVERN</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <a href="/admin" className="text-sm text-slate-400 hover:text-white transition-colors font-mono border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800">
                Admin
              </a>
            )}
            <a href="/profile" className="text-sm text-slate-400 hover:text-white transition-colors font-mono">
              ← Profile
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-black font-mono text-white tracking-tight">
            The Quest Tavern
          </h1>
          <p className="text-slate-400 font-mono text-lg">
            Accept coding challenges. Earn EXP. Level up.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2.5 font-mono font-bold text-sm rounded-xl transition-all ${
                filter === f.key
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="text-center text-amber-400 font-mono text-sm bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            {feedback}
          </div>
        )}

        {/* Quest Grid */}
        {filteredQuests.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-mono border-2 border-dashed border-slate-700 rounded-2xl">
            No quests available right now. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuests.map(quest => {
              const config = DIFFICULTY_CONFIG[quest.difficulty] || DIFFICULTY_CONFIG.common
              const mySub = submissionMap.get(quest.id)

              return (
                <div
                  key={quest.id}
                  className={`group relative bg-slate-800/60 backdrop-blur-sm border-2 ${config.border} rounded-2xl p-6 space-y-4 transition-all duration-300 hover:bg-slate-800/90 ${config.glow} hover:scale-[1.02] cursor-pointer`}
                  onClick={() => setSelectedQuest(quest)}
                >
                  {/* Difficulty badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                      {config.icon} {config.label}
                    </span>
                    <span className="text-lg font-black font-mono text-white">
                      ⚡ {quest.exp_reward}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold font-mono text-white leading-tight group-hover:text-blue-300 transition-colors">
                    {quest.title}
                  </h3>

                  {/* Description preview */}
                  {quest.description && (
                    <p className="text-sm text-slate-400 font-mono line-clamp-3 leading-relaxed">
                      {quest.description}
                    </p>
                  )}

                  {/* Status / Action */}
                  <div className="pt-2">
                    {mySub ? (
                      <div className={`text-center py-2.5 rounded-xl font-mono font-bold text-sm border ${
                        mySub.status === 'approved' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : mySub.status === 'submitted'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : mySub.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {mySub.status === 'approved' && '✓ Completed'}
                        {mySub.status === 'submitted' && '⏳ Under Review'}
                        {mySub.status === 'rejected' && '✕ Rejected — Retry?'}
                        {mySub.status === 'pending' && '📝 In Progress'}
                      </div>
                    ) : (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          await handleClaim(quest.id)
                        }}
                        disabled={isLoading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all font-mono text-sm shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      >
                        ⚔️ Claim Quest
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Quest Detail Modal */}
      {selectedQuest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => { setSelectedQuest(null); setSubmitUrl('') }}>
          <div className="bg-slate-800 border-2 border-slate-700 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            {(() => {
              const config = DIFFICULTY_CONFIG[selectedQuest.difficulty] || DIFFICULTY_CONFIG.common
              const mySub = submissionMap.get(selectedQuest.id)
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                      {config.icon} {config.label}
                    </span>
                    <button onClick={() => { setSelectedQuest(null); setSubmitUrl('') }} className="text-slate-500 hover:text-white text-2xl transition-colors">✕</button>
                  </div>
                  <h2 className="text-2xl font-black font-mono text-white">{selectedQuest.title}</h2>
                  {selectedQuest.description && (
                    <p className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">{selectedQuest.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm font-mono text-slate-400 border-t border-slate-700 pt-4">
                    <span>⚡ <strong className="text-white">{selectedQuest.exp_reward}</strong> EXP</span>
                    {selectedQuest.max_completions && <span>👥 Max <strong className="text-white">{selectedQuest.max_completions}</strong></span>}
                  </div>

                  {/* Action Area */}
                  {mySub ? (
                    mySub.status === 'pending' ? (
                      <div className="space-y-3">
                        <p className="text-sm font-mono text-slate-400">Submit your GitHub link to complete this quest:</p>
                        <input
                          type="url"
                          value={submitUrl}
                          onChange={e => setSubmitUrl(e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors font-mono text-sm"
                        />
                        <button
                          onClick={() => handleSubmit(mySub.id)}
                          disabled={isLoading || !submitUrl.trim()}
                          className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all font-mono text-sm"
                        >
                          {isLoading ? 'Submitting...' : '🚀 Submit for Review'}
                        </button>
                      </div>
                    ) : (
                      <div className={`text-center py-3 rounded-xl font-mono font-bold text-sm border ${
                        mySub.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : mySub.status === 'submitted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {mySub.status === 'approved' && '✓ Quest Completed!'}
                        {mySub.status === 'submitted' && '⏳ Submission Under Review'}
                        {mySub.status === 'rejected' && '✕ Submission Rejected'}
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => handleClaim(selectedQuest.id)}
                      disabled={isLoading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all font-mono text-sm shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    >
                      {isLoading ? 'Claiming...' : '⚔️ Claim This Quest'}
                    </button>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
