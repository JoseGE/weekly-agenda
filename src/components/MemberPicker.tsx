import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'
import { findMemberByName, getPersonCount, isPersonAtLimit } from '@/lib/assignment-rules'
import { normalizeName, sortMembersByName } from '@/lib/program-utils'
import type { Member, WeeklyProgram } from '@/types'

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
  placeholder = 'Buscar o escribir nombre',
}: MemberPickerProps) {
  const { ensureMember } = useApp()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(
    null,
  )

  const activeMembers = useMemo(
    () => sortMembersByName(members.filter((m) => m.active)),
    [members],
  )

  const registerMember = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    const resolved = ensureMember(trimmed)
    if (resolved && resolved.name !== value) {
      onChange(resolved.name)
    }
  }

  const selectOptions = useMemo(
    () =>
      activeMembers.map((member) => {
        const count = getPersonCount(program, member.name, exclude)
        return { member, count, atLimit: count >= 2 }
      }),
    [activeMembers, program, exclude],
  )

  const filteredOptions = useMemo(() => {
    const query = normalizeName(value)
    if (!query) return selectOptions
    return selectOptions.filter(({ member }) => normalizeName(member.name).includes(query))
  }, [selectOptions, value])

  const currentCount = value.trim() ? getPersonCount(program, value, exclude) : 0
  const atLimit = value.trim() ? isPersonAtLimit(program, value, exclude) : false
  const matchedMember = value.trim() ? findMemberByName(members, value) : undefined
  const showSuggestions = open && filteredOptions.length > 0

  useLayoutEffect(() => {
    if (!showSuggestions) {
      setDropdownRect(null)
      return
    }

    const updatePosition = () => {
      const rect = inputRef.current?.getBoundingClientRect()
      if (!rect) return
      setDropdownRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [showSuggestions, value])

  const selectMember = (name: string) => {
    onChange(name)
    registerMember(name)
    setOpen(false)
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (containerRef.current?.contains(event.relatedTarget as Node)) return
    setOpen(false)
    registerMember(value)
  }

  return (
    <div ref={containerRef} className="relative min-w-0 max-w-full space-y-2">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            registerMember(value)
            setOpen(false)
            ;(e.target as HTMLInputElement).blur()
          }
          if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showSuggestions}
        aria-autocomplete="list"
      />

      {showSuggestions &&
        dropdownRect &&
        createPortal(
          <ul
            className="fixed z-50 max-h-48 overflow-y-auto rounded-xl border border-stone-200/80 bg-white py-1 shadow-lg"
            style={{
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
            }}
            role="listbox"
          >
            {filteredOptions.map(({ member, count, atLimit: optionAtLimit }) => (
              <li key={member.id} role="option">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-navy-soft ${
                    optionAtLimit ? 'text-amber-800' : 'text-stone-800'
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectMember(member.name)}
                >
                  <span>{member.name}</span>
                  <span
                    className={`text-xs ${optionAtLimit ? 'font-medium text-amber-700' : 'text-stone-500'}`}
                  >
                    {count > 0 && `${count}/2`}
                    {optionAtLimit && ' · Al límite'}
                  </span>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}

      {value.trim() && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant={atLimit ? 'warning' : 'secondary'}>{currentCount}/2 esta semana</Badge>
          {atLimit && (
            <span className="flex items-center gap-1 text-amber-700">
              <AlertTriangle className="h-3 w-3" />
              Ya tiene 2 apariciones esta semana
            </span>
          )}
          {matchedMember ? (
            <span className="text-stone-500">Miembro registrado</span>
          ) : (
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
