'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function selectClass(formData: FormData) {
  const selectedClass = formData.get('class') as string
  if (!selectedClass) return { error: 'Please select a class' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { error } = await supabase
      .from('profiles')
      .update({ class: selectedClass })
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }
  }

  redirect('/profile')
}
