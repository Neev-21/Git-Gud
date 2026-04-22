import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LeaderboardView from './LeaderboardView'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all players ranked by EXP
  const { data: players } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, level, exp, class')
    .order('exp', { ascending: false })

  // Get badge count per user
  const { data: badgeCounts } = await supabase
    .from('user_badges')
    .select('user_id')

  const badgeMap: Record<string, number> = {}
  ;(badgeCounts || []).forEach((b: any) => {
    badgeMap[b.user_id] = (badgeMap[b.user_id] || 0) + 1
  })

  const playerList = (players || []).map(p => ({
    id: p.id,
    username: p.username,
    avatar_url: p.avatar_url,
    level: p.level || 1,
    exp: p.exp || 0,
    class: p.class || null,
    badge_count: badgeMap[p.id] || 0,
  }))

  // Fetch guilds with aggregated EXP
  const { data: guilds } = await supabase
    .from('guilds')
    .select('id, name, banner_url, max_members, guild_members(user_id)')

  const guildList = await Promise.all(
    (guilds || []).map(async (g) => {
      const memberIds = (g.guild_members || []).map((m: any) => m.user_id)
      let totalExp = 0
      let avgLevel = 0
      if (memberIds.length > 0) {
        const { data: members } = await supabase
          .from('profiles')
          .select('exp, level')
          .in('id', memberIds)
        totalExp = (members || []).reduce((sum: number, m: any) => sum + (m.exp || 0), 0)
        avgLevel = Math.round((members || []).reduce((sum: number, m: any) => sum + (m.level || 1), 0) / memberIds.length)
      }
      return {
        id: g.id,
        name: g.name,
        banner_url: g.banner_url,
        member_count: memberIds.length,
        max_members: g.max_members,
        total_exp: totalExp,
        avg_level: avgLevel,
      }
    })
  )

  guildList.sort((a, b) => b.total_exp - a.total_exp)

  return (
    <LeaderboardView
      players={playerList}
      guilds={guildList}
      currentUserId={user.id}
    />
  )
}
