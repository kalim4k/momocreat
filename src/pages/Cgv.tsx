import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Cgv() {
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
              Conditions Générales de Vente (CGV)
            </h1>
            <p className="text-xs text-text-secondary">
              Dernière mise à jour : 6 juillet 2026
            </p>
          </div>

          {/* Legal Text body */}
          <div className="flex flex-col gap-8 text-sm sm:text-base leading-relaxed text-text-secondary">
            
            <p>
              Les présentes Conditions Générales de Vente (ci-après les "CGV") régissent l'ensemble des relations entre la plateforme <strong>Momo Creator</strong> (ci-après "Nous" ou la "Plateforme") et toute personne physique ou morale (ci-après le "Vendeur", "Créateur" ou "Client") utilisant nos services pour vendre ou acheter des produits numériques, des fichiers ou des abonnements.
            </p>

            {/* Section 1 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">1. Objet du Service</h2>
              <p>
                Momo Creator fournit une solution en ligne permettant aux créateurs de contenu de créer des pages de vente pour commercialiser directement :
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-xs sm:text-sm">
                <li>Des produits et contenus digitaux (e-books, guides PDF, fichiers de formation, templates, documents audio ou vidéo).</li>
                <li>Des services, des séances de coaching ou d'accompagnement (prise de rendez-vous ou prestations personnalisées).</li>
                <li>Des accès à des contenus premium ou des formules d'abonnements.</li>
              </ul>
              <p className="mt-1">
                Momo Creator agit en tant qu'intermédiaire technique facilitant la mise en relation entre les Vendeurs et leurs Clients, et intégrant des solutions de paiement tiers (Wave, Orange Money, MTN, Moov, et Cartes Bancaires).
              </p>
            </div>

            {/* Section 2 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">2. Inscription et Accès au Compte</h2>
              <p>
                L'inscription à Momo Creator est entièrement gratuite et sans engagement. Le Vendeur doit être majeur, fournir des informations authentiques et tenir à jour ses coordonnées. Nous nous réservons le droit exclusif de suspendre ou de supprimer tout compte en cas de non-respect des présentes conditions ou d'activités frauduleuses suspectées.
              </p>
            </div>

            {/* Section 3 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">3. Modèle Économique et Commission</h2>
              <p>
                L'utilisation de la plateforme est basée sur un modèle de facturation transparent à la performance :
              </p>
              <div className="p-5 rounded-2xl border border-border-custom bg-light-bg-surface flex flex-col gap-3 my-2">
                <div className="flex items-center justify-between border-b border-border-custom pb-2">
                  <span className="font-semibold text-text-primary">Frais d'abonnement mensuel</span>
                  <span className="font-bold text-emerald-600">0 FCFA</span>
                </div>
                <div className="flex items-center justify-between border-b border-border-custom pb-2">
                  <span className="font-semibold text-text-primary">Frais de transaction (Commission)</span>
                  <span className="font-bold text-accent-corail">10% par vente réussie</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Cette commission de 10% est prélevée automatiquement sur chaque paiement validé. Ce taux inclut la maintenance de la plateforme, l'hébergement sécurisé de vos fichiers pour la livraison automatique, ainsi que les frais techniques d'intégration des opérateurs de Mobile Money et cartes bancaires.
                </p>
              </div>
              <p className="mt-1">
                Le montant net crédité sur le portefeuille virtuel (Wallet) du Vendeur correspond à la formule : <code className="font-mono bg-light-bg-surface px-2 py-1 rounded text-accent-corail font-semibold">Montant payé par l'acheteur - 10%</code>.
              </p>
            </div>

            {/* Section 4 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">4. Retrait des Fonds (Payouts)</h2>
              <p>
                Les fonds accumulés à la suite des ventes sont instantanément disponibles sur le Wallet virtuel du Vendeur. Le Vendeur peut demander un retrait vers son compte Mobile Money (Wave, Orange Money, etc.) de son choix à tout moment.
              </p>
              <p className="mt-1">
                Nous nous engageons à valider et transférer les fonds dans les meilleurs délais, généralement en moins de 24 heures ouvrables, après vérification automatique de l'absence d'activité frauduleuse ou de réclamation client en cours.
              </p>
            </div>

            {/* Section 5 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">5. Responsabilité du Vendeur</h2>
              <p>
                Le Vendeur conserve l'entière responsabilité :
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-xs sm:text-sm">
                <li>De la qualité, de la conformité et de la légitimité des produits, fichiers ou services numériques vendus.</li>
                <li>Du respect de la réglementation fiscale en vigueur dans son pays de résidence (déclarations administratives, impôts, TVA).</li>
                <li>Du service client et du service après-vente (SAV) auprès de ses acheteurs.</li>
              </ul>
              <p className="mt-1">
                Il est strictement interdit d'utiliser Momo Creator pour proposer des contenus protégés par le droit d'auteur sans autorisation, des fichiers malveillants ou frauduleux, ou tout service en violation directe de nos Conditions d'Utilisation.
              </p>
            </div>

            {/* Section 6 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">6. Litiges et Remboursements</h2>
              <p>
                Les achats de produits numériques téléchargeables sont par nature fermes et définitifs dès lors que le lien de téléchargement a été généré ou le fichier livré. Aucun remboursement ne pourra être exigé par l'acheteur après livraison du contenu, sauf accord direct et écrit du Vendeur ou dysfonctionnement technique majeur imputable à la Plateforme.
              </p>
              <p className="mt-1">
                Momo Creator agit en tant qu'intermédiaire technique et n'intervient pas dans les litiges éditoriaux ou commerciaux entre le Vendeur et son acheteur, sauf fraude manifeste ou non-livraison avérée.
              </p>
            </div>

            {/* Section 7 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">7. Disponibilité et Force Majeure</h2>
              <p>
                Nous faisons nos meilleurs efforts pour maintenir un accès constant à notre plateforme et garantir que vos clients puissent acheter et recevoir leurs contenus 24h/24. Néanmoins, l'accès peut être ponctuellement limité ou suspendu en cas d'opérations de maintenance préventive ou de pannes réseau chez nos opérateurs de paiement tiers, sans ouvrir droit à dédommagement.
              </p>
            </div>

            {/* Section 8 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">8. Modification des CGV</h2>
              <p>
                Momo Creator se réserve le droit de modifier les présentes Conditions Générales de Vente à tout moment. Les créateurs de contenu en seront avisés par notification ou email. La poursuite de l'utilisation des fonctionnalités de vente après publication des modifications vaut acceptation expresse des nouvelles CGV.
              </p>
            </div>

            {/* Section 9 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">9. Loi Applicable</h2>
              <p>
                Les présentes conditions sont régies par la législation applicable dans le pays d'exploitation de la plateforme. En cas de litige et à défaut d'accord amiable, les tribunaux compétents seront saisis du différend.
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
            <Link to="/legal/terms" className="hover:underline">Conditions d'utilisation</Link>
            <Link to="/legal/sales" className="hover:underline font-semibold text-accent-corail">Conditions de vente (CGV)</Link>
            <Link to="/legal/privacy" className="hover:underline">Politique de confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
