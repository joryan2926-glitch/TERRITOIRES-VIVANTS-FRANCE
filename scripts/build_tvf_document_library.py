from __future__ import annotations

from pathlib import Path
import zipfile

from build_tvf_operational_documents import (
    ROOT, OUT, setup_doc, paragraph, add_bullets, add_check_table,
    add_kv_table, add_signature_block, save_doc, safe_name,
    main as build_base_kit, build_convention
)

ARCHIVE = ROOT / "documents" / "TVF-kit-formulaires-conventions-prets-a-utiliser.zip"

COMMON_FIELDS = [
    "Numero dossier TVF", "Date", "Demandeur / structure", "Contact", "Adresse ou territoire",
    "Categorie", "Referent TVF", "Statut", "Prochaine action"
]

def rows(labels):
    return [(label, "____________________________________________________________") for label in labels]

def checklist(base):
    return [(item, priority, note) for item, priority, note in base]

def blank_area(doc, title, line_count=6):
    paragraph(doc, title, style="Heading 2")
    for _ in range(line_count):
        paragraph(doc, "________________________________________________________________________________", after=2)

PIECE_GUIDES = [
    ("TVF-LP-02", "Pieces a fournir - proprietaire et bien vacant", "Proprietaire, mandataire, bailleur", "Verifier un logement, commerce, local, batiment, terrain ou friche avant instruction.", [
        ("Identite du proprietaire ou representant", "Obligatoire", "Nom, coordonnees, qualite, pouvoir."),
        ("Adresse complete du bien", "Obligatoire", "Adresse, commune, etage ou parcelle si connue."),
        ("Justificatif de propriete ou mandat", "A verifier", "Titre, taxe fonciere, mandat ou autorisation."),
        ("Photos recentes", "Obligatoire", "Facade, acces, interieur si autorise."),
        ("Etat connu et contraintes", "Obligatoire", "Vacance, reseaux, securite, copropriete, sinistre."),
        ("Diagnostics ou plans", "Si disponible", "DPE, amiante, plomb, plans, devis, etudes.")], ["Aucune visite sans accord explicite.", "Aucune promesse de travaux ou financement avant instruction.", "Verifier les pouvoirs de signature."], "Prequalification, pieces, visite, scenario d'usage ou classement."),
    ("TVF-LP-03", "Pieces a fournir - commerce ou local vacant", "Proprietaire, bailleur, commercant, collectivite", "Qualifier un local commercial ferme ou sous-utilise avant reactivation.", [
        ("Adresse et situation", "Obligatoire", "Rue, quartier, surface, vitrine, acces."),
        ("Statut d'occupation", "Obligatoire", "Vide, bail, contentieux, cession, disponibilite."),
        ("Photos", "Obligatoire", "Vitrine, interieur, reserve, acces."),
        ("Contraintes ERP ou securite", "A verifier", "Accessibilite, electricite, incendie, ventilation."),
        ("Conditions envisagees", "A verifier", "Loyer solidaire, occupation temporaire, pret, bail.")], ["Distinguer occupation temporaire, bail et mise a disposition.", "Verifier l'ouverture au public avant tout usage.", "Ne pas annoncer d'activite sans porteur valide."], "Etude d'usage, mise en relation, appel a porteur ou classement."),
    ("TVF-LP-04", "Pieces a fournir - friche terrain ou espace abandonne", "Collectivite, proprietaire foncier, entreprise", "Verifier un terrain ou une friche avant projet d'usage.", [
        ("Localisation precise", "Obligatoire", "Adresse, plan, parcelle ou perimetre."),
        ("Proprietaire ou gestionnaire", "A verifier", "Personne publique, privee, bailleur, indivision."),
        ("Photos et acces", "Obligatoire", "Acces, cloture, etat, risques apparents."),
        ("Usage actuel et risques", "Obligatoire", "Depot sauvage, pollution, ruine, voisinage."),
        ("Contraintes foncieres", "A verifier", "Zonage, servitudes, PLU, urbanisme.")], ["Ne pas entrer sans autorisation.", "Verifier pollution et securite avant chantier.", "Adapter le projet au droit foncier."], "Diagnostic, autorisation, faisabilite usage transitoire ou classement."),
    ("TVF-LP-05", "Pieces a fournir - materiaux de reemploi", "Entreprise, artisan, collectivite, particulier", "Qualifier des materiaux, mobiliers ou equipements avant acceptation.", [
        ("Description des ressources", "Obligatoire", "Categorie, quantite, dimensions, etat."),
        ("Photos", "Recommande", "Vue generale, details, defauts, etiquettes."),
        ("Localisation et enlevement", "Obligatoire", "Adresse, acces, manutention, delai."),
        ("Disponibilite", "Obligatoire", "Date de retrait et date limite."),
        ("Securite", "A verifier", "Amiante, plomb, electricite, produits dangereux."),
        ("Origine", "A verifier", "Chantier, surplus, deconstruction, stock, don.")], ["TVF n'est ni dechetterie ni plateforme de dons libres.", "Refuser les ressources dangereuses ou non tracables.", "Affecter aux projets valides uniquement."], "Acceptation, refus, complement, affectation ou stockage temporaire."),
    ("TVF-LP-06", "Pieces a fournir - collectivite et territoire", "Commune, EPCI, departement, region", "Preparer un rendez-vous, un diagnostic ou une cooperation territoriale.", [
        ("Contact referent", "Obligatoire", "Elu, direction ou service competent."),
        ("Perimetre concerne", "Obligatoire", "Commune, quartier, rue, centralite ou zone."),
        ("Besoin public identifie", "Obligatoire", "Vacance, friche, commerce, materiaux, insertion."),
        ("Documents disponibles", "Si disponible", "PLH, OPAH, PCAET, Action Coeur de Ville, donnees."),
        ("Calendrier administratif", "Recommande", "Budget, deliberation, comite, echeance.")], ["TVF complete les politiques publiques sans les remplacer.", "Identifier un service pilote.", "Formaliser le partage de donnees."], "Rendez-vous, fiche territoire, convention ou orientation."),
    ("TVF-LP-07", "Pieces a fournir - entreprise ou partenaire economique", "Entreprise, artisan, promoteur, bailleur, logisticien", "Qualifier une contribution RSE, materielle, technique, logistique ou financiere.", [
        ("Identification de l'entreprise", "Obligatoire", "Raison sociale, SIRET, adresse, representant."),
        ("Contact habilite", "Obligatoire", "Nom, fonction, e-mail, telephone."),
        ("Nature de la contribution", "Obligatoire", "Materiaux, local, vehicule, competence, financement."),
        ("Conditions proposees", "A verifier", "Duree, cout, disponibilite, contraintes."),
        ("Assurance et responsabilites", "A verifier", "Transport, local, chantier, materiel.")], ["Ne pas afficher un partenaire sans accord ecrit.", "Clarifier la valorisation RSE.", "Tracer l'affectation des contributions."], "Rendez-vous, convention de partenariat, bordereau ou classement."),
    ("TVF-LP-08", "Pieces a fournir - local de stockage", "Collectivite, entreprise, bailleur, proprietaire", "Verifier un local potentiel pour stockage, tri ou preparation de ressources.", [
        ("Adresse et acces", "Obligatoire", "Plan, stationnement, livraison, hauteur, horaires."),
        ("Surface et caracteristiques", "Obligatoire", "Surface, sol, electricite, eau, securite, ventilation."),
        ("Photos", "Obligatoire", "Interieur, exterieur, acces, zones sensibles."),
        ("Conditions", "A verifier", "Duree, gratuit, loyer, charges, assurance."),
        ("Autorisations", "A verifier", "Proprietaire, bail, copropriete, reglement, incendie.")], ["Aucun stockage sans convention et assurance.", "Verifier humidite, securite et accessibilite.", "Tenir un registre entrees/sorties."], "Visite technique, protocole de stockage, convention ou refus."),
    ("TVF-LP-09", "Pieces a fournir - transport et logistique", "Transporteur, loueur, collectivite, entreprise", "Verifier un vehicule, une livraison, une manutention ou un appui logistique.", [
        ("Description du moyen", "Obligatoire", "Type vehicule, volume, charge utile, hayon."),
        ("Disponibilites", "Obligatoire", "Dates, horaires, delai de reservation."),
        ("Conducteur ou responsable", "A verifier", "Permis, habilitation, contact."),
        ("Assurance", "A verifier", "Vehicule, biens transportes, responsabilite."),
        ("Conditions d'usage", "A verifier", "Carburant, kilometrage, cout, zone.")], ["Clarifier qui charge et decharge.", "Ne pas transporter de ressources dangereuses sans cadre.", "Archiver le bon d'enlevement."], "Accord ponctuel, convention logistique, planning ou refus."),
    ("TVF-LP-10", "Pieces a fournir - benevole association ou insertion", "Benevole, association, SIAE, organisme de formation", "Preparer une mission encadree ou un chantier participatif.", [
        ("Coordonnees et profil", "Obligatoire", "Nom, contact, disponibilites, competences."),
        ("Cadre d'intervention", "Obligatoire", "Benevolat, insertion, formation, chantier."),
        ("Encadrement", "A verifier", "Referent, qualification, nombre de participants."),
        ("Assurance", "A verifier", "Structure, benevole, chantier, public."),
        ("Consignes securite", "A verifier", "EPI, outils, zones interdites, horaires.")], ["Adapter les missions aux competences reelles.", "Ne pas confier de tache dangereuse sans encadrement.", "Tracer presences et consignes."], "Entretien, mission, convention, charte ou classement."),
    ("TVF-LP-11", "Pieces a fournir - financeur mecene ou investisseur", "Fondation, entreprise mecene, financeur public ou prive", "Preparer un dossier de soutien financier ou materiel avec tracabilite.", [
        ("Identification du financeur", "Obligatoire", "Structure, contact, statut, adresse."),
        ("Objet du soutien", "Obligatoire", "Projet, territoire, theme, public."),
        ("Budget previsionnel", "Obligatoire", "Montants, postes, calendrier, cofinancements."),
        ("Modalites de versement", "A verifier", "Don, subvention, convention, appel a projets."),
        ("Reporting attendu", "A verifier", "Indicateurs, livrables, calendrier, communication.")], ["Ne pas garantir d'avantage fiscal sans validation.", "Affecter les fonds selon convention.", "Prevoir les justificatifs avant depense."], "Note projet, dossier de financement, convention ou classement."),
    ("TVF-LP-12", "Pieces a fournir - presse institution communication", "Journaliste, institution, service communication", "Encadrer une demande d'information, d'interview, de logo ou de support public.", [
        ("Identite du demandeur", "Obligatoire", "Nom, media ou institution, coordonnees."),
        ("Objet de la demande", "Obligatoire", "Interview, logo, citation, photo, communique."),
        ("Date limite", "Obligatoire", "Echeance de reponse ou publication."),
        ("Angle ou contexte", "A verifier", "Sujet, support, diffusion, cible."),
        ("Validation necessaire", "A verifier", "Citation, logo, chiffre, photo, partenaire.")], ["Ne pas citer de partenaire non officialise.", "Valider les chiffres avant diffusion.", "Conserver la trace de la demande."], "Reponse presse, kit media, validation interne ou refus prudent."),
]

INSTRUCTION_DOCS = [
    ("TVF-INST-01", "Fiche dossier client et demande", "Ouvrir un dossier TVF OS hors formulaire web.", COMMON_FIELDS + ["Objet de la demande", "Pieces recues", "Resume instruction"], [
        ("Coordonnees completes", "Obligatoire", "Telephone ou e-mail utilisable."),
        ("Categorie selectionnee", "Obligatoire", "Collectivite, proprietaire, entreprise, materiaux, etc."),
        ("Objet formule en une phrase", "Obligatoire", "Facilite la recherche et le suivi."),
        ("Pieces rattachees", "A verifier", "Photos, documents, mail, devis, preuve."),
        ("Prochaine action definie", "Obligatoire", "Appel, mail, rendez-vous, relance, classement.")]),
    ("TVF-INST-02", "Grille instruction dossier", "Evaluer recevabilite, interet territorial, risques et suite.", COMMON_FIELDS + ["Interet territorial", "Risques", "Faisabilite", "Decision proposee"], [
        ("Besoin clairement identifie", "Obligatoire", "Ce que le demandeur attend de TVF."),
        ("Role TVF pertinent", "Obligatoire", "Coordination, instruction, convention, orientation."),
        ("Pieces essentielles disponibles", "A verifier", "Voir liste par sujet."),
        ("Risque juridique ou securite", "A verifier", "Assurance, propriete, chantier, donnees."),
        ("Decision interne tracee", "Obligatoire", "Continuer, attendre, orienter, refuser, classer.")]),
    ("TVF-INST-03", "Fiche decision et orientation", "Tracer la decision TVF et l'orientation donnee au dossier.", COMMON_FIELDS + ["Decision", "Motif", "Conditions", "Date d'information", "Echeance"], [
        ("Decision selectionnee", "Obligatoire", "Instruire, demander pieces, orienter, refuser, classer."),
        ("Motif formule", "Obligatoire", "Expliquer sans promesse excessive."),
        ("Message au demandeur prepare", "A verifier", "Courrier, e-mail ou appel."),
        ("Dossier mis a jour", "Obligatoire", "Statut et prochaine action."),
        ("Documents sensibles proteges", "A verifier", "Acces limite si necessaire.")]),
    ("TVF-INST-04", "Compte rendu rendez-vous", "Conserver une trace claire apres rendez-vous.", ["Date", "Lieu / visio", "Participants", "Dossier", "Objet", "Points abordes", "Decisions", "Pieces attendues", "Actions TVF", "Actions partenaire", "Echeances"], [
        ("Participants notes", "Obligatoire", "Nom, structure, fonction."),
        ("Decisions separees des idees", "Obligatoire", "Eviter les malentendus."),
        ("Pieces et delais notes", "A verifier", "Qui transmet quoi et quand."),
        ("Compte rendu archive", "Obligatoire", "Rattacher au dossier TVF OS."),
        ("Transmission validee", "A verifier", "Envoyer si necessaire.")]),
    ("TVF-INST-05", "Fiche visite terrain", "Preparer et tracer une visite de bien, local, friche ou ressource.", ["Numero dossier", "Adresse", "Date visite", "Personnes presentes", "Autorisation acces", "Etat apparent", "Photos", "Risques", "Potentiel", "Suite proposee"], [
        ("Autorisation d'acces", "Obligatoire", "Aucun acces sans accord."),
        ("Photos autorisees", "A verifier", "Ne pas photographier de personnes sans accord."),
        ("Risques apparents notes", "Obligatoire", "Structure, electricite, humidite, dechets."),
        ("Aucune intervention effectuee", "Rappel", "La visite n'est pas un chantier."),
        ("Compte rendu rattache", "Obligatoire", "Archivage TVF OS.")]),
    ("TVF-INST-06", "Fiche securite et points a verrouiller", "Verifier les conditions minimales avant action terrain.", ["Dossier", "Lieu", "Action prevue", "Responsable", "Assurance", "Acces", "EPI", "Risques", "Public present", "Secours", "Decision securite"], [
        ("Responsable identifie", "Obligatoire", "Une personne pilote l'action."),
        ("Assurance verifiee", "Obligatoire", "Qui couvre les personnes et les biens."),
        ("Consignes ecrites", "Obligatoire", "Acces, outils, zones interdites."),
        ("EPI prevus", "A verifier", "Gants, chaussures, masques selon besoin."),
        ("Arret possible", "Obligatoire", "TVF peut interrompre si securite insuffisante.")]),
    ("TVF-INST-07", "Registre pieces manquantes et relances", "Suivre les documents demandes, recus, refuses ou a relancer.", ["Numero dossier", "Demandeur", "Piece demandee", "Date demande", "Canal", "Date relance", "Date reception", "Conformite", "Commentaire", "Statut dossier"], [
        ("Piece demandee clairement nommee", "Obligatoire", "Eviter les demandes vagues."),
        ("Delai de reponse indique", "Recommande", "Date ou echeance."),
        ("Piece recue classee", "Obligatoire", "Rattachement au dossier."),
        ("Piece sensible protegee", "A verifier", "Identite, RIB, contrat, signature."),
        ("Decision apres relance", "A verifier", "Continuer, attendre ou classer.")]),
    ("TVF-INST-08", "Fiche budget previsionnel dossier", "Cadrer un besoin financier avant demande de soutien.", ["Numero dossier", "Projet", "Territoire", "Postes de depenses", "Contributions en nature", "Financements recherches", "Calendrier", "Hypotheses", "Risques budgetaires", "Validation"], [
        ("Postes separes", "Obligatoire", "Travaux, materiaux, transport, assurance, communication."),
        ("Aucun chiffre non justifie", "Obligatoire", "Devis, estimation ou hypothese mentionnee."),
        ("Contributions en nature valorisees", "Recommande", "Local, vehicule, materiaux, benevolat encadre."),
        ("Reste a financer visible", "Obligatoire", "Montant ou tranche a rechercher."),
        ("Validation avant transmission", "Obligatoire", "Ne pas envoyer un budget non relu.")]),
]
EXTRA_CONVENTIONS = [
    ("TVF-CONV-07", "Convention type de local de stockage", "Collectivite, entreprise, bailleur, proprietaire", "Encadrer la mise a disposition d'un local pour stockage, tri ou preparation.", "Definir les conditions d'utilisation d'un local au service des projets TVF.", ["Usage limite aux finalites prevues.", "Registre des entrees, sorties et affectations.", "Assurance, acces, securite, charges et horaires precises.", "Aucun produit dangereux sans validation specifique.", "Restitution et etat de sortie prevus."], ["Etat des lieux", "Photos", "Assurance", "Reglement d'acces", "Inventaire initial"]),
    ("TVF-CONV-08", "Convention type de transport et logistique", "Transporteur, loueur, entreprise, collectivite", "Encadrer vehicule, chauffeur, manutention ou livraison.", "Definir les moyens logistiques mobilises et les responsabilites.", ["Mission decrite par trajet, dates, ressources et responsables.", "Assurances du vehicule, conducteur et biens verifiees.", "Roles de chargement, transport et dechargement definis.", "Ressources dangereuses exclues sans cadre specifique.", "Bon d'enlevement ou inventaire annexe."], ["Fiche operation", "Assurance", "Permis si besoin", "Bon d'enlevement", "Inventaire transporte"]),
    ("TVF-CONV-09", "Convention type association insertion ou chantier encadre", "Association, SIAE, organisme de formation", "Cadrer une cooperation sociale, pedagogique ou participative.", "Organiser une action encadree avec roles, publics, missions, securite et livrables.", ["Structure encadrante et responsable operationnel identifies.", "Missions adaptees aux competences et conditions de securite.", "Emargement possible pour suivi, assurance et impact.", "Consignes, EPI, zones interdites et procedure d'arret formalises.", "Bilan d'action realise apres intervention."], ["Fiche mission", "Consignes securite", "Feuille emargement", "Autorisation image", "Bilan action"]),
    ("TVF-CONV-10", "Autorisation type de visite d'un bien ou d'un site", "Proprietaire, gestionnaire, mandataire", "Autoriser une visite de diagnostic sans engagement de travaux.", "Permettre a TVF de visiter un bien ou site pour observation, photos autorisees et prequalification.", ["La visite ne vaut pas acceptation du dossier.", "Personnes, date, zones accessibles et photos autorisees sont precisees.", "Aucune intervention technique sans autorisation specifique.", "Risques apparents notes sans se substituer a un diagnostic reglementaire.", "Informations recueillies conservees en interne sauf accord contraire."], ["Adresse", "Personnes autorisees", "Photos autorisees", "Piece identite si besoin", "Compte rendu visite"]),
    ("TVF-CONV-11", "Autorisation type droit a l'image et communication", "Benevole, partenaire, participant, proprietaire", "Encadrer photos, videos, citations ou logos.", "Definir supports, durees, territoires et limites d'utilisation d'images ou mentions publiques.", ["Supports autorises clairement listes.", "Aucune personne identifiable diffusee sans autorisation adaptee.", "Logos et noms de partenaires utilises uniquement avec accord ecrit.", "Retrait ou limitation d'usage prevu selon conditions.", "Images et citations ne doivent pas suggerer un partenariat non signe."], ["Visuels concernes", "Supports autorises", "Duree", "Logo", "Validation communication"]),
    ("TVF-CONV-12", "Proces-verbal type de restitution ou cloture", "TVF, proprietaire, collectivite, partenaire", "Cloturer une mise a disposition, une action ou une cooperation.", "Tracer la fin d'une action, la restitution d'un bien ou le bilan d'une cooperation.", ["Date, objet, parties, livrables et points ouverts precises.", "Etat de sortie ou bilan d'utilisation annexe si necessaire.", "Cles, documents, materiaux ou equipements restitues listes.", "Reserves eventuelles formulees factuellement.", "Communication finale validee avant publication."], ["Etat de sortie", "Inventaire", "Photos", "Bilan impact", "Reserves eventuelles"]),
]

def build_piece_guide(item):
    ref, title, public, subtitle, required, vigilance, decision = item
    doc = setup_doc(title, ref, subtitle, public, status="Checklist operationnelle prete a remplir")
    paragraph(doc, "Identification du dossier", style="Heading 1")
    add_kv_table(doc, rows(["Numero dossier TVF", "Date de demande", "Demandeur / structure", "Referent TVF", "Statut"]), widths=(1.85, 4.4))
    add_check_table(doc, "Pieces obligatoires ou a verifier", checklist(required))
    paragraph(doc, "Points de vigilance", style="Heading 2")
    add_bullets(doc, vigilance)
    blank_area(doc, "Observations, pieces manquantes et relances", 6)
    add_kv_table(doc, [("Decision TVF", "[ ] Complet   [ ] Pieces a demander   [ ] Rendez-vous   [ ] Visite   [ ] Orientation   [ ] Classe"), ("Suite logique", decision), ("Date de relance", "____ / ____ / ______"), ("Prochaine action", "____________________________________________________________")], widths=(1.85, 4.4))
    add_signature_block(doc, left_label="Controle TVF", right_label="Demandeur / partenaire si necessaire")
    out = OUT / "14-listes-pieces" / f"{ref.lower()}-{safe_name(title)}.docx"
    save_doc(doc, out)
    return out

def build_instruction_doc(item):
    ref, title, subtitle, fields, checks = item
    doc = setup_doc(title, ref, subtitle, "Equipe TVF", status="Document interne TVF OS pret a completer")
    paragraph(doc, "Zone dossier", style="Heading 1")
    add_kv_table(doc, rows(fields), widths=(2.05, 4.2))
    add_check_table(doc, "Controle d'instruction", checklist(checks))
    blank_area(doc, "Analyse, notes et elements a completer", 7)
    add_kv_table(doc, [("Decision", "[ ] Continuer   [ ] Demander pieces   [ ] Rendez-vous   [ ] Convention   [ ] Orienter   [ ] Classer"), ("Motif", "____________________________________________________________"), ("Responsable suite", "____________________________________________________________"), ("Date limite", "____ / ____ / ______")], widths=(1.85, 4.4))
    add_signature_block(doc, left_label="Referent TVF", right_label="Validation interne si necessaire")
    out = OUT / "16-instruction-dossier" / f"{ref.lower()}-{safe_name(title)}.docx"
    save_doc(doc, out)
    return out

def build_extra_convention(item):
    ref, title, public, subtitle, obj, clauses, annexes = item
    return build_convention({"ref": ref, "folder": "13-conventions-types", "title": title, "public": public, "subtitle": subtitle, "object": obj, "clauses": clauses, "annexes": annexes})

def build_complete_index(paths):
    doc = setup_doc("Index complet de la bibliotheque interne TVF OS", "TVF-INDEX-02", "Repertoire operationnel des formulaires, listes de pieces, fiches d'instruction, conventions et courriers.", "Equipe TVF", status="Bibliotheque interne complete")
    paragraph(doc, "Mode d'utilisation", style="Heading 1")
    add_bullets(doc, ["Ouvrir un dossier avec un formulaire ou une fiche dossier client.", "Demander les pieces avec la liste adaptee au sujet.", "Instruire le dossier avec une grille interne et tracer les decisions.", "Adapter une convention uniquement lorsque le dossier est recevable.", "Archiver chaque document dans TVF OS avec le numero de dossier."])
    paragraph(doc, "Classement", style="Heading 1")
    add_kv_table(doc, [("01 - Formulaires", "Reception et qualification."), ("02 - Conventions", "Formalisation apres instruction."), ("03 - Pieces a fournir", "Recevabilite par sujet."), ("04 - Courriers", "Demandes et relances."), ("05 - Instruction", "Ouverture, analyse, visite, decision et suivi.")], widths=(1.75, 4.5))
    paragraph(doc, "Liste complete des fichiers", style="Heading 1")
    for path in sorted(paths):
        p = doc.add_paragraph(style="List Bullet")
        p.add_run(str(path.relative_to(OUT)).replace(chr(92), '/'))
    out = OUT / "00-index" / "tvf-index-bibliotheque-interne-complete.docx"
    save_doc(doc, out)
    return out

def refresh_readme(paths):
    lines = ["# Bibliotheque interne TVF OS", "", "Documents internes prets a remplir pour recevoir, qualifier, instruire, conventionner et suivre les demandes TVF.", "", "## Categories", "", "- `00-index` : index du kit et index complet.", "- `01` a `12` : formulaires par type de demande.", "- `13-conventions-types` : conventions, autorisations, chartes et PV types.", "- `14-listes-pieces` : pieces a fournir par sujet.", "- `15-courriers-prets-a-envoyer` : courriers types.", "- `16-instruction-dossier` : fiches internes d'instruction.", "", "## Regle", "", "Completer le numero de dossier TVF, les coordonnees, les pieces recues, la decision et les signatures si necessaire. Adapter tout document engageant avant transmission ou signature.", "", "## Fichiers", ""]
    for path in sorted(paths):
        lines.append(f"- `{str(path.relative_to(OUT)).replace(chr(92), '/')}`")
    (OUT / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

def rebuild_archive():
    if ARCHIVE.exists():
        ARCHIVE.unlink()
    with zipfile.ZipFile(ARCHIVE, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(OUT.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(ROOT / "documents"))

def main():
    build_base_kit()
    generated = sorted(OUT.rglob("*.docx"))
    for item in PIECE_GUIDES:
        generated.append(build_piece_guide(item))
    for item in INSTRUCTION_DOCS:
        generated.append(build_instruction_doc(item))
    for item in EXTRA_CONVENTIONS:
        generated.append(build_extra_convention(item))
    generated = sorted(set(generated))
    generated.append(build_complete_index(generated))
    generated = sorted(set(generated))
    refresh_readme(generated)
    rebuild_archive()
    print(f"Generated internal library documents: {len(generated)}")
    print(f"Archive: {ARCHIVE.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
