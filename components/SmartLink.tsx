'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

interface SmartLinkProps extends ComponentProps<typeof Link> {
    activeClassName?: string
}

export function SmartLink({ href, className, activeClassName, onClick, prefetch = false, ...props }: SmartLinkProps) {
    const pathname = usePathname()

    // Normalize paths: treat '/dashboard' and '/dashboard/' as same
    const cleanPath = pathname?.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
    const hrefString = typeof href === 'string' ? href : (href as any).pathname // simple fallback
    const cleanHref = hrefString?.endsWith('/') && hrefString.length > 1 ? hrefString.slice(0, -1) : hrefString

    const isActive = cleanPath === cleanHref

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (isActive) {
            e.preventDefault()
            return
        }
        if (onClick) {
            onClick(e)
        }
    }

    return (
        <Link
            href={href}
            prefetch={prefetch} // Default to false to avoid aggressive preloading
            className={cn(className, isActive && activeClassName)}
            onClick={handleClick}
            {...props}
        />
    )
}
