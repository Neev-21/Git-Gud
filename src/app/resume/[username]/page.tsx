import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ResumeView from './ResumeView'

export default async function ResumePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, level, exp, class, created_at')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // Badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('*, badges:badge_id(name, description)')
    .eq('user_id', profile.id)

  const badges = (userBadges || []).map((ub: any) => ({
    name: ub.badges?.name || 'Unknown',
    description: ub.badges?.description || '',
  }))

  // Completed quests
  const { data: completedQuests } = await supabase
    .from('submissions')
    .select('quests:quest_id(title, description, difficulty)')
    .eq('user_id', profile.id)
    .eq('status', 'approved')

  const quests = (completedQuests || []).map((s: any) => ({
    title: s.quests?.title || 'Unknown Quest',
    description: s.quests?.description || '',
    difficulty: s.quests?.difficulty || 'common',
  }))

  // Guild
  const { data: membership } = await supabase
    .from('guild_members')
    .select('role, guilds:guild_id(name)')
    .eq('user_id', profile.id)
    .single()

  const guild = membership
    ? { name: (membership.guilds as any)?.name || 'Unknown', role: membership.role }
    : null

  return (
    <ResumeView
      user={{
        username: profile.username,
        level: profile.level || 1,
        exp: profile.exp || 0,
        class: profile.class || null,
        created_at: profile.created_at,
      }}
      badges={badges}
      quests={quests}
      guild={guild}
    />
  )
}
