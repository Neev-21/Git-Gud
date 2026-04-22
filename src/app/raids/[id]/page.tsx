import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RaidDetail from './RaidDetail'

export default async function RaidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: raid } = await supabase
    .from('hackathons')
    .select('*')
    .eq('id', id)
    .single()

  if (!raid) notFound()

  // Fetch submissions with guild info
  const { data: submissions } = await supabase
    .from('hackathon_submissions')
    .select('*, guilds:guild_id(id, name, banner_url)')
    .eq('hackathon_id', id)
    .order('score', { ascending: false })

  const subList = (submissions || []).map((s: any) => ({
    id: s.id,
    guild_id: s.guild_id,
    guild_name: s.guilds?.name || 'Unknown',
    guild_banner: s.guilds?.banner_url || null,
    github_url: s.github_url,
    score: s.score || 0,
    review_notes: s.review_notes,
    submitted_at: s.submitted_at,
    placement: s.placement || null,
  }))

  // Get user's guild membership
  const { data: membership } = await supabase
    .from('guild_members')
    .select('guild_id, role')
    .eq('user_id', user.id)
    .single()

  const now = new Date()
  const status = !raid.is_active ? 'inactive'
    : (raid.start_date && new Date(raid.start_date) > now) ? 'upcoming'
    : raid.is_finalized ? 'finalized'
    : (raid.end_date && new Date(raid.end_date) < now) ? 'judging'
    : 'active'

  const hasSubmitted = membership
    ? subList.some(s => s.guild_id === membership.guild_id)
    : false

  return (
    <RaidDetail
      raid={{
        id: raid.id,
        title: raid.title,
        description: raid.description,
        start_date: raid.start_date,
        end_date: raid.end_date,
        exp_reward: raid.exp_reward || 0,
        banner_url: raid.banner_url,
        max_teams: raid.max_teams,
        status,
      }}
      submissions={subList}
      isLeader={membership?.role === 'leader'}
      isInGuild={!!membership}
      hasSubmitted={hasSubmitted}
      isFinalized={raid.is_finalized || false}
      userGuildId={membership?.guild_id || null}
    />
  )
}
