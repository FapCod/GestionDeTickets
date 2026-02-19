import CatalogTable from '@/components/settings/CatalogTable'
import { getCatalog } from '@/actions/catalogs'

export default async function TeamsPage() {
    const data = await getCatalog('teams') || []

    const columns = [
        { key: 'name', label: 'Name' }
    ]

    return (
        <CatalogTable
            data={data}
            columns={columns}
            tableName="teams"
            title="Teams"
        />
    )
}
