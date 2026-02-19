'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getReleases(moduleId?: string) {
    const supabase = await createClient()
    let query = supabase.from('releases').select('*, modules(name)')

    if (moduleId) {
        query = query.eq('module_id', moduleId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching releases:', error)
        return []
    }

    return data
}

export async function createRelease(data: any) {
    const supabase = await createClient()
    const { error } = await supabase.from('releases').insert(data)

    if (error) {
        console.error('Error creating release:', error)
        return { error: error.message }
    }

    revalidatePath('/settings/releases')
    return { success: true }
}

export async function updateRelease(id: string, data: any) {
    const supabase = await createClient()
    const { error } = await supabase.from('releases').update(data).eq('id', id)

    if (error) {
        console.error('Error updating release:', error)
        return { error: error.message }
    }

    revalidatePath('/settings/releases')
    return { success: true }
}

export async function deleteRelease(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('releases').delete().eq('id', id)

    if (error) {
        console.error('Error deleting release:', error)
        return { error: error.message }
    }

    revalidatePath('/settings/releases')
    return { success: true }
}
