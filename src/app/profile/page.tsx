import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.class) {
    redirect('/onboarding')
  }

  const userData = {
    id: user.id,
    email: user.email,
    username: user.user_metadata?.user_name || 'Adventurer',
    avatar_url: user.user_metadata?.avatar_url || '',
    level: profile.level || 1,
    exp: profile.exp || 0,
    rpgClass: profile.class,
    isAdmin: profile.is_admin || false,
  }

  return <ProfileClient user={userData} />
}
