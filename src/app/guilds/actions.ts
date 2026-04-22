'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createGuild(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user is already in a guild
  const { data: existingMembership } = await supabase
    .from('guild_members')
    .select('guild_id')
    .eq('user_id', user.id)
    .single()

  if (existingMembership) {
    return { error: 'You must leave your current guild before creating a new one.' }
  }

  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const bannerUrl = (formData.get('banner_url') as string) || null
  const maxMembers = formData.get('max_members')
    ? parseInt(formData.get('max_members') as string, 10)
    : 10

  // Create guild
  const { data: guild, error: guildError } = await supabase
    .from('guilds')
    .insert({
      name,
      description,
      banner_url: bannerUrl,
      owner_id: user.id,
      max_members: maxMembers,
    })
    .select('id')
    .single()

  if (guildError) return { error: guildError.message }

  // Add creator as leader
  const { error: memberError } = await supabase
    .from('guild_members')
    .insert({
      guild_id: guild.id,
      user_id: user.id,
      role: 'leader',
    })

  if (memberError) return { error: memberError.message }

  revalidatePath('/guilds')
  return { success: true, guildId: guild.id }
}

export async function joinGuild(guildId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check exclusive membership
  const { data: existingMembership } = await supabase
    .from('guild_members')
    .select('guild_id')
    .eq('user_id', user.id)
    .single()

  if (existingMembership) {
    return { error: 'You are already in a guild. Leave it first before joining another.' }
  }

  // Check capacity
  const { count } = await supabase
    .from('guild_members')
    .select('*', { count: 'exact', head: true })
    .eq('guild_id', guildId)

  const { data: guild } = await supabase
    .from('guilds')
    .select('max_members')
    .eq('id', guildId)
    .single()

  if (guild && count !== null && count >= guild.max_members) {
    return { error: 'This guild is full.' }
  }

  const { error } = await supabase
    .from('guild_members')
    .insert({
      guild_id: guildId,
      user_id: user.id,
      role: 'member',
    })

  if (error) return { error: error.message }
  revalidatePath('/guilds')
  revalidatePath(`/guilds/${guildId}`)
  return { success: true }
}

export async function leaveGuild(guildId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user is the owner — owners must disband, not leave
  const { data: guild } = await supabase
    .from('guilds')
    .select('owner_id')
    .eq('id', guildId)
    .single()

  if (guild?.owner_id === user.id) {
    return { error: 'Guild owners must disband the guild instead of leaving.' }
  }

  const { error } = await supabase
    .from('guild_members')
    .delete()
    .eq('guild_id', guildId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/guilds')
  revalidatePath(`/guilds/${guildId}`)
  return { success: true }
}

export async function kickMember(guildId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify caller is the guild owner
  const { data: guild } = await supabase
    .from('guilds')
    .select('owner_id')
    .eq('id', guildId)
    .single()

  if (guild?.owner_id !== user.id) {
    return { error: 'Only the guild owner can kick members.' }
  }

  if (userId === user.id) {
    return { error: 'You cannot kick yourself.' }
  }

  const { error } = await supabase
    .from('guild_members')
    .delete()
    .eq('guild_id', guildId)
    .eq('user_id', userId)

  if (error) return { error: error.message }
  revalidatePath(`/guilds/${guildId}`)
  return { success: true }
}

export async function disbandGuild(guildId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: guild } = await supabase
    .from('guilds')
    .select('owner_id')
    .eq('id', guildId)
    .single()

  if (guild?.owner_id !== user.id) {
    return { error: 'Only the guild owner can disband the guild.' }
  }

  // Delete all members first, then the guild
  await supabase.from('guild_members').delete().eq('guild_id', guildId)
  const { error } = await supabase.from('guilds').delete().eq('id', guildId)

  if (error) return { error: error.message }
  revalidatePath('/guilds')
  redirect('/guilds')
}
