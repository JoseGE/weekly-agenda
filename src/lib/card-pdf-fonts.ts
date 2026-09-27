import { Font } from '@react-pdf/renderer'
import sourceSansRegular from '@/assets/card-fonts/SourceSans3-Regular.ttf'
import sourceSansItalic from '@/assets/card-fonts/SourceSans3-It.ttf'
import sourceSansBold from '@/assets/card-fonts/SourceSans3-Bold.ttf'
import sourceSansBoldItalic from '@/assets/card-fonts/SourceSans3-BoldIt.ttf'
import playfairRegular from '@/assets/card-fonts/PlayfairDisplay-Regular.ttf'
import playfairItalic from '@/assets/card-fonts/PlayfairDisplay-Italic.ttf'
import playfairBold from '@/assets/card-fonts/PlayfairDisplay-Bold.ttf'
import playfairBoldItalic from '@/assets/card-fonts/PlayfairDisplay-BoldItalic.ttf'
import cormorantRegular from '@/assets/card-fonts/CormorantGaramond-Regular.ttf'
import cormorantItalic from '@/assets/card-fonts/CormorantGaramond-Italic.ttf'
import cormorantBold from '@/assets/card-fonts/CormorantGaramond-Bold.ttf'
import cormorantBoldItalic from '@/assets/card-fonts/CormorantGaramond-BoldItalic.ttf'

let registered = false

function resolveFontSource(source: string): string {
  const runtimeProcess = (globalThis as typeof globalThis & {
    process?: { cwd: () => string }
  }).process
  if (runtimeProcess && source.startsWith('/')) {
    return `${runtimeProcess.cwd()}${source}`
  }
  return source
}

export function registerCardPdfFonts() {
  if (registered) return
  registered = true

  Font.register({
    family: 'CardSourceSans',
    fonts: [
      { src: resolveFontSource(sourceSansRegular), fontWeight: 400, fontStyle: 'normal' },
      { src: resolveFontSource(sourceSansItalic), fontWeight: 400, fontStyle: 'italic' },
      { src: resolveFontSource(sourceSansBold), fontWeight: 700, fontStyle: 'normal' },
      { src: resolveFontSource(sourceSansBoldItalic), fontWeight: 700, fontStyle: 'italic' },
    ],
  })
  Font.register({
    family: 'CardPlayfair',
    fonts: [
      { src: resolveFontSource(playfairRegular), fontWeight: 400, fontStyle: 'normal' },
      { src: resolveFontSource(playfairItalic), fontWeight: 400, fontStyle: 'italic' },
      { src: resolveFontSource(playfairBold), fontWeight: 700, fontStyle: 'normal' },
      { src: resolveFontSource(playfairBoldItalic), fontWeight: 700, fontStyle: 'italic' },
    ],
  })
  Font.register({
    family: 'CardCormorant',
    fonts: [
      { src: resolveFontSource(cormorantRegular), fontWeight: 400, fontStyle: 'normal' },
      { src: resolveFontSource(cormorantItalic), fontWeight: 400, fontStyle: 'italic' },
      { src: resolveFontSource(cormorantBold), fontWeight: 700, fontStyle: 'normal' },
      { src: resolveFontSource(cormorantBoldItalic), fontWeight: 700, fontStyle: 'italic' },
    ],
  })
}
