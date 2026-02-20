'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
    { href: "/settings/modules", title: "Modules" },
    { href: "/settings/components", title: "Components" },
    { href: "/settings/statuses", title: "Statuses" },
    { href: "/settings/teams", title: "Teams" },
    { href: "/settings/environments", title: "Environments" },
    { href: "/settings/developers", title: "Developers" },
    { href: "/settings/releases", title: "Releases" },
]

export function SettingsNav() {
    const pathname = usePathname()

    return (
        <nav className="grid gap-4 text-sm text-muted-foreground">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "font-medium transition-colors hover:text-primary",
                        pathname === item.href || pathname.startsWith(item.href)
                            ? "font-semibold text-primary"
                            : ""
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}
