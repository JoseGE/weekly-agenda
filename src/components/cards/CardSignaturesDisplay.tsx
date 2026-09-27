import type { CardFontSizes } from '@/lib/card-font-scale'
import { getSignatureImageSrc } from '@/lib/card-signature-images'
import {
  getVisibleCardSignatures,
  signatureShowsLine,
  signatureShowsName,
  signatureShowsTitle,
} from '@/lib/card-utils'
import type { ChurchCard } from '@/types'

interface CardSignaturesDisplayProps {
  card: ChurchCard
  sizes: CardFontSizes
}

export function CardSignaturesDisplay({ card, sizes }: CardSignaturesDisplayProps) {
  const signatures = getVisibleCardSignatures(card)
  if (signatures.length === 0) return null

  const single = signatures.length === 1
  const reserveImageSpace = signatures.some((signature) => getSignatureImageSrc(signature.name))

  return (
    <div
      className={`mt-14 flex w-full flex-wrap gap-x-6 gap-y-8 ${single ? 'justify-center' : 'justify-between'}`}
    >
      {signatures.map((signature) => (
        <div
          key={signature.id}
          className={`flex flex-col items-center text-center ${single ? 'w-full max-w-xs' : 'w-[30%] min-w-[30%]'}`}
        >
          {(() => {
            const imageSrc = getSignatureImageSrc(signature.name)
            if (imageSrc) {
              return (
                <img
                  src={imageSrc}
                  alt=""
                  className="mb-1 h-[88px] w-full object-contain object-bottom"
                />
              )
            }
            return reserveImageSpace ? <span className="h-[88px]" aria-hidden /> : null
          })()}
          {signatureShowsLine(signature) ? (
            <span className="mb-4 block h-0.5 w-full bg-stone-700" />
          ) : null}
          {signatureShowsName(signature) ? (
            <p
              className="break-words font-bold text-[#0f2d4a]"
              style={{ fontSize: sizes.signatureName }}
            >
              {signature.name.trim()}
            </p>
          ) : null}
          {signatureShowsTitle(signature) ? (
            <p
              className="mt-1 break-words text-stone-600"
              style={{ fontSize: sizes.signatureTitle }}
            >
              {signature.title?.trim()}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
