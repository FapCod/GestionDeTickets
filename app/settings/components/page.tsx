import CatalogTable, { Column } from '@/components/settings/CatalogTable'
import { getCatalog } from '@/actions/catalogs'

export default async function ComponentsPage() {
    const components = await getCatalog('components') || []
    const modules = await getCatalog('modules') || []

    // Create options for module select
    const moduleOptions = modules.map((m: any) => ({
        label: m.name,
        value: m.id
    }))

    const columns: Column[] = [
        { key: 'name', label: 'Name', type: 'text' },
        {
            key: 'module_id',
            label: 'Module',
            type: 'select',
            options: moduleOptions
        }
    ]

    return (
        <CatalogTable
            data={components}
            columns={columns}
            tableName="components"
            title="Components"
        />
    )
}
