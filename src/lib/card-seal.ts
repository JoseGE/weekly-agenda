import sealSrc from '@/assets/sello-iglesia.png'

export const CARD_SEAL_SRC = sealSrc

/** Resuelve la ruta del sello para @react-pdf en pruebas y en el navegador. */
export function resolveCardSealSource(source: string = CARD_SEAL_SRC): string {
  const runtimeProcess = (globalThis as typeof globalThis & {
    process?: { cwd: () => string }
  }).process
  if (runtimeProcess && source.startsWith('/')) {
    return `${runtimeProcess.cwd()}${source}`
  }
  return source
}
