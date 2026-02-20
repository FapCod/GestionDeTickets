import CatalogTable, { Column } from '@/components/settings/CatalogTable'
import { getReleases } from '@/actions/releases'
import { getCatalog } from '@/actions/catalogs'

export default async function ReleasesPage() {
    const [data, modules, developers] = await Promise.all([
        getReleases(),
        getCatalog('modules'),
        getCatalog('developers')
    ])

    const columns: Column[] = [
        { key: 'name', label: 'Nombre', type: 'text' },
        {
            key: 'module_id',
            label: 'Módulo',
            type: 'select',
            options: modules.map((m: any) => ({ label: m.name, value: m.id }))
        },
        { key: 'start_date', label: 'Fecha Inicio', type: 'date' },
        { key: 'end_date', label: 'Fecha Fin', type: 'date' },
        {
            key: 'responsible_id',
            label: 'Responsable',
            type: 'select',
            options: (developers || []).map((d: any) => ({ label: d.name, value: d.id }))
        },
        {
            key: 'active',
            label: 'Activo',
            type: 'select',
            options: [
                { label: 'Sí', value: 'true' },
                { label: 'No', value: 'false' }
            ]
        }
    ]

    const formattedData = data.map((r: any) => ({
        ...r,
        responsible_id: r.responsible_id || r.developers?.id, // Ensure we have the ID for editing
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
