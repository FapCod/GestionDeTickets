import { Header } from "@/components/dashboard/Header"
import { getCatalog } from "@/actions/catalogs"
import { SmartLink } from "@/components/SmartLink"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const modules = await getCatalog('modules') || []

    const dashboardHref = modules.length > 0 ? `/dashboard/${modules[0].id}` : '/dashboard'

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header modules={modules} />
            <div className="flex flex-1">
                <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
                    <nav className="grid gap-2 p-4 text-sm font-medium">
                        <div className="px-2 text-xs font-semibold text-muted-foreground mb-2">Módulos</div>
                        {modules.map((m: any) => (
                            <SmartLink
                                key={m.id}
                                href={`/dashboard/${m.id}`}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                                activeClassName="bg-muted text-primary font-semibold"
                            >
                                {m.name}
                            </SmartLink>
                        ))}
                    </nav>
                </aside>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 overflow-x-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
