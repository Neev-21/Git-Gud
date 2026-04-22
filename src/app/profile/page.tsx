import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.class) {
    redirect('/onboarding')
  }

  // Fetch user's earned badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('*, badges:badge_id(id, name, description, image_url)')
    .eq('user_id', user.id)

  const userData = {
    id: user.id,
    email: user.email,
    username: user.user_metadata?.user_name || 'Adventurer',
    avatar_url: user.user_metadata?.avatar_url || '',
    level: profile.level || 1,
    exp: profile.exp || 0,
    rpgClass: profile.class,
    isAdmin: profile.is_admin || false,
  }

  const earnedBadges = (userBadges || []).map((ub: any) => ({
    id: ub.badges?.id,
    name: ub.badges?.name || 'Unknown',
    description: ub.badges?.description || '',
    image_url: ub.badges?.image_url || null,
    earnedAt: ub.earned_at,
  }))

  // Fetch guild membership
  const { data: guildMembership } = await supabase
    .from('guild_members')
    .select('role, guilds:guild_id(id, name, banner_url)')
    .eq('user_id', user.id)
    .single()

  const guildData = guildMembership
    ? {
        id: (guildMembership.guilds as any)?.id,
        name: (guildMembership.guilds as any)?.name || 'Unknown',
        banner_url: (guildMembership.guilds as any)?.banner_url || null,
        role: guildMembership.role,
      }
    : null

  return <ProfileClient user={userData} badges={earnedBadges} guild={guildData} />
}
