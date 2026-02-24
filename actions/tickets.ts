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
      ticket_developers (developers(id, name)),
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

    const { dev_ids, ...ticketData } = data;
    const supabase = await createClient()

    const { data: newTicket, error } = await supabase.from('tickets').insert(ticketData).select().single()

    if (error) {
        console.error('Error creating ticket:', error)
        return { error: error.message }
    }

    if (dev_ids && Array.isArray(dev_ids) && dev_ids.length > 0) {
        const ticketDevs = dev_ids.map((devId: string) => ({
            ticket_id: newTicket.id,
            developer_id: devId
        }))
        const { error: relError } = await supabase.from('ticket_developers').insert(ticketDevs)
        if (relError) console.error('Error linking developers:', relError)
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateTicket(id: string, data: any) {
    const { dev_ids, ...ticketData } = data;
    const supabase = await createClient()

    if (Object.keys(ticketData).length > 0) {
        const { error } = await supabase.from('tickets').update(ticketData).eq('id', id)
        if (error) {
            console.error('Error updating ticket:', error)
            return { error: error.message }
        }
    }

    // Identify if dev_ids was sent explicitly (even as empty array)
    if (dev_ids !== undefined) {
        // Delete existing
        const { error: delError } = await supabase.from('ticket_developers').delete().eq('ticket_id', id)
        if (delError) console.error('Error clearing old developers:', delError)

        // Insert new
        if (Array.isArray(dev_ids) && dev_ids.length > 0) {
            const ticketDevs = dev_ids.map((devId: string) => ({
                ticket_id: id,
                developer_id: devId
            }))
            const { error: insError } = await supabase.from('ticket_developers').insert(ticketDevs)
            if (insError) console.error('Error inserting new developers:', insError)
        }
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
