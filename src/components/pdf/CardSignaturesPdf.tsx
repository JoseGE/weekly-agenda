import { Image, Text, View } from '@react-pdf/renderer'
import type { CardPdfStyles } from '@/lib/card-document-styles'
import {
  getSignatureImageSrc,
  resolveSignatureImageSource,
} from '@/lib/card-signature-images'
import {
  getVisibleCardSignatures,
  signatureShowsLine,
  signatureShowsName,
  signatureShowsTitle,
} from '@/lib/card-utils'
import type { ChurchCard } from '@/types'

interface CardSignaturesPdfProps {
  card: ChurchCard
  styles: CardPdfStyles
}

export function CardSignaturesPdf({ card, styles }: CardSignaturesPdfProps) {
  const signatures = getVisibleCardSignatures(card)
  if (signatures.length === 0) return null

  const single = signatures.length === 1
  const reserveImageSpace = signatures.some((signature) => getSignatureImageSrc(signature.name))

  return (
    <View style={single ? [styles.signaturesWrap, styles.signaturesWrapSingle] : styles.signaturesWrap}>
      {signatures.map((signature) => (
        <View
          key={signature.id}
          style={single ? [styles.signatureBlock, styles.signatureBlockSingle] : styles.signatureBlock}
        >
          {(() => {
            const imageSrc = getSignatureImageSrc(signature.name)
            if (imageSrc) {
              return (
                <Image
                  src={resolveSignatureImageSource(imageSrc)}
                  style={styles.signatureImage}
                />
              )
            }
            return reserveImageSpace ? <View style={styles.signatureImageSpacer} /> : null
          })()}
          {signatureShowsLine(signature) ? <View style={styles.signatureLine} /> : null}
          {signatureShowsName(signature) ? (
            <Text style={styles.signatureName}>{signature.name.trim()}</Text>
          ) : null}
          {signatureShowsTitle(signature) ? (
            <Text style={styles.signatureTitle}>{signature.title?.trim()}</Text>
          ) : null}
        </View>
      ))}
    </View>
  )
}
