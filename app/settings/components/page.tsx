import CatalogTable, { Column } from '@/components/settings/CatalogTable'
import { getCatalog, reorderComponents } from '@/actions/catalogs'

export default async function ComponentsPage() {
    const [components, modules] = await Promise.all([
        getCatalog('components') || [],
        getCatalog('modules') || []
    ])

    // Create options for module select
    const moduleOptions = modules.map((m: any) => ({
        label: m.name,
        value: m.id
    }))

    const columns: Column[] = [
        { key: 'name', label: 'Nombre', type: 'text' },
        {
            key: 'module_id',
            label: 'Módulo',
            type: 'select',
            options: moduleOptions,
            filterable: true
        }
    ]

    const handleReorder = async (orderedItems: { id: string, sort_order: number }[]) => {
        'use server'
        // Find the module_id from the first item (all items should belong to the same module if UI logic is followed)
        if (orderedItems.length === 0) return { success: true }

        // We need the module_id. Since getCatalog doesn't give us module_id easily in this scope
        // without searching the components array, we'll find it from the components data.
        const firstId = orderedItems[0].id
        const component = components.find((c: any) => c.id === firstId)
        const moduleId = component?.module_id

        if (!moduleId) return { error: 'No se pudo determinar el módulo' }

        return await reorderComponents(moduleId, orderedItems)
    }

    return (
        <CatalogTable
            data={components}
            columns={columns}
            tableName="components"
            title="Componentes"
            enableReordering={true}
            onReorder={handleReorder}
        />
    )
}
