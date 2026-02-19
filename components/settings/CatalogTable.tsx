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
    type?: 'text' | 'select' | 'color'
    options?: { label: string, value: string }[]
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return
        const res = await deleteCatalogItem(tableName, id, '/settings/' + tableName)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Item deleted')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
                <h2 className="text-lg font-bold">{title}</h2>
                <Button onClick={() => { setEditingItem(null); setIsOpen(true) }}>
                    <Plus className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>

            <div className="rounded-md border bg-card">
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
                        {data.map((row) => (
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
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
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
        </div>
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
