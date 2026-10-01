import { supabase } from '../lib/supabase'

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

export async function getOwnProfile(userId) {
  if (!userId) return null

  const { data, error } = await supabase
    .from('medical_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function saveOwnProfile(userId, input) {
  if (!userId) throw new Error('You must be signed in to save a profile.')

  const payload = {
    user_id: userId,
    full_name: input.full_name.trim(),
    blood_group: input.blood_group.trim(),
    allergies: input.allergies?.trim() || null,
    medications: input.medications?.trim() || null,
    medical_conditions: input.medical_conditions?.trim() || null,
    critical_notes: input.critical_notes?.trim() || null,
    emergency_contact_name: input.emergency_contact_name.trim(),
    emergency_contact_relation: input.emergency_contact_relation?.trim() || null,
    emergency_contact_phone: input.emergency_contact_phone.trim(),
  }

  const { data, error } = await supabase
    .from('medical_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function getEmergencyProfile(publicId) {
  if (!isUuid(publicId)) return null

  const { data, error } = await supabase.rpc('get_emergency_profile', {
    public_profile_id: publicId,
  })

  if (error) throw error
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}
