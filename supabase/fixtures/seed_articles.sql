-- Fixture articles for local/dev testing. Run AFTER the articles migration.
--
-- The PDF row references an object in the private 'articles' bucket; upload
-- the fixture file first (Storage → articles → create folder 'pdf'):
--   supabase/fixtures/global-south-primer.pdf  →  pdf/global-south-primer.pdf
-- The markdown original can be uploaded too (source of record):
--   supabase/fixtures/what-are-emerging-markets.md  →  md/what-are-emerging-markets.md
--
-- Both rows are seeded as published so /articles shows them immediately.

insert into public.articles
  (slug, title, subtitle, author, summary, tags, source_type, storage_path, content_md, reading_minutes, status, published_at, created_by)
values
(
  'what-are-emerging-markets',
  'What Are Emerging Markets, Actually?',
  null,
  'EMN Editorial Team',
  'A primer on what qualifies an economy as "emerging", why the label is contested, and why it matters for investors and policymakers alike.',
  array['primer', 'economics'],
  'markdown',
  'md/what-are-emerging-markets.md',
  $md$## The label everyone uses and nobody agrees on

"Emerging market" is one of the most-used and least-defined terms in finance. Coined at the International Finance Corporation in 1981 as a friendlier alternative to "third world", it now covers everything from South Korea's chip fabs to frontier equity markets with a handful of listed companies.

Index providers can't agree either. MSCI classifies **24 countries** as emerging; FTSE Russell counts differently, and South Korea sits in *developed* for FTSE but *emerging* for MSCI. The label is a judgement about market accessibility as much as income.

## What the definitions share

Most frameworks look at some mix of:

- **Income per capita** — below high-income thresholds, but growing quickly
- **Market accessibility** — can foreign capital get in *and out*?
- **Institutional depth** — settlement systems, custody, disclosure standards
- **Liquidity** — enough turnover that an index fund can actually track the index

> The paradox of the asset class: the moment a market finishes "emerging", it graduates out of the index — so the index is permanently a collection of works-in-progress.

## Why it matters

Emerging economies now account for roughly half of global GDP on a purchasing-power basis and the large majority of global growth. For students of finance, economics or politics, that means the interesting questions — demographic dividends, resource curses, currency crises, industrial policy — mostly live here.

| Question | Where it plays out |
| --- | --- |
| Can industrial policy still work? | Vietnam, India, Indonesia |
| What does de-dollarisation look like? | BRICS payment systems |
| How do you exit the middle-income trap? | Malaysia, Brazil, Türkiye |

## Further reading

Start with the IMF's *World Economic Outlook* database and the MSCI market-classification review — both free, both primary sources. Then come to an [EMN event](https://emnunimelb.com/events) and argue about it in person.$md$,
  4,
  'published',
  '2026-07-01T09:00:00+10:00',
  'seed'
),
(
  'global-south-primer',
  'The Global South Primer',
  'A one-page fixture PDF',
  'EMN Editorial Team',
  'Fixture PDF article demonstrating the embedded reader with EMN page chrome.',
  array['primer'],
  'pdf',
  'pdf/global-south-primer.pdf',
  null,
  null,
  'published',
  '2026-07-08T09:00:00+10:00',
  'seed'
)
on conflict (slug) do nothing;
