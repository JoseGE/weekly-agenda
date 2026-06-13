import { normalizeName } from '@/lib/program-utils'
import type { AppData, Member, WeeklyProgram } from '@/types'

const FUZZY_MIN_LENGTH = 6
const FUZZY_MAX_DISTANCE = 1

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const next = Math.min(row[j] + 1, prev + 1, row[j - 1] + cost)
      row[j - 1] = prev
      prev = next
    }
    row[b.length] = prev
  }
  return row[b.length]
}

/** Accent-insensitive match; allows a single-character typo on longer names. */
export function namesLikelyMatch(a: string, b: string): boolean {
  const left = normalizeName(a)
  const right = normalizeName(b)
  if (!left || !right) return false
  if (left === right) return true

  const minLength = Math.min(left.length, right.length)
  if (minLength < FUZZY_MIN_LENGTH) return false
  if (Math.abs(left.length - right.length) > FUZZY_MAX_DISTANCE) return false

  return levenshteinDistance(left, right) <= FUZZY_MAX_DISTANCE
}

function pushNormalizedGroup(
  group: Member[],
  groups: Member[][],
  assigned: Set<string>,
) {
  if (group.length <= 1) return
  group.forEach((entry) => assigned.add(entry.id))
  groups.push(group)
}

export function findDuplicateMemberGroups(members: Member[]): Member[][] {
  const groups: Member[][] = []
  const assigned = new Set<string>()
  const normalizedByMember = new Map(members.map((member) => [member.id, normalizeName(member.name)]))

  const exactBuckets = new Map<string, Member[]>()
  for (const member of members) {
    const key = normalizedByMember.get(member.id)!
    const bucket = exactBuckets.get(key) ?? []
    bucket.push(member)
    exactBuckets.set(key, bucket)
  }

  for (const bucket of exactBuckets.values()) {
    pushNormalizedGroup(bucket, groups, assigned)
  }

  const remaining = members.filter((member) => !assigned.has(member.id))
  for (let i = 0; i < remaining.length; i++) {
    const member = remaining[i]
    if (assigned.has(member.id)) continue

    const left = normalizedByMember.get(member.id)!
    const fuzzyGroup = [member]

    for (let j = i + 1; j < remaining.length; j++) {
      const candidate = remaining[j]
      if (assigned.has(candidate.id)) continue

      const right = normalizedByMember.get(candidate.id)!
      if (left === right) {
        fuzzyGroup.push(candidate)
        continue
      }

      const minLength = Math.min(left.length, right.length)
      if (minLength < FUZZY_MIN_LENGTH) continue
      if (Math.abs(left.length - right.length) > FUZZY_MAX_DISTANCE) continue
      if (levenshteinDistance(left, right) <= FUZZY_MAX_DISTANCE) {
        fuzzyGroup.push(candidate)
      }
    }

    pushNormalizedGroup(fuzzyGroup, groups, assigned)
  }

  return groups
}

function memberRichnessScore(member: Member): number {
  let score = 0
  if (member.birthDate?.trim()) score += 4
  if (member.address?.trim()) score += 2
  if (member.positionId) score += 2
  if (member.active) score += 1
  return score
}

function memberSortKey(member: Member, indexById: Map<string, number>): number {
  if (member.createdAt) return new Date(member.createdAt).getTime()
  return (indexById.get(member.id) ?? 0) * 1_000
}

/** Keeps the most recently created member; merges metadata from older duplicates into it. */
export function pickNewestMember(members: Member[], allMembers: Member[]): Member {
  const indexById = new Map(allMembers.map((member, index) => [member.id, index]))
  return [...members].sort((a, b) => {
    const timeDiff = memberSortKey(b, indexById) - memberSortKey(a, indexById)
    if (timeDiff !== 0) return timeDiff
    return memberRichnessScore(b) - memberRichnessScore(a)
  })[0]
}

export function assignLegacyMemberTimestamps(members: Member[]): Member[] {
  const base = Date.parse('2020-01-01T12:00:00')
  return members.map((member, index) =>
    member.createdAt
      ? member
      : { ...member, createdAt: new Date(base + index * 1_000).toISOString() },
  )
}

function mergeMemberMetadata(keeper: Member, others: Member[]): Member {
  const merged = { ...keeper }
  for (const other of others) {
    if (!merged.birthDate && other.birthDate) merged.birthDate = other.birthDate
    if (!merged.address && other.address) merged.address = other.address
    if (!merged.positionId && other.positionId) merged.positionId = other.positionId
    merged.active = merged.active || other.active
  }
  return merged
}

function rewriteProgramsMemberNames(
  programs: WeeklyProgram[],
  canonicalName: string,
  aliases: string[],
): WeeklyProgram[] {
  return programs.map((program) => ({
    ...program,
    days: program.days.map((day) => ({
      ...day,
      events: day.events.map((event) => ({
        ...event,
        assignments: event.assignments.map((assignment) => ({
          ...assignment,
          members: assignment.members.map((memberName) => {
            const trimmed = memberName.trim()
            if (!trimmed) return memberName
            if (aliases.some((alias) => namesLikelyMatch(trimmed, alias))) {
              return canonicalName
            }
            return memberName
          }),
        })),
      })),
    })),
  }))
}

export function mergeMembersIntoData(
  data: AppData,
  keeperId: string,
  duplicateIds: string[],
): AppData {
  const keeper = data.members.find((member) => member.id === keeperId)
  if (!keeper) return data

  const duplicates = data.members.filter((member) => duplicateIds.includes(member.id))
  if (duplicates.length === 0) return data

  const mergedKeeper = mergeMemberMetadata(keeper, duplicates)
  const aliasNames = duplicates.map((member) => member.name)

  return {
    ...data,
    members: data.members
      .filter((member) => !duplicateIds.includes(member.id))
      .map((member) => (member.id === keeperId ? mergedKeeper : member)),
    programs: rewriteProgramsMemberNames(data.programs, mergedKeeper.name, aliasNames),
  }
}

export function deduplicateAllMembers(data: AppData): AppData {
  let current: AppData = {
    ...data,
    members: assignLegacyMemberTimestamps(data.members),
  }
  const groups = findDuplicateMemberGroups(current.members)

  for (const group of groups) {
    const keeper = pickNewestMember(group, current.members)
    const duplicateIds = group.filter((member) => member.id !== keeper.id).map((m) => m.id)
    current = mergeMembersIntoData(current, keeper.id, duplicateIds)
  }

  return current
}
