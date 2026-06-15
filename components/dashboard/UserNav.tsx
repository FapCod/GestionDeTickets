'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/login/actions'
import { User, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function UserNav() {
    const [userEmail, setUserEmail] = useState<string | null>(null)

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUserEmail(data.user.email || null)
            }
        })
    }, [])

    const fallbackLetter = userEmail ? userEmail.charAt(0).toUpperCase() : 'U'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Avatar className="h-full w-full">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">{fallbackLetter}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Usuario</p>
                        <p className="text-xs leading-none text-muted-foreground truncate" title={userEmail || ''}>
                            {userEmail || 'Cargando...'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
