import CatalogTable, { Column } from '@/components/settings/CatalogTable'
import { getCatalog, reorderComponents } from '@/actions/catalogs'

export default async function ComponentsPage() {
    // Audit: Replaced sequential awaits with Promise.all for better performance
    const [components, modules] = await Promise.all([
        getCatalog('components'),
        getCatalog('modules')
    ])

    const moduleOptions = modules.map((m: any) => ({
        label: m.name,
        value: m.id
    }))

    const columns: Column[] = [
        {
            key: 'name',
            label: 'Nombre',
            type: 'note' // Nueva funcionalidad: Notas estilo Excel
        },
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
        if (orderedItems.length === 0) return { success: true }

        const componentId = orderedItems[0].id
        const component = (components as any[]).find(c => c.id === componentId)
        const moduleId = component?.module_id

        if (!moduleId) return { error: 'No se pudo determinar el módulo' }
        return await reorderComponents(moduleId, orderedItems)
    }

    return (
        <CatalogTable
            data={components || []}
            columns={columns}
            tableName="components"
            title="Componentes"
            enableReordering={true}
            onReorder={handleReorder}
        />
    )
}
