import type { Metadata } from 'next';
import { useLocale, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/ui/Container';
import HeroVideo from '@/components/HeroVideo';
import HeroTitle from '@/components/HeroTitle';
import ScrollReveal from '@/components/ScrollReveal';
import BottomEmailCapture from '@/components/BottomEmailCapture';
import { RequestTripCta } from '@/components/RequestTripCta';
import { TourGrid } from '@/components/features/tourGrid/TourGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/jsonLd';
import { buildAlternates, ogImages } from '@/lib/seo/canonical';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const alternates = buildAlternates(locale, '');
  return {
    title: t('title'),
    description: t('description'),
    alternates,
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: alternates.canonical,
      images: ogImages,
    },
  };
}

export default function HomePage() {
  const locale = useLocale();
  const tHero = useTranslations('hero');
  const tHeroIntro = useTranslations('heroIntro');
  const tNextTrips = useTranslations('nextTrips');
  const tTourGrid = useTranslations('tourGrid');
  const tHeader = useTranslations('header');
  const tTrails = useTranslations('trails.master');

  const breadcrumbs = breadcrumbSchema(locale, [
    { name: tHeader('brandName'), path: '' },
  ]);
  // ItemList of all surfaced tours so AI/SEO crawlers can discover trail names.
  const tourCardKeys = ['guadua', 'cafe', 'agua', 'volcan', 'cacao', 'paramo', 'tigre', 'oro'];
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: tTrails('title'),
    itemListElement: tourCardKeys.map((key, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tTourGrid(`cards.${key}.name`),
    })),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={[breadcrumbs, itemList]} />
      <Header />
      <main id="main-content" className="flex-1">
        {/* Hero Section - Full Screen */}
        <section className="relative h-[100svh] min-h-[100svh] bg-black flex flex-col overflow-hidden hero-section">
          {/* Background Video */}
          <HeroVideo />

          {/* Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 text-center px-6 sm:px-10 lg:px-16">
            <HeroTitle title={tHero('title')} />
            {/* Trip inquiry CTA */}
            <div className="flex w-full flex-col items-center gap-6">
              <p className="text-h3 font-light leading-8 tracking-wide text-white">
                {tHero('prompt')}
              </p>
              <RequestTripCta label={tNextTrips('requestCta')} source="home_hero" />
            </div>
          </div>
        </section>

        {/* Hero Intro Section */}
        <ScrollReveal>
          <section className="self-stretch bg-foreground py-20">
            <Container className="flex flex-col items-center justify-center gap-8">
              <div className="text-center max-w-heading flex flex-col gap-2">
                <h2 className="text-h2 font-bold text-white">
                  {tHeroIntro('heading')}
                </h2>
                <p className="text-h2 font-light text-white">
                  {tHeroIntro('subheading')
                    .split(/\.\s+/)
                    .filter(Boolean)
                    .map((sentence, i, arr) => {
                      const trimmed = sentence.trim();
                      const needsPeriod = !trimmed.endsWith('.');
                      return (
                        <span key={i} className="block sm:inline">
                          {trimmed}
                          {needsPeriod ? '.' : ''}
                          {i < arr.length - 1 ? ' ' : ''}
                        </span>
                      );
                    })}
                </p>
              </div>
              <svg width="72" height="16" viewBox="0 0 72 16" fill="none" aria-hidden="true" className="text-accent-400">
                <path
                  d="M2 10 C10 2, 18 14, 26 10 C34 6, 42 2, 50 10 C58 14, 66 6, 70 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="text-center max-w-heading">
                <p className="text-h3 font-light leading-8 tracking-wide text-background">
                  {tHeroIntro('subtitle')}
                </p>
              </div>
            </Container>
          </section>
        </ScrollReveal>

        {/* Tour Grid Section */}
        <ScrollReveal>
          <section className="bg-gray-100 py-16 md:py-24">
            <Container>
              <TourGrid
                cards={[
                  {
                    id: 'guadua',
                    title: tTourGrid('cards.guadua.name'),
                    imageSrc: '/tours/sendero_guadua.webp',
                    imageAlt: tTourGrid('cards.guadua.name'),
                    description: tTourGrid('cards.guadua.description'),
                    distance: tTourGrid('cards.guadua.distance'),
                    difficulty: tTourGrid('cards.guadua.difficulty'),
                    elevation: tTourGrid('cards.guadua.elevation'),
                    elevationGain: tTourGrid('cards.guadua.elevationGain'),
                  },
                  {
                    id: 'cafe',
                    title: tTourGrid('cards.cafe.name'),
                    imageSrc: '/tours/sendero_cafe.webp',
                    imageAlt: tTourGrid('cards.cafe.name'),
                    description: tTourGrid('cards.cafe.description'),
                    distance: tTourGrid('cards.cafe.distance'),
                    difficulty: tTourGrid('cards.cafe.difficulty'),
                    elevation: tTourGrid('cards.cafe.elevation'),
                    elevationGain: tTourGrid('cards.cafe.elevationGain'),
                  },
                  {
                    id: 'agua',
                    title: tTourGrid('cards.agua.name'),
                    imageSrc: '/tours/sendero_agua.webp',
                    imageAlt: tTourGrid('cards.agua.name'),
                    description: tTourGrid('cards.agua.description'),
                    distance: tTourGrid('cards.agua.distance'),
                    difficulty: tTourGrid('cards.agua.difficulty'),
                    elevation: tTourGrid('cards.agua.elevation'),
                    elevationGain: tTourGrid('cards.agua.elevationGain'),
                  },
                  {
                    id: 'volcan',
                    title: tTourGrid('cards.volcan.name'),
                    imageSrc: '/tours/sendero_volcan.webp',
                    imageAlt: tTourGrid('cards.volcan.name'),
                    description: tTourGrid('cards.volcan.description'),
                    distance: tTourGrid('cards.volcan.distance'),
                    difficulty: tTourGrid('cards.volcan.difficulty'),
                    elevation: tTourGrid('cards.volcan.elevation'),
                    elevationGain: tTourGrid('cards.volcan.elevationGain'),
                  },
                  {
                    id: 'cacao',
                    title: tTourGrid('cards.cacao.name'),
                    imageSrc: '/tours/sendero_cacao.webp',
                    imageAlt: tTourGrid('cards.cacao.name'),
                    description: tTourGrid('cards.cacao.description'),
                    distance: tTourGrid('cards.cacao.distance'),
                    difficulty: tTourGrid('cards.cacao.difficulty'),
                    elevation: tTourGrid('cards.cacao.elevation'),
                    elevationGain: tTourGrid('cards.cacao.elevationGain'),
                  },
                  {
                    id: 'paramo',
                    title: tTourGrid('cards.paramo.name'),
                    imageSrc: '/tours/sendero_paramo.webp',
                    imageAlt: tTourGrid('cards.paramo.name'),
                    description: tTourGrid('cards.paramo.description'),
                    distance: tTourGrid('cards.paramo.distance'),
                    difficulty: tTourGrid('cards.paramo.difficulty'),
                    elevation: tTourGrid('cards.paramo.elevation'),
                    elevationGain: tTourGrid('cards.paramo.elevationGain'),
                  },
                  {
                    id: 'tigre',
                    title: tTourGrid('cards.tigre.name'),
                    imageSrc: '/tours/sendero-tigre.webp',
                    imageAlt: tTourGrid('cards.tigre.name'),
                    description: tTourGrid('cards.tigre.description'),
                    distance: tTourGrid('cards.tigre.distance'),
                    difficulty: tTourGrid('cards.tigre.difficulty'),
                    elevation: tTourGrid('cards.tigre.elevation'),
                    elevationGain: tTourGrid('cards.tigre.elevationGain'),
                  },
                  {
                    id: 'oro',
                    title: tTourGrid('cards.oro.name'),
                    imageSrc: '/tours/sendero_oro.webp',
                    imageAlt: tTourGrid('cards.oro.name'),
                    description: tTourGrid('cards.oro.description'),
                    distance: tTourGrid('cards.oro.distance'),
                    difficulty: tTourGrid('cards.oro.difficulty'),
                    elevation: tTourGrid('cards.oro.elevation'),
                    elevationGain: tTourGrid('cards.oro.elevationGain'),
                  },
                ]}
              />
            </Container>
          </section>
        </ScrollReveal>

        {/* Next Trips + Waitlist Section - Bottom of Page */}
        <ScrollReveal delay={200}>
          <section id="waitlist" className="relative min-h-[100svh] py-20 flex flex-col items-center justify-center overflow-hidden cta-section">
            {/* Background image */}
            <div className="absolute inset-0 -z-10">
              <Image
                src="/cta-pioneer.png"
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/70" />
            </div>

            {/* Content */}
            <Container className="relative z-10 text-center flex flex-col items-center">
              <h2 className="text-h1 font-bold text-white mb-10">
                {tNextTrips('heading')}
              </h2>

              <p className="mb-10 max-w-heading text-h3 font-light leading-8 tracking-wide text-background">
                {tNextTrips('continuesText')}
              </p>

              {/* CTAs: trip inquiry (primary) + waitlist email capture (secondary) */}
              <div className="max-w-md mx-auto flex flex-col items-center gap-12">
                <RequestTripCta label={tNextTrips('requestCta')} source="home_next_trips" />
                <BottomEmailCapture
                  buttonLabel={tNextTrips('waitlistCta')}
                  buttonVariant="hero-cta-secondary"
                  buttonClassName="w-[260px]"
                />
              </div>
            </Container>
          </section>
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}
