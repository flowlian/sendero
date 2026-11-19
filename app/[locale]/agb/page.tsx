import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/ui/Container';

interface AgbClause {
  number?: string;
  lead?: string;
  text: string;
  tableHeaders?: [string, string];
  table?: { label: string; value: string }[];
}

interface AgbSection {
  title: string;
  clauses: AgbClause[];
}

export default function AgbPage() {
  const t = useTranslations('agb');
  const scopeParagraphs = t.raw('scope.paragraphs') as string[];
  const sections = t.raw('sections') as AgbSection[];
  const organizerLines = t.raw('organizer.lines') as string[];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1 pt-[116px]">
        <section className="py-16 md:py-24">
          <Container>
            <div className="max-w-text flex flex-col gap-8">

              {/* Title */}
              <h1 className="text-h1 font-bold text-foreground">{t('title')}</h1>

              {/* Content */}
              <div className="flex flex-col gap-6 text-body text-foreground leading-relaxed">

                <div className="flex flex-col gap-2">
                  <h2 className="font-bold">{t('scope.title')}</h2>
                  {scopeParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                {sections.map((section) => (
                  <div key={section.title} className="flex flex-col gap-2">
                    <h2 className="font-bold">{section.title}</h2>
                    {section.clauses.map((clause, index) => (
                      <div key={clause.number ?? index} className="flex flex-col gap-2">
                        <p>
                          {clause.number && <span className="font-bold">{clause.number} </span>}
                          {clause.lead && <span className="font-bold">{clause.lead}: </span>}
                          {clause.text}
                        </p>
                        {clause.table && clause.tableHeaders && (
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-border bg-white text-left">
                              <thead>
                                <tr>
                                  <th className="text-body-em border border-border p-3">{clause.tableHeaders[0]}</th>
                                  <th className="text-body-em border border-border p-3">{clause.tableHeaders[1]}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {clause.table.map((row) => (
                                  <tr key={row.label}>
                                    <td className="text-body border border-border p-3">{row.label}</td>
                                    <td className="text-body border border-border p-3">{row.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <div className="flex flex-col gap-1">
                  <h2 className="font-bold">{t('organizer.title')}</h2>
                  {organizerLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                <p>{t('lastUpdated')}</p>

              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
