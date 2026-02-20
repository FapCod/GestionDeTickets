'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
    { href: "/settings/modules", title: "Módulos" },
    { href: "/settings/components", title: "Componentes" },
    { href: "/settings/statuses", title: "Estados" },
    { href: "/settings/teams", title: "Equipos" },
    { href: "/settings/environments", title: "Entornos" },
    { href: "/settings/developers", title: "Desarrolladores" },
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
