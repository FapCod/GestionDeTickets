import Link from "next/link"
import { getCatalog } from "@/actions/catalogs"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/dashboard/UserNav"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { SettingsNav } from "@/components/settings/SettingsNav"
import { SmartLink } from "@/components/SmartLink"

export default async function SettingsLayout({
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
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Dashboard
                    </SmartLink>
                    <Link
                        href="/settings"
                        className="text-foreground transition-colors hover:text-foreground"
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
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
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

