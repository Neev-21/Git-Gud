import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import QuestBoard from './QuestBoard'

export default async function TavernPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch open quests
  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  // Fetch user's own submissions to show claim state
  const { data: mySubmissions } = await supabase
    .from('submissions')
    .select('id, quest_id, status, github_url')
    .eq('user_id', user.id)

  // Fetch user profile for admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return (
    <QuestBoard
      quests={quests || []}
      mySubmissions={mySubmissions || []}
      isAdmin={profile?.is_admin || false}
    />
  )
}
