import { getFriendCardFontSizes } from '@/lib/friend-card-font-scale'
import { formatCardEventTime, getCardFontScale } from '@/lib/card-utils'
import { getFriendEventDateLabel } from '@/lib/card-layout'
import type { ChurchCard } from '@/types'

interface FriendCardShareImageProps {
  card: ChurchCard
  churchName: string
}

function LeafAccent({ side }: { side: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 80 220"
      aria-hidden
      className={`pointer-events-none absolute top-24 ${side === 'left' ? 'left-2' : 'right-2'} h-52 w-12 opacity-70`}
      style={{ transform: side === 'right' ? 'scaleX(-1)' : undefined }}
    >
      <path
        d="M40 10 C20 40, 10 90, 18 140 C26 180, 34 200, 40 210"
        fill="none"
        stroke="#8aa48a"
        strokeWidth="2"
      />
      <ellipse cx="24" cy="50" rx="10" ry="5" fill="#9cb89c" transform="rotate(-25 24 50)" />
      <ellipse cx="18" cy="85" rx="11" ry="5" fill="#a8c4a8" transform="rotate(-35 18 85)" />
      <ellipse cx="22" cy="120" rx="10" ry="5" fill="#9cb89c" transform="rotate(-20 22 120)" />
      <ellipse cx="30" cy="155" rx="9" ry="4" fill="#b5cdb5" transform="rotate(-15 30 155)" />
    </svg>
  )
}

function CalendarIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} className="mx-auto text-[#c47a2c]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function ClockIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} className="mx-auto text-[#c47a2c]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function HeartIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} className="mx-auto text-[#c47a2c]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z" />
    </svg>
  )
}

export function FriendCardShareImage({ card, churchName }: FriendCardShareImageProps) {
  const fontScale = getCardFontScale(card)
  const sizes = getFriendCardFontSizes(fontScale)
  const eventDateLabel = getFriendEventDateLabel(card)
  const eventTimeLabel = card.eventTime ? formatCardEventTime(card.eventTime) : ''
  const showEventRow = Boolean(eventDateLabel || eventTimeLabel)

  return (
    <div
      data-church-card-share
      className="relative box-border overflow-hidden bg-[#faf6ef] text-[#1a3348]"
      style={{
        width: 1080,
        minHeight: 1400,
        padding: 40,
        fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
      }}
    >
      <div
        className="relative flex min-h-[1320px] flex-col border-2 border-[#c47a2c] p-1"
        style={{ boxShadow: 'inset 0 0 0 1px #e8dcc8' }}
      >
        <div className="relative flex flex-1 flex-col px-12 py-10">
          <LeafAccent side="left" />
          <LeafAccent side="right" />

          <p
            className="text-center font-semibold tracking-wide text-[#1a3348]"
            style={{ fontSize: sizes.churchName }}
          >
            {churchName}
          </p>

          <div className="mt-5 flex justify-center">
            <span
              className="rounded-full bg-[#e8f0f7] px-5 py-1.5 font-semibold uppercase tracking-[0.2em] text-[#1a4d7c]"
              style={{ fontSize: sizes.badge }}
            >
              Invitación
            </span>
          </div>

          <h1
            className="mt-8 text-center font-semibold leading-tight text-[#1a3348]"
            style={{ fontSize: sizes.title }}
          >
            {card.title.trim() || 'Una invitación especial'}
          </h1>

          <div className="mx-auto mt-4 flex items-center gap-2 text-[#c47a2c]">
            <span className="h-px w-10 bg-[#d4a574]" />
            <span className="text-lg">✿</span>
            <span className="h-px w-10 bg-[#d4a574]" />
          </div>

          {card.greeting?.trim() ? (
            <p className="mt-8 text-center italic text-[#1a3348]" style={{ fontSize: sizes.greeting }}>
              {card.greeting.trim()}
            </p>
          ) : null}

          {card.body.trim() ? (
            <p
              className="mx-auto mt-5 max-w-3xl text-center leading-relaxed text-[#1a3348]"
              style={{ fontSize: sizes.body, lineHeight: 1.65 }}
            >
              {card.body.trim()}
            </p>
          ) : null}

          {card.quote?.trim() ? (
            <div
              className="relative mx-auto mt-8 max-w-3xl rounded-2xl border border-[#d4a574]/60 px-8 py-8 text-center"
              style={{
                fontSize: sizes.quote,
                background: 'linear-gradient(180deg, #f3f7fb 0%, #eef3f8 100%)',
              }}
            >
              <span className="absolute left-1/2 top-3 -translate-x-1/2 text-4xl leading-none text-[#c47a2c]">
                “
              </span>
              <p className="mt-4 italic leading-relaxed text-[#1a3348]">{card.quote.trim()}</p>
              {card.quoteReference?.trim() ? (
                <p className="mt-3 not-italic text-[#5a7085]" style={{ fontSize: sizes.quoteReference }}>
                  {card.quoteReference.trim()}
                </p>
              ) : null}
            </div>
          ) : null}

          {card.subtitle?.trim() ? (
            <p
              className="mt-8 text-center text-[#c47a2c]"
              style={{
                fontSize: sizes.scriptTitle,
                fontFamily: '"Great Vibes", cursive',
                lineHeight: 1.1,
              }}
            >
              {card.subtitle.trim()}
            </p>
          ) : null}

          {showEventRow ? (
            <div
              className="mx-auto mt-8 grid max-w-4xl grid-cols-3 overflow-hidden rounded-xl border-2 border-[#c47a2c]"
              style={{ fontSize: sizes.eventDetail }}
            >
              <div className="flex flex-col items-center justify-center border-r border-[#c47a2c]/40 px-5 py-6 text-center">
                <CalendarIcon size={sizes.eventIcon} />
                <p className="mt-3 font-medium leading-snug">{eventDateLabel || '—'}</p>
              </div>
              <div className="flex flex-col items-center justify-center border-r border-[#c47a2c]/40 px-5 py-6 text-center">
                <ClockIcon size={sizes.eventIcon} />
                <p className="mt-3 font-medium leading-snug">{eventTimeLabel || '—'}</p>
              </div>
              <div className="flex flex-col items-center justify-center px-5 py-6 text-center">
                <HeartIcon size={sizes.eventIcon} />
              </div>
            </div>
          ) : null}

          {card.closing?.trim() ? (
            <p className="mt-10 text-center text-[#1a3348]" style={{ fontSize: sizes.closing }}>
              {card.closing.trim()}
              <span className="ml-1 text-[#c47a2c]">♥</span>
            </p>
          ) : null}

          {card.friendSignature?.trim() ? (
            <div className="mt-6 text-center">
              <p
                className="text-[#1a3348]"
                style={{
                  fontSize: sizes.friendSignature,
                  fontFamily: '"Great Vibes", cursive',
                  lineHeight: 1,
                }}
              >
                {card.friendSignature.trim()}
              </p>
              <div className="mx-auto mt-1 h-px w-48 bg-[#1a3348]/70" />
            </div>
          ) : null}

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(255,248,220,0.35) 35%, rgba(255,220,150,0.25) 100%)',
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, #ffd27a 0%, transparent 70%)' }}
          />
        </div>
      </div>
    </div>
  )
}
