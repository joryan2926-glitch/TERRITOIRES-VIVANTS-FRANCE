const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();

const footer = `
    <footer class="site-footer institutional-footer" aria-label="Pied de page Territoires Vivants France">
      <div class="footer-contact-bar">
        <div>
          <span>Si&egrave;ge national</span>
          <strong>25 rue &Eacute;lise Gervais, 42000 Saint-&Eacute;tienne</strong>
        </div>
        <div>
          <span>E-mail</span>
          <strong>&Agrave; compl&eacute;ter apr&egrave;s activation officielle</strong>
        </div>
        <div>
          <span>T&eacute;l&eacute;phone</span>
          <strong>&Agrave; compl&eacute;ter apr&egrave;s validation</strong>
        </div>
        <a class="footer-map-link" href="https://www.openstreetmap.org/search?query=25%20rue%20%C3%89lise%20Gervais%2042000%20Saint-%C3%89tienne" rel="noopener" target="_blank">Localiser le si&egrave;ge</a>
      </div>

      <div class="footer-main-grid">
        <section class="footer-about" aria-labelledby="footer-about-title">
          <a class="footer-logo-link" href="index.html" aria-label="Retour &agrave; l'accueil">
            <img decoding="async" loading="lazy" src="assets/logo-territoires-vivants-france.png" alt="TERRITOIRES VIVANTS FRANCE" />
          </a>
          <h2 id="footer-about-title">Redonner vie aux lieux, aux b&acirc;timents et aux territoires.</h2>
          <p>Territoires Vivants France est une association nationale en structuration qui relie observation, r&eacute;emploi, habitat, commerces, friches et mobilisation citoyenne pour transformer des ressources inutilis&eacute;es en projets utiles.</p>
          <span class="footer-territory">Territoire pilote : Saint-&Eacute;tienne</span>
        </section>

        <nav class="footer-column" aria-labelledby="footer-navigation-title">
          <h2 id="footer-navigation-title">Navigation</h2>
          <a href="index.html">Accueil</a>
          <a href="qui-sommes-nous.html">L'association</a>
          <a href="nos-actions.html">Nos actions</a>
          <a href="nos-poles.html">Nos 5 p&ocirc;les</a>
          <a href="observatoire-national.html">Observatoire</a>
          <a href="index.html#actualites">Actualit&eacute;s</a>
          <a href="contact.html">Contact</a>
        </nav>

        <nav class="footer-column" aria-labelledby="footer-resources-title">
          <h2 id="footer-resources-title">Ressources</h2>
          <a href="faq.html">FAQ</a>
          <a href="ressources.html">Centre de ressources</a>
          <a href="publications-etudes.html">Publications et &eacute;tudes</a>
          <a href="documents-officiels.html">Documents officiels</a>
          <a href="mentions-legales.html">Mentions l&eacute;gales</a>
          <a href="politique-confidentialite.html">Politique de confidentialit&eacute;</a>
          <a href="mentions-legales.html#conditions-utilisation">Conditions d'utilisation</a>
        </nav>

        <section class="footer-column footer-social" aria-labelledby="footer-social-title">
          <h2 id="footer-social-title">Nous suivre</h2>
          <div class="footer-social-grid">
            <a href="#" aria-label="LinkedIn &agrave; compl&eacute;ter" title="Lien LinkedIn &agrave; compl&eacute;ter"><span aria-hidden="true">in</span><small>LinkedIn</small></a>
            <a href="#" aria-label="Facebook &agrave; compl&eacute;ter" title="Lien Facebook &agrave; compl&eacute;ter"><span aria-hidden="true">f</span><small>Facebook</small></a>
            <a href="#" aria-label="Instagram &agrave; compl&eacute;ter" title="Lien Instagram &agrave; compl&eacute;ter"><span aria-hidden="true">ig</span><small>Instagram</small></a>
            <a href="#" aria-label="X Twitter &agrave; compl&eacute;ter" title="Lien X &agrave; compl&eacute;ter"><span aria-hidden="true">x</span><small>X</small></a>
            <a href="#" aria-label="YouTube &agrave; compl&eacute;ter" title="Lien YouTube &agrave; compl&eacute;ter"><span aria-hidden="true">yt</span><small>YouTube</small></a>
            <a href="#" aria-label="TikTok &agrave; compl&eacute;ter" title="Lien TikTok &agrave; compl&eacute;ter"><span aria-hidden="true">tt</span><small>TikTok</small></a>
            <a href="#" aria-label="WhatsApp &agrave; compl&eacute;ter" title="Lien WhatsApp &agrave; compl&eacute;ter"><span aria-hidden="true">wa</span><small>WhatsApp</small></a>
            <a href="contact.html#newsletter" aria-label="Newsletter TVF"><span aria-hidden="true">@</span><small>Newsletter</small></a>
          </div>
        </section>

        <nav class="footer-column footer-action" aria-labelledby="footer-action-title">
          <h2 id="footer-action-title">Agir avec TVF</h2>
          <a href="espace-benevoles.html">Devenir b&eacute;n&eacute;vole</a>
          <a href="proprietaires.html">Proposer un bien</a>
          <a href="banque-materiaux.html#contribuer">Proposer des mat&eacute;riaux</a>
          <a href="faire-un-don.html">Faire un don</a>
          <a href="partenariats-strategiques.html">Devenir partenaire</a>
          <a href="contact.html">Nous contacter</a>
        </nav>
      </div>

      <div class="footer-trust-row" aria-label="Espaces institutionnels &agrave; compl&eacute;ter">
        <div>
          <span>Partenaires institutionnels</span>
          <p>Emplacements r&eacute;serv&eacute;s apr&egrave;s convention et accord de publication.</p>
          <div class="footer-logo-placeholders" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        <div>
          <span>Financeurs</span>
          <p>Espaces &agrave; compl&eacute;ter uniquement apr&egrave;s soutien confirm&eacute;.</p>
          <div class="footer-logo-placeholders" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        <div>
          <span>Labels et certifications</span>
          <p>Affichage pr&eacute;vu apr&egrave;s obtention officielle.</p>
          <div class="footer-logo-placeholders" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 TERRITOIRES VIVANTS FRANCE - Tous droits r&eacute;serv&eacute;s</p>
        <a class="footer-back-top" href="#">Retour en haut de page</a>
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
