import { getCatalog } from '@/actions/catalogs'
import { getTickets } from '@/actions/tickets'
import { getTicketMatrix } from '@/actions/matrix'
import { getReleases } from '@/actions/releases'
import TicketMatrix from '@/components/dashboard/TicketMatrix'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { ReleaseSelector } from '@/components/dashboard/ReleaseSelector'

export default async function ModuleDashboard({ params, searchParams }: { params: Promise<{ moduleId: string }>, searchParams: Promise<{ releaseId?: string }> }) {
    const { moduleId } = await params
    const { releaseId } = await searchParams

    const supabase = await createClient()
    const { data: moduleData } = await supabase.from('modules').select('*').eq('id', moduleId).single()

    // 1. Fetch Releases for this Module
    const moduleReleases = await getReleases(moduleId) || []

    // FILTER: Only pass active releases to the selector
    const activeReleasesForFilter = moduleReleases.filter((r: any) => r.active)

    // 2. Determine Scope (Active Release)
    let activeRelease = moduleReleases.find((r: any) => r.id === releaseId)
    if (!activeRelease) {
        activeRelease = moduleReleases.find((r: any) => r.active)
    }
    const currentReleaseId = activeRelease?.id

    // 3. Fetch Data Scoped by Release (if exists)
    let tickets = await getTickets()
    if (currentReleaseId) {
        tickets = tickets.filter((t: any) => t.release_id === currentReleaseId)
    } else {
        // If no release defined/selected, filter tickets with NO release
        tickets = tickets.filter((t: any) => !t.release_id)
    }

    const { data: components } = await supabase.from('components').select('*').eq('module_id', moduleId).order('name')

    const ticketIds = tickets.map((t: any) => t.id)
    const matrix = await getTicketMatrix(ticketIds, components?.map((c: any) => c.id) || [])

    const statuses = await getCatalog('statuses')
    const developers = await getCatalog('developers')
    const teams = await getCatalog('teams')
    const environments = await getCatalog('environments')

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">{moduleData?.name || 'Dashboard'} Matrix</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Release:</span>
                    <Suspense fallback={<span>Loading...</span>}>
                        <ReleaseSelector releases={activeReleasesForFilter} currentReleaseId={currentReleaseId} />
                    </Suspense>
                </div>
            </div>

            {currentReleaseId ? (
                <TicketMatrix
                    tickets={tickets}
                    components={components || []}
                    matrix={matrix || []}
                    statuses={statuses || []}
                    developers={developers || []}
                    teams={teams || []}
                    environments={environments || []}
                    releases={moduleReleases} // Pass ALL releases to matrix for historical display
                    defaultReleaseId={currentReleaseId}
                />
            ) : (
                <div className="p-10 text-center border rounded border-dashed text-muted-foreground">
                    No active release found. Please create or select a release.
                </div>
            )}
        </div>
    )
}
