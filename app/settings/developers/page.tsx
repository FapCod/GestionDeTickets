import CatalogTable, { Column } from '@/components/settings/CatalogTable'
import { getCatalog } from '@/actions/catalogs'

export default async function DevelopersPage() {
    const [developers, modules] = await Promise.all([
        getCatalog('developers') || [],
        getCatalog('modules') || []
    ])

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
            options: moduleOptions,
            filterable: true
        }
    ]

    return (
        <CatalogTable
            data={developers}
            columns={columns}
            tableName="developers"
            title="Developers"
        />
    )
}
