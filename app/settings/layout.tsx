import { getCatalog } from "@/actions/catalogs"
import { SettingsNav } from "@/components/settings/SettingsNav"
import { Header } from "@/components/dashboard/Header"

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const modules = await getCatalog('modules') || []

    const dashboardHref = modules.length > 0 ? `/dashboard/${modules[0].id}` : '/dashboard'

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header modules={modules} />
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Configuración</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)]">
                    <SettingsNav />
                    <div className="grid gap-6 w-full min-w-0">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}

