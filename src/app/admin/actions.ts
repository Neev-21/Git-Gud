'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { calculateLevelFromExp } from '@/utils/expEngine'

// ─── Helper: verify admin ───
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/profile')
  return { supabase, user }
}

// ─── Quest CRUD ───
export async function createQuest(formData: FormData) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('quests').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    difficulty: formData.get('difficulty') as string,
    exp_reward: parseInt(formData.get('exp_reward') as string, 10),
    badge_reward_id: (formData.get('badge_reward_id') as string) || null,
    max_completions: formData.get('max_completions')
      ? parseInt(formData.get('max_completions') as string, 10)
      : null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function updateQuestStatus(questId: string, status: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('quests')
    .update({ status })
    .eq('id', questId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function deleteQuest(questId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('quests')
    .delete()
    .eq('id', questId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

// ─── Submission Review ───
export async function reviewSubmission(
  submissionId: string,
  decision: 'approved' | 'rejected',
  reviewerNotes?: string
) {
  const { supabase } = await requireAdmin()

  // 1. Fetch the submission + quest details
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('*, quests(*)')
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) throw new Error('Submission not found')

  // 2. Update the submission status
  const { error: updateError } = await supabase
    .from('submissions')
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: reviewerNotes || null,
    })
    .eq('id', submissionId)

  if (updateError) throw new Error(updateError.message)

  // 3. If approved, award EXP and badge
  if (decision === 'approved') {
    const quest = submission.quests
    const userId = submission.user_id

    // Get current user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('exp, level')
      .eq('id', userId)
      .single()

    if (profile && quest) {
      const newExp = profile.exp + quest.exp_reward
      const { level: newLevel } = calculateLevelFromExp(newExp)

      await supabase
        .from('profiles')
        .update({ exp: newExp, level: newLevel })
        .eq('id', userId)

      // Award badge if quest has one
      if (quest.badge_reward_id) {
        await supabase.from('user_badges').insert({
          user_id: userId,
          badge_id: quest.badge_reward_id,
        })
      }
    }
  }

  revalidatePath('/admin')
}

// ─── User Management ───
export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

// ─── Badge CRUD ───
export async function createBadge(formData: FormData) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('badges').insert({
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function deleteBadge(badgeId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('badges')
    .delete()
    .eq('id', badgeId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

// ─── Raid Management ───
export async function createRaid(formData: FormData) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('hackathons').insert({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    start_date: (formData.get('start_date') as string) || null,
    end_date: (formData.get('end_date') as string) || null,
    exp_reward: parseInt(formData.get('exp_reward') as string, 10) || 0,
    banner_url: (formData.get('banner_url') as string) || null,
    max_teams: formData.get('max_teams') ? parseInt(formData.get('max_teams') as string, 10) : null,
    is_active: true,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/raids')
}

export async function deleteRaid(raidId: string) {
  const { supabase } = await requireAdmin()

  await supabase.from('hackathon_submissions').delete().eq('hackathon_id', raidId)
  const { error } = await supabase.from('hackathons').delete().eq('id', raidId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/raids')
}

export async function scoreRaidSubmission(submissionId: string, score: number, reviewNotes: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('hackathon_submissions')
    .update({ score, review_notes: reviewNotes || null })
    .eq('id', submissionId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/raids')
}

const PLACEMENT_MULTIPLIERS: Record<number, number> = { 1: 3, 2: 2, 3: 1.5 }
const PARTICIPANT_MULTIPLIER = 1

export async function finalizeRaid(raidId: string) {
  const { supabase } = await requireAdmin()

  // 1. Verify raid exists and is not finalized
  const { data: raid } = await supabase
    .from('hackathons')
    .select('id, exp_reward, is_finalized')
    .eq('id', raidId)
    .single()

  if (!raid) throw new Error('Raid not found')
  if (raid.is_finalized) throw new Error('Raid already finalized')

  // 2. Get all submissions sorted by score DESC
  const { data: submissions } = await supabase
    .from('hackathon_submissions')
    .select('id, guild_id, score')
    .eq('hackathon_id', raidId)
    .order('score', { ascending: false })

  if (!submissions || submissions.length === 0) throw new Error('No submissions to finalize')

  // 3. Assign placements and calculate EXP per guild
  const guildExpMap: Map<string, number> = new Map()

  for (let i = 0; i < submissions.length; i++) {
    const sub = submissions[i]
    const placement = i < 3 ? i + 1 : null
    const multiplier = placement ? PLACEMENT_MULTIPLIERS[placement] : PARTICIPANT_MULTIPLIER
    const expAwarded = Math.floor(raid.exp_reward * multiplier)

    // Update submission with placement
    if (placement) {
      await supabase
        .from('hackathon_submissions')
        .update({ placement })
        .eq('id', sub.id)
    }

    guildExpMap.set(sub.guild_id, expAwarded)
  }

  // 4. Distribute EXP to all members of each participating guild
  for (const [guildId, expAmount] of guildExpMap) {
    const { data: members } = await supabase
      .from('guild_members')
      .select('user_id')
      .eq('guild_id', guildId)

    if (members && members.length > 0) {
      for (const member of members) {
        // Increment EXP
        const { data: profile } = await supabase
          .from('profiles')
          .select('exp')
          .eq('id', member.user_id)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ exp: profile.exp + expAmount })
            .eq('id', member.user_id)
        }
      }
    }
  }

  // 5. Mark raid as finalized
  await supabase
    .from('hackathons')
    .update({ is_finalized: true })
    .eq('id', raidId)

  revalidatePath('/admin')
  revalidatePath('/raids')
  revalidatePath(`/raids/${raidId}`)
}
