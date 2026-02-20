'use client'

import { useState, useOptimistic, startTransition } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { updateTicket, createTicket, deleteTicket } from '@/actions/tickets'
import { toggleComponentApplies, updateComponentNotes } from '@/actions/matrix'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TicketMatrixProps {
    tickets: any[]
    components: any[]
    matrix: any[]
    statuses: any[]
    developers: any[]
    teams: any[]
    environments: any[]
    releases: any[]
    defaultReleaseId?: string
}

export default function TicketMatrix({
    tickets,
    components,
    matrix,
    statuses,
    developers,
    teams,
    environments,
    releases,
    defaultReleaseId
}: TicketMatrixProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // Optimistic UI for Matrix
    const [optimisticMatrix, setOptimisticMatrix] = useOptimistic(
        matrix,
        (state, updatedEntry: any) => {
            const existingIndex = state.findIndex((item: any) =>
                item.ticket_id === updatedEntry.ticket_id && item.component_id === updatedEntry.component_id
            )
            if (existingIndex !== -1) {
                const newState = [...state]
                newState[existingIndex] = { ...newState[existingIndex], ...updatedEntry }
                return newState
            }
            return [...state, updatedEntry]
        }
    )

    const handleStatusChange = async (ticketId: string, field: string, value: string | null) => {
        const res = await updateTicket(ticketId, { [field]: value })
        if (res.error) toast.error(res.error)
        else toast.success('Ticket actualizado')
    }

    const handleToggle = async (ticketId: string, componentId: string, currentApplies: boolean) => {
        const newApplies = !currentApplies

        startTransition(() => {
            setOptimisticMatrix({
                ticket_id: ticketId,
                component_id: componentId,
                applies: newApplies
            })
        })

        const res = await toggleComponentApplies(ticketId, componentId, newApplies)
        if (res.error) {
            toast.error(res.error)
            // Revert on error? useOptimistic handles revert automatically when parent re-renders, 
            // but manual revert might be needed if revalidation doesn't happen or fails.
            // For now, relies on next validation.
            startTransition(() => {
                setOptimisticMatrix({
                    ticket_id: ticketId,
                    component_id: componentId,
                    applies: currentApplies // Revert
                })
            })
        }
    }

    const handleNotesChange = async (ticketId: string, componentId: string, notes: string) => {
        // Optimistically update notes too if desired, but focus is on toggle delay
        const res = await updateComponentNotes(ticketId, componentId, notes)
        if (res.error) toast.error(res.error)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar ticket?')) return
        const res = await deleteTicket(id)
        if (res.error) toast.error(res.error)
        else toast.success('Ticket eliminado')
    }

    // Helper to get matrix state
    const getMatrixEntry = (ticketId: string, componentId: string) => {
        return optimisticMatrix.find((m: any) => m.ticket_id === ticketId && m.component_id === componentId)
    }

    // Filter statuses for dropdowns
    const ticketStatuses = statuses.filter(s => s.category === 'TICKET')
    const qaStatuses = statuses.filter(s => s.category === 'QA')
    const activeReleases = releases.filter(r => r.active)

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Ticket
                </Button>
            </div>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[200px]">Ticket</TableHead>
                            <TableHead className="min-w-[140px]">Release</TableHead>
                            <TableHead className="min-w-[140px]">Estado</TableHead>
                            <TableHead className="min-w-[140px]">Estado QA</TableHead>
                            <TableHead className="min-w-[120px]">Dev</TableHead>
                            <TableHead className="min-w-[120px]">Equipo</TableHead>
                            <TableHead className="min-w-[100px]">Entorno</TableHead>
                            {components.map(c => (
                                <TableHead key={c.id} className="text-center min-w-[100px] border-l whitespace-nowrap" title={c.name}>
                                    {c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name}
                                </TableHead>
                            ))}
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.map(ticket => (
                            <TableRow key={ticket.id}>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <Input
                                            defaultValue={ticket.title}
                                            className="h-8 font-medium border-transparent hover:border-input focus:border-input px-2 w-full"
                                            onBlur={(e) => {
                                                if (e.target.value !== ticket.title) {
                                                    handleStatusChange(ticket.id, 'title', e.target.value)
                                                }
                                            }}
                                        />
                                        <Input
                                            defaultValue={ticket.description || ''}
                                            className="h-7 text-xs text-muted-foreground border-transparent hover:border-input focus:border-input px-2 truncate w-full"
                                            onBlur={(e) => {
                                                const currentDesc = ticket.description || ''
                                                if (e.target.value !== currentDesc) {
                                                    handleStatusChange(ticket.id, 'description', e.target.value)
                                                }
                                            }}
                                            placeholder="Sin descripción"
                                        />
                                    </div>
                                </TableCell>

                                {/* Release Select */}
                                <TableCell>
                                    <Select
                                        defaultValue={ticket.release_id || 'unassigned'}
                                        onValueChange={(val) => handleStatusChange(ticket.id, 'release_id', val === 'unassigned' ? null : val)}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Release" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Sin Asignar</SelectItem>
                                            {releases.map(r => (
                                                <SelectItem key={r.id} value={r.id} disabled={!r.active}>
                                                    {r.name} {r.developers?.name && `(${r.developers.name})`} {!r.active && '(Inactivo)'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                {/* Status Selects */}
                                <TableCell>
                                    <Select
                                        defaultValue={ticket.status_id}
                                        onValueChange={(val) => handleStatusChange(ticket.id, 'status_id', val)}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ticketStatuses.map(s => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color || '#ccc' }}></div>
                                                        {s.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                <TableCell>
                                    <Select
                                        defaultValue={ticket.qa_status_id}
                                        onValueChange={(val) => handleStatusChange(ticket.id, 'qa_status_id', val)}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="QA" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {qaStatuses.map(s => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color || '#ccc' }}></div>
                                                        {s.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                <TableCell>
                                    <Select defaultValue={ticket.dev_id} onValueChange={(val) => handleStatusChange(ticket.id, 'dev_id', val)}>
                                        <SelectTrigger className="h-8"><SelectValue placeholder="Dev" /></SelectTrigger>
                                        <SelectContent>
                                            {developers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                <TableCell>
                                    <Select defaultValue={ticket.team_id} onValueChange={(val) => handleStatusChange(ticket.id, 'team_id', val)}>
                                        <SelectTrigger className="h-8"><SelectValue placeholder="Equipo" /></SelectTrigger>
                                        <SelectContent>
                                            {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                <TableCell>
                                    <Select defaultValue={ticket.environment_id} onValueChange={(val) => handleStatusChange(ticket.id, 'environment_id', val)}>
                                        <SelectTrigger className="h-8"><SelectValue placeholder="Env" /></SelectTrigger>
                                        <SelectContent>
                                            {environments.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                {/* Matrix Toggle/Notes Cells */}
                                {components.map(c => {
                                    const entry = getMatrixEntry(ticket.id, c.id)
                                    const applies = entry?.applies || false

                                    // Special logic for COMMENTS
                                    if (c.name === 'COMMENTS') {
                                        return (
                                            <TableCell key={c.id} className="border-l text-center p-1 min-w-[200px]">
                                                <Textarea
                                                    className="min-h-[60px] text-xs resize-none"
                                                    placeholder="Agregar comentarios..."
                                                    defaultValue={entry?.notes || ''}
                                                    onBlur={(e) => {
                                                        const currentNotes = entry?.notes || ''
                                                        if (e.target.value !== currentNotes) {
                                                            handleNotesChange(ticket.id, c.id, e.target.value)
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                        )
                                    }

                                    return (
                                        <TableCell key={c.id} className="border-l text-center p-1">
                                            <div
                                                onClick={() => handleToggle(ticket.id, c.id, applies)}
                                                className={cn(
                                                    "cursor-pointer w-full h-8 rounded flex items-center justify-center text-xs font-bold transition-colors select-none",
                                                    applies
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                                                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                )}
                                            >
                                                {applies ? 'APLICA' : 'N/A'}
                                            </div>
                                        </TableCell>
                                    )
                                })}

                                <TableCell>
                                    <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(ticket.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <CreateTicketDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                statuses={ticketStatuses}
                qaStatuses={qaStatuses}
                developers={developers}
                teams={teams}
                environments={environments}
                releases={activeReleases}
                defaultReleaseId={defaultReleaseId}
            />
        </div>
    )
}

function CreateTicketDialog({ open, onOpenChange, statuses, qaStatuses, developers, teams, environments, releases, defaultReleaseId }: any) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const releaseId = formData.get('release_id')

        if (!releaseId || releaseId === 'unassigned') {
            toast.error('El Release es requerido')
            return
        }

        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            status_id: formData.get('status_id') || null,
            qa_status_id: formData.get('qa_status_id') || null,
            dev_id: formData.get('dev_id') || null,
            team_id: formData.get('team_id') || null,
            environment_id: formData.get('environment_id') || null,
            release_id: formData.get('release_id') || null,
        }

        const res = await createTicket(data)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Ticket creado')
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" required />
                    </div>
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" name="description" />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="release_id" className="flex gap-1">Release <span className="text-destructive">*</span></Label>
                        <Select name="release_id" defaultValue={defaultReleaseId || undefined} required>
                            <SelectTrigger><SelectValue placeholder="Seleccionar Release" /></SelectTrigger>
                            <SelectContent>
                                {releases.map((s: any) => (
                                    <SelectItem key={s.id} value={s.id} disabled={!s.active}>
                                        {s.name} {!s.active && '(Inactivo)'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="status_id">Estado</Label>
                            <Select name="status_id">
                                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {statuses.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="qa_status_id">Estado QA</Label>
                            <Select name="qa_status_id">
                                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {qaStatuses.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="dev_id">Desarrollador</Label>
                            <Select name="dev_id">
                                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {developers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="team_id">Equipo</Label>
                            <Select name="team_id">
                                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {teams.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="environment_id">Entorno</Label>
                        <Select name="environment_id">
                            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                            <SelectContent>
                                {environments.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <Button type="submit">Crear</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
