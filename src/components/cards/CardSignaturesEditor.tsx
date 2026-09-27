import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { getSignatureImageSrc } from '@/lib/card-signature-images'
import { createEmptySignature, fillSignatureFromMember } from '@/lib/card-utils'
import { sortMembersByName } from '@/lib/program-utils'
import type { CardSignature, Member, MemberPosition } from '@/types'

interface CardSignaturesEditorProps {
  signatures: CardSignature[]
  members: Member[]
  positions: MemberPosition[]
  onChange: (signatures: CardSignature[]) => void
}

export function CardSignaturesEditor({
  signatures,
  members,
  positions,
  onChange,
}: CardSignaturesEditorProps) {
  const activeMembers = sortMembersByName(members.filter((member) => member.active))

  const updateSignature = (id: string, updates: Partial<CardSignature>) => {
    onChange(signatures.map((signature) => (signature.id === id ? { ...signature, ...updates } : signature)))
  }

  const removeSignature = (id: string) => {
    onChange(signatures.filter((signature) => signature.id !== id))
  }

  const moveSignature = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= signatures.length) return
    const next = [...signatures]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    onChange(next)
  }

  const handleMemberSelect = (signature: CardSignature, value: string) => {
    if (value === '__manual__') {
      updateSignature(signature.id, { memberId: undefined })
      return
    }

    const member = activeMembers.find((entry) => entry.id === value)
    if (!member) return
    updateSignature(signature.id, fillSignatureFromMember(signature, member, positions))
  }

  return (
    <div className="space-y-4 rounded-lg border border-stone-200/80 bg-stone-50/60 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label className="text-base">Firmas</Label>
          <p className="text-xs text-stone-500">
            Opcional. Martina, Marisol y Zacarías usan su firma manuscrita.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onChange([...signatures, createEmptySignature()])}
        >
          <Plus className="h-4 w-4" />
          Agregar firma
        </Button>
      </div>

      {signatures.length === 0 ? (
        <p className="text-sm text-stone-500">Sin firmas en esta carta.</p>
      ) : (
        <div className="space-y-3">
          {signatures.map((signature, index) => (
            <div
              key={signature.id}
              className="space-y-3 rounded-xl border border-stone-200/70 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  {getSignatureImageSrc(signature.name) ? (
                    <img
                      src={getSignatureImageSrc(signature.name)}
                      alt=""
                      className="h-10 w-24 shrink-0 object-contain object-left"
                    />
                  ) : null}
                  <p className="text-sm font-medium text-navy-dark">
                    Firma {index + 1}
                    {signature.name.trim() ? ` — ${signature.name.trim()}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => moveSignature(index, -1)}
                    aria-label="Subir firma"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === signatures.length - 1}
                    onClick={() => moveSignature(index, 1)}
                    aria-label="Bajar firma"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSignature(signature.id)}
                    aria-label="Eliminar firma"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`signature-member-${signature.id}`}>Miembro (opcional)</Label>
                <Select
                  value={signature.memberId ?? '__manual__'}
                  onValueChange={(value) => handleMemberSelect(signature, value)}
                >
                  <SelectTrigger id={`signature-member-${signature.id}`}>
                    <SelectValue placeholder="Escribir manualmente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__manual__">Escribir manualmente</SelectItem>
                    {activeMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`signature-name-${signature.id}`}>Nombre</Label>
                  <Input
                    id={`signature-name-${signature.id}`}
                    value={signature.name}
                    onChange={(e) =>
                      updateSignature(signature.id, { name: e.target.value, memberId: undefined })
                    }
                    placeholder="Ej: José García"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`signature-title-${signature.id}`}>Cargo</Label>
                  <Input
                    id={`signature-title-${signature.id}`}
                    value={signature.title ?? ''}
                    onChange={(e) => updateSignature(signature.id, { title: e.target.value })}
                    placeholder="Ej: Pastor/a"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`signature-line-${signature.id}`}
                    checked={signature.showLine !== false}
                    onCheckedChange={(checked) => updateSignature(signature.id, { showLine: checked })}
                  />
                  <Label htmlFor={`signature-line-${signature.id}`} className="font-normal">
                    Mostrar línea
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`signature-name-visible-${signature.id}`}
                    checked={signature.showName !== false}
                    onCheckedChange={(checked) => updateSignature(signature.id, { showName: checked })}
                  />
                  <Label htmlFor={`signature-name-visible-${signature.id}`} className="font-normal">
                    Mostrar nombre
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`signature-title-visible-${signature.id}`}
                    checked={signature.showTitle !== false}
                    onCheckedChange={(checked) => updateSignature(signature.id, { showTitle: checked })}
                  />
                  <Label htmlFor={`signature-title-visible-${signature.id}`} className="font-normal">
                    Mostrar cargo
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
