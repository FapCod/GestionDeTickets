import CatalogTable, { Column } from '@/components/settings/CatalogTable'
import { getCatalog } from '@/actions/catalogs'

export default async function StatusesPage() {
    const data = await getCatalog('statuses') || []

    const columns: Column[] = [
        { key: 'name', label: 'Nombre', type: 'text' },
        {
            key: 'category',
            label: 'Categoría',
            type: 'select',
            options: [
                { label: 'Estado Ticket', value: 'TICKET' },
                { label: 'Estado QA', value: 'QA' }
            ]
        },
        { key: 'color', label: 'Color', type: 'color' }
    ]

    return (
        <CatalogTable
            data={data}
            columns={columns}
            tableName="statuses"
            title="Estados"
        />
    )
}
