const CULTO_PREFIX_PATTERN = /^Culto del [^,\n]+,?\s*/i

export const GENERAL_MINISTRY_ID = 'general'

interface MinistryOption {
  id: string
  name: string
}

export function shouldSkipMinistryTitle(ministryId: string | undefined, ministries: MinistryOption[]): boolean {
  if (!ministryId) return true
  if (ministryId === GENERAL_MINISTRY_ID) return true

  const ministry = ministries.find((m) => m.id === ministryId)
  if (!ministry) return true

  return ministry.name.trim().toLowerCase() === 'culto general'
}

/** Antepone "Culto del {ministerio}" al título cuando corresponde. */
export function applyMinistryTitlePrefix(
  title: string,
  ministryId: string | undefined,
  ministries: MinistryOption[],
): string {
  if (shouldSkipMinistryTitle(ministryId, ministries)) {
    return title
  }

  const ministry = ministries.find((m) => m.id === ministryId)
  if (!ministry) return title

  const prefix = `Culto del ${ministry.name}`
  const trimmed = title.trim()

  if (trimmed.startsWith(prefix)) {
    return title
  }

  const remainder = trimmed.replace(CULTO_PREFIX_PATTERN, '').trim()
  if (remainder) {
    return `${prefix}, ${remainder}`
  }

  return prefix
}
