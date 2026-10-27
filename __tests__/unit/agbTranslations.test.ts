import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';
import esMessages from '@/messages/es.json';

const locales = { de: deMessages.agb, en: enMessages.agb, es: esMessages.agb };

/** Clause numbers per section, e.g. [['1.1', '1.2'], …]; unnumbered clauses show as null. */
function clauseNumbers(agb: typeof deMessages.agb) {
  return agb.sections.map((section) =>
    section.clauses.map((clause) => ('number' in clause ? clause.number : null))
  );
}

describe('agb translations', () => {
  it('has the same sections and clause numbers in de, en and es', () => {
    const deNumbers = clauseNumbers(deMessages.agb);
    expect(clauseNumbers(enMessages.agb)).toEqual(deNumbers);
    expect(clauseNumbers(esMessages.agb)).toEqual(deNumbers);
  });

  it('has the cancellation table with the same rates in every locale', () => {
    const rates = (agb: typeof deMessages.agb) =>
      agb.sections
        .flatMap((section) => section.clauses)
        .flatMap((clause) => ('table' in clause ? (clause.table as { value: string }[]) : []))
        .map((row) => row.value.replace(/\s/g, ''));
    expect(rates(deMessages.agb)).toEqual(['20%', '30%', '50%', '70%', '85%', '90%']);
    expect(rates(enMessages.agb)).toEqual(rates(deMessages.agb));
    expect(rates(esMessages.agb)).toEqual(rates(deMessages.agb));
  });

  it.each(Object.entries(locales))('has notice, scope and organizer copy in %s', (_, agb) => {
    expect(agb.notice.title).not.toBe('');
    expect(agb.notice.text).toContain('julian@senderobiketrails.com');
    expect(agb.scope.paragraphs).toHaveLength(deMessages.agb.scope.paragraphs.length);
    expect(agb.organizer.lines).toHaveLength(deMessages.agb.organizer.lines.length);
  });
});
