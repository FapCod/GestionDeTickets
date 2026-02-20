'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Get developers with their associated modules
export async function getDevelopersWithModules() {
    const supabase = await createClient()

    // 1. Get all developers
    const { data: developers, error: devError } = await supabase
        .from('developers')
        .select('*')
        .order('name', { ascending: true })

    if (devError) {
        console.error('Error fetching developers:', devError)
        return []
    }

    // 2. Get all developer_modules relations
    const { data: relations, error: relError } = await supabase
        .from('developer_modules')
        .select('*')

    if (relError) {
        console.error('Error fetching developer modules:', relError)
        return developers // Return developers without modules if relation fetch fails
    }

    // 3. Map modules to developers
    // We want the output to match the table structure expected by CatalogTable, 
    // but the 'module_id' field will now be an array of IDs.
    const developersWithModules = developers.map(dev => {
        const devModules = relations
            .filter(r => r.developer_id === dev.id)
            .map(r => r.module_id)

        return {
            ...dev,
            module_ids: devModules // Use plural to indicate array
        }
    })

    return developersWithModules
}

export async function createDeveloperWithModules(data: any) {
    const supabase = await createClient()
    const { module_ids, ...devData } = data

    // 1. Create developer
    const { data: newDev, error: createError } = await supabase
        .from('developers')
        .insert(devData)
        .select()
        .single()

    if (createError) {
        console.error('Error creating developer:', createError)
        return { error: createError.message }
    }

    // 2. Add module associations if any
    if (module_ids && Array.isArray(module_ids) && module_ids.length > 0) {
        const timestamp = new Date().toISOString()
        const relations = module_ids.map((moduleId: string) => ({
            developer_id: newDev.id,
            module_id: moduleId,
            created_at: timestamp
        }))

        const { error: relError } = await supabase
            .from('developer_modules')
            .insert(relations)

        if (relError) {
            console.error('Error adding developer modules:', relError)
            // Note: Developer created but modules failed. 
            // Ideally we'd rollback but Supabase HTTP API doesn't support transactions easily without RPC.
            return { error: 'Developer created but module assignment failed: ' + relError.message }
        }
    }

    revalidatePath('/settings/developers')
    return { success: true }
}

export async function updateDeveloperWithModules(id: string, data: any) {
    const supabase = await createClient()
    const { module_ids, ...devData } = data

    // 1. Update developer basic info
    const { error: updateError } = await supabase
        .from('developers')
        .update(devData)
        .eq('id', id)

    if (updateError) {
        console.error('Error updating developer:', updateError)
        return { error: updateError.message }
    }

    // 2. Update module associations logic: Delete all and re-insert
    // Only proceed if module_ids is provided (undefined means no change to relations)
    if (module_ids !== undefined && Array.isArray(module_ids)) {
        // Delete existing
        const { error: deleteError } = await supabase
            .from('developer_modules')
            .delete()
            .eq('developer_id', id)

        if (deleteError) {
            console.error('Error removing old modules:', deleteError)
            return { error: deleteError.message }
        }

        // Insert new
        if (module_ids.length > 0) {
            const timestamp = new Date().toISOString()
            const relations = module_ids.map((moduleId: string) => ({
                developer_id: id,
                module_id: moduleId,
                created_at: timestamp
            }))

            const { error: insertError } = await supabase
                .from('developer_modules')
                .insert(relations)

            if (insertError) {
                console.error('Error adding new modules:', insertError)
                return { error: insertError.message }
            }
        }
    }

    revalidatePath('/settings/developers')
    return { success: true }
}

export async function deleteDeveloper(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('developers').delete().eq('id', id)

    if (error) {
        console.error('Error deleting developer:', error)
        return { error: error.message }
    }

    revalidatePath('/settings/developers')
    return { success: true }
}
