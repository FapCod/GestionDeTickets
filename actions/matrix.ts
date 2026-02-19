'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTicketMatrix(ticketIds: string[], componentIds: string[]) {
    // Optimization: Fetch only relevant matrix entries
    // But simpler: just fetch all for the tickets?
    const supabase = await createClient()

    if (ticketIds.length === 0) return []

    const { data, error } = await supabase
        .from('ticket_component_matrix')
        .select('*')
        .in('ticket_id', ticketIds)
    //.in('component_id', componentIds) // Optional filter

    if (error) {
        console.error('Error fetching matrix:', error)
        return []
    }
    return data
}

export async function toggleComponentApplies(ticketId: string, componentId: string, applies: boolean) {
    const supabase = await createClient()

    // Upsert
    const { error } = await supabase
        .from('ticket_component_matrix')
        .upsert({ ticket_id: ticketId, component_id: componentId, applies }, { onConflict: 'ticket_id,component_id' })

    if (error) {
        console.error('Error toggling matrix:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateComponentNotes(ticketId: string, componentId: string, notes: string) {
    const supabase = await createClient()

    // Upsert notes - ensure applies is handled if it doesn't exist? 
    // For COMMENTS component, applies should probably be true by default if note exists

    const { error } = await supabase
        .from('ticket_component_matrix')
        .upsert({ ticket_id: ticketId, component_id: componentId, notes, applies: true }, { onConflict: 'ticket_id,component_id' })

    if (error) {
        console.error('Error updating notes:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
