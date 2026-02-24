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
import { ComponentNoteCell } from '@/components/settings/ComponentNoteCell'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, ExternalLink, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import ReactSelect from 'react-select'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

    // Edit Ticket state
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingTicket, setEditingTicket] = useState<any | null>(null)

    // Delete confirmation state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

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

    const handleDelete = async () => {
        if (!itemToDelete) return

        const res = await deleteTicket(itemToDelete)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Ticket eliminado exitosamente')
        }
        setIsDeleteDialogOpen(false)
        setItemToDelete(null)
    }

    const openDeleteDialog = (id: string) => {
        setItemToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const handleCopyTable = async () => {
        if (!tickets || tickets.length === 0) return;

        // 1. Preparar los datos
        const headers = ["Ticket", "Descripción", "Dev", "Equipo", "Entorno"];

        const plainRows: string[] = [];
        const htmlRows: string[] = [];

        tickets.forEach(ticket => {
            const title = ticket.title || "-";
            // Limpiamos la descripción de saltos de línea y caracteres raros
            const desc = ticket.description ? ticket.description.replace(/(\r\n|\n|\r)/gm, " ") : "-";
            const dev = ticket.ticket_developers?.map((td: any) => td.developers?.name).join(', ') || "-";
            const equipo = ticket.teams?.name || "-";
            const entorno = ticket.environments?.name || "-";

            // Fila para texto plano (TSV)
            plainRows.push([title, desc, dev, equipo, entorno].join("\t"));

            // Fila para HTML
            htmlRows.push(`
                <tr>
                    <td style="border: 1px solid #ccc; padding: 8px;">${title}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${desc}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${dev}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${equipo}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${entorno}</td>
                </tr>
            `);
        });

        const tsvText = [headers.join("\t"), ...plainRows].join("\n");

        const htmlTable = `
            <table style="border-collapse: collapse; font-family: sans-serif; width: 100%;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        ${headers.map(h => `<th style="border: 1px solid #ccc; padding: 8px; text-align: left;">${h}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${htmlRows.join("")}
                </tbody>
            </table>
        `;

        // 2. Escribir en el portapapeles usando Clipboard API
        try {
            const clipboardItem = new ClipboardItem({
                "text/plain": new Blob([tsvText], { type: "text/plain" }),
                "text/html": new Blob([htmlTable], { type: "text/html" })
            });

            await navigator.clipboard.write([clipboardItem]);
            toast.success("¡Copiado!", {
                description: "Tabla copiada. Pégala en Teams, Outlook o Excel."
            });
        } catch (error) {
            console.error("Error al copiar:", error);
            toast.error("Error", {
                description: "No se pudo copiar la tabla."
            });
        }
    };

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
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCopyTable}>
                    <Copy className="mr-2 h-4 w-4" /> Copiar
                </Button>
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
                                <TableHead key={c.id} className="text-center min-w-[100px] border-l whitespace-nowrap p-0 m-0" title={c.name}>
                                    <ComponentNoteCell
                                        componentId={c.id}
                                        initialNotes={c.technical_notes}
                                        content={c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name}
                                    />
                                </TableHead>
                            ))}
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.map(ticket => (
                            <TableRow key={ticket.id}>
                                <TableCell className="relative group">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center justify-between gap-1">
                                            {ticket.ticket_url ? (
                                                <a
                                                    href={ticket.ticket_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline font-medium truncate flex items-center gap-1"
                                                >
                                                    {ticket.title}
                                                    <ExternalLink className="h-3 w-3 inline" />
                                                </a>
                                            ) : (
                                                <span className="font-medium truncate">{ticket.title}</span>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1"
                                                onClick={() => {
                                                    setEditingTicket(ticket)
                                                    setIsEditOpen(true)
                                                }}
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {ticket.description ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="text-xs text-muted-foreground truncate cursor-help block max-w-[180px]">
                                                            {ticket.description}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[300px] break-words">
                                                        {ticket.description}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Sin descripción</span>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Ticket Fields Refactored with MatrixSelect */}
                                <TableCell>
                                    <MatrixSelect
                                        value={ticket.release_id}
                                        onValueChange={(val: string) => handleStatusChange(ticket.id, 'release_id', val)}
                                        options={releases.map(r => ({ label: r.name, value: r.id, disabled: !r.active }))}
                                        placeholder="Release"
                                    />
                                </TableCell>

                                <TableCell>
                                    <MatrixSelect
                                        value={ticket.status_id}
                                        onValueChange={(val: string) => handleStatusChange(ticket.id, 'status_id', val)}
                                        options={ticketStatuses.map(s => ({ label: s.name, value: s.id, color: s.color }))}
                                        placeholder="Estado"
                                    />
                                </TableCell>

                                <TableCell>
                                    <MatrixSelect
                                        value={ticket.qa_status_id}
                                        onValueChange={(val: string) => handleStatusChange(ticket.id, 'qa_status_id', val)}
                                        options={qaStatuses.map(s => ({ label: s.name, value: s.id, color: s.color }))}
                                        placeholder="QA"
                                    />
                                </TableCell>

                                <TableCell className="text-sm">
                                    {ticket.ticket_developers?.map((td: any) => td.developers?.name).join(', ') || "-"}
                                </TableCell>

                                <TableCell>
                                    <MatrixSelect
                                        value={ticket.team_id}
                                        onValueChange={(val: string) => handleStatusChange(ticket.id, 'team_id', val)}
                                        options={teams.map(t => ({ label: t.name, value: t.id }))}
                                        placeholder="Equipo"
                                    />
                                </TableCell>

                                <TableCell>
                                    <MatrixSelect
                                        value={ticket.environment_id}
                                        onValueChange={(val: string) => handleStatusChange(ticket.id, 'environment_id', val)}
                                        options={environments.map(e => ({ label: e.name, value: e.id }))}
                                        placeholder="Env"
                                    />
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
                                    <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => openDeleteDialog(ticket.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el ticket
                            de nuestra base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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

            <EditTicketDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                ticket={editingTicket}
                statuses={ticketStatuses}
                qaStatuses={qaStatuses}
                developers={developers}
                teams={teams}
                environments={environments}
                releases={releases}
            />
        </div>
    )
}

/**
 * Audit: Reusable MatrixSelect to follow DRY principles.
 * Encapsulates standard configuration for matrix dropdowns.
 */
function MatrixSelect({ value, onValueChange, options, placeholder }: any) {
    return (
        <Select defaultValue={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-8">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt: any) => (
                    <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                        <div className="flex items-center gap-2">
                            {opt.color && (
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color || '#ccc' }}></div>
                            )}
                            {opt.label} {opt.disabled && '(Inactivo)'}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
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
            ticket_url: formData.get('ticket_url') || null,
            status_id: formData.get('status_id') || null,
            qa_status_id: formData.get('qa_status_id') || null,
            dev_ids: formData.getAll('dev_ids'),
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
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="ticket_url">URL del Ticket (Opcional)</Label>
                        <Input id="ticket_url" name="ticket_url" placeholder="https://jira.com/..." />
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
                            <ReactSelect
                                name="dev_ids"
                                isMulti
                                placeholder="Seleccionar"
                                className="text-sm"
                                options={developers.map((s: any) => ({ label: s.name, value: s.id }))}
                            />
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

function EditTicketDialog({ open, onOpenChange, ticket, statuses, qaStatuses, developers, teams, environments, releases }: any) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!ticket) return

        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            ticket_url: formData.get('ticket_url') || null,
            status_id: formData.get('status_id') || null,
            qa_status_id: formData.get('qa_status_id') || null,
            dev_ids: formData.getAll('dev_ids'),
            team_id: formData.get('team_id') || null,
            environment_id: formData.get('environment_id') || null,
            release_id: formData.get('release_id') || null,
        }

        const res = await updateTicket(ticket.id, data)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Ticket actualizado')
            onOpenChange(false)
        }
    }

    if (!ticket) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" defaultValue={ticket.title} required />
                    </div>
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" name="description" defaultValue={ticket.description || ''} />
                    </div>
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="ticket_url">URL del Ticket (Opcional)</Label>
                        <Input id="ticket_url" name="ticket_url" defaultValue={ticket.ticket_url || ''} placeholder="https://jira.com/..." />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="release_id" className="flex gap-1">Release <span className="text-destructive">*</span></Label>
                        <Select name="release_id" defaultValue={ticket.release_id} required>
                            <SelectTrigger><SelectValue placeholder="Seleccionar Release" /></SelectTrigger>
                            <SelectContent>
                                {releases.map((s: any) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name} {!s.active && '(Inactivo)'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="status_id">Estado</Label>
                            <Select name="status_id" defaultValue={ticket.status_id || undefined}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {statuses.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="qa_status_id">Estado QA</Label>
                            <Select name="qa_status_id" defaultValue={ticket.qa_status_id || undefined}>
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
                            <ReactSelect
                                name="dev_ids"
                                isMulti
                                placeholder="Seleccionar"
                                className="text-sm"
                                defaultValue={
                                    ticket.ticket_developers
                                        ? ticket.ticket_developers.map((td: any) => ({
                                            label: td.developers?.name,
                                            value: td.developers?.id
                                        }))
                                        : []
                                }
                                options={developers.map((s: any) => ({ label: s.name, value: s.id }))}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="team_id">Equipo</Label>
                            <Select name="team_id" defaultValue={ticket.team_id || undefined}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    {teams.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="environment_id">Entorno</Label>
                        <Select name="environment_id" defaultValue={ticket.environment_id || undefined}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                            <SelectContent>
                                {environments.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <Button type="submit">Guardar Cambios</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
