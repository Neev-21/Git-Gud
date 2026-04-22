'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function claimQuest(questId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user already has a submission for this quest
  const { data: existing } = await supabase
    .from('submissions')
    .select('id')
    .eq('user_id', user.id)
    .eq('quest_id', questId)
    .single()

  if (existing) {
    // Already claimed, don't create a duplicate
    return { error: 'You have already claimed this quest.' }
  }

  const { error } = await supabase.from('submissions').insert({
    user_id: user.id,
    quest_id: questId,
    github_url: '',
    status: 'pending',
  })

  if (error) return { error: error.message }
  revalidatePath('/tavern')
  return { success: true }
}

export async function submitQuest(submissionId: string, githubUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('submissions')
    .update({
      github_url: githubUrl,
      status: 'submitted',
    })
    .eq('id', submissionId)
    .eq('user_id', user.id) // ensure ownership

  if (error) return { error: error.message }
  revalidatePath('/tavern')
  return { success: true }
}
