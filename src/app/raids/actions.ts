'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitRaidEntry(raidId: string, githubUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's guild membership
  const { data: membership } = await supabase
    .from('guild_members')
    .select('guild_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) return { error: 'You must be in a guild to participate in raids.' }
  if (membership.role !== 'leader') return { error: 'Only guild leaders can submit raid entries.' }

  // Check raid is active
  const { data: raid } = await supabase
    .from('hackathons')
    .select('*')
    .eq('id', raidId)
    .single()

  if (!raid) return { error: 'Raid not found.' }
  if (!raid.is_active) return { error: 'This raid is not active.' }

  const now = new Date()
  if (raid.start_date && new Date(raid.start_date) > now) return { error: 'This raid has not started yet.' }
  if (raid.end_date && new Date(raid.end_date) < now) return { error: 'This raid has ended.' }

  // Check guild hasn't already submitted
  const { data: existingSub } = await supabase
    .from('hackathon_submissions')
    .select('id')
    .eq('hackathon_id', raidId)
    .eq('guild_id', membership.guild_id)
    .single()

  if (existingSub) return { error: 'Your guild has already submitted an entry for this raid.' }

  // Check max teams
  if (raid.max_teams) {
    const { count } = await supabase
      .from('hackathon_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('hackathon_id', raidId)

    if (count !== null && count >= raid.max_teams) return { error: 'This raid has reached its team limit.' }
  }

  const { error } = await supabase
    .from('hackathon_submissions')
    .insert({
      hackathon_id: raidId,
      guild_id: membership.guild_id,
      github_url: githubUrl,
      submitted_at: new Date().toISOString(),
    })

  if (error) return { error: error.message }
  revalidatePath(`/raids/${raidId}`)
  return { success: true }
}
