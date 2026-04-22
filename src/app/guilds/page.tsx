import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import GuildList from './GuildList'

export default async function GuildsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all guilds with member count
  const { data: guilds } = await supabase
    .from('guilds')
    .select('*, guild_members(user_id)')
    .order('created_at', { ascending: false })

  // Fetch current user's guild membership
  const { data: myMembership } = await supabase
    .from('guild_members')
    .select('guild_id, role')
    .eq('user_id', user.id)
    .single()

  // Compute guild stats: member count + total EXP
  const guildList = await Promise.all(
    (guilds || []).map(async (guild) => {
      const memberIds = (guild.guild_members || []).map((m: any) => m.user_id)
      let totalExp = 0
      if (memberIds.length > 0) {
        const { data: members } = await supabase
          .from('profiles')
          .select('exp')
          .in('id', memberIds)
        totalExp = (members || []).reduce((sum: number, m: any) => sum + (m.exp || 0), 0)
      }
      return {
        id: guild.id,
        name: guild.name,
        description: guild.description,
        banner_url: guild.banner_url,
        owner_id: guild.owner_id,
        max_members: guild.max_members,
        member_count: memberIds.length,
        total_exp: totalExp,
      }
    })
  )

  // Sort by total EXP descending
  guildList.sort((a, b) => b.total_exp - a.total_exp)

  return (
    <GuildList
      guilds={guildList}
      myGuildId={myMembership?.guild_id || null}
      userId={user.id}
    />
  )
}
