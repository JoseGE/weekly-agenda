import { useState } from 'react'
import { Plus, Trash2, UserPlus } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export function SettingsPage() {
  const {
    members,
    ministries,
    settings,
    addMember,
    updateMember,
    deleteMember,
    addMinistry,
    updateMinistry,
    deleteMinistry,
    updateSettings,
    data,
  } = useApp()

  const [newMemberName, setNewMemberName] = useState('')
  const [newMinistryName, setNewMinistryName] = useState('')
  const [newMinistryDesc, setNewMinistryDesc] = useState('')

  const handleAddMember = () => {
    if (!newMemberName.trim()) return
    addMember(newMemberName)
    setNewMemberName('')
  }

  const handleAddMinistry = () => {
    if (!newMinistryName.trim()) return
    addMinistry(newMinistryName, newMinistryDesc.trim() || undefined)
    setNewMinistryName('')
    setNewMinistryDesc('')
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="mt-1 text-stone-600">Administra miembros, ministerios y valores por defecto.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Valores por defecto</CardTitle>
          <CardDescription>Se usan al crear un nuevo programa</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default-church">Nombre de la iglesia</Label>
            <Input
              id="default-church"
              value={settings.churchName}
              onChange={(e) => updateSettings({ churchName: e.target.value })}
            />
            <p className="text-xs text-stone-500">
              Se muestra en el encabezado de la app y en los PDF generados.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-theme">Tema del mes por defecto</Label>
            <Input
              id="default-theme"
              value={settings.defaultMonthlyTheme}
              onChange={(e) => updateSettings({ defaultMonthlyTheme: e.target.value })}
              placeholder="Ej: Junio: Mes de ayuno y oración"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Miembros ({members.length})
          </CardTitle>
          <CardDescription>
            Lista de personas para asignar partes. La fecha de nacimiento se usa para mostrar
            cumpleaños en el programa semanal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del miembro"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
            />
            <Button onClick={handleAddMember}>
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>

          {members.length === 0 ? (
            <p className="text-sm text-stone-500">No hay miembros registrados.</p>
          ) : (
            <div className="divide-y divide-stone-100 rounded-md border border-stone-200">
              {members.map((member) => (
                <div key={member.id} className="space-y-3 p-3">
                  <div className="flex items-center gap-3">
                    <Input
                      value={member.name}
                      onChange={(e) => updateMember(member.id, { name: e.target.value })}
                      className="flex-1"
                      placeholder="Nombre"
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={member.active}
                        onCheckedChange={(active) => updateMember(member.id, { active })}
                      />
                      <Badge variant={member.active ? 'secondary' : 'outline'}>
                        {member.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${member.name}?`)) deleteMember(member.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-stone-500">Dirección (opcional)</Label>
                      <Input
                        value={member.address ?? ''}
                        onChange={(e) =>
                          updateMember(member.id, { address: e.target.value || undefined })
                        }
                        placeholder="Calle, ciudad..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-stone-500">Fecha de nacimiento (opcional)</Label>
                      <Input
                        type="date"
                        value={member.birthDate ?? ''}
                        onChange={(e) =>
                          updateMember(member.id, { birthDate: e.target.value || undefined })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ministerios ({ministries.length})</CardTitle>
          <CardDescription>Ministerios configurables para los eventos del programa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2">
            <Input
              placeholder="Nombre del ministerio"
              value={newMinistryName}
              onChange={(e) => setNewMinistryName(e.target.value)}
            />
            <Textarea
              placeholder="Descripción (opcional)"
              value={newMinistryDesc}
              onChange={(e) => setNewMinistryDesc(e.target.value)}
              rows={1}
            />
          </div>
          <Button onClick={handleAddMinistry}>
            <Plus className="h-4 w-4" />
            Agregar ministerio
          </Button>

          <div className="divide-y divide-stone-100 rounded-md border border-stone-200">
            {data.ministries.map((ministry) => (
              <div key={ministry.id} className="flex items-start gap-3 p-3">
                <div className="flex-1 space-y-2">
                  <Input
                    value={ministry.name}
                    onChange={(e) => updateMinistry(ministry.id, { name: e.target.value })}
                  />
                  <Input
                    placeholder="Descripción"
                    value={ministry.description ?? ''}
                    onChange={(e) =>
                      updateMinistry(ministry.id, { description: e.target.value || undefined })
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Switch
                    checked={ministry.active}
                    onCheckedChange={(active) => updateMinistry(ministry.id, { active })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`¿Eliminar ${ministry.name}?`)) deleteMinistry(ministry.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
