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
import { Pencil, Trash2, Plus } from 'lucide-react'

export interface Column {
    key: string
    label: string
    type?: 'text' | 'select' | 'color' | 'date'
    options?: { label: string, value: string }[]
    filterable?: boolean // New prop for filtering
}

interface CatalogTableProps {
    data: any[]
    columns: Column[]
    tableName: 'modules' | 'components' | 'statuses' | 'teams' | 'environments' | 'developers' | 'releases'
    title: string
}

export default function CatalogTable({ data, columns, tableName, title }: CatalogTableProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any | null>(null)

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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return
        const res = await deleteCatalogItem(tableName, id, '/settings/' + tableName)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Item deleted')
        }
    }

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setCurrentPage(1) // Reset to first page on filter change
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-lg font-bold">{title}</h2>
                    <p className="text-sm text-muted-foreground">Manage your {title.toLowerCase()} here.</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {/* Dynamic Filters */}
                    {columns.filter(col => col.filterable && col.type === 'select').map(col => (
                        <Select key={col.key} onValueChange={(val) => handleFilterChange(col.key, val)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={`Filter by ${col.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All {col.label}s</SelectItem>
                                {col.options?.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ))}

                    <Button onClick={() => { setEditingItem(null); setIsOpen(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card w-full max-w-[85vw] sm:max-w-full">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.key}>{col.label}</TableHead>
                            ))}
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
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
                                        return <TableCell key={col.key}>{row[col.key]}</TableCell>
                                    })}
                                    <TableCell className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingItem(row); setIsOpen(true) }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(row.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {
                totalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )
            }

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                    </DialogHeader>
                    <CatalogForm
                        columns={columns}
                        tableName={tableName}
                        defaultValues={editingItem}
                        onSuccess={() => setIsOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div >
    )
}

function CatalogForm({ columns, tableName, defaultValues, onSuccess }: any) {
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
            res = await updateCatalogItem(tableName, defaultValues.id, cleanData, '/settings/' + tableName)
        } else {
            res = await createCatalogItem(tableName, cleanData, '/settings/' + tableName)
        }

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(defaultValues ? 'Item updated' : 'Item created')
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
                                        <SelectValue placeholder={`Select ${col.label}`} />
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
                    ) : (
                        <Input id={col.key} {...register(col.key)} />
                    )}
                </div>
            ))}
            <div className="flex justify-end gap-2">
                <Button type="submit">Save</Button>
            </div>
        </form>
    )
}
