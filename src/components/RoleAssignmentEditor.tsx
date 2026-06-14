import { Trash2 } from 'lucide-react'
import { FIXED_ROLES } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { MemberPicker, MultiMemberPicker } from '@/components/MemberPicker'
import { PENDING_ASSIGNMENT_LABEL } from '@/lib/program-utils'
import type { DayEvent, Member, RoleAssignment, RoleId, WeeklyProgram } from '@/types'

interface RoleAssignmentEditorProps {
  program: WeeklyProgram
  members: Member[]
  event: DayEvent
  onUpdateAssignments: (assignments: RoleAssignment[]) => void
}

export function RoleAssignmentEditor({
  program,
  members,
  event,
  onUpdateAssignments,
}: RoleAssignmentEditorProps) {
  const getAssignment = (roleId: RoleId): RoleAssignment | undefined =>
    event.assignments.find((a) => a.roleId === roleId)

  const updateRole = (
    roleId: RoleId,
    roleName: string,
    membersList: string[],
    assignOnEventDay = false,
  ) => {
    const others = event.assignments.filter((a) => a.roleId !== roleId)
    if (!assignOnEventDay && membersList.length === 0) {
      onUpdateAssignments(others)
      return
    }
    onUpdateAssignments([
      ...others,
      {
        roleId,
        roleName,
        members: assignOnEventDay ? [] : membersList,
        ...(assignOnEventDay ? { assignOnEventDay: true } : {}),
      },
    ])
  }

  const setAssignOnEventDay = (roleId: RoleId, roleName: string, assignOnEventDay: boolean) => {
    if (assignOnEventDay) {
      updateRole(roleId, roleName, [], true)
      return
    }
    const existing = event.assignments.find((a) => a.roleId === roleId)
    const members = existing?.members.some((m) => m.trim()) ? existing.members : ['']
    updateRole(roleId, roleName, members, false)
  }

  const addRole = (roleId: RoleId) => {
    const role = FIXED_ROLES.find((r) => r.id === roleId)
    if (!role || getAssignment(roleId)) return
    onUpdateAssignments([
      ...event.assignments,
      { roleId, roleName: role.name, members: [''] },
    ])
  }

  const removeRole = (roleId: RoleId) => {
    onUpdateAssignments(event.assignments.filter((a) => a.roleId !== roleId))
  }

  const availableRoles = FIXED_ROLES.filter((r) => !getAssignment(r.id))

  return (
    <div className="min-w-0 space-y-4 overflow-hidden rounded-md border border-stone-200 bg-stone-50 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Label className="text-sm font-semibold">Asignaciones de partes</Label>
        {availableRoles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {availableRoles.map((role) => (
              <Button
                key={role.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addRole(role.id)}
              >
                + {role.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {event.assignments.length === 0 && (
        <p className="text-sm text-stone-500">
          Agrega partes como Dirige, Mensaje, Himnos, etc.
        </p>
      )}

      {event.assignments.map((assignment) => {
        const roleDef = FIXED_ROLES.find((r) => r.id === assignment.roleId)
        if (!roleDef) return null

        return (
          <div key={assignment.roleId} className="min-w-0 overflow-hidden rounded-md border border-stone-200 bg-white p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="font-medium break-words">{assignment.roleName}</span>
                <Badge variant="outline" className="text-xs">
                  {roleDef.allowMultiple ? 'Varias personas' : 'Una persona'}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRole(assignment.roleId)}
              >
                <Trash2 className="h-4 w-4 text-stone-400" />
              </Button>
            </div>

            <div className="mb-3 flex min-w-0 items-start gap-2">
              <Switch
                id={`assign-on-event-day-${assignment.roleId}`}
                checked={assignment.assignOnEventDay === true}
                onCheckedChange={(checked) =>
                  setAssignOnEventDay(assignment.roleId, assignment.roleName, checked)
                }
                className="mt-0.5 shrink-0"
              />
              <Label
                htmlFor={`assign-on-event-day-${assignment.roleId}`}
                className="break-words leading-snug text-sm"
              >
                {PENDING_ASSIGNMENT_LABEL}
              </Label>
            </div>

            {assignment.assignOnEventDay ? (
              <Badge variant="secondary" className="text-xs">
                {PENDING_ASSIGNMENT_LABEL}
              </Badge>
            ) : roleDef.allowMultiple ? (
              <MultiMemberPicker
                program={program}
                members={members}
                values={assignment.members.length > 0 ? assignment.members : ['']}
                onChange={(vals) => updateRole(assignment.roleId, assignment.roleName, vals)}
                eventId={event.id}
                roleId={assignment.roleId}
              />
            ) : (
              <MemberPicker
                program={program}
                members={members}
                value={assignment.members[0] ?? ''}
                onChange={(name) => updateRole(assignment.roleId, assignment.roleName, [name])}
                exclude={{
                  eventId: event.id,
                  roleId: assignment.roleId,
                  memberIndex: 0,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
