import CatalogTable from '@/components/settings/CatalogTable'
import { getCatalog } from '@/actions/catalogs'

export default async function ModulesPage() {
    const data = await getCatalog('modules') || []

    const columns = [
        { key: 'name', label: 'Nombre' },
        { key: 'description', label: 'Descripción' }
    ]

    return (
        <CatalogTable
            data={data}
            columns={columns}
            tableName="modules"
            title="Módulos"
        />
    )
}
