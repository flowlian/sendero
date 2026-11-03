# WhatsApp flow

How a visitor gets from the website into a chat with Julian, and what to set up in
the WhatsApp Business app so the first reply feels personal.

## On the website

`components/features/whatsapp/WhatsAppWidget.tsx` (mounted in `app/[locale]/layout.tsx`)

1. A round river-green button sits bottom-right on every page. It appears once the
   cookie banner has been answered (both use the bottom edge).
2. Tapping it opens a welcome card: Julian's portrait, a two-sentence greeting, and
   two choices.
3. **Ask a question** opens WhatsApp with the message already typed, naming the page
   the visitor came from, e.g. *"Hola Julian! Ich habe mir gerade die Anfrageseite auf
   Deiner Website angesehen und habe eine Frage:"*. Pages that aren't mapped in
   `pageKeyFor` get the plain *"Hola Julian! Ich habe eine Frage:"*.
4. **Request a trip** opens WhatsApp with a short template that mirrors the `/anfragen`
   form, so the first message already holds what's needed:

   ```
   Hola Julian! Ich möchte eine Reise anfragen.
   Wann ungefähr:
   Wie viele Personen:
   Mein Fahrniveau:
   ```

Everything is in the visitor's language (`whatsapp` namespace in `messages/*.json`).
The number lives in `lib/contact.ts` (`WHATSAPP_NUMBER`). The contact page uses it too.

**PostHog events:** `whatsapp_widget_opened { path }` and
`whatsapp_chat_started { intent: 'question' | 'trip', path }`. Compare the two to see
how many people open the card and then actually start a chat.

**Privacy:** the `datenschutz` page has a WhatsApp section. No data goes to Meta until
the visitor taps a choice. *Have the lawyer check this text along with the AGB.*

## In the WhatsApp Business app

Settings → Business tools. These replies are written by hand in the sendero voice.
Replace anything in `[brackets]` with real figures before saving.

### Greeting message
*Send to: everyone who writes for the first time, or after 14 days without contact.*
WhatsApp allows only one greeting, so it covers all three languages in a few lines:

> Hola! 🌿 This is Julian from sendero bike trails – thanks for writing. I read every
> message myself and reply as soon as I'm back from the trail.
> Danke für Deine Nachricht – ich melde mich persönlich bei Dir.
> ¡Gracias por escribir! Te respondo personalmente muy pronto.

### Away message
*Send: outside your business hours (set the schedule that fits Berlin + Colombia).*

> Hola! I'm probably out in the mountains right now 🚲 I've got your message and
> I'll answer personally soon.
> Gerade bin ich unterwegs – ich antworte Dir bald.
> Ahora estoy en la montaña – te escribo pronto.

### Quick replies
Type `/` in a chat to insert them. Keep one per language.

| shortcut | language | text |
|---|---|---|
| `/reise` | DE | Wie schön, dass Du mitkommen willst! Die nächste Reise: [Termine], 9 Tage, kleine Gruppe von [x–y] Personen. Alles in Ruhe findest Du hier: senderobiketrails.com/de/anfragen – oder erzähl mir einfach hier, wann Du Zeit hast und wie viel Du fährst. |
| `/trip` | EN | So glad you want to come along! Next trip: [dates], 9 days, a small group of [x–y]. The details are here: senderobiketrails.com/en/anfragen – or just tell me here when you're free and how much you ride. |
| `/viaje` | ES | ¡Qué chévere que quieras venir! Próximo viaje: [fechas], 9 días, grupo pequeño de [x–y] personas. Los detalles están aquí: senderobiketrails.com/es/anfragen – o cuéntame por aquí cuándo tienes tiempo y cuánto montas. |
| `/level` | DE/EN/ES | The three riding levels as on the /anfragen page ("LevelInfo"), with real km and elevation per day: [km / hm]. |
| `/preise` | DE/EN/ES | Price per person [€], what's included [list] and what isn't [list]. Real figures only. |

### Labels
Sort every new chat as soon as you read it:

- **Frage / Question**: started with "Ask a question"
- **Reiseanfrage / Trip request**: started with "Request a trip"
- **Angebot gesendet / Offer sent**
- **Gebucht / Booked**

Since the opening line of the pre-typed message is different for each choice, you can
tell them apart at a glance.

## Changing things

- **Different number:** edit `WHATSAPP_NUMBER` in `lib/contact.ts`.
- **New page name in the question message:** add the route to `PAGE_PREFIXES` in the
  widget and a `whatsapp.pages.<key>` string in all three `messages/*.json` files.
- **Copy:** `whatsapp.card.*` (welcome card) and `whatsapp.message.*` (pre-typed text).
  Write each language with the same intent, not word for word.
