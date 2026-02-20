import CatalogTable, { Column } from '@/components/settings/CatalogTable'
import { getCatalog } from '@/actions/catalogs'
import { getDevelopersWithModules, createDeveloperWithModules, updateDeveloperWithModules, deleteDeveloper } from '@/actions/developers'

export default async function DevelopersPage() {
    const [developers, modules] = await Promise.all([
        getDevelopersWithModules(),
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
            key: 'module_ids',
            label: 'Módulos',
            type: 'multi-select',
            options: moduleOptions,
            filterable: true
        },
        { key: 'email', label: 'Email', type: 'text' }
    ]

    return (
        <CatalogTable
            data={developers}
            columns={columns}
            tableName="developers"
            title="Desarrolladores"
            customActions={{
                create: createDeveloperWithModules,
                update: updateDeveloperWithModules,
                delete: deleteDeveloper
            }}
        />
    )
}
