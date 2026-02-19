import CatalogTable from '@/components/settings/CatalogTable'
import { getCatalog } from '@/actions/catalogs'

export default async function ModulesPage() {
    const data = await getCatalog('modules') || []

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' }
    ]

    return (
        <CatalogTable
            data={data}
            columns={columns}
            tableName="modules"
            title="Modules"
        />
    )
}
