import { v4 as uuidv4 } from 'uuid'
import {
  CUSTOM_ROLE_ID_PREFIX,
  FIXED_ROLES,
  type RoleAssignment,
  type RoleDefinition,
  type RoleId,
} from '@/types'

export function isCustomRoleId(roleId: string): boolean {
  return roleId.startsWith(CUSTOM_ROLE_ID_PREFIX)
}

export function createCustomRoleId(): RoleId {
  return `${CUSTOM_ROLE_ID_PREFIX}${uuidv4()}`
}

export function getAssignmentRoleDef(assignment: RoleAssignment): RoleDefinition {
  const fixed = FIXED_ROLES.find((role) => role.id === assignment.roleId)
  if (fixed) return fixed

  return {
    id: assignment.roleId,
    name: assignment.roleName,
    allowMultiple: assignment.allowMultiple ?? false,
  }
}
