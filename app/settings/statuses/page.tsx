import CatalogTable, { Column } from '@/components/settings/CatalogTable'
import { getCatalog } from '@/actions/catalogs'

export default async function StatusesPage() {
    const data = await getCatalog('statuses') || []

    const columns: Column[] = [
        { key: 'name', label: 'Name', type: 'text' },
        {
            key: 'category',
            label: 'Category',
            type: 'select',
            options: [
                { label: 'Ticket Status', value: 'TICKET' },
                { label: 'QA Status', value: 'QA' }
            ]
        },
        { key: 'color', label: 'Color', type: 'color' }
    ]

    return (
        <CatalogTable
            data={data}
            columns={columns}
            tableName="statuses"
            title="Statuses"
        />
    )
}
