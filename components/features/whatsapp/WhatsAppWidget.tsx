'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FaWhatsapp } from 'react-icons/fa6';
import { X } from 'lucide-react';
import posthog from 'posthog-js';
import { usePathname } from '@/lib/i18n/routing';
import { buildWhatsAppUrl } from '@/lib/contact';
import { STORAGE_KEY, CONSENT_EVENT } from '@/components/features/cookie-consent/CookieBanner';

const PORTRAIT_SRC = '/images/anfragen/julian-portrait.jpg';

type PageKey = 'home' | 'anfragen' | 'mtbReisen' | 'trails' | 'faq' | 'about' | 'contact';

const PAGE_PREFIXES: [string, PageKey][] = [
  ['/anfragen', 'anfragen'],
  ['/mtb-reisen', 'mtbReisen'],
  ['/trails', 'trails'],
  ['/faq', 'faq'],
  ['/about', 'about'],
  ['/contact', 'contact'],
];

/** Maps a locale-less pathname to a page we can name in the pre-typed message */
export function pageKeyFor(pathname: string): PageKey | null {
  if (pathname === '/' || pathname === '') return 'home';
  const match = PAGE_PREFIXES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match ? match[1] : null;
}

const choiceBase =
  'flex h-[42px] w-full items-center justify-center rounded-component-button px-6 text-caption font-medium uppercase leading-tight tracking-[0.06em] transition-[color,background-color,scale] duration-fast ease-out-strong motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

/**
 * WhatsApp welcome widget
 *
 * Floating button on every page that opens a short welcome from Julian with
 * two ways in: ask a question or request a trip. Each opens WhatsApp with a
 * message already typed in the visitor's language. Stays hidden until the
 * cookie banner has been answered, since both share the bottom edge.
 */
export function WhatsAppWidget() {
  const t = useTranslations('whatsapp');
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstChoiceRef = useRef<HTMLAnchorElement>(null);
  const cardId = useId();
  const titleId = useId();

  useEffect(() => {
    const check = () => setReady(Boolean(localStorage.getItem(STORAGE_KEY)));
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  useEffect(() => {
    if (!open) return;
    firstChoiceRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  if (!ready) return null;

  const pageKey = pageKeyFor(pathname);
  const questionText = pageKey
    ? t('message.questionOnPage', { page: t(`pages.${pageKey}`) })
    : t('message.question');

  const toggle = () => {
    if (!open) posthog.capture('whatsapp_widget_opened', { path: pathname });
    setOpen((value) => !value);
  };

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  const startChat = (intent: 'question' | 'trip') => {
    posthog.capture('whatsapp_chat_started', { intent, path: pathname });
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      <div
        id={cardId}
        role="dialog"
        aria-labelledby={titleId}
        aria-hidden={!open}
        inert={!open}
        className={`absolute bottom-[72px] right-0 w-[min(320px,calc(100vw-48px))] origin-bottom-right rounded-md border border-gray-300 bg-white p-5 shadow-lg transition-[opacity,scale] duration-200 ease-out-strong motion-reduce:transition-opacity ${
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0 motion-reduce:scale-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <Image
            src={PORTRAIT_SRC}
            alt=""
            width={40}
            height={40}
            sizes="40px"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
          <p id={titleId} className="min-w-0 flex-1 text-sm font-bold text-foreground">
            {t('card.name')}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label={t('card.close')}
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-silver transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground">{t('card.greeting')}</p>

        <div className="mt-5 flex flex-col gap-2">
          <a
            ref={firstChoiceRef}
            href={buildWhatsAppUrl(questionText)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => startChat('question')}
            className={`${choiceBase} border border-primary-500 text-primary-500 hover:bg-primary-500/10`}
          >
            {t('card.ask')}
          </a>
          <a
            href={buildWhatsAppUrl(t('message.trip'))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => startChat('trip')}
            className={`${choiceBase} bg-primary-500 text-accent-400 hover:bg-river-forest`}
          >
            {t('card.trip')}
          </a>
        </div>

        <p className="mt-4 text-center text-xs text-silver">{t('card.hint')}</p>
      </div>

      <button
        ref={toggleRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={cardId}
        aria-label={t('button.ariaLabel')}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-accent-400 shadow-lg transition-[background-color,scale] duration-fast ease-out-strong hover:bg-river-forest motion-safe:active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <FaWhatsapp className="h-7 w-7" aria-hidden="true" />}
      </button>
    </div>
  );
}
