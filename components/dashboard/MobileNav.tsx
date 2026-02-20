'use client'

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, Ticket } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SmartLink } from '@/components/SmartLink'

export function MobileNav({ modules }: { modules: any[] }) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const dashboardHref = modules.length > 0 ? `/dashboard/${modules[0].id}` : '/dashboard'

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <SheetHeader className="px-2">
                    <SheetTitle className="flex items-center gap-2 text-lg font-bold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                            <Ticket className="h-4 w-4 text-primary-foreground" />
                        </div>
                        Gestión de Tickets
                    </SheetTitle>
                    <SheetDescription className="text-left">
                        Navega a través de módulos y configuraciones.
                    </SheetDescription>
                </SheetHeader>
                <nav className="grid gap-2 text-lg font-medium mt-4">
                    <SmartLink
                        href={dashboardHref}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname === dashboardHref ? "bg-muted text-primary" : "text-muted-foreground"
                        )}
                        onClick={() => setOpen(false)}
                    >
                        Dashboard
                    </SmartLink>
                    <SmartLink
                        href="/settings"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname.startsWith("/settings") ? "bg-muted text-primary" : "text-muted-foreground"
                        )}
                        onClick={() => setOpen(false)}
                    >
                        Configuración
                    </SmartLink>

                    <div className="my-2 border-t" />
                    <div className="px-4 text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                        Módulos
                    </div>

                    {modules.map((m: any) => (
                        <SmartLink
                            key={m.id}
                            href={`/dashboard/${m.id}`}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === `/dashboard/${m.id}` ? "bg-muted text-primary" : "text-muted-foreground"
                            )}
                            onClick={() => setOpen(false)}
                        >
                            {m.name}
                        </SmartLink>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    )
}
