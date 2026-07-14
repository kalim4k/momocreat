/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SocialLinks {
  tiktok?: string;
  instagram?: string;
  snapchat?: string;
  whatsapp?: string;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  social_links?: SocialLinks | null;
  payout_phone_number: string; // Numéro pour le retrait Mobile Money
  payout_provider: 'wave' | 'orange' | 'mtn' | 'moov' | null;
  status?: 'active' | 'inactive';
  created_at: string;
}

export interface Content {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  price_fcfa: number; // Toujours un entier en FCFA, sans centimes
  thumbnail_url?: string | null;
  preview_url?: string | null; // Image de prévisualisation
  file_url: string; // URL du fichier réel (gardée secrète ou signée temporairement)
  content_type: 'video' | 'image' | 'pdf' | 'audio';
  status: 'published' | 'draft' | 'archived' | 'removed';
  is_published: boolean;
  auto_drafted_by_subscription?: boolean;
  created_at: string;
  creator?: CreatorProfile; // Relation optionnelle
}

export interface Purchase {
  id: string;
  buyer_phone: string; // Téléphone de l'acheteur ayant payé en Mobile Money
  content_id: string;
  status: 'pending' | 'completed' | 'failed';
  payment_reference: string; // Référence de transaction de l'agrégateur
  amount_paid_fcfa: number; // Montant total payé en FCFA
  commission_amount_fcfa: number; // Commission de la plateforme
  creator_net_amount_fcfa: number; // Revenu net pour le créateur (calculé à l'achat)
  created_at: string;
  content?: Content; // Relation optionnelle
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  creator_id: string;
  amount_requested: number;
  payout_provider: string; // mtn, orange, moov, wave, paypal, mixbyyass
  payout_phone_number: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  requested_at: string;
  processed_at?: string | null;
}

export interface Subscription {
  id: string;
  creator_id: string;
  transaction_id?: string | null;
  amount_paid: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
}


