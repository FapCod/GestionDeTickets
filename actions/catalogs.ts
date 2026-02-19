'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type TableName = keyof Database['public']['Tables']

export async function getCatalog(table: TableName) {
    const supabase = await createClient()
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })

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
