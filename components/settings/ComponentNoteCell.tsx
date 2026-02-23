"use client"

import { useState } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateComponentNote } from "@/actions/updateComponentNote"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ComponentNoteCellProps {
    componentId: string
    initialNotes: string | null
    content: string // The name or content of the cell to display
}

export function ComponentNoteCell({ componentId, initialNotes, content }: ComponentNoteCellProps) {
    const [notes, setNotes] = useState(initialNotes || "")
    const [tempNotes, setTempNotes] = useState(initialNotes || "")
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const hasNote = notes.trim().length > 0

    const handleSave = async () => {
        setIsLoading(true)
        const res = await updateComponentNote(componentId, tempNotes)
        if (res.error) {
            toast.error(res.error)
        } else {
            setNotes(tempNotes)
            setIsEditing(false)
            toast.success("Nota técnica actualizada")
        }
        setIsLoading(false)
    }

    return (
        <div className="relative group min-h-[2.5rem] flex items-center px-2">
            {/* Excel-style Red Triangle */}
            {hasNote && (
                <div
                    className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-l-[8px] border-t-red-600 border-l-transparent"
                    title="Tiene nota técnica"
                />
            )}

            {/* Hover & Edit Logic */}
            <HoverCard openDelay={200}>
                <Popover open={isEditing} onOpenChange={setIsEditing}>
                    <HoverCardTrigger asChild>
                        <PopoverTrigger asChild>
                            <div className="cursor-pointer w-full h-full flex items-center">
                                {content}
                            </div>
                        </PopoverTrigger>
                    </HoverCardTrigger>

                    <PopoverContent className="w-80">
                        <div className="space-y-4">
                            <h4 className="font-medium leading-none">Editar Nota Técnica</h4>
                            <Textarea
                                placeholder="Escribe una nota técnica aquí..."
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setTempNotes(notes)
                                        setIsEditing(false)
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? "Guardando..." : "Guardar"}
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {hasNote && !isEditing && (
                    <HoverCardContent className="w-64 bg-[#ffffe1] border-[#cecece] text-slate-800 shadow-sm max-h-64 overflow-y-auto">
                        <p className="text-sm italic whitespace-pre-wrap break-words">{notes}</p>
                    </HoverCardContent>
                )}
            </HoverCard>
        </div>
    )
}
