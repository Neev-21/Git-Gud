import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import PublicProfile from './PublicProfile'

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  // Lookup profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, level, exp, class, created_at')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // Fetch badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('*, badges:badge_id(id, name, description, image_url)')
    .eq('user_id', profile.id)

  const badges = (userBadges || []).map((ub: any) => ({
    id: ub.badges?.id,
    name: ub.badges?.name || 'Unknown',
    description: ub.badges?.description || '',
    image_url: ub.badges?.image_url || null,
  }))

  // Fetch guild membership
  const { data: membership } = await supabase
    .from('guild_members')
    .select('role, guilds:guild_id(id, name, banner_url)')
    .eq('user_id', profile.id)
    .single()

  const guildInfo = membership
    ? {
        id: (membership.guilds as any)?.id,
        name: (membership.guilds as any)?.name || 'Unknown',
        banner_url: (membership.guilds as any)?.banner_url || null,
        role: membership.role,
      }
    : null

  // Quest completion count
  const { count: questsCompleted } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('status', 'approved')

  return (
    <PublicProfile
      user={{
        username: profile.username,
        avatar_url: profile.avatar_url,
        level: profile.level || 1,
        exp: profile.exp || 0,
        class: profile.class || null,
        created_at: profile.created_at,
      }}
      badges={badges}
      guild={guildInfo}
      questsCompleted={questsCompleted || 0}
    />
  )
}
