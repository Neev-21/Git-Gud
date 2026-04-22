import { createClient } from '@/utils/supabase/server'
import LandingPage from './LandingPage'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Live stats
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: totalGuilds } = await supabase.from('guilds').select('*', { count: 'exact', head: true })
  const { count: totalQuestsCompleted } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { data: expData } = await supabase.from('profiles').select('exp')
  const totalExp = (expData || []).reduce((sum: number, p: any) => sum + (p.exp || 0), 0)

  // Recent activity (last 10 badge awards)
  const { data: recentBadges } = await supabase
    .from('user_badges')
    .select('earned_at, badges:badge_id(name), profiles:user_id(username)')
    .order('earned_at', { ascending: false })
    .limit(5)

  const activity = (recentBadges || []).map((b: any) => ({
    type: 'badge' as const,
    text: `${b.profiles?.username || 'Someone'} earned "${b.badges?.name || 'a badge'}"`,
    time: b.earned_at,
  }))

  return (
    <LandingPage
      isLoggedIn={!!user}
      stats={{
        totalUsers: totalUsers || 0,
        totalGuilds: totalGuilds || 0,
        totalQuestsCompleted: totalQuestsCompleted || 0,
        totalExp: totalExp,
      }}
      activity={activity}
    />
  )
}
