'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function ReleaseSelector({ releases, currentReleaseId }: { releases: any[], currentReleaseId?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleChange = (val: string) => {
        const params = new URLSearchParams(searchParams)
        if (val) {
            params.set('releaseId', val)
        } else {
            params.delete('releaseId')
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <Select value={currentReleaseId || ''} onValueChange={handleChange}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar Release" />
            </SelectTrigger>
            <SelectContent>
                {releases.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                        {r.name} {r.developers?.name && `(${r.developers.name})`} {r.active ? '(Active)' : ''}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
