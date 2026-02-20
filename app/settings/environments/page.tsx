import CatalogTable from '@/components/settings/CatalogTable'
import { getCatalog } from '@/actions/catalogs'

export default async function EnvironmentsPage() {
    const data = await getCatalog('environments') || []

    const columns = [
        { key: 'name', label: 'Nombre' }
    ]

    return (
        <CatalogTable
            data={data}
            columns={columns}
            tableName="environments"
            title="Entornos"
        />
    )
}
