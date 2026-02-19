import CatalogTable from '@/components/settings/CatalogTable'
import { getCatalog } from '@/actions/catalogs'

export default async function DevelopersPage() {
    const data = await getCatalog('developers') || []

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' }
    ]

    return (
        <CatalogTable
            data={data}
            columns={columns}
            tableName="developers"
            title="Developers"
        />
    )
}
