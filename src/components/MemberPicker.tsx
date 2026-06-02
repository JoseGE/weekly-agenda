import { useMemo, useState } from 'react'
import { AlertTriangle, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { useApp } from '@/context/AppContext'
import { findMemberByName, getPersonCount, isPersonAtLimit } from '@/lib/assignment-rules'
import { normalizeName, sortMembersByName } from '@/lib/program-utils'
import type { Member, WeeklyProgram } from '@/types'

function resolvePickerMode(value: string, members: Member[]): 'select' | 'free' {
  if (!value.trim()) return 'select'
  return findMemberByName(members, value) ? 'select' : 'free'
}

interface MemberPickerProps {
  program: WeeklyProgram
  members: Member[]
  value: string
  onChange: (value: string) => void
  exclude?: { eventId: string; roleId?: string; memberIndex?: number }
  placeholder?: string
}

export function MemberPicker({
  program,
  members,
  value,
  onChange,
  exclude,
  placeholder = 'Seleccionar o escribir nombre',
}: MemberPickerProps) {
  const { ensureMember } = useApp()
  const activeMembers = useMemo(
    () => sortMembersByName(members.filter((m) => m.active)),
    [members],
  )
  const [mode, setMode] = useState<'select' | 'free'>(() => resolvePickerMode(value, activeMembers))

  const registerFreeTextMember = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    const existing = findMemberByName(members, trimmed)
    if (existing) {
      ensureMember(trimmed)
      if (existing.name !== name) onChange(existing.name)
      return
    }

    ensureMember(trimmed)
  }

  const currentCount = value.trim()
    ? getPersonCount(program, value, exclude)
    : 0
  const atLimit = value.trim() ? isPersonAtLimit(program, value, exclude) : false
  const matchedMember = value.trim() ? findMemberByName(members, value) : undefined

  const selectOptions = activeMembers.map((member) => {
    const count = getPersonCount(program, member.name, exclude)
    const disabled = count >= 2
    return { member, count, disabled }
  })

  const handleSelectChange = (memberId: string) => {
    const member = activeMembers.find((m) => m.id === memberId)
    if (member) onChange(member.name)
  }

  const selectedMemberId = activeMembers.find(
    (m) => normalizeName(m.name) === normalizeName(value),
  )?.id

  const displayMode =
    mode === 'select' && value.trim() && !selectedMemberId ? 'free' : mode

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={displayMode === 'select' ? 'default' : 'outline'}
          onClick={() => {
            if (value.trim()) registerFreeTextMember(value)
            setMode('select')
          }}
        >
          Lista
        </Button>
        <Button
          type="button"
          size="sm"
          variant={displayMode === 'free' ? 'default' : 'outline'}
          onClick={() => setMode('free')}
        >
          Texto libre
        </Button>
      </div>

      {displayMode === 'select' ? (
        <Select
          value={selectedMemberId}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map(({ member, count, disabled }) => (
              <SelectItem key={member.id} value={member.id} disabled={disabled}>
                {member.name}
                {count > 0 && ` (${count}/2)`}
                {disabled && ' — Límite alcanzado'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => registerFreeTextMember(value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              registerFreeTextMember(value)
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          placeholder="Escribir nombre..."
        />
      )}

      {value.trim() && (
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={atLimit ? 'destructive' : 'secondary'}>{currentCount}/2 esta semana</Badge>
          {atLimit && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-3 w-3" />
              Límite alcanzado
            </span>
          )}
          {matchedMember && displayMode === 'free' && (
            <span className="text-stone-500">Ya está en la lista de miembros</span>
          )}
          {!matchedMember && displayMode === 'free' && value.trim() && (
            <span className="text-stone-500">Se guardará en miembros al salir del campo</span>
          )}
        </div>
      )}
    </div>
  )
}

interface MultiMemberPickerProps {
  program: WeeklyProgram
  members: Member[]
  values: string[]
  onChange: (values: string[]) => void
  eventId: string
  roleId: string
}

export function MultiMemberPicker({
  program,
  members,
  values,
  onChange,
  eventId,
  roleId,
}: MultiMemberPickerProps) {
  const addSlot = () => onChange([...values, ''])

  const updateSlot = (index: number, name: string) => {
    const next = [...values]
    next[index] = name
    onChange(next)
  }

  const removeSlot = (index: number) => {
    if (values.length <= 1) {
      onChange([''])
      return
    }
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {values.map((name, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">
            <Label className="mb-1 block text-xs text-stone-500">Persona {index + 1}</Label>
            <MemberPicker
              program={program}
              members={members}
              value={name}
              onChange={(v) => updateSlot(index, v)}
              exclude={{ eventId, roleId, memberIndex: index }}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-6 shrink-0"
            onClick={() => removeSlot(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addSlot}>
        <Plus className="h-4 w-4" />
        Agregar persona
      </Button>
    </div>
  )
}
