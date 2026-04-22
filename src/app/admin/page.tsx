import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/profile')

  // Fetch all quests
  const { data: quests } = await supabase
    .from('quests')
    .select('*, badges:badge_reward_id(id, name)')
    .order('created_at', { ascending: false })

  // Fetch pending submissions with user and quest info
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, profiles:user_id(username, avatar_url), quests:quest_id(title, exp_reward)')
    .order('created_at', { ascending: false })

  // Fetch all badges for the quest form dropdown
  const { data: badges } = await supabase
    .from('badges')
    .select('id, name, image_url')
    .order('name')

  // Fetch all users for admin management
  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, is_admin, level, exp, class')
    .order('username')

  return (
    <AdminDashboard
      quests={quests || []}
      submissions={submissions || []}
      badges={badges || []}
      users={users || []}
    />
  )
}
