'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTickets() {
    const supabase = await createClient()

    // Fetch tickets with all related data (status, dev, team, etc)
    // note: supabase-js joins syntax
    const { data, error } = await supabase
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

    if (error) {
        console.error('Error fetching tickets:', error)
        return []
    }

    return data
}

export async function createTicket(data: any) {
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
