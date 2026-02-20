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

    // 1. Parallel Fetching: Critical Metadata & Catalogs
    const [
        moduleResponse,
        moduleReleases,
        componentsResponse,
        statuses,
        developers,
        teams,
        environments
    ] = await Promise.all([
        supabase.from('modules').select('*').eq('id', moduleId).single(),
        getReleases(moduleId),
        supabase.from('components').select('*').eq('module_id', moduleId).order('name'),
        getCatalog('statuses'),
        getCatalog('developers'),
        getCatalog('teams'),
        getCatalog('environments')
    ])

    const moduleData = moduleResponse.data
    const components = componentsResponse.data || []

    // 2. Determine Scope (Active Release)
    // Only pass active releases to the selector
    const activeReleasesForFilter = (moduleReleases || []).filter((r: any) => r.active)

    let activeRelease = (moduleReleases || []).find((r: any) => r.id === releaseId)
    if (!activeRelease && releaseId === undefined) {
        activeRelease = (moduleReleases || []).find((r: any) => r.active)
    }
    const currentReleaseId = activeRelease?.id

    // 3. Fetch Tickets Scoped by Release (Optimized)
    // If we have a release ID, filter by it. If explicit 'null' logic needed, handle it.
    // Here we fetch based on the determined scope.
    let tickets: any[] = []

    // Logic update: If looking for "No Release" tickets or specific release
    // For now, if currentReleaseId exists, fetch for it.
    // If user specifically selected "no release" or fallback? 
    // Current UI forces selection of release usually.
    // We will pass currentReleaseId to getTickets. If undefined, it fetches all (or we can handle 'null')

    if (currentReleaseId) {
        tickets = await getTickets(currentReleaseId)
    } else {
        // Fallback or empty state. If strict scoping is required:
        tickets = []
    }

    // 4. Calculate Matrix
    // Only if we have tickets and components
    let matrix: any[] = []
    if (tickets.length > 0 && components.length > 0) {
        const ticketIds = tickets.map((t: any) => t.id)
        matrix = await getTicketMatrix(ticketIds, components.map((c: any) => c.id))
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">{moduleData?.name || 'Dashboard'} Matrix</h1>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full md:w-auto">
                    {activeRelease?.responsible && (
                        <div className="text-sm bg-muted/50 px-2 py-1 rounded-md border">
                            <span className="text-muted-foreground mr-1">Responsible:</span>
                            <span className="font-medium">{activeRelease.responsible}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Release:</span>
                        <div className="w-full md:w-auto">
                            <Suspense fallback={<span>Loading...</span>}>
                                <ReleaseSelector releases={activeReleasesForFilter} currentReleaseId={currentReleaseId} />
                            </Suspense>
                        </div>
                    </div>
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
                    releases={moduleReleases || []} // Pass ALL releases to matrix for historical display
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
