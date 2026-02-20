'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTickets(releaseId?: string) {
    const supabase = await createClient()

    // Base query
    let query = supabase
        .from('tickets')
        .select(`
      *,
      statuses!tickets_status_id_fkey (id, name, color),
      qa_status:statuses!tickets_qa_status_id_fkey (id, name, color),
      developers (id, name),
      teams (id, name),
      environments (id, name),
      releases (id, name)
    `)
        .order('created_at', { ascending: false })

    // Apply filter if releaseId is provided
    if (releaseId) {
        query = query.eq('release_id', releaseId)
    } else if (releaseId === null) {
        // Explicitly fetch tickets with NO release if null is passed (optional, depending on usage)
        query = query.is('release_id', null)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching tickets:', error)
        return []
    }

    return data
}

export async function createTicket(data: any) {
    if (!data.release_id) {
        return { error: 'Release is required' }
    }

    const supabase = await createClient()
    const { error } = await supabase.from('tickets').insert(data)

    if (error) {
        console.error('Error creating ticket:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateTicket(id: string, data: any) {
    const supabase = await createClient()
    const { error } = await supabase.from('tickets').update(data).eq('id', id)

    if (error) {
        console.error('Error updating ticket:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteTicket(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('tickets').delete().eq('id', id)

    if (error) {
        console.error('Error deleting ticket:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
