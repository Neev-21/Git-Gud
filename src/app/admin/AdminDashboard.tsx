'use client'

import { useState } from 'react'
import { createQuest, updateQuestStatus, deleteQuest, reviewSubmission, toggleUserAdmin, createBadge, deleteBadge, createRaid, deleteRaid, closeRaid, scoreRaidSubmission, finalizeRaid } from './actions'

type Quest = {
  id: string
  title: string
  description: string | null
  difficulty: string
  status: string
  exp_reward: number
  max_completions: number | null
  badge_reward_id: string | null
  badges: { id: string; name: string } | null
  created_at: string
}

type Submission = {
  id: string
  user_id: string
  quest_id: string | null
  github_url: string
  status: string
  created_at: string
  reviewed_at: string | null
  reviewer_notes: string | null
  profiles: { username: string; avatar_url: string | null } | null
  quests: { title: string; exp_reward: number } | null
}

type Badge = { id: string; name: string; image_url: string | null }

type UserProfile = {
  id: string
  username: string
  avatar_url: string | null
  is_admin: boolean
  level: number
  exp: number
  class: string | null
}

const DIFFICULTY_STYLES: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  common: { border: 'border-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400', glow: '' },
  rare: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]' },
  legendary: { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-[0_0_16px_rgba(245,158,11,0.4)]' },
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  approved: 'bg-green-500/10 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
}

type Tab = 'quests' | 'submissions' | 'badges' | 'raids' | 'users'

type RaidData = {
  id: string
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  is_finalized: boolean
  exp_reward: number
  banner_url: string | null
  max_teams: number | null
  hackathon_submissions: {
    id: string
    guild_id: string
    github_url: string
    score: number
    review_notes: string | null
    placement: number | null
    guilds: { name: string; banner_url: string | null } | null
  }[]
}

export default function AdminDashboard({
  quests,
  submissions,
  badges,
  users,
  raids,
}: {
  quests: Quest[]
  submissions: Submission[]
  badges: Badge[]
  users: UserProfile[]
  raids: RaidData[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>('quests')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showBadgeForm, setShowBadgeForm] = useState(false)
  const [badgePreview, setBadgePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'quests', label: 'Quests', count: quests.length },
    { key: 'submissions', label: 'Submissions', count: submissions.filter(s => s.status === 'submitted').length },
    { key: 'badges', label: 'Badges', count: badges.length },
    { key: 'raids', label: 'Raids', count: raids.length },
    { key: 'users', label: 'Users', count: users.length },
  ]

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
            <span className="text-slate-500 font-mono text-sm border border-slate-700 px-3 py-1 rounded-full">ADMIN</span>
          </div>
          <a href="/profile" className="text-sm text-slate-400 hover:text-white transition-colors font-mono">
            ← Back to Profile
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 font-mono font-bold text-sm tracking-wider rounded-t-xl transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-800 text-white border border-slate-700 border-b-slate-900'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── QUESTS TAB ─── */}
        {activeTab === 'quests' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-mono">Quest Management</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.3)] font-mono text-sm"
              >
                {showCreateForm ? '✕ Cancel' : '+ New Quest'}
              </button>
            </div>

            {/* Create Quest Form */}
            {showCreateForm && (
              <form
                action={async (formData) => {
                  setIsLoading(true)
                  await createQuest(formData)
                  setShowCreateForm(false)
                  setIsLoading(false)
                }}
                className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Title</label>
                    <input name="title" required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors font-mono" placeholder="Build a REST API..." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea name="description" rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors font-mono resize-none" placeholder="Describe the quest requirements..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
                    <select name="difficulty" defaultValue="common" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors font-mono">
                      <option value="common">⚪ Common (50-100 EXP)</option>
                      <option value="rare">🟣 Rare (200-500 EXP)</option>
                      <option value="legendary">🟡 Legendary (1000+ EXP)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">EXP Reward</label>
                    <input name="exp_reward" type="number" required min={1} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors font-mono" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Badge Reward</label>
                    <select name="badge_reward_id" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors font-mono">
                      <option value="">No badge</option>
                      {badges.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Max Completions</label>
                    <input name="max_completions" type="number" min={1} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors font-mono" placeholder="Unlimited" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all font-mono text-sm uppercase tracking-wider"
                >
                  {isLoading ? 'Creating...' : '⚔️ Create Quest'}
                </button>
              </form>
            )}

            {/* Quest List */}
            <div className="space-y-4">
              {quests.length === 0 ? (
                <div className="text-center py-16 text-slate-500 font-mono border-2 border-dashed border-slate-700 rounded-2xl">
                  No quests yet. Create your first one!
                </div>
              ) : (
                quests.map(quest => {
                  const style = DIFFICULTY_STYLES[quest.difficulty] || DIFFICULTY_STYLES.common
                  return (
                    <div key={quest.id} className={`flex items-center justify-between gap-4 p-6 bg-slate-800/50 backdrop-blur-sm border ${style.border} rounded-2xl ${style.glow} transition-all hover:bg-slate-800/80`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold font-mono text-lg text-white truncate">{quest.title}</h3>
                          <span className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                            {quest.difficulty}
                          </span>
                          <span className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                            quest.status === 'open' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            {quest.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 font-mono truncate">{quest.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-mono">
                          <span>⚡ {quest.exp_reward} EXP</span>
                          {quest.badges && <span>🏅 {quest.badges.name}</span>}
                          {quest.max_completions && <span>👥 Max {quest.max_completions}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={async () => {
                            setIsLoading(true)
                            await updateQuestStatus(quest.id, quest.status === 'open' ? 'closed' : 'open')
                            setIsLoading(false)
                          }}
                          className="px-4 py-2 text-xs font-mono font-bold border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
                        >
                          {quest.status === 'open' ? 'Close' : 'Reopen'}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete this quest? This cannot be undone.')) {
                              setIsLoading(true)
                              await deleteQuest(quest.id)
                              setIsLoading(false)
                            }
                          }}
                          className="px-4 py-2 text-xs font-mono font-bold border border-red-800 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ─── SUBMISSIONS TAB ─── */}
        {activeTab === 'submissions' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold font-mono">Submission Review</h2>
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="text-center py-16 text-slate-500 font-mono border-2 border-dashed border-slate-700 rounded-2xl">
                  No submissions yet.
                </div>
              ) : (
                submissions.map(sub => (
                  <div key={sub.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 space-y-4 hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {sub.profiles?.avatar_url && (
                          <img src={sub.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full border-2 border-slate-700" />
                        )}
                        <div>
                          <p className="font-bold font-mono text-white">{sub.profiles?.username || 'Unknown'}</p>
                          <p className="text-sm text-slate-400 font-mono">{sub.quests?.title || 'Unknown Quest'} • ⚡ {sub.quests?.exp_reward || 0} EXP</p>
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-bold uppercase px-3 py-1.5 rounded-full border ${STATUS_STYLES[sub.status] || STATUS_STYLES.pending}`}>
                        {sub.status}
                      </span>
                    </div>

                    <a
                      href={sub.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full text-left px-4 py-3 bg-slate-900 rounded-xl text-blue-400 hover:text-blue-300 font-mono text-sm transition-colors border border-slate-700 hover:border-blue-500/50 truncate"
                    >
                      🔗 {sub.github_url}
                    </a>

                    {sub.status === 'submitted' && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={async () => {
                            setIsLoading(true)
                            await reviewSubmission(sub.id, 'approved')
                            setIsLoading(false)
                          }}
                          disabled={isLoading}
                          className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all font-mono text-sm"
                        >
                          ✓ Approve & Award EXP
                        </button>
                        <button
                          onClick={async () => {
                            const notes = prompt('Rejection reason (optional):')
                            setIsLoading(true)
                            await reviewSubmission(sub.id, 'rejected', notes || undefined)
                            setIsLoading(false)
                          }}
                          disabled={isLoading}
                          className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-red-400 font-bold rounded-xl transition-all font-mono text-sm"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}

                    {sub.reviewer_notes && (
                      <p className="text-sm text-slate-500 font-mono italic border-l-2 border-slate-700 pl-3 mt-2">
                        Admin note: {sub.reviewer_notes}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 font-mono">
                      Submitted {new Date(sub.created_at).toLocaleDateString()}
                      {sub.reviewed_at && ` • Reviewed ${new Date(sub.reviewed_at).toLocaleDateString()}`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* ─── BADGES TAB ─── */}
        {activeTab === 'badges' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-mono">Badge Management</h2>
              <button
                onClick={() => setShowBadgeForm(!showBadgeForm)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-mono text-sm"
              >
                {showBadgeForm ? '✕ Cancel' : '+ New Badge'}
              </button>
            </div>

            {showBadgeForm && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setIsLoading(true)
                  const form = e.currentTarget
                  const formData = new FormData(form)
                  const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]')
                  const file = fileInput?.files?.[0]

                  if (file) {
                    const { createClient } = await import('@/utils/supabase/client')
                    const supabase = createClient()
                    const ext = file.name.split('.').pop()
                    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

                    const { error: uploadError } = await supabase.storage
                      .from('badges')
                      .upload(fileName, file)

                    if (uploadError) {
                      alert('Failed to upload image: ' + uploadError.message)
                      setIsLoading(false)
                      return
                    }

                    const { data: urlData } = supabase.storage
                      .from('badges')
                      .getPublicUrl(fileName)

                    formData.set('image_url', urlData.publicUrl)
                  }

                  await createBadge(formData)
                  setShowBadgeForm(false)
                  setBadgePreview(null)
                  setIsLoading(false)
                }}
                className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Badge Name</label>
                    <input name="name" required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors font-mono" placeholder="First Blood" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Badge Image</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full bg-slate-900 border border-dashed border-slate-600 hover:border-amber-500 rounded-xl px-4 py-3 text-slate-400 hover:text-amber-400 transition-colors font-mono text-sm text-center">
                          {badgePreview ? '✓ Image selected' : 'Click to upload...'}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (ev) => setBadgePreview(ev.target?.result as string)
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                      {badgePreview && (
                        <img src={badgePreview} alt="Preview" className="w-14 h-14 rounded-xl border-2 border-amber-500/30 object-cover" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Description</label>
                    <input name="description" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors font-mono" placeholder="Awarded for completing your first quest" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all font-mono text-sm uppercase tracking-wider"
                >
                  {isLoading ? 'Uploading...' : '🏅 Create Badge'}
                </button>
              </form>
            )}

            <div className="space-y-3">
              {badges.length === 0 ? (
                <div className="text-center py-16 text-slate-500 font-mono border-2 border-dashed border-slate-700 rounded-2xl">
                  No badges yet. Create your first one!
                </div>
              ) : (
                badges.map(b => (
                  <div key={b.id} className="flex items-center justify-between gap-4 p-5 bg-slate-800/50 backdrop-blur-sm border border-amber-500/20 rounded-2xl hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl border border-amber-500/20 flex items-center justify-center text-2xl overflow-hidden bg-amber-500/10">
                        {b.image_url ? (
                          <img src={b.image_url} alt={b.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-amber-400">🏅</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold font-mono text-white">{b.name}</p>
                        <p className="text-xs text-slate-500 font-mono">ID: {b.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete badge "${b.name}"? This cannot be undone.`)) {
                          setIsLoading(true)
                          await deleteBadge(b.id)
                          setIsLoading(false)
                        }
                      }}
                      disabled={isLoading}
                      className="px-4 py-2 text-xs font-mono font-bold border border-red-800 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── RAIDS TAB ─── */}
        {activeTab === 'raids' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-mono">Raid Management</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.3)] font-mono text-sm"
              >
                {showCreateForm ? '✕ Cancel' : '+ New Raid'}
              </button>
            </div>

            {showCreateForm && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setIsLoading(true)
                  const formData = new FormData(e.currentTarget)
                  await createRaid(formData)
                  setShowCreateForm(false)
                  setIsLoading(false)
                }}
                className="bg-slate-800/60 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Title</label>
                    <input name="title" required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors font-mono" placeholder="The Great Code War" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">EXP Reward</label>
                    <input name="exp_reward" type="number" defaultValue={500} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                    <input name="start_date" type="datetime-local" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">End Date</label>
                    <input name="end_date" type="datetime-local" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Max Teams (optional)</label>
                    <input name="max_teams" type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors font-mono" placeholder="Leave empty for unlimited" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea name="description" rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors font-mono resize-none" placeholder="Describe the raid mission..." />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all font-mono text-sm uppercase tracking-wider">
                  {isLoading ? 'Creating...' : '⚔️ Launch Raid'}
                </button>
              </form>
            )}

            <div className="space-y-4">
              {raids.length === 0 ? (
                <div className="text-center py-16 text-slate-500 font-mono border-2 border-dashed border-slate-700 rounded-2xl">No raids yet.</div>
              ) : (
                raids.map(r => (
                  <div key={r.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold font-mono text-white text-lg">{r.title}</h3>
                          {(() => {
                            const now = new Date()
                            const ended = r.end_date && new Date(r.end_date) < now
                            if (r.is_finalized) return <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">✓ Finalized</span>
                            if (ended) return <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">⚖️ Judging</span>
                            if (r.start_date && new Date(r.start_date) > now) return <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">⏳ Upcoming</span>
                            return <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">🔥 Active</span>
                          })()}
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          ⚡ {r.exp_reward} EXP • 🏰 {r.hackathon_submissions.length}{r.max_teams ? `/${r.max_teams}` : ''} teams
                          {r.start_date && ` • ${new Date(r.start_date).toLocaleDateString()}`}
                          {r.end_date && ` → ${new Date(r.end_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete raid "${r.title}"?`)) {
                            setIsLoading(true)
                            await deleteRaid(r.id)
                            setIsLoading(false)
                          }
                        }}
                        disabled={isLoading || r.is_finalized}
                        className="px-3 py-1.5 text-xs font-mono font-bold text-red-400 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-30"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Lifecycle Action Bar */}
                    {!r.is_finalized && (
                      <div className="flex gap-3">
                        {/* Close Submissions — only if raid hasn't ended yet */}
                        {(!r.end_date || new Date(r.end_date) > new Date()) && (
                          <button
                            onClick={async () => {
                              if (confirm(`Close submissions for "${r.title}"? This will end the submission period immediately.`)) {
                                setIsLoading(true)
                                await closeRaid(r.id)
                                setIsLoading(false)
                              }
                            }}
                            disabled={isLoading}
                            className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all font-mono text-sm shadow-[0_0_12px_rgba(234,88,12,0.3)]"
                          >
                            🔒 Close Submissions
                          </button>
                        )}
                        {/* Finalize & Release EXP — only if ended and has submissions */}
                        {r.end_date && new Date(r.end_date) < new Date() && r.hackathon_submissions.length > 0 && (
                          <button
                            onClick={async () => {
                              const sorted = [...r.hackathon_submissions].sort((a, b) => b.score - a.score)
                              const preview = sorted.slice(0, 3).map((s, i) => {
                                const mult = [3, 2, 1.5][i]
                                const medal = ['🥇', '🥈', '🥉'][i]
                                return `${medal} ${s.guilds?.name || 'Unknown'}: ${s.score}pts → ${Math.floor(r.exp_reward * mult)} EXP`
                              }).join('\n')
                              const rest = sorted.length > 3 ? `\n+ ${sorted.length - 3} more guilds: ${r.exp_reward} EXP each` : ''
                              if (confirm(`Finalize "${r.title}" & Release EXP?\n\n${preview}${rest}\n\nEXP will be distributed to ALL guild members. This cannot be undone.`)) {
                                setIsLoading(true)
                                await finalizeRaid(r.id)
                                setIsLoading(false)
                              }
                            }}
                            disabled={isLoading}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all font-mono text-sm shadow-[0_0_12px_rgba(22,163,74,0.3)]"
                          >
                            🏆 Finalize & Release EXP
                          </button>
                        )}
                      </div>
                    )}
                    {r.hackathon_submissions.length > 0 && (
                      <div className="space-y-2 border-t border-slate-700 pt-4">
                        <p className="text-sm font-mono font-bold text-slate-400">{r.is_finalized ? 'Results:' : 'Submissions:'}</p>
                        {[...r.hackathon_submissions].sort((a, b) => b.score - a.score).map((s, i) => {
                          const medal = r.is_finalized && s.placement ? ['', '🥇', '🥈', '🥉'][s.placement] : ''
                          return (
                            <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                              {medal && <span className="text-lg shrink-0">{medal}</span>}
                              <div className="flex-1 min-w-0">
                                <p className="font-mono font-bold text-white text-sm">{s.guilds?.name || 'Unknown Guild'}</p>
                                <a href={s.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline font-mono truncate block">{s.github_url}</a>
                              </div>
                              {r.is_finalized ? (
                                <div className="text-right">
                                  <span className="font-mono font-bold text-amber-400 text-sm">{s.score} pts</span>
                                  <p className="text-xs text-slate-500 font-mono">
                                    {s.placement ? `${[0, 3, 2, 1.5][s.placement]}× = ${Math.floor(r.exp_reward * [0, 3, 2, 1.5][s.placement])} EXP` : `${r.exp_reward} EXP`}
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    defaultValue={s.score}
                                    className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-center font-mono text-sm focus:border-amber-500 focus:outline-none"
                                    onBlur={async (e) => {
                                      const newScore = parseInt(e.target.value, 10)
                                      if (!isNaN(newScore) && newScore !== s.score) {
                                        await scoreRaidSubmission(s.id, newScore, s.review_notes || '')
                                      }
                                    }}
                                  />
                                  <span className="text-xs text-slate-500 font-mono">pts</span>
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── USERS TAB ─── */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold font-mono">User Management</h2>
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between gap-4 p-5 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl hover:bg-slate-800/80 transition-colors">
                  <div className="flex items-center gap-4">
                    {u.avatar_url && (
                      <img src={u.avatar_url} alt="" className="w-12 h-12 rounded-full border-2 border-slate-700" />
                    )}
                    <div>
                      <p className="font-bold font-mono text-white">{u.username}</p>
                      <p className="text-sm text-slate-400 font-mono">
                        Lvl {u.level} • {u.exp.toLocaleString()} EXP
                        {u.class && ` • ${u.class}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const action = u.is_admin ? 'demote' : 'promote'
                      if (confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${u.username} ${u.is_admin ? 'from' : 'to'} admin?`)) {
                        setIsLoading(true)
                        await toggleUserAdmin(u.id, !u.is_admin)
                        setIsLoading(false)
                      }
                    }}
                    disabled={isLoading}
                    className={`px-5 py-2.5 text-xs font-mono font-bold rounded-xl border transition-all disabled:opacity-50 ${
                      u.is_admin
                        ? 'border-amber-500/50 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                        : 'border-slate-600 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {u.is_admin ? '👑 Admin' : 'Make Admin'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
