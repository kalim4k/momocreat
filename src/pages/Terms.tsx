import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Terms() {
  const { styles } = useTheme();

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.textPrimary} flex flex-col font-sans`}>
      {/* Header */}
      <header className={`border-b ${styles.border} py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-40`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-corail animate-pulse" />
            <span className="font-display text-xl font-medium tracking-tight text-text-primary">Momo Creator</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1 text-xs font-semibold text-accent-corail hover:underline"
          >
            <ArrowLeft size={14} />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col gap-8">
          
          {/* Header section */}
          <div className="flex flex-col gap-3 border-b border-border-custom pb-6">
            <div className="p-3 bg-accent-corail/10 text-accent-corail rounded-2xl w-fit">
              <FileText size={24} />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mt-2">
              Conditions Générales d'Utilisation (CGU)
            </h1>
            <p className="text-xs text-text-secondary">
              Dernière mise à jour : 6 juillet 2026
            </p>
          </div>

          {/* Legal Text body */}
          <div className="flex flex-col gap-8 text-sm sm:text-base leading-relaxed text-text-secondary">
            
            <p>
              Bienvenue sur Momo Creator. Les présentes Conditions Générales d'Utilisation (ci-après les "CGU") ont pour objet de définir les modalités et conditions dans lesquelles nous mettons notre plateforme à la disposition des utilisateurs (Créateurs, Acheteurs et Visiteurs).
            </p>

            {/* Section 1 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">1. Acceptation des Conditions</h2>
              <p>
                L'accès et l'utilisation de la plateforme Momo Creator sont soumis à l'acceptation expresse et sans réserve des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser nos services ni accéder à notre site.
              </p>
            </div>

            {/* Section 2 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">2. Description du Service</h2>
              <p>
                Momo Creator est une plateforme en ligne (SaaS) permettant à ses utilisateurs (les "Vendeurs" ou "Créateurs") de créer gratuitement une page web personnalisée pour héberger, promouvoir et vendre leurs créations numériques (guides, ebooks, vidéos, formations, fichiers audio, templates) ainsi que de gérer des abonnements récurrents de manière automatisée.
              </p>
            </div>

            {/* Section 3 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">3. Création de Compte et Sécurité</h2>
              <p>
                Pour utiliser les fonctionnalités de vente de Momo Creator, vous devez créer un compte utilisateur en fournissant des données d'identification authentiques, exhaustives et à jour.
              </p>
              <p className="mt-1">
                L'utilisateur est seul responsable de la sécurité et de la confidentialité de ses identifiants de connexion. Toute action effectuée via son compte sera irréfragablement réputée avoir été accomplie par lui-même.
              </p>
            </div>

            {/* Section 4 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">4. Règles de Bonne Conduite</h2>
              <p>
                En utilisant Momo Creator, vous vous engagez à :
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-xs sm:text-sm mt-1">
                <li>Ne pas utiliser la plateforme à des fins illégales, trompeuses ou frauduleuses.</li>
                <li>Ne pas violer les droits de propriété intellectuelle d'autrui (marques, brevets, droits d'auteur, etc.).</li>
                <li>Ne pas tenter de contourner, d'endommager ou de pirater le système de sécurité de la plateforme ou d'entraver son bon fonctionnement.</li>
                <li>Fournir des fichiers exempts de tout virus, cheval de Troie ou logiciel malveillant de nature à nuire aux terminaux de vos clients.</li>
              </ul>
            </div>

            {/* Section 5 - Forbidden contents */}
            <div className="flex flex-col gap-4 p-6 border border-amber-200 bg-amber-50/30 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle size={20} className="shrink-0" />
                <h3 className="font-display font-semibold text-base">5. Contenus Strictement Interdits</h3>
              </div>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                Les contenus suivants sont formellement proscrits sur Momo Creator :
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-xs text-amber-950">
                <li><strong>Drogues et substances illicites :</strong> Toute vente, incitation ou promotion relative à des stupéfiants, substances psychoactives, drogues ou matériels illégaux.</li>
                <li><strong>Jeux d'argent et paris :</strong> Tout contenu de casino, paris sportifs, loteries, pyramides de Ponzi ou systèmes de gains d'argent miraculeux.</li>
                <li><strong>Contenus à caractère sexuel :</strong> Pornographie, services d'escorte, contenus à caractère pornographique explicite ou racoleur.</li>
                <li><strong>Armes et explosifs :</strong> Vente ou tutoriels de fabrication d'armes à feu, couteaux de combat, explosifs ou matériel militaire.</li>
                <li><strong>Contrefaçon et Piratage :</strong> Revente de formations d'autres créateurs, clés de licence piratées ou copies non autorisées.</li>
              </ul>
            </div>

            {/* Section 6 - Sanctions */}
            <div className="flex flex-col gap-4 p-6 border border-red-200 bg-red-50/30 rounded-2xl">
              <div className="flex items-center gap-2 text-red-700">
                <ShieldAlert size={20} className="shrink-0" />
                <h3 className="font-display font-semibold text-base">6. Sanctions et Mesures</h3>
              </div>
              <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
                En cas de constatation d'une violation grave ou répétée des présentes CGU, Momo Creator se réserve le droit d'appliquer les mesures suivantes de manière immédiate, unilatérale et sans indemnité :
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-xs text-red-950">
                <li><strong>Suspension temporaire</strong> de votre compte et interruption immédiate de vos liens de vente publics.</li>
                <li><strong>Bannissement définitif</strong> du contrevenant avec suppression irrévocable de l'accès à la plateforme.</li>
                <li><strong>Gel immédiat de l'intégralité du solde (Wallet)</strong> pendant la durée de l'audit ou de l'enquête interne (jusqu'à 90 jours).</li>
                <li><strong>Confiscation définitive des fonds</strong> illicites en cas de fraude avérée, d'escroquerie ou de violation des lois pénales.</li>
                <li><strong>Transmission et signalement</strong> systématiques des éléments de preuve aux autorités policières et judiciaires compétentes.</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">7. Propriété Intellectuelle</h2>
              <p>
                <strong>Propriété de Momo Creator :</strong> Les interfaces, logos, chartes graphiques, bases de données, codes sources, technologies et tous les éléments créatifs composant le site de Momo Creator sont notre propriété intellectuelle exclusive. Toute reproduction est interdite.
              </p>
              <p>
                <strong>Propriété des Créateurs :</strong> Le Créateur conserve l'entière et exclusive propriété intellectuelle de ses contenus importés sur la plateforme. Momo Creator agit en tant que simple prestataire de stockage technique.
              </p>
            </div>

            {/* Section 8 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">8. Limitation de Responsabilité</h2>
              <p>
                Momo Creator agit en qualité d'hébergeur technique et de facilitateur de paiement. Nous déclinons toute responsabilité concernant :
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-xs sm:text-sm mt-1">
                <li>La qualité, l'absence de bogues ou l'exactitude des fichiers vendus par les créateurs.</li>
                <li>Les pannes serveurs indépendantes de notre volonté ou interruptions dues aux passerelles de Mobile Money tierces.</li>
                <li>Les litiges financiers ou commerciaux survenant entre un Créateur et son acheteur final.</li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">9. Droit Applicable et Juridiction</h2>
              <p>
                Les présentes Conditions Générales d'Utilisation sont régies par la législation applicable dans la zone d'implantation. En cas de contestation ou de litige, l'utilisateur s'engage à rechercher prioritairement une résolution amiable avec notre service de support avant toute action judiciaire.
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${styles.border} py-8 px-6 text-center text-xs ${styles.textSecondary} bg-white`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong>Momo Creator</strong> © {new Date().getFullYear()} — Tous droits réservés.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/legal/terms" className="hover:underline font-semibold text-accent-corail">Conditions d'utilisation</Link>
            <Link to="/legal/sales" className="hover:underline">Conditions de vente (CGV)</Link>
            <Link to="/legal/privacy" className="hover:underline">Politique de confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
