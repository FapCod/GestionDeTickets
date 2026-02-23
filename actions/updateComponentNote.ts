'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateComponentNote(componentId: string, notes: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('components')
        .update({ technical_notes: notes })
        .eq('id', componentId)

    if (error) {
        console.error('Error updating component notes:', error)
        return { error: 'No se pudo guardar la nota técnica' }
    }

    revalidatePath('/settings/components')
    return { success: true }
}
