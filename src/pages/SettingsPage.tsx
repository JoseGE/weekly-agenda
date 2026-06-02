import { Building2, Briefcase, Users } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useApp } from '@/context/AppContext'
import { SettingsGeneralTab } from '@/components/settings/SettingsGeneralTab'
import { SettingsMembersTab } from '@/components/settings/SettingsMembersTab'
import { SettingsMinistriesTab } from '@/components/settings/SettingsMinistriesTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SettingsPage() {
  const { members, data } = useApp()
  const activeMembers = members.filter((m) => m.active).length

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuración"
        description="Administra la iglesia, el directorio de miembros y los ministerios desde secciones separadas."
      />

      <Tabs defaultValue="general" className="page-enter stagger-1 w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-3">
          <TabsTrigger value="general" className="gap-2 py-2.5">
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2 py-2.5">
            <Users className="h-4 w-4" />
            Miembros
            <span className="rounded-full bg-stone-200/80 px-1.5 text-xs tabular-nums data-[state=active]:bg-navy-soft data-[state=active]:text-navy-dark">
              {activeMembers}
            </span>
          </TabsTrigger>
          <TabsTrigger value="ministries" className="gap-2 py-2.5">
            <Briefcase className="h-4 w-4" />
            Ministerios
            <span className="rounded-full bg-stone-200/80 px-1.5 text-xs tabular-nums data-[state=active]:bg-navy-soft data-[state=active]:text-navy-dark">
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
