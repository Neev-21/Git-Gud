import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import GuildDetail from './GuildDetail'

export default async function GuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: guild } = await supabase
    .from('guilds')
    .select('*')
    .eq('id', id)
    .single()

  if (!guild) notFound()

  // Fetch members with profile data
  const { data: members } = await supabase
    .from('guild_members')
    .select('*, profiles:user_id(id, username, avatar_url, level, exp, class)')
    .eq('guild_id', id)
    .order('joined_at', { ascending: true })

  const memberList = (members || []).map((m: any) => ({
    userId: m.user_id,
    username: m.profiles?.username || 'Unknown',
    avatar_url: m.profiles?.avatar_url || null,
    level: m.profiles?.level || 1,
    exp: m.profiles?.exp || 0,
    class: m.profiles?.class || null,
    role: m.role,
    joined_at: m.joined_at,
  }))

  const totalExp = memberList.reduce((sum: number, m: any) => sum + m.exp, 0)
  const avgLevel = memberList.length > 0
    ? Math.round(memberList.reduce((sum: number, m: any) => sum + m.level, 0) / memberList.length)
    : 0

  return (
    <GuildDetail
      guild={{
        id: guild.id,
        name: guild.name,
        description: guild.description,
        banner_url: guild.banner_url,
        owner_id: guild.owner_id,
        max_members: guild.max_members,
      }}
      members={memberList}
      totalExp={totalExp}
      avgLevel={avgLevel}
      currentUserId={user.id}
    />
  )
}
