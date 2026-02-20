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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm, Controller } from 'react-hook-form'
import { createCatalogItem, updateCatalogItem, deleteCatalogItem } from '@/actions/catalogs'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, GripVertical, Check, X, MoveVertical } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { cn } from '@/lib/utils'

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

export interface Column {
    key: string
    label: string
    type?: 'text' | 'select' | 'multi-select' | 'color' | 'date'
    options?: { label: string, value: string }[]
    filterable?: boolean // New prop for filtering
}

interface CatalogTableProps {
    data: any[]
    columns: Column[]
    tableName: 'modules' | 'components' | 'statuses' | 'teams' | 'environments' | 'developers' | 'releases'
    title: string
    customActions?: {
        create: (data: any) => Promise<any>
        update: (id: string, data: any) => Promise<any>
        delete: (id: string) => Promise<any>
    }
    enableReordering?: boolean
    onReorder?: (orderedData: any[]) => Promise<any>
}

export default function CatalogTable({ data, columns, tableName, title, customActions, enableReordering, onReorder }: CatalogTableProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any | null>(null)

    // Delete confirmation state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    // Reordering State
    const [isReordering, setIsReordering] = useState(false)
    const [reorderData, setReorderData] = useState<any[]>([])

    // Pagination & Filtering State
    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFilters] = useState<Record<string, string>>({})
    const itemsPerPage = 10

    // Filter Logic
    const filteredData = data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value || value === 'all') return true
            return String(item[key]) === value
        })
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDelete = async () => {
        if (!itemToDelete) return

        const res = await deleteCatalogItem(tableName, itemToDelete, '/settings/' + tableName)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Elemento eliminado exitosamente')
        }
        setIsDeleteDialogOpen(false)
        setItemToDelete(null)
    }

    const openDeleteDialog = (id: string) => {
        setItemToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setCurrentPage(1) // Reset to first page on filter change
    }

    const startReordering = () => {
        // Reordering only makes sense if we have a module filter active for components
        if (tableName === 'components' && (!filters.module_id || filters.module_id === 'all')) {
            toast.warning('Primero debes seleccionar un módulo para poder reordenar los componentes.')
            return
        }
        setReorderData([...filteredData])
        setIsReordering(true)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setReorderData((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id)
                const newIndex = items.findIndex(i => i.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const saveReorder = async () => {
        if (!onReorder) return

        // Map to include sort_order
        const orderedItems = reorderData.map((item, index) => ({
            id: item.id,
            sort_order: index + 1
        }))

        const res = await onReorder(orderedItems)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Orden actualizado')
            setIsReordering(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-lg font-bold">{title}</h2>
                    <p className="text-sm text-muted-foreground">Gestiona tus {title.toLowerCase()} aquí.</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {/* Dynamic Filters */}
                    {!isReordering && columns.filter(col => col.filterable && (col.type === 'select' || col.type === 'multi-select')).map(col => (
                        <Select key={col.key} onValueChange={(val) => handleFilterChange(col.key, val)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={`Filtrar por ${col.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos {col.label}s</SelectItem>
                                {col.options?.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ))}

                    {enableReordering && !isReordering && (
                        <Button variant="outline" onClick={startReordering}>
                            <MoveVertical className="mr-2 h-4 w-4" /> Reordenar
                        </Button>
                    )}

                    {isReordering && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsReordering(false)}>
                                <X className="mr-2 h-4 w-4" /> Cancelar
                            </Button>
                            <Button size="sm" onClick={saveReorder}>
                                <Check className="mr-2 h-4 w-4" /> Guardar Orden
                            </Button>
                        </div>
                    )}

                    {!isReordering && (
                        <Button onClick={() => { setEditingItem(null); setIsOpen(true) }}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border bg-card w-full max-w-[85vw] sm:max-w-full overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {isReordering && <TableHead className="w-[40px]"></TableHead>}
                                {columns.map((col) => (
                                    <TableHead key={col.key}>{col.label}</TableHead>
                                ))}
                                {!isReordering && <TableHead className="w-[100px]">Acciones</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isReordering ? (
                                <SortableContext
                                    items={reorderData.map(i => i.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {reorderData.map((row) => (
                                        <SortableRow key={row.id} row={row} columns={columns} />
                                    ))}
                                </SortableContext>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((row) => (
                                    <TableRow key={row.id}>
                                        {columns.map((col) => {
                                            if (col.type === 'color') {
                                                return (
                                                    <TableCell key={col.key}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: row[col.key] }}></div>
                                                            {row[col.key]}
                                                        </div>
                                                    </TableCell>
                                                )
                                            }
                                            if (col.type === 'select') {
                                                const option = col.options?.find(o => o.value === row[col.key])
                                                return <TableCell key={col.key}>{option ? option.label : row[col.key]}</TableCell>
                                            }
                                            if (col.type === 'multi-select') {
                                                const values = Array.isArray(row[col.key]) ? row[col.key] : []
                                                return (
                                                    <TableCell key={col.key}>
                                                        <div className="flex flex-wrap gap-1">
                                                            {values.map((val: string) => {
                                                                const option = col.options?.find(o => o.value === val)
                                                                return (
                                                                    <span key={val} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                                        {option ? option.label : val}
                                                                    </span>
                                                                )
                                                            })}
                                                        </div>
                                                    </TableCell>
                                                )
                                            }
                                            return <TableCell key={col.key}>{row[col.key]}</TableCell>
                                        })}
                                        <TableCell className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingItem(row); setIsOpen(true) }}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(row.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length + (isReordering ? 1 : 1)} className="h-24 text-center">
                                        Sin resultados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </DndContext>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el elemento
                            seleccionado de nuestra base de datos.
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

            {/* Pagination Controls */}
            {
                !isReordering && totalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <div className="text-sm font-medium">
                            Página {currentPage} de {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                )
            }

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Elemento' : 'Agregar Nuevo'}</DialogTitle>
                    </DialogHeader>
                    <CatalogForm
                        columns={columns}
                        tableName={tableName}
                        defaultValues={editingItem}
                        onSuccess={() => setIsOpen(false)}
                        customActions={customActions}
                    />
                </DialogContent>
            </Dialog>
        </div >
    )
}

function SortableRow({ row, columns }: { row: any, columns: Column[] }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: row.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as const,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <TableRow ref={setNodeRef} style={style}>
            <TableCell className="w-[40px]">
                <Button variant="ghost" size="icon" className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </TableCell>
            {columns.map((col) => {
                if (col.type === 'select') {
                    const option = col.options?.find(o => o.value === row[col.key])
                    return <TableCell key={col.key}>{option ? option.label : row[col.key]}</TableCell>
                }
                return <TableCell key={col.key}>{row[col.key]}</TableCell>
            })}
        </TableRow>
    )
}

function CatalogForm({ columns, tableName, defaultValues, onSuccess, customActions }: any) {
    const { register, handleSubmit, control } = useForm({
        defaultValues: defaultValues || {}
    })

    const onSubmit = async (data: any) => {
        // Filter data to only include keys defined in columns
        // This prevents sending joined relations (like 'modules' object) to the update action
        const cleanData: any = {}
        columns.forEach((col: any) => {
            if (data[col.key] !== undefined) {
                cleanData[col.key] = data[col.key]
            }
        })

        let res
        if (defaultValues?.id) {
            if (customActions?.update) {
                res = await customActions.update(defaultValues.id, cleanData)
            } else {
                res = await updateCatalogItem(tableName, defaultValues.id, cleanData, '/settings/' + tableName)
            }
        } else {
            if (customActions?.create) {
                res = await customActions.create(cleanData)
            } else {
                res = await createCatalogItem(tableName, cleanData, '/settings/' + tableName)
            }
        }

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(defaultValues ? 'Elemento actualizado' : 'Elemento creado')
            onSuccess()
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {columns.map((col: any) => (
                <div key={col.key} className="grid w-full gap-1.5">
                    <Label htmlFor={col.key}>{col.label}</Label>
                    {col.type === 'select' ? (
                        <Controller
                            control={control}
                            name={col.key}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Seleccionar ${col.label}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {col.options?.map((opt: any) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    ) : col.type === 'color' ? (
                        <div className="flex gap-2">
                            <Input id={col.key} type="color" className="w-12 p-1 h-10" {...register(col.key)} />
                            <Input type="text" {...register(col.key)} placeholder="#000000" />
                        </div>
                    ) : col.type === 'date' ? (
                        <Input id={col.key} type="date" {...register(col.key)} />
                    ) : col.type === 'multi-select' ? (
                        <Controller
                            control={control}
                            name={col.key}
                            render={({ field }) => (
                                <div className="border rounded-md p-2 space-y-2 max-h-48 overflow-y-auto">
                                    {col.options?.map((opt: any) => {
                                        const values = Array.isArray(field.value) ? field.value : []
                                        const isChecked = values.includes(opt.value)
                                        return (
                                            <div key={opt.value} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`${col.key}-${opt.value}`}
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const newValues = e.target.checked
                                                            ? [...values, opt.value]
                                                            : values.filter((v: string) => v !== opt.value)
                                                        field.onChange(newValues)
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor={`${col.key}-${opt.value}`} className="text-sm cursor-pointer select-none">
                                                    {opt.label}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        />
                    ) : (
                        <Input
                            id={col.key}
                            {...register(col.key)}
                            className={cn(
                                tableName === 'components' && col.key === 'name' && "uppercase"
                            )}
                        />
                    )}
                </div>
            ))}
            <div className="flex justify-end gap-2">
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    )
}

