import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ChurchCard } from '@/types'

interface FriendCardEditorFieldsProps {
  card: ChurchCard
  onSave: (updates: Partial<ChurchCard>) => void
}

export function FriendCardEditorFields({ card, onSave }: FriendCardEditorFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="friend-title">Título</Label>
        <Input
          id="friend-title"
          value={card.title}
          onChange={(e) => onSave({ title: e.target.value })}
          placeholder="Una invitación especial"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="friend-greeting">Saludo</Label>
        <Input
          id="friend-greeting"
          value={card.greeting ?? ''}
          onChange={(e) => onSave({ greeting: e.target.value })}
          placeholder="Querido amigo, querida amiga:"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="friend-body">Mensaje</Label>
        <Textarea
          id="friend-body"
          value={card.body}
          onChange={(e) => onSave({ body: e.target.value })}
          rows={4}
          className="leading-relaxed"
        />
      </div>

      <div className="space-y-4 rounded-lg border border-[#d4a574]/40 bg-[#faf6ef]/80 p-4">
        <p className="text-sm font-semibold text-navy-dark">Cita bíblica</p>
        <div className="space-y-2">
          <Label htmlFor="friend-quote">Texto</Label>
          <Textarea
            id="friend-quote"
            value={card.quote ?? ''}
            onChange={(e) => onSave({ quote: e.target.value })}
            rows={2}
            className="italic"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="friend-quote-ref">Referencia</Label>
          <Input
            id="friend-quote-ref"
            value={card.quoteReference ?? ''}
            onChange={(e) => onSave({ quoteReference: e.target.value })}
            placeholder="Juan 10:10b"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="friend-script-title">Nombre del evento (cursiva)</Label>
        <Input
          id="friend-script-title"
          value={card.subtitle ?? ''}
          onChange={(e) => onSave({ subtitle: e.target.value })}
          placeholder="Campaña Juvenil"
          className="font-[family-name:var(--font-display)] italic"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="friend-event-dates">Fechas del evento</Label>
          <Input
            id="friend-event-dates"
            value={card.eventDateLabel ?? ''}
            onChange={(e) => onSave({ eventDateLabel: e.target.value })}
            placeholder="12, 13 y 14 de agosto de 2026"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="friend-event-time">Hora</Label>
          <Input
            id="friend-event-time"
            type="time"
            value={card.eventTime ?? ''}
            onChange={(e) => onSave({ eventTime: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="friend-closing">Cierre</Label>
        <Input
          id="friend-closing"
          value={card.closing ?? ''}
          onChange={(e) => onSave({ closing: e.target.value })}
          placeholder="Te espero con amor."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="friend-signature">Firma (cursiva)</Label>
        <Input
          id="friend-signature"
          value={card.friendSignature ?? ''}
          onChange={(e) => onSave({ friendSignature: e.target.value })}
          placeholder="Jesús"
          className="italic"
        />
      </div>
    </>
  )
}
