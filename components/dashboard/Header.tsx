'use client'

import Link from "next/link"
import { SmartLink } from "@/components/SmartLink"
import { Ticket } from "lucide-react"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { UserNav } from "@/components/dashboard/UserNav"
import { usePathname } from "next/navigation"

interface HeaderProps {
    modules: any[]
}

export function Header({ modules }: HeaderProps) {
    const pathname = usePathname()
    // Find active module based on URL if possible, or fallback
    // But layouts passed modules[0] for default dashboard link.
    // We can just rely on the passed modules to construct the default link.

    const dashboardHref = modules.length > 0 ? `/dashboard/${modules[0].id}` : '/dashboard'

    // Determine active states
    // Dashboard is active if path starts with /dashboard
    const isDashboardActive = pathname === '/dashboard' || pathname.startsWith('/dashboard/')

    // Settings is active if path starts with /settings
    const isSettingsActive = pathname.startsWith('/settings')

    return (
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <SmartLink
                    href={dashboardHref}
                    className="flex items-center gap-2 font-semibold"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                        <Ticket className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="">Gestión de Tickets</span>
                </SmartLink>
                <Link
                    href={dashboardHref}
                    className={`transition-colors hover:text-foreground ${isDashboardActive ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                    Dashboard
                </Link>
                <Link
                    href="/settings"
                    className={`transition-colors hover:text-foreground ${isSettingsActive ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                    Configuración
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
    )
}
