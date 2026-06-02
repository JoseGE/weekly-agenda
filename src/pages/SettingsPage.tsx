import { BadgeCheck, Building2, Briefcase, LayoutTemplate, Users } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useApp } from '@/context/AppContext'
import { SettingsGeneralTab } from '@/components/settings/SettingsGeneralTab'
import { SettingsMembersTab } from '@/components/settings/SettingsMembersTab'
import { SettingsMinistriesTab } from '@/components/settings/SettingsMinistriesTab'
import { SettingsPositionsTab } from '@/components/settings/SettingsPositionsTab'
import { SettingsWeekTemplateTab } from '@/components/settings/SettingsWeekTemplateTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SettingsPage() {
  const { members, data } = useApp()
  const activeMembers = members.filter((m) => m.active).length
  const activePositions = data.positions.filter((p) => p.active).length
  const templateEvents = data.weekTemplate.reduce((sum, day) => sum + day.events.length, 0)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuración"
        description="Administra la iglesia, miembros, cargos, plantilla semanal y ministerios."
      />

      <Tabs defaultValue="general" className="page-enter stagger-1 w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto w-max min-w-full gap-1 sm:grid sm:w-full sm:grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="general" className="gap-2 py-2.5">
              <Building2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="template" className="gap-2 py-2.5">
              <LayoutTemplate className="h-4 w-4" />
              Plantilla
              <span className="rounded-full bg-stone-200/80 px-1.5 text-xs tabular-nums data-[state=active]:bg-navy-soft data-[state=active]:text-navy-dark">
                {templateEvents}
              </span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2 py-2.5">
              <Users className="h-4 w-4" />
              Miembros
              <span className="rounded-full bg-stone-200/80 px-1.5 text-xs tabular-nums data-[state=active]:bg-navy-soft data-[state=active]:text-navy-dark">
                {activeMembers}
              </span>
            </TabsTrigger>
            <TabsTrigger value="positions" className="gap-2 py-2.5">
              <BadgeCheck className="h-4 w-4" />
              Cargos
              <span className="rounded-full bg-stone-200/80 px-1.5 text-xs tabular-nums data-[state=active]:bg-navy-soft data-[state=active]:text-navy-dark">
                {activePositions}
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
        </div>

        <TabsContent value="general">
          <SettingsGeneralTab />
        </TabsContent>
        <TabsContent value="template">
          <SettingsWeekTemplateTab />
        </TabsContent>
        <TabsContent value="members">
          <SettingsMembersTab />
        </TabsContent>
        <TabsContent value="positions">
          <SettingsPositionsTab />
        </TabsContent>
        <TabsContent value="ministries">
          <SettingsMinistriesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
