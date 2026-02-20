import { redirect } from 'next/navigation'
import { getCatalog } from '@/actions/catalogs'

export default async function DashboardPage() {
    const modules = await getCatalog('modules') || []

    if (modules.length > 0) {
        redirect(`/dashboard/${modules[0].id}`)
    }

    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <h1 className="text-2xl font-bold">No se encontraron módulos</h1>
                <p className="text-muted-foreground">Por favor, cree módulos en Configuración para comenzar.</p>
            </div>
        </div>
    )
}
