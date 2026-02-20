'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type TableName = keyof Database['public']['Tables']

export async function getCatalog(table: TableName, orderBy: string = 'created_at', ascending: boolean = false) {
    const supabase = await createClient()

    // Default order for components should be sort_order
    let orderCol = orderBy
    let orderAsc = ascending

    if (table === 'components' && orderBy === 'created_at') {
        orderCol = 'sort_order'
        orderAsc = true
    }

    const { data, error } = await supabase.from(table).select('*').order(orderCol, { ascending: orderAsc })

    if (error) {
        console.error(`Error fetching ${table}:`, error)
        throw new Error(`Failed to fetch ${table}`)
    }

    return data
}

export async function createCatalogItem(table: TableName, data: any, path: string) {
    const supabase = await createClient()
    const { error } = await supabase.from(table).insert(data)

    if (error) {
        console.error(`Error creating item in ${table}:`, error)
        return { error: error.message }
    }

    revalidatePath(path)
    return { success: true }
}

export async function updateCatalogItem(table: TableName, id: string, data: any, path: string) {
    const supabase = await createClient()
    const { error } = await supabase.from(table).update(data).eq('id', id)

    if (error) {
        console.error(`Error updating item in ${table}:`, error)
        return { error: error.message }
    }

    revalidatePath(path)
    return { success: true }
}

export async function deleteCatalogItem(table: TableName, id: string, path: string) {
    const supabase = await createClient()

    // Check for foreign key constraints manually if needed, or rely on DB constraints
    // For now simple delete.
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) {
        console.error(`Error deleting item from ${table}:`, error)
        return { error: error.message }
    }

    revalidatePath(path)
    return { success: true }
}

export async function reorderComponents(moduleId: string, orderedComponents: { id: string, sort_order: number }[]) {
    const supabase = await createClient()

    try {
        // Step 1: Move to temporary negative values to avoid UNIQUE constraint violations
        // during transition (e.g., swapping 1 and 2)
        const tempUpdates = orderedComponents.map((comp) => ({
            id: comp.id,
            sort_order: -comp.sort_order - 1000 // Ensure unique negative values
        }))

        for (const update of tempUpdates) {
            const { error: tempError } = await supabase
                .from('components')
                .update({ sort_order: update.sort_order })
                .eq('id', update.id)

            if (tempError) throw tempError
        }

        // Step 2: Set final positive values
        for (const comp of orderedComponents) {
            const { error: finalError } = await supabase
                .from('components')
                .update({ sort_order: comp.sort_order })
                .eq('id', comp.id)

            if (finalError) throw finalError
        }

        revalidatePath('/settings/components')
        revalidatePath('/dashboard')
        revalidatePath(`/dashboard/${moduleId}`)

        return { success: true }
    } catch (error: any) {
        console.error('Error reordering components:', error)
        return { error: error.message || 'Error al reordenar componentes' }
    }
}
