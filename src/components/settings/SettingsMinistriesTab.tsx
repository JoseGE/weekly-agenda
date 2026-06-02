import { useState } from 'react'
import { Briefcase, Plus, Trash2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export function SettingsMinistriesTab() {
  const { data, addMinistry, updateMinistry, deleteMinistry } = useApp()
  const [newMinistryName, setNewMinistryName] = useState('')
  const [newMinistryDesc, setNewMinistryDesc] = useState('')

  const handleAddMinistry = () => {
    if (!newMinistryName.trim()) return
    addMinistry(newMinistryName, newMinistryDesc.trim() || undefined)
    setNewMinistryName('')
    setNewMinistryDesc('')
  }

  const activeCount = data.ministries.filter((m) => m.active).length

  return (
    <div className="space-y-4">
      <Card className="border-church-gold/20 bg-cream/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-church-gold" />
            Nuevo ministerio
          </CardTitle>
          <CardDescription>
            Los ministerios aparecen al configurar eventos en el programa semanal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-ministry-name">Nombre</Label>
              <Input
                id="new-ministry-name"
                placeholder="Ej: Ministerio de Jóvenes"
                value={newMinistryName}
                onChange={(e) => setNewMinistryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMinistry()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-ministry-desc">Descripción (opcional)</Label>
              <Textarea
                id="new-ministry-desc"
                placeholder="Breve descripción"
                value={newMinistryDesc}
                onChange={(e) => setNewMinistryDesc(e.target.value)}
                rows={1}
              />
            </div>
          </div>
          <Button onClick={handleAddMinistry}>
            <Plus className="h-4 w-4" />
            Agregar ministerio
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-stone-500">
        {activeCount} activos · {data.ministries.length} en total
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {data.ministries.map((ministry) => (
          <Card key={ministry.id} className={!ministry.active ? 'opacity-75' : undefined}>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    value={ministry.name}
                    onChange={(e) => updateMinistry(ministry.id, { name: e.target.value })}
                    className="font-medium"
                  />
                  <Input
                    placeholder="Descripción (opcional)"
                    value={ministry.description ?? ''}
                    onChange={(e) =>
                      updateMinistry(ministry.id, { description: e.target.value || undefined })
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => {
                    if (confirm(`¿Eliminar ${ministry.name}?`)) deleteMinistry(ministry.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={ministry.active}
                    onCheckedChange={(active) => updateMinistry(ministry.id, { active })}
                  />
                  <Label className="text-sm font-normal">Visible en eventos</Label>
                </div>
                <Badge variant={ministry.active ? 'secondary' : 'outline'}>
                  {ministry.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
