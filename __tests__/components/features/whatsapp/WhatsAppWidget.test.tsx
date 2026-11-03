/**
 * WhatsAppWidget Test Suite
 *
 * Uses the real German copy from messages/de.json through a tiny next-intl mock.
 *
 * @see components/features/whatsapp/WhatsAppWidget.tsx
 */

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WhatsAppWidget, pageKeyFor } from '@/components/features/whatsapp/WhatsAppWidget';
import { STORAGE_KEY, CONSENT_EVENT } from '@/components/features/cookie-consent/CookieBanner';
import de from '@/messages/de.json';

jest.mock('next-intl', () => {
  const messages = require('@/messages/de.json');
  const resolve = (path: string): unknown =>
    path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown>)?.[key], messages);

  return {
    useLocale: () => 'de',
    useTranslations: (namespace: string) => (key: string, values: Record<string, string> = {}) =>
      String(resolve(`${namespace}.${key}`) ?? key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? ''),
  };
});

let mockPathname = '/anfragen';
jest.mock('@/lib/i18n/routing', () => ({ usePathname: () => mockPathname }));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

jest.mock('posthog-js', () => ({ capture: jest.fn() }));

const copy = de.whatsapp;
const textOf = (link: HTMLElement) => new URL(link.getAttribute('href')!).searchParams.get('text');

const renderReady = () => {
  localStorage.setItem(STORAGE_KEY, 'accepted');
  return render(<WhatsAppWidget />);
};

describe('WhatsAppWidget', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPathname = '/anfragen';
  });

  it('stays hidden until the cookie banner is answered', () => {
    render(<WhatsAppWidget />);
    expect(screen.queryByRole('button', { name: copy.button.ariaLabel })).not.toBeInTheDocument();

    act(() => {
      localStorage.setItem(STORAGE_KEY, 'declined');
      window.dispatchEvent(new Event(CONSENT_EVENT));
    });

    expect(screen.getByRole('button', { name: copy.button.ariaLabel })).toBeInTheDocument();
  });

  it('opens the welcome card and focuses the first choice', async () => {
    renderReady();
    const toggle = screen.getByRole('button', { name: copy.button.ariaLabel });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: copy.card.name })).toBeVisible();
    expect(screen.getByText(copy.card.greeting)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.card.ask })).toHaveFocus();
  });

  it('pre-types the question with the current page and the trip template', async () => {
    renderReady();
    await userEvent.click(screen.getByRole('button', { name: copy.button.ariaLabel }));

    const ask = screen.getByRole('link', { name: copy.card.ask });
    const trip = screen.getByRole('link', { name: copy.card.trip });

    expect(ask).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\/4917631470193\?text=/));
    expect(ask).toHaveAttribute('target', '_blank');
    expect(textOf(ask)).toBe(copy.message.questionOnPage.replace('{page}', copy.pages.anfragen));
    expect(textOf(trip)).toBe(copy.message.trip);
  });

  it('uses the plain question on pages it cannot name', async () => {
    mockPathname = '/impressum';
    renderReady();
    await userEvent.click(screen.getByRole('button', { name: copy.button.ariaLabel }));

    expect(textOf(screen.getByRole('link', { name: copy.card.ask }))).toBe(copy.message.question);
  });

  it('closes on Escape and returns focus to the button', async () => {
    renderReady();
    const toggle = screen.getByRole('button', { name: copy.button.ariaLabel });
    await userEvent.click(toggle);

    await userEvent.keyboard('{Escape}');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('closes on a click outside', async () => {
    renderReady();
    const toggle = screen.getByRole('button', { name: copy.button.ariaLabel });
    await userEvent.click(toggle);

    await userEvent.click(document.body);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('pageKeyFor', () => {
  it.each([
    ['/', 'home'],
    ['/anfragen', 'anfragen'],
    ['/trails/sendero-del-tigre', 'trails'],
    ['/mtb-reisen/9-tage', 'mtbReisen'],
    ['/faqs', null],
    ['/impressum', null],
  ])('%s → %s', (pathname, key) => {
    expect(pageKeyFor(pathname)).toBe(key);
  });
});
