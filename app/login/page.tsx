import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import LoginForm from '@/components/auth/LoginForm'
import { Suspense } from 'react'
import { Ticket } from 'lucide-react'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const params = await searchParams
    return (
        <div className="flex flex-col h-screen w-full items-center justify-center px-4 gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg mb-2">
                    <Ticket className="h-7 w-7 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Gestión de Tickets
                </h1>
                <p className="text-muted-foreground">
                    Sistema de Control de Releases y QA
                </p>
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
                    <CardDescription>
                        Ingresa tu correo electrónico para iniciar sesión.
                    </CardDescription>
                </CardHeader>
                <Suspense fallback={<div>Cargando formulario...</div>}>
                    <LoginForm error={params?.error} />
                </Suspense>
            </Card>
        </div>
    )
}
