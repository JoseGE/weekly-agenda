import { useMemo, useState } from 'react'
import { BadgeCheck, Cake, ChevronDown, MapPin, Plus, Search, Trash2, UserPlus } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { formatProgramDate, getPositionName } from '@/lib/program-utils'
import { cn } from '@/lib/utils'
import type { Member, MemberPosition } from '@/types'

type MemberFilter = 'all' | 'active' | 'inactive'

function memberMatchesSearch(member: Member, query: string, positions: MemberPosition[]) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const positionName = getPositionName(positions, member.positionId)?.toLowerCase() ?? ''
  return (
    member.name.toLowerCase().includes(q) ||
    (member.address?.toLowerCase().includes(q) ?? false) ||
    positionName.includes(q)
  )
}

function MemberRow({
  member,
  expanded,
  onToggle,
  positions,
  allPositions,
}: {
  member: Member
  expanded: boolean
  onToggle: () => void
  positions: MemberPosition[]
  allPositions: MemberPosition[]
}) {
  const { updateMember, deleteMember } = useApp()
  const positionName = getPositionName(allPositions, member.positionId)
  const selectablePositions = useMemo(() => {
    if (!member.positionId || positions.some((p) => p.id === member.positionId)) {
      return positions
    }
    const assigned = allPositions.find((p) => p.id === member.positionId)
    return assigned ? [...positions, assigned] : positions
  }, [positions, allPositions, member.positionId])
  const subtitleParts: string[] = []
  if (positionName) subtitleParts.push(positionName)
  if (member.birthDate) {
    subtitleParts.push(`Cumpleaños: ${formatProgramDate(member.birthDate.slice(0, 10))}`)
  } else if (member.address?.trim()) {
    subtitleParts.push(member.address.trim())
  }
  const subtitle = subtitleParts.join(' · ') || 'Sin datos adicionales'

  return (
    <div className="rounded-xl border border-stone-200/70 bg-white/90">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-stone-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-soft text-sm font-semibold text-navy-dark">
          {member.name.trim().charAt(0).toUpperCase() || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-stone-900">{member.name || 'Sin nombre'}</p>
          <p className="truncate text-xs text-stone-500">{subtitle}</p>
        </div>
        {positionName && (
          <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
            {positionName}
          </Badge>
        )}
        <Badge variant={member.active ? 'secondary' : 'outline'}>
          {member.active ? 'Activo' : 'Inactivo'}
        </Badge>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-stone-400 transition-transform', expanded && 'rotate-180')}
        />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-stone-100 px-4 py-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={member.name}
              onChange={(e) => updateMember(member.id, { name: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5" />
              Cargo
            </Label>
            <Select
              value={member.positionId ?? '__none__'}
              onValueChange={(value) =>
                updateMember(member.id, {
                  positionId: value === '__none__' ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin cargo asignado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin cargo</SelectItem>
                {selectablePositions.map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.name}
                    {!position.active ? ' (inactivo)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Dirección
              </Label>
              <Input
                value={member.address ?? ''}
                onChange={(e) =>
                  updateMember(member.id, { address: e.target.value || undefined })
                }
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Cake className="h-3.5 w-3.5" />
                Fecha de nacimiento
              </Label>
              <Input
                type="date"
                value={member.birthDate ?? ''}
                onChange={(e) =>
                  updateMember(member.id, { birthDate: e.target.value || undefined })
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={member.active}
                onCheckedChange={(active) => updateMember(member.id, { active })}
              />
              <Label className="text-sm font-normal">Disponible para asignar partes</Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                if (confirm(`¿Eliminar a ${member.name}?`)) deleteMember(member.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function SettingsMembersTab() {
  const { members, positions, data, addMember } = useApp()
  const [newMemberName, setNewMemberName] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MemberFilter>('active')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (filter === 'active' && !member.active) return false
      if (filter === 'inactive' && member.active) return false
      return memberMatchesSearch(member, search, data.positions)
    })
  }, [members, filter, search, data.positions])

  const handleAddMember = () => {
    if (!newMemberName.trim()) return
    const member = addMember(newMemberName)
    setNewMemberName('')
    setExpandedId(member.id)
  }

  const filterButtons: { id: MemberFilter; label: string }[] = [
    { id: 'active', label: 'Activos' },
    { id: 'inactive', label: 'Inactivos' },
    { id: 'all', label: 'Todos' },
  ]

  return (
    <div className="space-y-4">
      <Card className="border-church-gold/20 bg-cream/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-church-gold" />
            Agregar miembro
          </CardTitle>
          <CardDescription>
            Las personas nuevas también se crean al escribirlas al asignar partes en un programa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del miembro"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
            />
            <Button onClick={handleAddMember} className="shrink-0">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre, cargo o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex rounded-lg border border-stone-200 bg-white p-1">
          {filterButtons.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                filter === id
                  ? 'bg-navy-dark text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-stone-500">
        {filteredMembers.length} de {members.length} miembros
        {search.trim() ? ` · búsqueda: “${search.trim()}”` : ''}
      </p>

      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-3 font-medium text-stone-700">
              {members.length === 0 ? 'No hay miembros registrados' : 'Ningún miembro coincide'}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {members.length === 0
                ? 'Agrega la primera persona arriba.'
                : 'Prueba otro filtro o término de búsqueda.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              expanded={expandedId === member.id}
              positions={positions}
              allPositions={data.positions}
              onToggle={() =>
                setExpandedId((current) => (current === member.id ? null : member.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
