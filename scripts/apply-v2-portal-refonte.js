const fs = require("fs");
const path = require("path");

const root = process.cwd();
const architecturePath = path.join(root, "PUBLIC_ARCHITECTURE.md");
const stylesPath = path.join(root, "styles.css");
const minStylesPath = path.join(root, "styles.min.css");

const architecture = fs.readFileSync(architecturePath, "utf8");
const publicPages = [...architecture.matchAll(/^- ([\w.-]+\.html)$/gm)].map((m) => m[1]);

const typoReplacements = [
  [/bas&rsquo;e/g, "bas&eacute;e"],
  [/particuli&eacute;re/g, "particuli&egrave;re"],
  [/recens&rsquo;s/g, "recens&eacute;s"],
  [/utilis&rsquo;/g, "utilis&eacute;"],
  [/minist&eacute;re/g, "minist&egrave;re"],
  [/compl&rsquo;mentaires/g, "compl&eacute;mentaires"],
  [/d&eacute;grad&egrave;s/g, "d&eacute;grad&eacute;s"],
  [/syst&eacute;me/g, "syst&egrave;me"],
  [/l'd&eacute;ploiement/g, "le d&eacute;ploiement"],
  [/planifi&eacute; dépôt/g, "d&eacute;p&ocirc;t planifi&eacute;"],
  [/planifi&eacute;es formes/g, "formes planifi&eacute;es"],
  [/la application/g, "l'application"],
  [/&eacute;tudier/g, "&Eacute;tudier"],
  [/&eacute;valuer/g, "&Eacute;valuer"],
  [/&eacute;cosyst&egrave;me/g, "&Eacute;cosyst&egrave;me"],
];

function fixHtml(html, file) {
  let next = html;

  next = next.replace(/\s\/(\s+data-france-photo=)/g, "$1");
  next = next.replace(/(<img\b[^>]*?\bdata-france-source="[^"]*")>/g, "$1 />");
  next = next.replace(/(<img\b[^>]*?\bdata-france-photo="[^"]*"[^>]*?)>\s*<\/img>/g, "$1 />");

  for (const [pattern, replacement] of typoReplacements) {
    next = next.replace(pattern, replacement);
  }

  next = next.replace(/m&sup2;(?=[A-Za-z&])/g, "m&eacute;");

  if (publicPages.includes(file)) {
    next = next.replace(/<body([^>]*?)class="([^"]*)"([^>]*)>/, (match, beforeClass, classes, afterClass) => {
      if (classes.split(/\s+/).includes("tvf-v2")) return match;
      return `<body${beforeClass}class="${classes} tvf-v2"${afterClass}>`;
    });
  }

  return next;
}

const v2Css = `

/* TVF V2 - couche de refonte institutionnelle appliquee aux pages publiques */
body.tvf-v2 {
  --v2-ink: #071f33;
  --v2-ink-soft: #294559;
  --v2-muted: #657484;
  --v2-green: #2e7d32;
  --v2-green-deep: #164f26;
  --v2-green-soft: #eef8ea;
  --v2-blue: #08243d;
  --v2-gold: #d99a16;
  --v2-paper: #fbfbf4;
  --v2-surface: #ffffff;
  --v2-border: rgba(7, 31, 51, 0.1);
  --v2-shadow: 0 26px 70px rgba(7, 31, 51, 0.1);
  --v2-shadow-hover: 0 34px 82px rgba(7, 31, 51, 0.16);
  --v2-radius-lg: 26px;
  --v2-radius-md: 18px;
  --v2-container: min(calc(100% - 48px), 1180px);
  --v2-wide: min(calc(100% - 40px), 1360px);
  color: var(--v2-ink);
  background:
    radial-gradient(circle at 8% 0%, rgba(46, 125, 50, 0.11), transparent 34rem),
    radial-gradient(circle at 92% 18%, rgba(217, 154, 22, 0.08), transparent 30rem),
    linear-gradient(180deg, #fbfcf7 0%, #f5f8f0 52%, #ffffff 100%) !important;
}

body.tvf-v2 .site-header {
  min-height: 82px !important;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  background: rgba(255, 255, 250, 0.96) !important;
  border-bottom: 1px solid rgba(7, 31, 51, 0.08) !important;
  box-shadow: 0 14px 38px rgba(7, 31, 51, 0.07) !important;
}

body.tvf-v2 .brand img {
  width: clamp(210px, 15vw, 285px) !important;
  height: auto !important;
  max-height: 88px !important;
}

body.tvf-v2 .main-nav {
  gap: clamp(18px, 2vw, 34px) !important;
  color: var(--v2-ink) !important;
  font-size: 15px !important;
  font-weight: 560 !important;
}

body.tvf-v2 .main-nav > a,
body.tvf-v2 .nav-drop-toggle {
  min-height: 48px !important;
}

body.tvf-v2 .main-nav > a::after,
body.tvf-v2 .nav-drop-toggle::after {
  bottom: 3px !important;
  height: 1px !important;
  background: rgba(46, 125, 50, 0.68) !important;
}

body.tvf-v2 .nav-dropdown-menu {
  padding: 18px !important;
  background: rgba(255, 255, 255, 0.985) !important;
  border: 1px solid rgba(7, 31, 51, 0.09) !important;
  border-radius: 18px !important;
  box-shadow: 0 30px 80px rgba(7, 31, 51, 0.16) !important;
}

body.tvf-v2 .mega-link {
  min-height: 72px !important;
  border-radius: 14px !important;
  background: linear-gradient(180deg, #ffffff, #fbfcf7) !important;
}

body.tvf-v2 .breadcrumb {
  width: var(--v2-container) !important;
  margin: 18px auto 0 !important;
  color: var(--v2-muted) !important;
  font-size: 0.88rem !important;
}

body.tvf-v2:not(.theme-home) main {
  padding-bottom: 1px;
}

body.tvf-v2:not(.theme-home) .page-hero,
body.tvf-v2:not(.theme-home) .content-hero,
body.tvf-v2:not(.theme-home) .impact-hero-panel,
body.tvf-v2:not(.theme-home) .actions-hero-premium,
body.tvf-v2:not(.theme-home) .poles-hero {
  width: var(--v2-wide) !important;
  margin: 28px auto 70px !important;
  overflow: hidden !important;
  border: 1px solid rgba(7, 31, 51, 0.08) !important;
  border-radius: var(--v2-radius-lg) !important;
  box-shadow: var(--v2-shadow) !important;
}

body.tvf-v2:not(.theme-home) .page-hero,
body.tvf-v2:not(.theme-home) .content-hero,
body.tvf-v2:not(.theme-home) .impact-hero-panel {
  display: grid !important;
  grid-template-columns: minmax(0, 1.04fr) minmax(320px, 0.96fr) !important;
  gap: clamp(28px, 4vw, 58px) !important;
  align-items: center !important;
  min-height: clamp(430px, 46vw, 620px) !important;
  padding: clamp(34px, 5vw, 70px) !important;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(242, 249, 238, 0.94)),
    var(--v2-surface) !important;
}

body.tvf-v2:not(.theme-home) .page-hero h1,
body.tvf-v2:not(.theme-home) .content-hero h1,
body.tvf-v2:not(.theme-home) .impact-hero-panel h1,
body.tvf-v2:not(.theme-home) .actions-hero-overlay h1,
body.tvf-v2:not(.theme-home) .poles-hero h1 {
  max-width: 850px !important;
  color: var(--v2-ink) !important;
  font-size: clamp(42px, 5.1vw, 72px) !important;
  line-height: 0.98 !important;
  font-weight: 850 !important;
  letter-spacing: -0.01em !important;
}

body.tvf-v2:not(.theme-home) .page-hero h1 span,
body.tvf-v2:not(.theme-home) .content-hero h1 span,
body.tvf-v2:not(.theme-home) .impact-hero-panel h1 span {
  color: var(--v2-green) !important;
}

body.tvf-v2:not(.theme-home) .page-hero p,
body.tvf-v2:not(.theme-home) .content-hero p,
body.tvf-v2:not(.theme-home) .impact-hero-panel p,
body.tvf-v2:not(.theme-home) .actions-hero-overlay p {
  max-width: 780px !important;
  color: var(--v2-ink-soft) !important;
  font-size: clamp(17px, 1.45vw, 21px) !important;
  line-height: 1.64 !important;
}

body.tvf-v2 .page-status,
body.tvf-v2 .dossier-kicker,
body.tvf-v2 .platform-hero-note {
  display: inline-flex !important;
  width: fit-content !important;
  margin-bottom: 14px !important;
  padding: 8px 12px !important;
  color: var(--v2-green-deep) !important;
  font-size: 0.75rem !important;
  font-weight: 850 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  background: rgba(46, 125, 50, 0.1) !important;
  border: 1px solid rgba(46, 125, 50, 0.18) !important;
  border-radius: 999px !important;
}

body.tvf-v2 .page-hero-photo,
body.tvf-v2 .content-hero img,
body.tvf-v2 img[data-france-photo="verified"],
body.tvf-v2 .actions-feature-media img,
body.tvf-v2 .photo-panel img,
body.tvf-v2 .info-card img {
  width: 100% !important;
  height: auto !important;
  min-height: 260px !important;
  max-height: 520px !important;
  aspect-ratio: 16 / 10 !important;
  object-fit: cover !important;
  border-radius: 20px !important;
  box-shadow: 0 22px 54px rgba(7, 31, 51, 0.14) !important;
  filter: saturate(1.02) contrast(1.06) brightness(0.96) !important;
}

body.tvf-v2 .premium-decision-strip,
body.tvf-v2 .page-brief,
body.tvf-v2 .in-page-nav,
body.tvf-v2 .page-wrap,
body.tvf-v2 main > section:not(.hero):not(.page-hero):not(.content-hero):not(.actions-hero-premium):not(.poles-hero):not(.premium-footer) {
  width: var(--v2-container) !important;
}

body.tvf-v2 main > section:not(.hero):not(.page-hero):not(.content-hero):not(.actions-hero-premium):not(.poles-hero):not(.premium-footer) {
  margin-top: clamp(56px, 7vw, 96px) !important;
  margin-bottom: clamp(56px, 7vw, 96px) !important;
}

body.tvf-v2 .premium-decision-strip,
body.tvf-v2 .page-brief {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 16px !important;
}

body.tvf-v2 .premium-decision-strip article,
body.tvf-v2 .page-brief article,
body.tvf-v2 .in-page-nav,
body.tvf-v2 .content-panel,
body.tvf-v2 .document-card,
body.tvf-v2 .dossier-card,
body.tvf-v2 .opportunity-card,
body.tvf-v2 .case-card,
body.tvf-v2 .doc-card,
body.tvf-v2 .data-card,
body.tvf-v2 .content-card,
body.tvf-v2 .impact-card,
body.tvf-v2 .project-card,
body.tvf-v2 .strategy-card,
body.tvf-v2 .resource-card,
body.tvf-v2 .resources-card,
body.tvf-v2 .metric-card,
body.tvf-v2 .audience-card,
body.tvf-v2 .journey-card,
body.tvf-v2 .faq-card,
body.tvf-v2 .pole-card,
body.tvf-v2 .panel,
body.tvf-v2 .info-card,
body.tvf-v2 .before-after-card,
body.tvf-v2 .platform-card,
body.tvf-v2 .workflow-step {
  padding: clamp(22px, 2.4vw, 34px) !important;
  color: var(--v2-ink-soft) !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(251, 252, 247, 0.98)) !important;
  border: 1px solid var(--v2-border) !important;
  border-radius: var(--v2-radius-md) !important;
  box-shadow: 0 14px 38px rgba(7, 31, 51, 0.07) !important;
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease !important;
}

body.tvf-v2 .premium-decision-strip article:hover,
body.tvf-v2 .page-brief article:hover,
body.tvf-v2 .content-panel:hover,
body.tvf-v2 .document-card:hover,
body.tvf-v2 .dossier-card:hover,
body.tvf-v2 .data-card:hover,
body.tvf-v2 .impact-card:hover,
body.tvf-v2 .audience-card:hover,
body.tvf-v2 .journey-card:hover,
body.tvf-v2 .info-card:hover,
body.tvf-v2 .before-after-card:hover {
  border-color: rgba(46, 125, 50, 0.24) !important;
  box-shadow: var(--v2-shadow-hover) !important;
  transform: translateY(-3px) !important;
}

body.tvf-v2 h2 {
  color: var(--v2-ink) !important;
  font-size: clamp(30px, 3vw, 46px) !important;
  line-height: 1.08 !important;
  font-weight: 790 !important;
}

body.tvf-v2 h3 {
  color: var(--v2-ink) !important;
  font-size: clamp(19px, 1.45vw, 24px) !important;
  line-height: 1.22 !important;
  font-weight: 760 !important;
}

body.tvf-v2 p,
body.tvf-v2 li {
  color: var(--v2-ink-soft) !important;
  font-size: 1rem !important;
  line-height: 1.68 !important;
}

body.tvf-v2 small,
body.tvf-v2 figcaption {
  color: var(--v2-muted) !important;
  line-height: 1.45 !important;
}

body.tvf-v2 .button,
body.tvf-v2 .donate-button,
body.tvf-v2 button[type="submit"],
body.tvf-v2 .footer-contact-button {
  min-height: 46px !important;
  padding: 0.78rem 1.18rem !important;
  color: #ffffff !important;
  background: linear-gradient(135deg, var(--v2-green-deep), var(--v2-green)) !important;
  border: 1px solid rgba(46, 125, 50, 0.2) !important;
  border-radius: 999px !important;
  box-shadow: 0 16px 32px rgba(46, 125, 50, 0.2) !important;
  font-weight: 820 !important;
}

body.tvf-v2 .button.secondary,
body.tvf-v2 .button.outline {
  color: var(--v2-ink) !important;
  background: #ffffff !important;
  border-color: rgba(7, 31, 51, 0.18) !important;
  box-shadow: none !important;
}

body.tvf-v2 .button:hover,
body.tvf-v2 .donate-button:hover,
body.tvf-v2 button[type="submit"]:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 20px 42px rgba(46, 125, 50, 0.25) !important;
}

body.tvf-v2 .stat-comparison,
body.tvf-v2 table {
  overflow: hidden !important;
  background: #ffffff !important;
  border: 1px solid var(--v2-border) !important;
  border-radius: 16px !important;
}

body.tvf-v2 .stat-comparison th,
body.tvf-v2 table th {
  color: #ffffff !important;
  background: var(--v2-blue) !important;
}

body.tvf-v2 .stat-comparison td,
body.tvf-v2 table td {
  color: var(--v2-ink-soft) !important;
}

body.tvf-v2 .tvf-page-faq details {
  border-radius: 16px !important;
}

body.tvf-v2 .premium-footer {
  margin-top: 110px !important;
}

@media (max-width: 980px) {
  body.tvf-v2 .site-header {
    min-height: 74px !important;
  }

  body.tvf-v2 .brand img {
    width: clamp(170px, 42vw, 230px) !important;
  }

  body.tvf-v2:not(.theme-home) .page-hero,
  body.tvf-v2:not(.theme-home) .content-hero,
  body.tvf-v2:not(.theme-home) .impact-hero-panel {
    grid-template-columns: 1fr !important;
    padding: 28px !important;
  }

  body.tvf-v2 .premium-decision-strip,
  body.tvf-v2 .page-brief {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 640px) {
  body.tvf-v2 {
    --v2-container: min(calc(100% - 22px), 680px);
    --v2-wide: min(calc(100% - 18px), 680px);
  }

  body.tvf-v2:not(.theme-home) .page-hero h1,
  body.tvf-v2:not(.theme-home) .content-hero h1,
  body.tvf-v2:not(.theme-home) .impact-hero-panel h1 {
    font-size: clamp(36px, 11vw, 50px) !important;
  }

  body.tvf-v2 .page-hero-photo,
  body.tvf-v2 .content-hero img,
  body.tvf-v2 img[data-france-photo="verified"] {
    min-height: 220px !important;
    border-radius: 16px !important;
  }
}
`;

function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .trim();
}

let htmlChanged = 0;
for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const filePath = path.join(root, file);
  const before = fs.readFileSync(filePath, "utf8");
  const after = fixHtml(before, file);
  if (after !== before) {
    fs.writeFileSync(filePath, after, "utf8");
    htmlChanged += 1;
  }
}

const marker = "/* TVF V2 - couche de refonte institutionnelle appliquee aux pages publiques */";
const beforeStyles = fs.readFileSync(stylesPath, "utf8");
const afterStyles = beforeStyles.includes(marker)
  ? beforeStyles.replace(new RegExp(`${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*$`), v2Css.trimEnd() + "\n")
  : beforeStyles.trimEnd() + "\n" + v2Css.trimEnd() + "\n";
if (afterStyles !== beforeStyles) fs.writeFileSync(stylesPath, afterStyles, "utf8");
fs.writeFileSync(minStylesPath, minify(afterStyles) + "\n", "utf8");

console.log(JSON.stringify({ publicPages: publicPages.length, htmlChanged }, null, 2));
