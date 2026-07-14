/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta.env as any).SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta.env as any).SUPABASE_ANON_KEY;

// Vérification de la configuration (on s'assure que les variables d'environnement ne sont pas des placeholders)
const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-public-key';

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Récupère l'instance du client Supabase.
 * Lève un message d'avertissement dans la console si non configuré, pour éviter tout plantage au démarrage.
 */
export function getSupabaseClient() {
  if (!supabase) {
    console.warn(
      "Supabase n'est pas encore configuré ou utilise des clés de démonstration. " +
      "Veuillez définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env.local pour l'intégration réelle."
    );
  }
  return supabase;
}
