import { Building2, Briefcase, Users } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { SettingsGeneralTab } from '@/components/settings/SettingsGeneralTab'
import { SettingsMembersTab } from '@/components/settings/SettingsMembersTab'
import { SettingsMinistriesTab } from '@/components/settings/SettingsMinistriesTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SettingsPage() {
  const { members, data } = useApp()
  const activeMembers = members.filter((m) => m.active).length

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-stone-900">Configuración</h2>
        <p className="mt-1 text-stone-600">
          Administra la iglesia, el directorio de miembros y los ministerios desde secciones separadas.
        </p>
      </section>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-3">
          <TabsTrigger value="general" className="gap-2 py-2.5">
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2 py-2.5">
            <Users className="h-4 w-4" />
            Miembros
            <span className="rounded-full bg-stone-200 px-1.5 text-xs tabular-nums data-[state=active]:bg-stone-800/10">
              {activeMembers}
            </span>
          </TabsTrigger>
          <TabsTrigger value="ministries" className="gap-2 py-2.5">
            <Briefcase className="h-4 w-4" />
            Ministerios
            <span className="rounded-full bg-stone-200 px-1.5 text-xs tabular-nums data-[state=active]:bg-stone-800/10">
              {data.ministries.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsGeneralTab />
        </TabsContent>
        <TabsContent value="members">
          <SettingsMembersTab />
        </TabsContent>
        <TabsContent value="ministries">
          <SettingsMinistriesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
