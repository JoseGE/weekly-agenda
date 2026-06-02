import { Trash2 } from 'lucide-react'
import { FIXED_ROLES } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MemberPicker, MultiMemberPicker } from '@/components/MemberPicker'
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

  const updateRole = (roleId: RoleId, roleName: string, membersList: string[]) => {
    const others = event.assignments.filter((a) => a.roleId !== roleId)
    if (membersList.length === 0) {
      onUpdateAssignments(others)
      return
    }
    onUpdateAssignments([...others, { roleId, roleName, members: membersList }])
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
    <div className="space-y-4 rounded-md border border-stone-200 bg-stone-50 p-4">
      <div className="flex items-center justify-between">
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
          <div key={assignment.roleId} className="rounded-md border border-stone-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{assignment.roleName}</span>
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

            {roleDef.allowMultiple ? (
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
