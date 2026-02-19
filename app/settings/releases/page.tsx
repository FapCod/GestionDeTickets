import CatalogTable, { Column } from '@/components/settings/CatalogTable'
import { getReleases } from '@/actions/releases'
import { getCatalog } from '@/actions/catalogs'

export default async function ReleasesPage() {
    const data = await getReleases() || []
    const modules = await getCatalog('modules') || []

    const columns: Column[] = [
        { key: 'name', label: 'Name', type: 'text' },
        {
            key: 'module_id',
            label: 'Module',
            type: 'select',
            options: modules.map((m: any) => ({ label: m.name, value: m.id }))
        },
        { key: 'start_date', label: 'Start Date', type: 'text' },
        { key: 'end_date', label: 'End Date', type: 'text' },
        {
            key: 'active',
            label: 'Active',
            type: 'select',
            options: [
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' }
            ]
        }
    ]

    const formattedData = data.map((r: any) => ({
        ...r,
        active: r.active ? 'true' : 'false'
    }))

    return (
        <CatalogTable
            data={formattedData}
            columns={columns}
            tableName="releases"
            title="Releases"
        />
    )
}
