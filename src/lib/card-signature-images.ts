import firmaMarisol from '@/assets/firma-marisol.png'
import firmaMartina from '@/assets/firma-martina.png'
import firmaZacarias from '@/assets/firma-zacarias.png'

const SIGNATURE_IMAGES = [
  { key: 'martina', src: firmaMartina },
  { key: 'marisol', src: firmaMarisol },
  { key: 'zacarias', src: firmaZacarias },
] as const

export function normalizeSignatureName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function getSignatureImageSrc(name: string): string | undefined {
  const normalized = normalizeSignatureName(name)
  return SIGNATURE_IMAGES.find((image) => normalized.includes(image.key))?.src
}

/** Resuelve la ruta de la firma para @react-pdf en pruebas y en el navegador. */
export function resolveSignatureImageSource(source: string): string {
  const runtimeProcess = (globalThis as typeof globalThis & {
    process?: { cwd: () => string }
  }).process
  if (runtimeProcess && source.startsWith('/')) {
    return `${runtimeProcess.cwd()}${source}`
  }
  return source
}
