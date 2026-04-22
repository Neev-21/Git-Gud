import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import RaidBoard from './RaidBoard'

export default async function RaidsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: raids } = await supabase
    .from('hackathons')
    .select('*, hackathon_submissions(id)')
    .order('created_at', { ascending: false })

  const now = new Date()

  const raidList = (raids || []).map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    start_date: r.start_date,
    end_date: r.end_date,
    is_active: r.is_active,
    exp_reward: r.exp_reward || 0,
    banner_url: r.banner_url,
    max_teams: r.max_teams,
    team_count: (r.hackathon_submissions || []).length,
    status: !r.is_active ? 'inactive' as const
      : (r.start_date && new Date(r.start_date) > now) ? 'upcoming' as const
      : r.is_finalized ? 'finalized' as const
      : (r.end_date && new Date(r.end_date) < now) ? 'judging' as const
      : 'active' as const,
  }))

  return <RaidBoard raids={raidList} />
}
