import type { ChurchCard, ChurchCardTemplate } from '@/types'
import { CHURCH_CARD_TEMPLATES } from '@/types'

export function getCardLayout(template: ChurchCardTemplate) {
  const def = CHURCH_CARD_TEMPLATES.find((item) => item.id === template)
  return def?.layout ?? 'standard'
}

export function isFriendCard(card: ChurchCard): boolean {
  return getCardLayout(card.template) === 'friend'
}

export function getFormalCardTemplates() {
  return CHURCH_CARD_TEMPLATES.filter((template) => template.category !== 'friends')
}

export function getFriendCardTemplates() {
  return CHURCH_CARD_TEMPLATES.filter((template) => template.category === 'friends')
}

export function getFriendEventDateLabel(card: ChurchCard): string {
  if (card.eventDateLabel?.trim()) return card.eventDateLabel.trim()
  return ''
}
