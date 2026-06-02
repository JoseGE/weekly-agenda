import { useState } from 'react'
import { BadgeCheck, Plus, Trash2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { sortPositionsByName } from '@/lib/program-utils'

export function SettingsPositionsTab() {
  const { data, addPosition, updatePosition, deletePosition } = useApp()
  const [newPositionName, setNewPositionName] = useState('')

  const handleAddPosition = () => {
    if (!newPositionName.trim()) return
    addPosition(newPositionName)
    setNewPositionName('')
  }

  const sortedPositions = sortPositionsByName(data.positions)
  const activeCount = data.positions.filter((p) => p.active).length

  return (
    <div className="space-y-4">
      <Card className="border-church-gold/20 bg-cream/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BadgeCheck className="h-5 w-5 text-church-gold" />
            Nuevo cargo
          </CardTitle>
          <CardDescription>
            Los cargos se asignan a cada miembro en la pestaña Miembros (Pastor, Tesorero, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="new-position-name">Nombre del cargo</Label>
            <Input
              id="new-position-name"
              placeholder="Ej: Diácono/a"
              value={newPositionName}
              onChange={(e) => setNewPositionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPosition()}
            />
          </div>
          <Button onClick={handleAddPosition}>
            <Plus className="h-4 w-4" />
            Agregar cargo
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-stone-500">
        {activeCount} activos · {data.positions.length} en total
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {sortedPositions.map((position) => (
          <Card key={position.id} className={!position.active ? 'opacity-75' : undefined}>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-start justify-between gap-2">
                <Input
                  value={position.name}
                  onChange={(e) => updatePosition(position.id, { name: e.target.value })}
                  className="font-medium"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => {
                    if (confirm(`¿Eliminar el cargo "${position.name}"?`)) {
                      deletePosition(position.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={position.active}
                    onCheckedChange={(active) => updatePosition(position.id, { active })}
                  />
                  <Label className="text-sm font-normal">Disponible para asignar</Label>
                </div>
                <Badge variant={position.active ? 'secondary' : 'outline'}>
                  {position.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
