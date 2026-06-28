const fs = require('fs');

const pages = fs.readdirSync('.').filter((file) => file.endsWith('.html'));

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pageStats(file) {
  const html = fs.readFileSync(file, 'utf8');
  const text = stripHtml(html);
  const longParagraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)]
    .map((match) => stripHtml(match[1]))
    .filter((paragraph) => paragraph.length > 520);

  return {
    file,
    words: text ? text.split(' ').length : 0,
    h1: (html.match(/<h1\b/g) || []).length,
    h2: (html.match(/<h2\b/g) || []).length,
    h3: (html.match(/<h3\b/g) || []).length,
    paragraphs: (html.match(/<p\b/g) || []).length,
    tables: (html.match(/<table\b/g) || []).length,
    images: (html.match(/<img\b/g) || []).length,
    cta: (html.match(/class="[^"]*(button|cta|premium-audience-cta)[^"]*"/g) || []).length,
    faq: /faq|questions/i.test(html),
    inPageNav: html.includes('in-page-nav'),
    decision: html.includes('premium-decision-strip'),
    audienceCta: html.includes('premium-audience-cta'),
    metaDescription: /<meta name="description" content="[^"]{80,190}"/.test(html),
    og: html.includes('property="og:title"') && html.includes('property="og:description"'),
    canonical: html.includes('rel="canonical"'),
    lang: html.includes('<html lang="fr"'),
    badAlt: [...html.matchAll(/<img\b[^>]*>/g)].filter((match) => !/\salt="[^"]+"/.test(match[0])).length,
    longParagraphs: longParagraphs.length,
  };
}

const stats = pages.map(pageStats);
const weak = stats
  .filter((page) => (
    page.h1 !== 1 ||
    !page.metaDescription ||
    !page.og ||
    !page.canonical ||
    !page.lang ||
    page.badAlt ||
    page.longParagraphs ||
    page.cta < 2 ||
    (page.words > 800 && page.tables === 0 && !page.faq)
  ))
  .sort((a, b) => b.longParagraphs - a.longParagraphs || b.words - a.words);

const termList = [
  'à venir',
  'en préparation',
  'partenaires à officialiser',
  'future connexion',
  'placeholder',
  'lorem',
  'TODO',
  'publiér',
  'planifi&eacute;es couches',
  'texte blanc',
];

const terms = Object.fromEntries(termList.map((term) => [term, []]));
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8').toLowerCase();
  for (const term of termList) {
    if (html.includes(term.toLowerCase())) {
      terms[term].push(file);
    }
  }
}

const summary = {
  pages: pages.length,
  withDecision: stats.filter((page) => page.decision).length,
  withAudienceCta: stats.filter((page) => page.audienceCta).length,
  withFaq: stats.filter((page) => page.faq).length,
  withInPageNav: stats.filter((page) => page.inPageNav).length,
  seoIssues: stats.filter((page) => page.h1 !== 1 || !page.metaDescription || !page.og || !page.canonical || !page.lang || page.badAlt).length,
  longParagraphPages: stats.filter((page) => page.longParagraphs > 0).length,
  lowCtaPages: stats.filter((page) => page.cta < 2).length,
  weakPages: weak.slice(0, 30),
  termHits: Object.fromEntries(Object.entries(terms).map(([term, files]) => [term, files.length])),
};

console.log(JSON.stringify(summary, null, 2));
