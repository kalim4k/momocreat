import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Eye, Key, Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Privacy() {
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
              <ShieldCheck size={24} />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mt-2">
              Politique de Confidentialité
            </h1>
            <p className="text-xs text-text-secondary">
              Dernière mise à jour : 6 juillet 2026
            </p>
          </div>

          {/* Intro text */}
          <p className="text-sm sm:text-base leading-relaxed text-text-secondary">
            Chez <strong>Momo Creator</strong>, la protection de vos données personnelles et le respect de votre vie privée sont nos priorités absolues. Cette Politique de Confidentialité a pour but de vous expliquer de manière claire et transparente comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lors de l'utilisation de notre plateforme.
          </p>

          {/* Core grid highlighting 3 pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
            <div className="p-5 rounded-2xl border border-border-custom bg-light-bg-surface flex flex-col gap-3">
              <div className="p-2.5 rounded-xl bg-accent-corail/10 text-accent-corail w-fit">
                <Eye size={18} />
              </div>
              <h3 className="font-semibold text-sm text-text-primary">Transparence totale</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Nous ne collectons que les informations strictement nécessaires pour fournir nos services et traiter les paiements.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border-custom bg-light-bg-surface flex flex-col gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 w-fit">
                <Key size={18} />
              </div>
              <h3 className="font-semibold text-sm text-text-primary">Sécurité de pointe</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Toutes les données sensibles, y compris les jetons d'identification et les numéros de retrait, sont chiffrées.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border-custom bg-light-bg-surface flex flex-col gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit">
                <Database size={18} />
              </div>
              <h3 className="font-semibold text-sm text-text-primary">Aucune revente</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Vos informations personnelles ne seront jamais vendues, louées ou partagées avec des tiers à des fins publicitaires.
              </p>
            </div>
          </div>

          {/* Legal Text body */}
          <div className="flex flex-col gap-8 text-sm sm:text-base leading-relaxed text-text-secondary">
            
            {/* Section 1 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">1. Informations que nous collectons</h2>
              <p>
                Nous collectons différents types de données selon votre usage de la plateforme :
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2 mt-1 text-xs sm:text-sm">
                <li>
                  <strong>Pour les Créateurs :</strong> Nom complet, adresse email, mot de passe, coordonnées de retrait Mobile Money (numéro de téléphone et nom de l'opérateur), ainsi que les détails des fichiers mis en vente.
                </li>
                <li>
                  <strong>Pour les Acheteurs :</strong> Adresse email (pour la livraison des fichiers) et numéro de téléphone (uniquement pour initier la transaction de paiement Mobile Money sécurisée auprès de nos partenaires).
                </li>
                <li>
                  <strong>Données techniques :</strong> Adresse IP, type de navigateur et identifiants de cookies pour assurer la sécurité de notre plateforme et prévenir la fraude.
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">2. Utilisation de vos données</h2>
              <p>
                Nous utilisons les données collectées exclusivement pour les finalités suivantes :
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2 mt-1 text-xs sm:text-sm">
                <li>Traitement des paiements et sécurisation des transactions.</li>
                <li>Hébergement et livraison automatisée des contenus numériques aux acheteurs.</li>
                <li>Gestion des retraits de gains pour les créateurs.</li>
                <li>Support client et résolution de problèmes techniques.</li>
                <li>Prévention de la fraude, du piratage et des activités suspectes ou malveillantes.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">3. Partage des données</h2>
              <p>
                Nous partageons des données uniquement avec les prestataires tiers indispensables à la fourniture de nos services, notamment :
              </p>
              <p className="mt-1">
                - Nos processeurs et intégrateurs de paiements agréés pour le déclenchement des demandes de paiement par Mobile Money et cartes bancaires.
              </p>
              <p>
                - Nos infrastructures d'hébergement cloud sécurisées pour stocker vos fichiers de manière confidentielle.
              </p>
            </div>

            {/* Section 4 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">4. Conservation et Sécurité des données</h2>
              <p>
                Vos informations personnelles sont conservées aussi longtemps que nécessaire pour accomplir les objectifs décrits dans cette politique, ou pour nous conformer à nos obligations légales en matière fiscale et comptable. Nous appliquons des protocoles de sécurité stricts (HTTPS/TLS) pour interdire tout accès non autorisé à vos données personnelles.
              </p>
            </div>

            {/* Section 5 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">5. Vos Droits</h2>
              <p>
                Conformément aux législations sur la protection des données personnelles, vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données personnelles stockées chez nous.
              </p>
              <p className="mt-1">
                Vous pouvez exercer ces droits à tout moment en modifiant les informations directement dans votre panneau de configuration Créateur, ou en contactant notre service de support.
              </p>
            </div>

            {/* Section 6 */}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold text-text-primary">6. Contact</h2>
              <p>
                Pour toute question ou demande concernant cette Politique de Confidentialité, veuillez nous écrire à l'adresse suivante : <span className="text-accent-corail font-semibold">privacy@momocreator.com</span>.
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
            <Link to="/legal/sales" className="hover:underline">Conditions de vente (CGV)</Link>
            <Link to="/legal/privacy" className="hover:underline font-semibold text-accent-corail">Politique de confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
