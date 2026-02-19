import Link from "next/link"
import { getCatalog } from "@/actions/catalogs"
import { Button } from "@/components/ui/button"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const modules = await getCatalog('modules') || []

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
                <nav className="flex items-center gap-6 text-lg font-medium md:flex-row md:gap-5 md:text-sm lg:gap-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-lg font-semibold md:text-base"
                    >
                        <span>Release Tracker</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-foreground transition-colors hover:text-foreground"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/settings"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Settings
                    </Link>
                </nav>
            </header>
            <div className="flex flex-1">
                <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
                    <nav className="grid gap-2 p-4 text-sm font-medium">
                        <div className="px-2 text-xs font-semibold text-muted-foreground mb-2">Modules</div>
                        {modules.map((m: any) => (
                            <Link
                                key={m.id}
                                href={`/dashboard/${m.id}`}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                            >
                                {m.name}
                            </Link>
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
