import { Building2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsGeneralTab() {
  const { settings, updateSettings } = useApp()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-church-gold" />
          Datos de la iglesia
        </CardTitle>
        <CardDescription>
          Estos valores se aplican al encabezado de la app y al crear nuevos programas.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid max-w-2xl gap-6">
        <div className="space-y-2">
          <Label htmlFor="default-church">Nombre de la iglesia</Label>
          <Input
            id="default-church"
            value={settings.churchName}
            onChange={(e) => updateSettings({ churchName: e.target.value })}
          />
          <p className="text-xs text-stone-500">Aparece en el encabezado y en los PDF generados.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="default-theme">Tema del mes por defecto</Label>
          <Input
            id="default-theme"
            value={settings.defaultMonthlyTheme}
            onChange={(e) => updateSettings({ defaultMonthlyTheme: e.target.value })}
            placeholder="Ej: Junio: Mes de ayuno y oración"
          />
          <p className="text-xs text-stone-500">
            Se rellena automáticamente al crear un programa nuevo. Puedes cambiarlo en cada semana.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
