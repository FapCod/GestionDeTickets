import Link from "next/link"
import { getCatalog } from "@/actions/catalogs"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/dashboard/UserNav"
import { MobileNav } from "@/components/dashboard/MobileNav"
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
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
                <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <SmartLink
                        href={dashboardHref}
                        className="flex items-center gap-2 text-lg font-semibold md:text-base"
                    >
                        <span>Release Tracker</span>
                    </SmartLink>
                    <SmartLink
                        href={dashboardHref}
                        className="text-foreground transition-colors hover:text-foreground"
                    >
                        Dashboard
                    </SmartLink>
                    <Link
                        href="/settings"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Settings
                    </Link>
                </nav>
                <MobileNav modules={modules} />
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <div className="ml-auto flex-1 sm:flex-initial">
                        {/* Search or other controls */}
                    </div>
                    <UserNav />
                </div>
            </header>
            <div className="flex flex-1">
                <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
                    <nav className="grid gap-2 p-4 text-sm font-medium">
                        <div className="px-2 text-xs font-semibold text-muted-foreground mb-2">Modules</div>
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
