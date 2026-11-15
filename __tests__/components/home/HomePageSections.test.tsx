import React from 'react';
import { render, screen, within } from '@testing-library/react';
import HomePage from '@/app/[locale]/page';

jest.mock('next-intl', () => ({
  useTranslations: () => Object.assign((key: string) => key, { rich: (key: string) => key }),
  useLocale: () => 'en',
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(),
}));

jest.mock('@/lib/seo/jsonLd', () => ({
  breadcrumbSchema: () => ({}),
}));

jest.mock('@/lib/seo/canonical', () => ({
  buildAlternates: () => ({ canonical: '/', languages: {} }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('@/lib/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('@/components/layout/Header', () => ({
  Header: () => <div data-testid="header" />,
}));

jest.mock('@/components/layout/Footer', () => ({
  Footer: () => <div data-testid="footer" />,
}));

jest.mock('@/components/ui/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="container">{children}</div>
  ),
}));

jest.mock('@/components/HeroVideo', () => () => <div data-testid="hero-video" />);
jest.mock('@/components/ScrollIndicator', () => () => <div data-testid="scroll-indicator" />);
jest.mock('@/components/ScrollReveal', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@/components/BottomEmailCapture', () => () => <div data-testid="bottom-email" />);

jest.mock('@/components/features/tourGrid/TourGrid', () => ({
  TourGrid: () => <div data-testid="tour-grid" />,
}));

jest.mock('@/components/seo/JsonLd', () => ({
  JsonLd: () => null,
}));

describe('HomePage section flow', () => {
  it('renders the request-trip CTA in the video hero, before the tour grid', () => {
    const { container } = render(<HomePage />);
    const hero = container.querySelector('.hero-section') as HTMLElement;

    expect(within(hero).getByText('prompt')).toBeInTheDocument();
    expect(within(hero).getByRole('link', { name: 'requestCta' })).toHaveAttribute('href', '/anfragen');
    expect(within(hero).queryByTestId('bottom-email')).not.toBeInTheDocument();

    const tourGrid = screen.getByTestId('tour-grid');
    const DOCUMENT_POSITION_PRECEDING = 2;
    expect(tourGrid.compareDocumentPosition(hero) & DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  it('renders the next trip announcement in the waitlist section', () => {
    const { container } = render(<HomePage />);
    const waitlist = container.querySelector('#waitlist') as HTMLElement;

    expect(within(waitlist).getByRole('heading', { name: 'heading' })).toBeInTheDocument();
    expect(within(waitlist).getByText('continuesText')).toBeInTheDocument();
  });

  it('offers both the request-trip CTA and the waitlist capture in the waitlist section', () => {
    const { container } = render(<HomePage />);
    const waitlist = container.querySelector('#waitlist') as HTMLElement;

    expect(within(waitlist).getByRole('link', { name: 'requestCta' })).toHaveAttribute('href', '/anfragen');
    expect(within(waitlist).getByTestId('bottom-email')).toBeInTheDocument();
  });
});
