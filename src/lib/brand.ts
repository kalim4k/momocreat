/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Actifs de marque — source unique.
 *
 * Le logo etait ecrit en dur dans dix fichiers, tous pointant vers le bucket Storage de
 * Supabase. Le jour ou ce bucket a repondu 402 (quota depasse), le logo a disparu partout en
 * meme temps : en-tete de la landing, connexion, inscription, tableau de bord, back-office,
 * portail acheteur, favicon. Rien ne signalait la panne cote code — les dix copies etaient
 * correctes, c'est l'hebergeur qui avait ferme la porte.
 *
 * Deux lecons, appliquees ici :
 *
 *   1. Un actif de marque ne se sert pas depuis un stockage tiers facture a l'usage. Il vit
 *      dans /public, il part avec le bundle, il ne peut pas tomber independamment du site.
 *   2. Une valeur repetee dix fois est une valeur qu'on ne pourra pas corriger d'un geste.
 *      Une constante, importee partout.
 *
 * Le fichier est un PNG 128x128 (~9 Ko) : le rendu le plus grand a l'ecran est 32 px CSS,
 * soit 96 px sur un ecran a 3x. L'original de 1254x1254 pesait 759 Ko pour le meme resultat
 * visible — sur une application pensee pour des connexions mobiles africaines, c'est 750 Ko
 * de trop.
 */
export const LOGO_URL = '/logo.png';
