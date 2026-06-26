const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();

const footer = `
    <footer class="site-footer institutional-footer" aria-label="Pied de page Territoires Vivants France">
      <div class="footer-main-grid footer-main-grid-simple">
        <section class="footer-about" aria-labelledby="footer-about-title">
          <a class="footer-logo-link" href="index.html" aria-label="Retour &agrave; l'accueil">
            <img decoding="async" loading="lazy" src="assets/logo-territoires-vivants-france.png" alt="TERRITOIRES VIVANTS FRANCE" />
          </a>
          <h2 id="footer-about-title">Redonner vie aux lieux, aux b&acirc;timents et aux territoires.</h2>
          <p>Association nationale en structuration, TVF accompagne la revitalisation des logements, commerces, friches et ressources inutilis&eacute;es. Territoire pilote : Saint-&Eacute;tienne.</p>
          <a class="footer-contact-button" href="contact.html">Nous contacter</a>
        </section>

        <nav class="footer-column" aria-labelledby="footer-navigation-title">
          <h2 id="footer-navigation-title">Navigation</h2>
          <a href="index.html">Accueil</a>
          <a href="qui-sommes-nous.html">L'association</a>
          <a href="nos-actions.html">Nos actions</a>
          <a href="nos-poles.html">Nos 5 p&ocirc;les</a>
          <a href="observatoire-national.html">Observatoire</a>
          <a href="contact.html">Contact</a>
        </nav>

        <nav class="footer-column" aria-labelledby="footer-resources-title">
          <h2 id="footer-resources-title">Ressources</h2>
          <a href="faq.html">FAQ</a>
          <a href="publications-etudes.html">Publications</a>
          <a href="ressources.html">Centre de ressources</a>
          <a href="mentions-legales.html">Mentions l&eacute;gales</a>
          <a href="politique-confidentialite.html">Politique de confidentialit&eacute;</a>
        </nav>

        <section class="footer-column footer-social" aria-labelledby="footer-social-title">
          <h2 id="footer-social-title">Nous suivre</h2>
          <div class="footer-social-grid footer-social-compact">
            <a href="#" aria-label="LinkedIn &agrave; compl&eacute;ter" title="Lien LinkedIn &agrave; compl&eacute;ter"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.5 8.8H3.8V20h2.7V8.8ZM5.2 4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM20.2 13.9c0-3.2-1.7-5.3-4.4-5.3-1.6 0-2.6.8-3.1 1.6V8.8H10V20h2.7v-6.1c0-1.7.8-2.8 2.3-2.8 1.4 0 2.4.9 2.4 2.9v6h2.8v-6.1Z"/></svg></span><small>LinkedIn</small></a>
            <a href="#" aria-label="Facebook &agrave; compl&eacute;ter" title="Lien Facebook &agrave; compl&eacute;ter"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14.2 8.1h2.1V4.4c-.4-.1-1.7-.2-3.2-.2-3.2 0-5.3 2-5.3 5.6v3.1H4.3V17h3.5v7h4.3v-7h3.4l.5-4.1h-3.9V10.2c0-1.2.3-2.1 2.1-2.1Z"/></svg></span><small>Facebook</small></a>
            <a href="#" aria-label="Instagram &agrave; compl&eacute;ter" title="Lien Instagram &agrave; compl&eacute;ter"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 2.2A2.8 2.8 0 0 0 5.2 8v8A2.8 2.8 0 0 0 8 18.8h8a2.8 2.8 0 0 0 2.8-2.8V8A2.8 2.8 0 0 0 16 5.2H8Zm4 3.2a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Zm0 2.1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm4.1-2.7a.9.9 0 1 1 1.8 0 .9.9 0 0 1-1.8 0Z"/></svg></span><small>Instagram</small></a>
            <a href="#" aria-label="YouTube &agrave; compl&eacute;ter" title="Lien YouTube &agrave; compl&eacute;ter"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21.6 8.1a3 3 0 0 0-2.1-2.1C17.7 5.5 12 5.5 12 5.5s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1C2 9.9 2 12 2 12s0 2.1.4 3.9a3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1c.4-1.8.4-3.9.4-3.9s0-2.1-.4-3.9ZM10 15.3V8.7l5.6 3.3L10 15.3Z"/></svg></span><small>YouTube</small></a>
          </div>
        </section>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 TERRITOIRES VIVANTS FRANCE - Tous droits r&eacute;serv&eacute;s</p>
      </div>
    </footer>`;

const footerPattern = /\s*<footer class="site-footer[\s\S]*?<\/footer>/g;

let changed = 0;
for (const file of htmlFiles) {
  const full = path.join(root, file);
  const html = fs.readFileSync(full, "utf8");
  if (!footerPattern.test(html)) continue;
  footerPattern.lastIndex = 0;
  const next = html.replace(footerPattern, footer);
  if (next !== html) {
    fs.writeFileSync(full, next, "utf8");
    changed += 1;
  }
}

console.log(JSON.stringify({ changed }, null, 2));
