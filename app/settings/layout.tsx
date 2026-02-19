import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-lg font-semibold md:text-base"
                    >
                        <span>Release Tracker</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/settings"
                        className="text-foreground transition-colors hover:text-foreground"
                    >
                        Settings
                    </Link>
                </nav>
            </header>
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <nav className="grid gap-4 text-sm text-muted-foreground">
                        <Link href="/settings/modules" className="font-semibold text-primary">
                            Modules
                        </Link>
                        <Link href="/settings/components">
                            Components
                        </Link>
                        <Link href="/settings/statuses">
                            Statuses
                        </Link>
                        <Link href="/settings/teams">
                            Teams
                        </Link>
                        <Link href="/settings/environments">
                            Environments
                        </Link>
                        <Link href="/settings/developers">
                            Developers
                        </Link>
                        <Link href="/settings/releases">
                            Releases
                        </Link>
                    </nav>
                    <div className="grid gap-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
