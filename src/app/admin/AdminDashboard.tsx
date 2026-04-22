'use client'

import { useState } from 'react'
import { createQuest, updateQuestStatus, deleteQuest, reviewSubmission, toggleUserAdmin, createBadge, deleteBadge } from './actions'

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

type Tab = 'quests' | 'submissions' | 'badges' | 'users'

export default function AdminDashboard({
  quests,
  submissions,
  badges,
  users,
}: {
  quests: Quest[]
  submissions: Submission[]
  badges: Badge[]
  users: UserProfile[]
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
