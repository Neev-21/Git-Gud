'use client'

import { useState } from 'react'
import { createGuild, joinGuild } from './actions'
import { createClient } from '@/utils/supabase/client'

type Guild = {
  id: string
  name: string
  description: string | null
  banner_url: string | null
  owner_id: string | null
  max_members: number
  member_count: number
  total_exp: number
}

export default function GuildList({
  guilds,
  myGuildId,
  userId,
}: {
  guilds: Guild[]
  myGuildId: string | null
  userId: string
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = search
    ? guilds.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : guilds

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setFeedback(null)
    const form = e.currentTarget
    const formData = new FormData(form)

    // Upload banner if selected
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]')
    const file = fileInput?.files?.[0]
    if (file) {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('guilds').upload(fileName, file)
      if (uploadError) {
        setFeedback('Failed to upload banner: ' + uploadError.message)
        setIsLoading(false)
        return
      }
      const { data: urlData } = supabase.storage.from('guilds').getPublicUrl(fileName)
      formData.set('banner_url', urlData.publicUrl)
    }

    const result = await createGuild(formData)
    if (result.error) setFeedback(result.error)
    else {
      setShowCreateForm(false)
      setBannerPreview(null)
    }
    setIsLoading(false)
  }

  const handleJoin = async (guildId: string) => {
    setIsLoading(true)
    setFeedback(null)
    const result = await joinGuild(guildId)
    if (result.error) setFeedback(result.error)
    setIsLoading(false)
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
            <span className="text-purple-400 font-mono text-sm border border-purple-500/30 bg-purple-500/10 px-3 py-1 rounded-full">🏰 GUILDS</span>
          </div>
          <a href="/profile" className="text-sm text-slate-400 hover:text-white transition-colors font-mono">← Profile</a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-black font-mono text-white tracking-tight">The Guild Hall</h1>
          <p className="text-slate-400 font-mono text-lg">Band together. Dominate the leaderboard.</p>
        </div>

        {/* Search + Create */}
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guilds..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors font-mono text-sm"
          />
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={!!myGuildId}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.3)] font-mono text-sm shrink-0"
          >
            {showCreateForm ? '✕ Cancel' : '+ Create Guild'}
          </button>
        </div>

        {myGuildId && !showCreateForm && (
          <p className="text-center text-sm text-purple-400 font-mono bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2">
            You are already in a guild. Leave it first to create or join another.
          </p>
        )}

        {feedback && (
          <div className="text-center text-amber-400 font-mono text-sm bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            {feedback}
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <form onSubmit={handleCreate} className="bg-slate-800/60 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Guild Name</label>
                <input name="name" required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors font-mono" placeholder="The Code Knights" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Max Members</label>
                <input name="max_members" type="number" min={2} max={50} defaultValue={10} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors font-mono" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea name="description" rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors font-mono resize-none" placeholder="We git gud together..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">Banner Image</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full bg-slate-900 border border-dashed border-slate-600 hover:border-purple-500 rounded-xl px-4 py-3 text-slate-400 hover:text-purple-400 transition-colors font-mono text-sm text-center">
                      {bannerPreview ? '✓ Banner selected' : 'Click to upload...'}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (ev) => setBannerPreview(ev.target?.result as string)
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                  {bannerPreview && (
                    <img src={bannerPreview} alt="Preview" className="w-20 h-12 rounded-lg border-2 border-purple-500/30 object-cover" />
                  )}
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all font-mono text-sm uppercase tracking-wider"
            >
              {isLoading ? 'Creating...' : '🏰 Found Guild'}
            </button>
          </form>
        )}

        {/* Guild Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-mono border-2 border-dashed border-slate-700 rounded-2xl">
            {search ? 'No guilds match your search.' : 'No guilds yet. Be the first to create one!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(guild => {
              const isMine = myGuildId === guild.id
              const isFull = guild.member_count >= guild.max_members
              return (
                <a
                  key={guild.id}
                  href={`/guilds/${guild.id}`}
                  className="group relative bg-slate-800/60 backdrop-blur-sm border-2 border-purple-500/20 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:scale-[1.02]"
                >
                  {/* Banner */}
                  <div className="h-28 bg-gradient-to-br from-purple-900/40 to-slate-800 overflow-hidden">
                    {guild.banner_url && (
                      <img src={guild.banner_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold font-mono text-white group-hover:text-purple-300 transition-colors truncate">{guild.name}</h3>
                      {isMine && (
                        <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full shrink-0 ml-2">YOUR GUILD</span>
                      )}
                    </div>

                    {guild.description && (
                      <p className="text-sm text-slate-400 font-mono line-clamp-2">{guild.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2 border-t border-slate-700">
                      <span>👥 {guild.member_count}/{guild.max_members}</span>
                      <span>⚡ {guild.total_exp.toLocaleString()} EXP</span>
                    </div>

                    {!isMine && !myGuildId && (
                      <button
                        onClick={async (e) => {
                          e.preventDefault()
                          await handleJoin(guild.id)
                        }}
                        disabled={isLoading || isFull}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all font-mono text-sm mt-2"
                      >
                        {isFull ? 'Guild Full' : '⚔️ Join Guild'}
                      </button>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
