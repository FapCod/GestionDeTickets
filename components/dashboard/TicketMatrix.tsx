'use client'

import { useState } from 'react'
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

    const handleStatusChange = async (ticketId: string, field: string, value: string | null) => {
        const res = await updateTicket(ticketId, { [field]: value })
        if (res.error) toast.error(res.error)
        else toast.success('Ticket updated')
    }

    const handleToggle = async (ticketId: string, componentId: string, currentApplies: boolean) => {
        const res = await toggleComponentApplies(ticketId, componentId, !currentApplies)
        if (res.error) toast.error(res.error)
        // optimistic update handled by server action revalidate
    }

    const handleNotesChange = async (ticketId: string, componentId: string, notes: string) => {
        const res = await updateComponentNotes(ticketId, componentId, notes)
        if (res.error) toast.error(res.error)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete ticket?')) return
        const res = await deleteTicket(id)
        if (res.error) toast.error(res.error)
        else toast.success('Ticket deleted')
    }

    // Helper to get matrix state
    const getMatrixEntry = (ticketId: string, componentId: string) => {
        return matrix.find(m => m.ticket_id === ticketId && m.component_id === componentId)
    }

    // Filter statuses for dropdowns
    const ticketStatuses = statuses.filter(s => s.category === 'TICKET')
    const qaStatuses = statuses.filter(s => s.category === 'QA')
    const activeReleases = releases.filter(r => r.active)

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Ticket
                </Button>
            </div>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[200px]">Ticket</TableHead>
                            <TableHead className="min-w-[140px]">Release</TableHead>
                            <TableHead className="min-w-[140px]">Status</TableHead>
                            <TableHead className="min-w-[140px]">QA Status</TableHead>
                            <TableHead className="min-w-[120px]">Dev</TableHead>
                            <TableHead className="min-w-[120px]">Team</TableHead>
                            <TableHead className="min-w-[100px]">Env</TableHead>
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
                                    <div className="font-medium">{ticket.title}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{ticket.description}</div>
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
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {releases.map(r => (
                                                <SelectItem key={r.id} value={r.id} disabled={!r.active}>
                                                    {r.name} {!r.active && '(Inactive)'}
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
                                            <SelectValue placeholder="Status" />
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
                                        <SelectTrigger className="h-8"><SelectValue placeholder="Team" /></SelectTrigger>
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
                                                    placeholder="Add comments..."
                                                    defaultValue={entry?.notes || ''}
                                                    onBlur={(e) => handleNotesChange(ticket.id, c.id, e.target.value)}
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
            toast.success('Ticket created')
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required />
                    </div>
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="release_id">Release</Label>
                        <Select name="release_id" defaultValue={defaultReleaseId}>
                            <SelectTrigger><SelectValue placeholder="Select Release" /></SelectTrigger>
                            <SelectContent>
                                {releases.map((s: any) => (
                                    <SelectItem key={s.id} value={s.id} disabled={!s.active}>
                                        {s.name} {!s.active && '(Inactive)'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="status_id">Status</Label>
                            <Select name="status_id">
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    {statuses.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="qa_status_id">QA Status</Label>
                            <Select name="qa_status_id">
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    {qaStatuses.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="dev_id">Developer</Label>
                            <Select name="dev_id">
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    {developers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="team_id">Team</Label>
                            <Select name="team_id">
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    {teams.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="environment_id">Environment</Label>
                        <Select name="environment_id">
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                {environments.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <Button type="submit">Create</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
