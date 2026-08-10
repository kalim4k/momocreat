/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { serverDb } from './src/lib/serverDb';

dotenv.config();

// Ensure both VITE_ prefixed and standard environment variables are mapped on process.env
process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
process.env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

process.env.MAKETOU_API_KEY = process.env.MAKETOU_API_KEY || process.env.VITE_MAKETOU_API_KEY;
process.env.VITE_MAKETOU_API_KEY = process.env.MAKETOU_API_KEY || process.env.VITE_MAKETOU_API_KEY;

process.env.MAKETOU_PRODUCT_ID = process.env.MAKETOU_PRODUCT_ID || process.env.VITE_MAKETOU_PRODUCT_ID;
process.env.VITE_MAKETOU_PRODUCT_ID = process.env.MAKETOU_PRODUCT_ID || process.env.VITE_MAKETOU_PRODUCT_ID;

process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'bigardlamine@gmail.com';
process.env.VITE_ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'bigardlamine@gmail.com';

const app = express();
const PORT = 3000;

app.use(express.json());

// Resolves the public URL of this deployment for building payment redirect links.
// Ignores unset/placeholder env values (e.g. "MY_APP_URL" left over from scaffolding)
// and falls back to VERCEL_URL, which Vercel sets automatically on every deployment.
const getAppUrl = () => {
  const isRealUrl = (v?: string) => !!v && /^https?:\/\//.test(v);
  const configuredAppUrl = [process.env.NEXT_PUBLIC_APP_URL, process.env.APP_URL].find(isRealUrl);
  const vercelAppUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  let url = (configuredAppUrl || vercelAppUrl || `http://localhost:${PORT}`).replace(/\/$/, '');
  if (url.includes('localhost')) {
    url = url.replace('localhost', 'lvh.me');
  }
  return url;
};

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-public-key';

const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const supabaseAdmin = isSupabaseConfigured && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to standard client if service role key is not set

console.log(`[Server] Supabase configuration status: ${isSupabaseConfigured ? 'CONNECTED' : 'DEMO MODE'}`);
console.log(`[Server] Supabase Admin status: ${supabaseAdmin !== supabase ? 'SERVICE ROLE ENABLED' : 'FALLBACK MODE'}`);


// ==========================================
// API ROUTES
// ==========================================

/**
 * 1. POST /api/payment/create-cart
 */
app.post('/api/payment/create-cart', async (req, res) => {
  const { contentId, buyerEmail, buyerFirstName, buyerLastName, buyerPhone } = req.body;

  if (!contentId || !buyerEmail || !buyerFirstName || !buyerLastName) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (contentId, buyerEmail, buyerFirstName, buyerLastName).' });
  }

  try {
    let content: any = null;

    // a. Retrieve content details
    if (supabase) {
      const { data, error } = await supabase
        .from('contents')
        .select('*, creator_profiles(*)')
        .eq('id', contentId)
        .maybeSingle();

      if (error) {
        console.error('[Server] Supabase error fetching content:', error);
      }
      content = data;
    }

    // Fallback if content is null or in demo mode
    if (!content) {
      // Look up in momo_local_contents from server db or defaults
      const localContents = [
        {
          id: '1',
          creator_id: 'creator_1',
          title: 'Pack PDF : Booster son audience TikTok en 30 jours',
          price_fcfa: 2500,
          status: 'published',
          is_published: true,
          creator_profiles: { user_id: 'user_1', id: 'creator_1' }
        },
        {
          id: '2',
          creator_id: 'creator_1',
          title: 'Template Notion : Organiser ses tournages Reels & TikTok',
          price_fcfa: 1500,
          status: 'published',
          is_published: true,
          creator_profiles: { user_id: 'user_1', id: 'creator_1' }
        },
        {
          id: '3',
          creator_id: 'creator_1',
          title: 'Masterclass : Décryptage de l\'Algorithme 2026 (Vidéo 20m)',
          price_fcfa: 5000,
          status: 'published',
          is_published: true,
          creator_profiles: { user_id: 'user_1', id: 'creator_1' }
        }
      ];
      
      content = localContents.find(c => c.id === contentId);
    }

    if (!content) {
      return res.status(404).json({ error: 'Contenu non trouvé.' });
    }

    const price_amount = content.price_fcfa || content.price_amount;
    const isPublished = content.status === 'published' || content.is_published === true;
    
    if (!isPublished) {
      return res.status(400).json({ error: 'Ce contenu n\'est pas publié.' });
    }

    // b. Verify no completed purchase already exists for (buyerEmail + contentId)
    const existingPurchases = serverDb.getPurchases();
    const hasBought = existingPurchases.some(
      p => p.buyerEmail.toLowerCase() === buyerEmail.toLowerCase() && p.contentId === contentId && p.status === 'completed'
    );

    if (hasBought) {
      return res.status(400).json({ error: 'Vous avez déjà acheté ce contenu.' });
    }

    // c. Create a purchase line with status = 'pending'
    const commission_amount = Math.round(price_amount * 0.18);
    const creator_net_amount = price_amount - commission_amount;

    let purchaseId = `purchase_${Math.random().toString(36).substring(2, 11)}`;

    if (supabase) {
      try {
        const { data: pbData, error: pbErr } = await supabase
          .from('purchases')
          .insert({
            buyer_phone: buyerPhone || 'Non fourni',
            content_id: contentId,
            status: 'pending',
            amount_paid_fcfa: price_amount,
            commission_amount_fcfa: commission_amount,
            creator_net_amount_fcfa: creator_net_amount,
            payment_reference: 'temp_ref_' + Date.now()
          })
          .select()
          .single();

        if (!pbErr && pbData) {
          purchaseId = pbData.id;
        } else {
          console.error('[Server] Supabase purchase insertion warning:', pbErr);
        }
      } catch (dbErr) {
        console.error('[Server] DB writing exception:', dbErr);
      }
    }

    // Save to our file-based DB as primary state of truth
    const localPurchase = serverDb.addPurchase({
      id: purchaseId,
      buyerPhone: buyerPhone || '',
      buyerEmail: buyerEmail,
      buyerFirstName: buyerFirstName,
      buyerLastName: buyerLastName,
      contentId: contentId,
      status: 'pending',
      paymentReference: '', // Will be updated to cartId once returned
      amountPaid: price_amount,
      commissionAmount: commission_amount,
      creatorNetAmount: creator_net_amount
    });

    const isMaketouConfigured = process.env.MAKETOU_API_KEY && process.env.MAKETOU_PRODUCT_ID;

    // d. Call Maketou Checkout or Simulate if not configured
    if (isMaketouConfigured) {
      const appUrl = getAppUrl();
      const redirectURL = `${appUrl}/payment/confirm?cartId={cartId}&purchaseId=${purchaseId}`;

      // Maketou requires strict E.164 format (e.g. +221771234567); reject anything else
      // rather than sending a malformed value that fails their validation for the whole cart.
      const normalizedPhone = (buyerPhone || '').replace(/[^\d+]/g, '');
      const isValidE164Phone = /^\+\d{8,15}$/.test(normalizedPhone);

      const requestBody = {
        productDocumentId: process.env.MAKETOU_PRODUCT_ID,
        email: buyerEmail,
        firstName: buyerFirstName,
        lastName: buyerLastName,
        phone: isValidE164Phone ? normalizedPhone : undefined,
        customerPrice: price_amount,
        redirectURL: redirectURL,
        meta: { contentId, purchaseId, buyerEmail }
      };

      console.log('[Server] Requesting Maketou checkout:', requestBody);

      const maketouRes = await fetch('https://api.maketou.net/api/v1/stores/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAKETOU_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!maketouRes.ok) {
        const errorText = await maketouRes.text();
        console.error('[Server] Maketou API error:', errorText);
        throw new Error(`Erreur Maketou API: ${maketouRes.statusText}`);
      }

      const maketouData = await maketouRes.json();
      console.log('[Server] Maketou Response:', maketouData);

      // Extract cartId and redirectUrl with fallback patterns
      const cart = maketouData.cart || maketouData || {};
      const cartId = cart.id || cart.cartId || cart.uuid || maketouData.id || maketouData.cartId || maketouData.cart_id || maketouData.uuid;
      const redirectUrl = maketouData.redirectUrl || maketouData.checkoutUrl || maketouData.checkout_url || maketouData.url || maketouData.paymentUrl || maketouData.payment_url || cart.redirectUrl || cart.checkoutUrl || cart.checkout_url || cart.url || cart.paymentUrl || cart.payment_url;

      if (!cartId || !redirectUrl) {
        console.error('[Server] Missing keys in Maketou response. Full response:', JSON.stringify(maketouData));
        throw new Error(`Données de panier ou d'URL de redirection manquantes dans la réponse Maketou. Réponse reçue: ${JSON.stringify(maketouData)}`);
      }

      // e. Mettre à jour la ligne purchase avec transaction_id -> créer d'abord transactions
      serverDb.updatePurchase(purchaseId, { paymentReference: cartId });

      // Create in-memory transaction record
      serverDb.addTransaction({
        provider: 'maketou',
        providerTransactionId: cartId,
        status: 'pending',
        type: 'purchase'
      });

      if (supabase) {
        try {
          // Attempt insertion in custom transactions table if it exists
          await supabase
            .from('transactions')
            .insert({
              provider: 'maketou',
              provider_transaction_id: cartId,
              status: 'pending',
              type: 'purchase'
            })
            .select()
            .maybeSingle();

          // Update purchase with payment_reference
          await supabase
            .from('purchases')
            .update({ payment_reference: cartId })
            .eq('id', purchaseId);
        } catch (dbErr) {
          console.warn('[Server] Supabase transaction update skipped or failed:', dbErr);
        }
      }

      // f. Return redirectUrl
      return res.json({ redirectUrl });

    } else {
      // SIMULATE PAYMENT PROCESS
      console.log('[Server] Maketou not configured. Simulating payment checkout redirect.');
      const mockCartId = `mock_cart_${Math.random().toString(36).substring(2, 11)}`;
      
      // Update local storage
      serverDb.updatePurchase(purchaseId, { paymentReference: mockCartId });
      serverDb.addTransaction({
        provider: 'maketou',
        providerTransactionId: mockCartId,
        status: 'pending',
        type: 'purchase'
      });

      const appUrl = getAppUrl();
      const simulatedRedirectUrl = `${appUrl}/payment/confirm?cartId=${mockCartId}&purchaseId=${purchaseId}`;

      return res.json({ redirectUrl: simulatedRedirectUrl });
    }

  } catch (err: any) {
    console.error('[Server] Create Cart handler error:', err);
    return res.status(500).json({ error: err.message || 'Une erreur interne est survenue lors de l\'initialisation du paiement.' });
  }
});


/**
 * 2. GET /api/payment/check-status
 * Verifies cart status with Maketou or simulation, and finalizes purchase
 */
app.get('/api/payment/check-status', async (req, res) => {
  const { cartId, purchaseId } = req.query;

  if (!cartId || !purchaseId) {
    return res.status(400).json({ error: 'Paramètres cartId et purchaseId requis.' });
  }

  try {
    const purchase = serverDb.getPurchase(purchaseId as string);
    if (!purchase) {
      return res.status(404).json({ error: 'Achat non trouvé.' });
    }

    // Retrieve content title and creator username dynamically
    let contentTitle = 'Contenu exclusif';
    let creatorUsername = 'michella_coaching'; // Default demo fallback

    if (supabase) {
      try {
        const { data: contentData } = await supabase
          .from('contents')
          .select('title, creator_profiles(username)')
          .eq('id', purchase.contentId)
          .maybeSingle();

        if (contentData) {
          contentTitle = contentData.title;
          if (contentData.creator_profiles) {
            creatorUsername = (contentData.creator_profiles as any).username || 'michella_coaching';
          }
        }
      } catch (err) {
        console.warn('[Server] Error fetching content title inside check-status:', err);
      }
    } else {
      // Look up in seeds
      const localContents = [
        { id: '1', title: 'Pack PDF : Booster son audience TikTok en 30 jours', creatorUsername: 'michella_coaching' },
        { id: '2', title: 'Template Notion : Organiser ses tournages Reels & TikTok', creatorUsername: 'michella_coaching' },
        { id: '3', title: 'Masterclass : Décryptage de l\'Algorithme 2026 (Vidéo 20m)', creatorUsername: 'michella_coaching' }
      ];
      const found = localContents.find(c => c.id === purchase.contentId);
      if (found) {
        contentTitle = found.title;
        creatorUsername = found.creatorUsername;
      } else {
        // Look up in serverDb or leave defaults
        contentTitle = 'Votre contenu exclusif';
      }
    }

    let statusToSet: 'completed' | 'failed' | 'waiting_payment' = 'waiting_payment';

    // Check if mock mode
    const isMock = (cartId as string).startsWith('mock_') || !process.env.MAKETOU_API_KEY;

    if (isMock) {
      // Simulated: completes immediately
      statusToSet = 'completed';
    } else {
      // Call Maketou
      console.log(`[Server] Polling Maketou status for cart ${cartId}`);
      const maketouRes = await fetch(`https://api.maketou.net/api/v1/stores/cart/${cartId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MAKETOU_API_KEY}`
        }
      });

      if (!maketouRes.ok) {
        console.error('[Server] Maketou status check error:', maketouRes.statusText);
        return res.status(500).json({ error: 'Impossible de vérifier le statut auprès de Maketou.' });
      }

      const cartData = await maketouRes.json();
      console.log('[Server] Maketou Cart status details:', cartData);

      const cartStatus = cartData.status || cartData.cart?.status;

      if (cartStatus === 'completed' || cartStatus === 'success') {
        statusToSet = 'completed';
      } else if (cartStatus === 'payment_failed' || cartStatus === 'failed' || cartStatus === 'abandoned') {
        statusToSet = 'failed';
      } else {
        statusToSet = 'waiting_payment';
      }
    }

    // Process State Changes
    if (statusToSet === 'completed') {
      // Update local db
      serverDb.updatePurchase(purchase.id, { status: 'completed', purchasedAt: new Date().toISOString() });
      serverDb.updateTransactionByCart(cartId as string, { status: 'success' });

      // Fetch content details to know creator to notify
      let creatorUserId: string | null = null;

      if (supabase) {
        try {
          const { data: contentData } = await supabase
            .from('contents')
            .select('*, creator_profiles(*)')
            .eq('id', purchase.contentId)
            .maybeSingle();

          if (contentData) {
            creatorUserId = contentData.creator_profiles?.user_id || contentData.creator_profiles?.id;
          }

          // Update Supabase tables
          await supabase
            .from('purchases')
            .update({ status: 'completed' })
            .eq('id', purchase.id);

          try {
            await supabase
              .from('transactions')
              .update({ status: 'success' })
              .eq('provider_transaction_id', cartId);
          } catch (e) {}

          // Create notification in Supabase
          if (creatorUserId) {
            await supabase
              .from('notifications')
              .insert({
                user_id: creatorUserId,
                title: 'Nouvelle vente !',
                message: `L'acheteur ${purchase.buyerFirstName} a débloqué votre contenu "${contentTitle}" pour ${purchase.amountPaid} FCFA.`,
                is_read: false
              });
          }

        } catch (dbErr) {
          console.error('[Server] Supabase completed status write warning:', dbErr);
        }
      }

      // Add server local notification
      serverDb.addNotification({
        userId: creatorUserId || 'creator_1',
        type: 'new_sale',
        title: 'Nouvelle vente !',
        message: `L'acheteur ${purchase.buyerFirstName} a débloqué votre contenu "${contentTitle}" pour ${purchase.amountPaid} FCFA.`
      });

      return res.json({ status: 'completed', contentId: purchase.contentId, contentTitle, creatorUsername });

    } else if (statusToSet === 'failed') {
      serverDb.updatePurchase(purchase.id, { status: 'failed' });
      serverDb.updateTransactionByCart(cartId as string, { status: 'failed' });

      if (supabase) {
        try {
          await supabase
            .from('purchases')
            .update({ status: 'failed' })
            .eq('id', purchase.id);

          try {
            await supabase
              .from('transactions')
              .update({ status: 'failed' })
              .eq('provider_transaction_id', cartId);
          } catch (e) {}
        } catch (dbErr) {
          console.error('[Server] Supabase failed status write warning:', dbErr);
        }
      }

      return res.json({ status: 'failed', contentId: purchase.contentId, contentTitle, creatorUsername });
    } else {
      return res.json({ status: 'waiting_payment', contentId: purchase.contentId, contentTitle, creatorUsername });
    }

  } catch (err: any) {
    console.error('[Server] Status verification error:', err);
    return res.status(500).json({ error: err.message || 'Erreur lors de la vérification.' });
  }
});


/**
 * POST /api/payment/create-donation-cart
 * Initiates a free-amount Maketou checkout so a fan can send a creator a direct donation.
 * Mirrors /api/payment/create-cart, but the amount is chosen by the donor instead of coming from a content row.
 */
app.post('/api/payment/create-donation-cart', async (req, res) => {
  const { creatorId, amount, donorName, donorEmail, donorMessage } = req.body;

  if (!creatorId || !amount || !donorName) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (creatorId, amount, donorName).' });
  }

  const donationAmount = Math.round(Number(amount));
  if (!Number.isFinite(donationAmount) || donationAmount < 1000) {
    return res.status(400).json({ error: 'Le montant du don doit être d\'au moins 1000 FCFA.' });
  }

  try {
    let creator: any = null;
    if (supabase) {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('id', creatorId)
        .maybeSingle();
      if (error) {
        console.error('[Server] Supabase error fetching creator for donation:', error);
      }
      creator = data;
    }

    if (!creator) {
      const localCreators = serverDb.getCreators();
      creator = localCreators.find((c: any) => c.id === creatorId);
    }

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé.' });
    }

    // Same commission rate applied to content purchases (server.ts create-cart handler)
    const commission_amount = Math.round(donationAmount * 0.18);
    const creator_net_amount = donationAmount - commission_amount;

    let donationId = `donation_${Math.random().toString(36).substring(2, 11)}`;

    if (supabase) {
      try {
        const { data: donData, error: donErr } = await supabase
          .from('donations')
          .insert({
            creator_id: creatorId,
            donor_name: donorName,
            donor_email: donorEmail || null,
            donor_message: donorMessage || null,
            status: 'pending',
            amount_fcfa: donationAmount,
            commission_amount_fcfa: commission_amount,
            creator_net_amount_fcfa: creator_net_amount,
            payment_reference: 'temp_ref_' + Date.now()
          })
          .select()
          .single();

        if (!donErr && donData) {
          donationId = donData.id;
        } else {
          console.error('[Server] Supabase donation insertion warning:', donErr);
        }
      } catch (dbErr) {
        console.error('[Server] DB writing exception:', dbErr);
      }
    }

    serverDb.addDonation({
      id: donationId,
      creatorId,
      donorName,
      donorEmail,
      donorMessage,
      status: 'pending',
      paymentReference: '',
      amount: donationAmount,
      commissionAmount: commission_amount,
      creatorNetAmount: creator_net_amount
    });

    const isMaketouConfigured = process.env.MAKETOU_API_KEY && process.env.MAKETOU_PRODUCT_ID;

    if (isMaketouConfigured) {
      const appUrl = getAppUrl();
      const redirectURL = `${appUrl}/payment/confirm?cartId={cartId}&purchaseId=${donationId}&kind=donation`;

      const [donorFirstName, ...rest] = (donorName as string).trim().split(' ');
      const donorLastName = rest.join(' ') || donorFirstName;

      const requestBody = {
        productDocumentId: process.env.MAKETOU_PRODUCT_ID,
        email: donorEmail || 'anonyme@momolink.pro',
        firstName: donorFirstName,
        lastName: donorLastName,
        customerPrice: donationAmount,
        redirectURL: redirectURL,
        meta: { donationId, creatorId }
      };

      const maketouRes = await fetch('https://api.maketou.net/api/v1/stores/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAKETOU_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!maketouRes.ok) {
        const errorText = await maketouRes.text();
        console.error('[Server] Maketou API error (donation):', errorText);
        throw new Error(`Erreur Maketou API: ${maketouRes.statusText}`);
      }

      const maketouData = await maketouRes.json();
      const cart = maketouData.cart || maketouData || {};
      const cartId = cart.id || cart.cartId || cart.uuid || maketouData.id || maketouData.cartId || maketouData.cart_id || maketouData.uuid;
      const redirectUrl = maketouData.redirectUrl || maketouData.checkoutUrl || maketouData.checkout_url || maketouData.url || maketouData.paymentUrl || maketouData.payment_url || cart.redirectUrl || cart.checkoutUrl || cart.checkout_url || cart.url || cart.paymentUrl || cart.payment_url;

      if (!cartId || !redirectUrl) {
        console.error('[Server] Missing keys in Maketou donation response. Full response:', JSON.stringify(maketouData));
        throw new Error(`Données de panier ou d'URL de redirection manquantes dans la réponse Maketou. Réponse reçue: ${JSON.stringify(maketouData)}`);
      }

      serverDb.updateDonation(donationId, { paymentReference: cartId });
      serverDb.addTransaction({ provider: 'maketou', providerTransactionId: cartId, status: 'pending', type: 'purchase' });

      if (supabase) {
        try {
          await supabase.from('donations').update({ payment_reference: cartId }).eq('id', donationId);
        } catch (dbErr) {
          console.warn('[Server] Supabase donation reference update skipped:', dbErr);
        }
      }

      return res.json({ redirectUrl });

    } else {
      console.log('[Server] Maketou not configured. Simulating donation checkout redirect.');
      const mockCartId = `mock_cart_${Math.random().toString(36).substring(2, 11)}`;
      serverDb.updateDonation(donationId, { paymentReference: mockCartId });
      serverDb.addTransaction({ provider: 'maketou', providerTransactionId: mockCartId, status: 'pending', type: 'purchase' });

      const appUrl = getAppUrl();
      const simulatedRedirectUrl = `${appUrl}/payment/confirm?cartId=${mockCartId}&purchaseId=${donationId}&kind=donation`;
      return res.json({ redirectUrl: simulatedRedirectUrl });
    }

  } catch (err: any) {
    console.error('[Server] Create Donation Cart handler error:', err);
    return res.status(500).json({ error: err.message || 'Une erreur interne est survenue lors de l\'initialisation du don.' });
  }
});


/**
 * GET /api/payment/check-donation-status
 * Verifies donation cart status with Maketou or simulation, and finalizes the donation.
 * Mirrors /api/payment/check-status for content purchases.
 */
app.get('/api/payment/check-donation-status', async (req, res) => {
  const { cartId, purchaseId } = req.query;

  if (!cartId || !purchaseId) {
    return res.status(400).json({ error: 'Paramètres cartId et purchaseId requis.' });
  }

  try {
    const donation = serverDb.getDonation(purchaseId as string);
    if (!donation) {
      return res.status(404).json({ error: 'Don non trouvé.' });
    }

    let creatorUsername = 'michella_coaching';
    if (supabase) {
      try {
        const { data: creatorData } = await supabase
          .from('creator_profiles')
          .select('username')
          .eq('id', donation.creatorId)
          .maybeSingle();
        if (creatorData) creatorUsername = creatorData.username;
      } catch (err) {
        console.warn('[Server] Error fetching creator username inside check-donation-status:', err);
      }
    }

    let statusToSet: 'completed' | 'failed' | 'waiting_payment' = 'waiting_payment';
    const isMock = (cartId as string).startsWith('mock_') || !process.env.MAKETOU_API_KEY;

    if (isMock) {
      statusToSet = 'completed';
    } else {
      const maketouRes = await fetch(`https://api.maketou.net/api/v1/stores/cart/${cartId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${process.env.MAKETOU_API_KEY}` }
      });

      if (!maketouRes.ok) {
        console.error('[Server] Maketou donation status check error:', maketouRes.statusText);
        return res.status(500).json({ error: 'Impossible de vérifier le statut auprès de Maketou.' });
      }

      const cartData = await maketouRes.json();
      const cartStatus = cartData.status || cartData.cart?.status;

      if (cartStatus === 'completed' || cartStatus === 'success') {
        statusToSet = 'completed';
      } else if (cartStatus === 'payment_failed' || cartStatus === 'failed' || cartStatus === 'abandoned') {
        statusToSet = 'failed';
      } else {
        statusToSet = 'waiting_payment';
      }
    }

    if (statusToSet === 'completed') {
      serverDb.updateDonation(donation.id, { status: 'completed' });
      serverDb.updateTransactionByCart(cartId as string, { status: 'success' });

      if (supabase) {
        try {
          await supabase.from('donations').update({ status: 'completed' }).eq('id', donation.id);
          try {
            await supabase.from('transactions').update({ status: 'success' }).eq('provider_transaction_id', cartId);
          } catch (e) {}
        } catch (dbErr) {
          console.error('[Server] Supabase donation completed write warning:', dbErr);
        }
      }

      return res.json({ status: 'completed', creatorUsername, amount: donation.amount });

    } else if (statusToSet === 'failed') {
      serverDb.updateDonation(donation.id, { status: 'failed' });
      serverDb.updateTransactionByCart(cartId as string, { status: 'failed' });

      if (supabase) {
        try {
          await supabase.from('donations').update({ status: 'failed' }).eq('id', donation.id);
        } catch (dbErr) {
          console.error('[Server] Supabase donation failed write warning:', dbErr);
        }
      }

      return res.json({ status: 'failed', creatorUsername });
    } else {
      return res.json({ status: 'waiting_payment', creatorUsername });
    }

  } catch (err: any) {
    console.error('[Server] Donation status verification error:', err);
    return res.status(500).json({ error: err.message || 'Erreur lors de la vérification.' });
  }
});


/**
 * POST /api/payment/create-anonymous-cart
 * Initiates an anonymous cart checkout for 2500 FCFA on Maketou without database storage.
 */
app.post('/api/payment/create-anonymous-cart', async (req, res) => {
  try {
    const isMaketouConfigured = process.env.MAKETOU_API_KEY && process.env.MAKETOU_PRODUCT_ID;
    const price_amount = 2500;

    // Use dummy/placeholder customer details to bypass Maketou requirements
    const buyerEmail = 'anonymous-payment@example.com';
    const buyerFirstName = 'Client';
    const buyerLastName = 'Anonyme';

    if (isMaketouConfigured) {
      const appUrl = getAppUrl();
      const redirectURL = `${appUrl}/pay/confirm`;

      const requestBody = {
        productDocumentId: process.env.MAKETOU_PRODUCT_ID,
        email: buyerEmail,
        firstName: buyerFirstName,
        lastName: buyerLastName,
        customerPrice: price_amount,
        redirectURL: redirectURL,
        meta: { isAnonymous: true }
      };

      console.log('[Server] Requesting anonymous Maketou checkout:', requestBody);

      const maketouRes = await fetch('https://api.maketou.net/api/v1/stores/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAKETOU_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!maketouRes.ok) {
        const errorText = await maketouRes.text();
        console.error('[Server] Anonymous Maketou API error:', errorText);
        throw new Error(`Erreur Maketou API: ${maketouRes.statusText}`);
      }

      const maketouData = await maketouRes.json();
      console.log('[Server] Anonymous Maketou Response:', maketouData);

      const cart = maketouData.cart || maketouData || {};
      const cartId = cart.id || cart.cartId || cart.uuid || maketouData.id || maketouData.cartId || maketouData.cart_id || maketouData.uuid;
      const redirectUrl = maketouData.redirectUrl || maketouData.checkoutUrl || maketouData.checkout_url || maketouData.url || maketouData.paymentUrl || maketouData.payment_url || cart.redirectUrl || cart.checkoutUrl || cart.checkout_url || cart.url || cart.paymentUrl || cart.payment_url;

      if (!cartId || !redirectUrl) {
        console.error('[Server] Missing keys in Maketou response. Full response:', JSON.stringify(maketouData));
        throw new Error(`Données de panier ou d'URL de redirection manquantes dans la réponse Maketou.`);
      }

      return res.json({ redirectUrl, cartId });
    } else {
      // Simulation mode
      console.log('[Server] Maketou not configured. Simulating anonymous checkout.');
      const mockCartId = `mock_cart_anon_${Math.random().toString(36).substring(2, 11)}`;
      const appUrl = getAppUrl();
      const simulatedRedirectUrl = `${appUrl}/pay/confirm?cartId=${mockCartId}`;

      return res.json({ redirectUrl: simulatedRedirectUrl, cartId: mockCartId });
    }
  } catch (err: any) {
    console.error('[Server] Create Anonymous Cart error:', err);
    return res.status(500).json({ error: err.message || 'Une erreur interne est survenue lors de l\'initialisation.' });
  }
});

/**
 * GET /api/payment/check-anonymous-status
 * Checks the status of an anonymous Maketou cart without database storage.
 */
app.get('/api/payment/check-anonymous-status', async (req, res) => {
  const { cartId } = req.query;

  if (!cartId) {
    return res.status(400).json({ error: 'Paramètre cartId requis.' });
  }

  try {
    const isMock = (cartId as string).startsWith('mock_') || !process.env.MAKETOU_API_KEY;

    if (isMock) {
      // Simulated: completes immediately
      return res.json({ status: 'completed' });
    } else {
      console.log(`[Server] Polling Maketou status for anonymous cart ${cartId}`);
      const maketouRes = await fetch(`https://api.maketou.net/api/v1/stores/cart/${cartId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MAKETOU_API_KEY}`
        }
      });

      if (!maketouRes.ok) {
        console.error('[Server] Anonymous Maketou status check error:', maketouRes.statusText);
        return res.status(500).json({ error: 'Impossible de vérifier le statut auprès de Maketou.' });
      }

      const cartData = await maketouRes.json();
      console.log('[Server] Anonymous Maketou Cart status details:', cartData);

      const cartStatus = cartData.status || cartData.cart?.status;

      let statusToReturn = 'waiting_payment';
      if (cartStatus === 'completed' || cartStatus === 'success') {
        statusToReturn = 'completed';
      } else if (cartStatus === 'payment_failed' || cartStatus === 'failed' || cartStatus === 'abandoned') {
        statusToReturn = 'failed';
      }

      return res.json({ status: statusToReturn });
    }
  } catch (err: any) {
    console.error('[Server] Anonymous status verification error:', err);
    return res.status(500).json({ error: err.message || 'Erreur lors de la vérification.' });
  }
});


/**
 * GET /api/payment/access-list
 * Returns list of completed purchase contentIds for an email
 */
app.get('/api/payment/access-list', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email requis.' });
  }
  try {
    const purchases = serverDb.getPurchases();
    const activePurchases = purchases.filter(
      p => p.buyerEmail.toLowerCase() === (email as string).toLowerCase() && p.status === 'completed'
    );
    const contentIds = activePurchases.map(p => p.contentId);
    return res.json({ contentIds });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


/**
 * 3. GET /api/payment/access
 * Checks if a buyer (by email) has access to a content.
 * Returns { hasAccess: boolean, signedUrl?: string }
 */
app.get('/api/payment/access', async (req, res) => {
  const { contentId, email } = req.query;

  if (!contentId || !email) {
    return res.status(400).json({ error: 'Champs contentId et email requis.' });
  }

  try {
    const purchases = serverDb.getPurchases();
    const hasAccess = purchases.some(
      p => p.contentId === contentId && 
           p.buyerEmail.toLowerCase() === (email as string).toLowerCase() && 
           p.status === 'completed'
    );

    if (!hasAccess) {
      return res.json({ hasAccess: false });
    }

    // Retrieve fileUrl from database
    let fileUrl = '';
    if (supabase) {
      const { data } = await supabase
        .from('contents')
        .select('file_url')
        .eq('id', contentId)
        .maybeSingle();
      if (data) {
        fileUrl = data.file_url;
      }
    }

    // Fallback file_url for local seeds
    if (!fileUrl) {
      const defaults: Record<string, string> = {
        '1': 'https://example.com/secured/guide-tiktok.pdf',
        '2': 'https://example.com/secured/notion-template.zip',
        '3': 'https://example.com/secured/masterclass-algo.mp4'
      };
      fileUrl = defaults[contentId as string] || 'https://example.com/secured/content.zip';
    }

    let signedUrl = fileUrl;

    // Generate signed Supabase Storage URL if supabase is connected
    if (supabase && fileUrl) {
      try {
        // Parse bucket name and path safely
        // Standard path is: bucket_name/file_path
        let storagePath = fileUrl;
        
        if (fileUrl.includes('/storage/v1/object/private/contents/')) {
          storagePath = fileUrl.split('/storage/v1/object/private/contents/')[1];
        } else if (fileUrl.includes('/storage/v1/object/public/contents/')) {
          storagePath = fileUrl.split('/storage/v1/object/public/contents/')[1];
        } else if (fileUrl.startsWith('http')) {
          // Extract path from general URL
          const parsed = new URL(fileUrl);
          const paths = parsed.pathname.split('/');
          storagePath = paths[paths.length - 1];
        }

        const { data, error } = await supabase.storage
          .from('contents')
          .createSignedUrl(storagePath, 3600); // 1 hour expiration

        if (!error && data?.signedUrl) {
          signedUrl = data.signedUrl;
        } else if (error) {
          console.warn('[Server] Supabase Storage signed URL generation error:', error.message);
        }
      } catch (err) {
        console.error('[Server] Exception generating signed URL:', err);
      }
    }

    return res.json({ hasAccess: true, signedUrl });

  } catch (err: any) {
    console.error('[Server] Access check error:', err);
    return res.status(500).json({ error: err.message || 'Une erreur est survenue lors de la vérification des accès.' });
  }
});


// ==========================================
// SYSTEME D'ABONNEMENT CREATEUR (Étape 9)
// ==========================================

async function isCreatorSubscribedServer(creatorId: string): Promise<boolean> {
  const graceLimit = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

  if (supabase) {
    try {
      // Fetch user_id for this creatorId first
      const { data: currentCreator } = await supabase
        .from('creator_profiles')
        .select('user_id')
        .eq('id', creatorId)
        .maybeSingle();

      if (currentCreator?.user_id) {
        const userId = currentCreator.user_id;

        // 1. Check if ANY creator profile for this user has is_premium set
        const { data: premiumProfiles } = await supabase
          .from('creator_profiles')
          .select('is_premium, premium_expires_at')
          .eq('user_id', userId)
          .eq('is_premium', true);

        const hasPremiumProfile = (premiumProfiles || []).some(cp => 
          !cp.premium_expires_at || new Date(cp.premium_expires_at).getTime() > graceLimit.getTime()
        );

        if (hasPremiumProfile) {
          return true;
        }

        // 2. Check if ANY creator profile for this user has an active subscription
        const { data: userProfiles } = await supabase
          .from('creator_profiles')
          .select('id')
          .eq('user_id', userId);
        
        const profileIds = (userProfiles || []).map(p => p.id);

        if (profileIds.length > 0) {
          const { data: subs, error } = await supabase
            .from('subscriptions')
            .select('end_date')
            .in('creator_id', profileIds)
            .eq('status', 'active')
            .gt('end_date', graceLimit.toISOString());

          if (!error && subs && subs.length > 0) {
            return true;
          }
        }
      }
    } catch (err) {
      console.warn('[Server] Supabase error in isCreatorSubscribedServer:', err);
    }
  }

  // Fallback to local server db
  const localCreator = serverDb.getCreators().find(c => c.id === creatorId);
  if (localCreator) {
    const userId = localCreator.user_id;
    // Check if any local creator with same user_id is premium
    const localUserCreators = serverDb.getCreators().filter(c => c.user_id === userId);
    const anyPremium = localUserCreators.some(c => c.is_premium);
    if (anyPremium) return true;

    // Check if any local creator with same user_id has subscription
    for (const c of localUserCreators) {
      if (serverDb.isCreatorSubscribed(c.id)) {
        return true;
      }
    }
  }
  
  return false;
}

async function apply_subscription_expiry() {
  console.log('[Server] Running apply_subscription_expiry check...');
  const now = new Date();
  const thresholdDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

  try {
    if (supabase) {
      try {
        // Find subscriptions that are expired past 3 days grace
        const { data: expiredSubs, error: subErr } = await supabase
          .from('subscriptions')
          .select('id, creator_id, end_date')
          .eq('status', 'active')
          .lt('end_date', thresholdDate.toISOString());

        if (!subErr && expiredSubs && expiredSubs.length > 0) {
          for (const sub of expiredSubs) {
            // Check if creator profile is_premium is set to true manually
            const { data: creatorProfile } = await supabase
              .from('creator_profiles')
              .select('user_id, is_premium, premium_expires_at')
              .eq('id', sub.creator_id)
              .maybeSingle();

            if (creatorProfile) {
              // 1. Check if user has any active premium profiles
              const { data: userProfiles } = await supabase
                .from('creator_profiles')
                .select('id, is_premium, premium_expires_at')
                .eq('user_id', creatorProfile.user_id);
              
              const hasPremium = (userProfiles || []).some(cp => 
                cp.is_premium && (!cp.premium_expires_at || new Date(cp.premium_expires_at).getTime() > Date.now())
              );
              if (hasPremium) {
                console.log(`[Server] Skipping auto-drafting for user ${creatorProfile.user_id} due to premium profile`);
                continue;
              }

              // 2. Check if user has any other active subscriptions
              const profileIds = (userProfiles || []).map(p => p.id);
              if (profileIds.length > 0) {
                const { data: activeSubs } = await supabase
                  .from('subscriptions')
                  .select('id')
                  .in('creator_id', profileIds)
                  .eq('status', 'active')
                  .gt('end_date', thresholdDate.toISOString())
                  .neq('id', sub.id); // Exclude the current expired one
                
                if (activeSubs && activeSubs.length > 0) {
                  console.log(`[Server] Skipping auto-drafting for creator ${sub.creator_id} because another boutique has an active subscription`);
                  continue;
                }
              }
            }

            console.log(`[Server] Subscription ${sub.id} is expired past grace. Setting status and drafting contents.`);
            
            await supabase
              .from('subscriptions')
              .update({ status: 'expired' })
              .eq('id', sub.id);

            const { error: draftErr } = await supabase
              .from('contents')
              .update({
                status: 'draft',
                is_published: false,
                auto_drafted_by_subscription: true
              })
              .eq('creator_id', sub.creator_id)
              .eq('status', 'published');

            if (draftErr) {
              console.error(`[Server] Error auto-drafting content for creator ${sub.creator_id}:`, draftErr);
            }
          }
        }
      } catch (dbErr) {
        console.error('[Server] Supabase subscription expiry job warning:', dbErr);
      }
    }

    // Local DB Check
    const localSubs = serverDb.getSubscriptions();
    const activeExpired = localSubs.filter(s => s.status === 'active' && new Date(s.endDate) < thresholdDate);
    
    for (const sub of activeExpired) {
      console.log(`[Server Local] Subscription ${sub.id} expired past grace.`);
      serverDb.updateSubscription(sub.id, { status: 'expired' });
    }
  } catch (err) {
    console.error('[Server] apply_subscription_expiry error:', err);
  }
}

// Set periodic expiration runner (every hour)
setInterval(apply_subscription_expiry, 60 * 60 * 1000);
// Run a check shortly after startup
setTimeout(apply_subscription_expiry, 10000);

/**
 * POST /api/subscription/create-cart
 */
app.post('/api/subscription/create-cart', async (req, res) => {
    const { creatorId, buyerEmail, buyerFirstName, buyerLastName, buyerPhone } = req.body;

  if (!creatorId) {
    return res.status(400).json({ error: 'creatorId est requis.' });
  }

  try {
    const amount = 5000;
    const productDocumentId = process.env.MAKETOU_PRODUCT_ID || '';
    
    const firstName = buyerFirstName || 'Abonné';
    const lastName = buyerLastName || 'Créateur';
    const email = buyerEmail || 'abonne@momo.com';

    const hasMaketou = !!process.env.MAKETOU_API_KEY;

    let phoneToUse = (buyerPhone || '').replace(/[\s\-\(\)]/g, '');
    if (!phoneToUse || phoneToUse === '') {
      phoneToUse = '+221771234567';
    } else if (!phoneToUse.startsWith('+')) {
      phoneToUse = '+' + phoneToUse;
    }

    if (hasMaketou && productDocumentId) {
      const appUrl = getAppUrl();
      const redirectURL = `${appUrl}/subscription/confirm?cartId={cartId}&creatorId=${creatorId}`;

      const body = {
        productDocumentId,
        email,
        firstName,
        lastName,
        phone: phoneToUse,
        customerPrice: amount,
        redirectURL: redirectURL,
        meta: {
          type: 'subscription',
          creatorId
        }
      };

      console.log('[Server] Initializing Maketou Cart for Subscription:', body);
      const maketouRes = await fetch('https://api.maketou.net/api/v1/stores/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAKETOU_API_KEY}`
        },
        body: JSON.stringify(body)
      });

      if (!maketouRes.ok) {
        const errorText = await maketouRes.text();
        console.error('[Server] Maketou subscription cart creation failed:', errorText);
        throw new Error(`Erreur Maketou: ${errorText}`);
      }

      const maketouData = await maketouRes.json();
      const cart = maketouData.cart || maketouData || {};
      const cartId = cart.id || cart.cartId || cart.uuid || maketouData.id || maketouData.cartId || maketouData.cart_id || maketouData.uuid;
      const redirectUrlRaw = maketouData.redirectUrl || maketouData.checkoutUrl || maketouData.checkout_url || maketouData.url || maketouData.paymentUrl || maketouData.payment_url || cart.redirectUrl || cart.checkoutUrl || cart.checkout_url || cart.url || cart.paymentUrl || cart.payment_url;

      if (!cartId || !redirectUrlRaw) {
        throw new Error('Données de panier ou d\'URL de redirection manquantes dans la réponse Maketou.');
      }

      serverDb.addTransaction({
        provider: 'maketou',
        providerTransactionId: cartId,
        status: 'pending',
        type: 'subscription'
      });

      if (supabase) {
        try {
          await supabase
            .from('transactions')
            .insert({
              provider: 'maketou',
              provider_transaction_id: cartId,
              status: 'pending',
              type: 'subscription'
            });
        } catch (dbErr) {
          console.warn('[Server] Supabase subscription transaction warning:', dbErr);
        }
      }

      return res.json({ redirectUrl: redirectUrlRaw });

    } else {
      console.log('[Server] Maketou not configured. Simulating subscription redirect.');
      const mockCartId = `mock_sub_${Math.random().toString(36).substring(2, 11)}`;

      serverDb.addTransaction({
        provider: 'maketou',
        providerTransactionId: mockCartId,
        status: 'pending',
        type: 'subscription'
      });

      const appUrl = getAppUrl();
      const simulatedRedirectUrl = `${appUrl}/subscription/confirm?cartId=${mockCartId}&creatorId=${creatorId}`;

      return res.json({ redirectUrl: simulatedRedirectUrl });
    }
  } catch (err: any) {
    console.error('[Server] Create Subscription Cart handler error:', err);
    return res.status(500).json({ error: err.message || 'Une erreur interne est survenue.' });
  }
});

/**
 * GET /api/subscription/check-status
 */
app.get('/api/subscription/check-status', async (req, res) => {
  const { cartId, creatorId } = req.query;

  if (!cartId || !creatorId) {
    return res.status(400).json({ error: 'Paramètres cartId et creatorId requis.' });
  }

  try {
    let statusToSet: 'completed' | 'failed' | 'waiting_payment' = 'waiting_payment';
    const isMock = (cartId as string).startsWith('mock_') || !process.env.MAKETOU_API_KEY;

    if (isMock) {
      statusToSet = 'completed';
    } else {
      console.log(`[Server] Polling Maketou subscription status for cart ${cartId}`);
      const maketouRes = await fetch(`https://api.maketou.net/api/v1/stores/cart/${cartId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MAKETOU_API_KEY}`
        }
      });

      if (!maketouRes.ok) {
        console.error('[Server] Maketou status check error:', maketouRes.statusText);
        return res.status(500).json({ error: 'Impossible de vérifier le statut auprès de Maketou.' });
      }

      const cartData = await maketouRes.json();
      const cartStatus = cartData.status || cartData.cart?.status;

      if (cartStatus === 'completed' || cartStatus === 'success') {
        statusToSet = 'completed';
      } else if (cartStatus === 'payment_failed' || cartStatus === 'failed' || cartStatus === 'abandoned') {
        statusToSet = 'failed';
      } else {
        statusToSet = 'waiting_payment';
      }
    }

    if (statusToSet === 'completed') {
      serverDb.updateTransactionByCart(cartId as string, { status: 'success' });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      // Create subscription in local db
      serverDb.addSubscription({
        creatorId: creatorId as string,
        amountPaid: 5000,
        currency: 'XOF',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active'
      });

      let restoredCount = 0;

      if (supabase) {
        try {
          const { data: contentsToRestore } = await supabase
            .from('contents')
            .select('id')
            .eq('creator_id', creatorId)
            .eq('auto_drafted_by_subscription', true);

          restoredCount = contentsToRestore?.length || 0;

          // Restore contents
          await supabase
            .from('contents')
            .update({
              status: 'published',
              is_published: true,
              auto_drafted_by_subscription: false
            })
            .eq('creator_id', creatorId)
            .eq('auto_drafted_by_subscription', true);

          // Insert subscription
          await supabase
            .from('subscriptions')
            .insert({
              creator_id: creatorId,
              amount_paid: 5000,
              currency: 'XOF',
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              status: 'active'
            });

          // Create transaction record
          try {
            await supabase
              .from('transactions')
              .insert({
                provider: 'maketou',
                provider_transaction_id: cartId,
                status: 'success',
                type: 'subscription'
              });
          } catch (txErr) {
            // Might exist, update instead
            await supabase
              .from('transactions')
              .update({ status: 'success' })
              .eq('provider_transaction_id', cartId);
          }

        } catch (dbErr) {
          console.error('[Server] Supabase subscription completed warning:', dbErr);
        }
      }

      serverDb.addNotification({
        userId: creatorId as string,
        type: 'system',
        title: 'Abonnement activé !',
        message: `Votre abonnement de 5 000 FCFA est actif jusqu'au ${endDate.toLocaleDateString('fr-FR')}.`
      });

      return res.json({ 
        status: 'completed', 
        endDate: endDate.toISOString(),
        restoredCount
      });

    } else if (statusToSet === 'failed') {
      serverDb.updateTransactionByCart(cartId as string, { status: 'failed' });
      if (supabase) {
        try {
          await supabase
            .from('transactions')
            .update({ status: 'failed' })
            .eq('provider_transaction_id', cartId);
        } catch (e) {}
      }
      return res.json({ status: 'failed' });
    } else {
      return res.json({ status: 'waiting_payment' });
    }

  } catch (err: any) {
    console.error('[Server] Check subscription status error:', err);
    return res.status(500).json({ error: err.message || 'Une erreur est survenue.' });
  }
});

/**
 * GET /api/subscription/status
 */
app.get('/api/subscription/status', async (req, res) => {
  const { creatorId } = req.query;

  if (!creatorId) {
    return res.status(400).json({ error: 'creatorId est requis.' });
  }

  try {
    let subscriptionsList: any[] = [];
    let isPremiumFromProfile = false;
    let premiumExpiresAt = null;

    let userId = '';

    if (supabase) {
      try {
        const { data: currentProfile } = await supabase
          .from('creator_profiles')
          .select('user_id')
          .eq('id', creatorId)
          .maybeSingle();

        if (currentProfile) {
          userId = currentProfile.user_id;

          // Fetch all profiles of this user
          const { data: userProfiles } = await supabase
            .from('creator_profiles')
            .select('id, is_premium, premium_expires_at')
            .eq('user_id', userId);

          // Check if any profile is premium
          const anyPremium = (userProfiles || []).find(p => p.is_premium);
          if (anyPremium) {
            isPremiumFromProfile = true;
            premiumExpiresAt = anyPremium.premium_expires_at;
          }

          // Fetch subscriptions for all profiles of this user
          const profileIds = (userProfiles || []).map(p => p.id);
          if (profileIds.length > 0) {
            const { data, error } = await supabase
              .from('subscriptions')
              .select('*')
              .in('creator_id', profileIds)
              .order('created_at', { ascending: false });

            if (!error && data) {
              subscriptionsList = data;
            }
          }
        }
      } catch (err) {
        console.warn('[Server] Supabase error loading subscriptions:', err);
      }
    } else {
      const creator = serverDb.getCreators().find(c => c.id === creatorId);
      if (creator) {
        userId = creator.user_id;
        const userProfiles = serverDb.getCreators().filter(c => c.user_id === userId);
        const anyPremium = userProfiles.find(p => p.is_premium);
        if (anyPremium) {
          isPremiumFromProfile = true;
          premiumExpiresAt = anyPremium.premium_expires_at || null;
        }

        // Fetch subscriptions for all profiles of this user in local DB
        userProfiles.forEach(p => {
          const localSubs = serverDb.getCreatorSubscriptions(p.id);
          localSubs.forEach(s => {
            subscriptionsList.push({
              id: s.id,
              creator_id: s.creatorId,
              transaction_id: s.transactionId,
              amount_paid: s.amountPaid,
              currency: s.currency,
              start_date: s.startDate,
              end_date: s.endDate,
              status: s.status,
              created_at: s.createdAt
            });
          });
        });
        // Sort by created_at desc
        subscriptionsList.sort((a,b) => b.created_at.localeCompare(a.created_at));
      }
    }

    // Merge or fall back to local DB if empty
    const localSubs = subscriptionsList.length === 0 ? serverDb.getCreatorSubscriptions(creatorId as string) : [];
    if (subscriptionsList.length === 0 && localSubs.length > 0) {
      subscriptionsList = localSubs.map(s => ({
        id: s.id,
        creator_id: s.creatorId,
        transaction_id: s.transactionId,
        amount_paid: s.amountPaid,
        currency: s.currency,
        start_date: s.startDate,
        end_date: s.endDate,
        status: s.status,
        created_at: s.createdAt
      }));
    }

    // Determine latest active subscription
    let activeSub = subscriptionsList.find(s => s.status === 'active');
    
    // Synthesize active subscription if isPremiumFromProfile is true but there's no active subscription
    if (!activeSub && isPremiumFromProfile) {
      activeSub = {
        id: 'sub_profile_premium',
        creator_id: creatorId,
        amount_paid: 5000,
        currency: 'XOF',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: premiumExpiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      subscriptionsList.unshift(activeSub);
    }
    
    // Also fetch autoDraftedCount
    let autoDraftedCount = 0;
    if (supabase) {
      try {
        const { count } = await supabase
          .from('contents')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', creatorId)
          .eq('auto_drafted_by_subscription', true);
        autoDraftedCount = count || 0;
      } catch (e) {}
    }

    return res.json({
      subscriptions: subscriptionsList,
      activeSubscription: activeSub || null,
      autoDraftedCount
    });

  } catch (err: any) {
    console.error('[Server] Get subscription status error:', err);
    return res.status(500).json({ error: err.message || 'Une erreur est survenue.' });
  }
});

/**
 * GET /api/subscription/check-subscribed
 */
app.get('/api/subscription/check-subscribed', async (req, res) => {
  const { creatorId } = req.query;
  if (!creatorId) {
    return res.status(400).json({ error: 'creatorId est requis.' });
  }
  try {
    const subscribed = await isCreatorSubscribedServer(creatorId as string);
    return res.json({ subscribed });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/subscription/apply-expiry
 * Manually trigger expiration check
 */
app.post('/api/subscription/apply-expiry', async (req, res) => {
  try {
    await apply_subscription_expiry();
    return res.json({ success: true, message: 'Expiration check completed.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ==========================================
// PORTAIL ACHETEUR (Étape 10b)
// ==========================================

/**
 * GET /api/portal/verify
 * Checks if a buyer has at least one completed purchase
 */
app.get('/api/portal/verify', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email requis.' });
  }

  try {
    const emailStr = (email as string).toLowerCase().trim();
    const purchases = serverDb.getPurchases();
    const exists = purchases.some(
      p => p.buyerEmail.toLowerCase() === emailStr && p.status === 'completed'
    );
    return res.json({ exists });
  } catch (err: any) {
    console.error('[Server] Portal verify error:', err);
    return res.status(500).json({ error: 'Une erreur est survenue lors de la vérification de l\'email.' });
  }
});

/**
 * GET /api/portal/purchases
 * Retrieves completed purchases for a buyer email, grouped by creator
 */
app.get('/api/portal/purchases', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email requis.' });
  }

  try {
    const emailStr = (email as string).toLowerCase().trim();
    const purchases = serverDb.getPurchases().filter(
      p => p.buyerEmail.toLowerCase() === emailStr && p.status === 'completed'
    );

    // Sort by purchasedAt / createdAt desc
    purchases.sort((a, b) => {
      const dateA = a.purchasedAt || a.createdAt;
      const dateB = b.purchasedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    if (purchases.length === 0) {
      return res.json([]);
    }

    const contentIds = Array.from(new Set(purchases.map(p => p.contentId)));
    
    // Fetch content details from Supabase if connected
    let fetchedContents: any[] = [];
    if (supabase && contentIds.length > 0) {
      const { data, error } = await supabase
        .from('contents')
        .select('*, creator_profiles(*)')
        .in('id', contentIds);
      if (!error && data) {
        fetchedContents = data;
      }
    }

    // Local default mock contents
    const localContents = [
      {
        id: '1',
        creator_id: 'creator_1',
        title: 'Pack PDF : Booster son audience TikTok en 30 jours',
        content_type: 'pdf',
        preview_url: null,
        price_fcfa: 2500,
        creator_profiles: {
          id: 'creator_1',
          username: 'michella_coaching',
          display_name: 'Michella Coaching',
          avatar_url: null
        }
      },
      {
        id: '2',
        creator_id: 'creator_1',
        title: 'Template Notion : Organiser ses tournages Reels & TikTok',
        content_type: 'pdf',
        preview_url: null,
        price_fcfa: 1500,
        creator_profiles: {
          id: 'creator_1',
          username: 'michella_coaching',
          display_name: 'Michella Coaching',
          avatar_url: null
        }
      },
      {
        id: '3',
        creator_id: 'creator_1',
        title: 'Masterclass : Décryptage de l\'Algorithme 2026 (Vidéo 20m)',
        content_type: 'video',
        preview_url: null,
        price_fcfa: 5000,
        creator_profiles: {
          id: 'creator_1',
          username: 'michella_coaching',
          display_name: 'Michella Coaching',
          avatar_url: null
        }
      }
    ];

    const contentsMap = new Map<string, any>();
    for (const item of localContents) {
      contentsMap.set(item.id, item);
    }
    for (const item of fetchedContents) {
      contentsMap.set(item.id, {
        id: item.id,
        creator_id: item.creator_id,
        title: item.title,
        content_type: item.content_type,
        preview_url: item.preview_url,
        price_fcfa: item.price_fcfa,
        creator_profiles: item.creator_profiles ? {
          id: item.creator_profiles.id,
          username: item.creator_profiles.username,
          display_name: item.creator_profiles.display_name,
          avatar_url: item.creator_profiles.avatar_url
        } : null
      });
    }

    const creatorGroupsMap = new Map<string, { creator: any; purchases: any[] }>();

    for (const p of purchases) {
      const content = contentsMap.get(p.contentId) || {
        id: p.contentId,
        title: 'Contenu exclusif débloqué',
        content_type: 'pdf',
        preview_url: null,
        price_fcfa: p.amountPaid,
        creator_profiles: {
          id: 'creator_unknown',
          username: 'unknown_creator',
          display_name: 'Créateur Exclusif',
          avatar_url: null
        }
      };

      const creator = content.creator_profiles || {
        id: content.creator_id || 'creator_unknown',
        username: 'unknown_creator',
        display_name: 'Créateur Exclusif',
        avatar_url: null
      };

      const creatorId = creator.id;

      if (!creatorGroupsMap.has(creatorId)) {
        creatorGroupsMap.set(creatorId, {
          creator: {
            id: creatorId,
            username: creator.username,
            display_name: creator.display_name,
            avatar_url: creator.avatar_url
          },
          purchases: []
        });
      }

      creatorGroupsMap.get(creatorId)!.purchases.push({
        purchaseId: p.id,
        contentId: p.contentId,
        title: content.title,
        content_type: content.content_type || 'pdf',
        preview_url: content.preview_url,
        price_fcfa: p.amountPaid,
        purchased_at: p.purchasedAt || p.createdAt
      });
    }

    return res.json(Array.from(creatorGroupsMap.values()));

  } catch (err: any) {
    console.error('[Server] Portal purchases error:', err);
    return res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des achats.' });
  }
});

/**
 * GET /api/portal/creator-purchases
 * Checks completed content IDs bought by a buyer email for a specific creator
 */
app.get('/api/portal/creator-purchases', async (req, res) => {
  const { email, creatorId } = req.query;
  if (!email || !creatorId) {
    return res.status(400).json({ error: 'Champs email et creatorId requis.' });
  }

  try {
    const emailStr = (email as string).toLowerCase().trim();
    const purchases = serverDb.getPurchases().filter(
      p => p.buyerEmail.toLowerCase() === emailStr && p.status === 'completed'
    );

    if (purchases.length === 0) {
      return res.json({ purchasedContentIds: [] });
    }

    const contentIds = purchases.map(p => p.contentId);

    let creatorContentIds: string[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('contents')
        .select('id')
        .eq('creator_id', creatorId)
        .in('id', contentIds);
      if (!error && data) {
        creatorContentIds = data.map(c => c.id);
      }
    }

    const localContentCreatorMap: Record<string, string> = {
      '1': 'creator_1',
      '2': 'creator_1',
      '3': 'creator_1'
    };

    const finalIds = new Set<string>();
    const purchaseMap: Record<string, string> = {};

    for (const id of creatorContentIds) {
      finalIds.add(id);
    }

    for (const p of purchases) {
      const cid = p.contentId;
      purchaseMap[cid] = p.id;
      if (localContentCreatorMap[cid] === creatorId) {
        finalIds.add(cid);
      }
    }

    return res.json({ purchasedContentIds: Array.from(finalIds), purchaseMap });

  } catch (err: any) {
    console.error('[Server] Portal creator purchases error:', err);
    return res.status(500).json({ error: 'Une erreur est survenue lors de la vérification des achats créateur.' });
  }
});


// ==========================================
// ADMIN DASHBOARD API ROUTES (Étape 11)
// ==========================================

const adminMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminEmail = process.env.ADMIN_EMAIL || 'bigardlamine@gmail.com';

  // For pure demo/mock mode without Supabase
  if (!supabase) {
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorisé : En-tête Authorization manquant ou invalide.' });
  }

  const token = authHeader.slice(7);

  // If local/preview development without active token (e.g. mock login bypass in dev mode only)
  if (token === adminEmail && process.env.NODE_ENV !== 'production') {
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.error('[Admin Auth] Supabase getUser error:', error);
      return res.status(401).json({ error: 'Non autorisé : Token invalide ou expiré.' });
    }

    if (user.email !== adminEmail) {
      console.warn(`[Admin Auth] Access forbidden: logged in as ${user.email} but expected ${adminEmail}`);
      return res.status(403).json({ error: 'Interdit : Vous n\'avez pas les droits d\'administration.' });
    }

    return next();
  } catch (err) {
    console.error('[Admin Auth] Exception verifying token:', err);
    return res.status(500).json({ error: 'Erreur interne lors de la validation des droits admin.' });
  }
};

// Mount admin middleware to protect all /api/admin/* endpoints
app.use('/api/admin', adminMiddleware);

// 1. GET /api/admin/check -> simple auth status confirmation
app.get('/api/admin/check', (req, res) => {
  return res.json({ isAdmin: true });
});

// Helper: Calculate creator real-time balance
const getCreatorBalance = async (creatorId: string) => {
  if (supabaseAdmin) {
    const { data: contents } = await supabaseAdmin
      .from('contents')
      .select('id')
      .eq('creator_id', creatorId);
    
    const contentIds = (contents || []).map(c => c.id);
    let earnings = 0;
    if (contentIds.length > 0) {
      const { data: purchases } = await supabaseAdmin
        .from('purchases')
        .select('creator_net_amount_fcfa')
        .eq('status', 'completed')
        .in('content_id', contentIds);
      earnings = (purchases || []).reduce((sum, p) => sum + (p.creator_net_amount_fcfa || 0), 0);
    }

    const { data: withdrawals } = await supabaseAdmin
      .from('withdrawals')
      .select('amount_requested')
      .eq('creator_id', creatorId)
      .in('status', ['pending', 'approved', 'paid']);
    const withdrawn = (withdrawals || []).reduce((sum, w) => sum + (w.amount_requested || 0), 0);

    return Math.max(0, earnings - withdrawn);
  } else {
    // Demo Mode
    const purchases = serverDb.getPurchases();
    const localContentCreatorMap: Record<string, string> = {
      '1': 'creator_1',
      '2': 'creator_1',
      '3': 'creator_1'
    };
    const earnings = purchases
      .filter(p => p.status === 'completed' && localContentCreatorMap[p.contentId] === creatorId)
      .reduce((sum, p) => sum + (p.creatorNetAmount || 0), 0);

    const withdrawals = serverDb.getWithdrawals();
    const withdrawn = withdrawals
      .filter(w => w.creator_id === creatorId && ['pending', 'approved', 'paid'].includes(w.status))
      .reduce((sum, w) => sum + (w.amount_requested || 0), 0);

    return Math.max(0, earnings - withdrawn);
  }
};

app.get('/api/admin/kpis', async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthStr = startOfMonth.toISOString();

    let activeCreatorsCount = 0;
    let platformEarnings = 0;
    let totalVolume = 0;
    let pendingWithdrawalsCount = 0;
    let usedFallback = false;

    let uniqueUsersCount = 0;
    let totalShopsCount = 0;
    let avgShopsPerUser = 0;
    let topShopsForMultiShopUsers: any[] = [];

    if (supabaseAdmin) {
      try {
        // Creators
        const { count: activeCreators, error: err1 } = await supabaseAdmin
          .from('creator_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        if (err1) throw err1;
        activeCreatorsCount = activeCreators || 0;

        // Platform monthly earnings & total transaction volume
        const { data: monthPurchases, error: err2 } = await supabaseAdmin
          .from('purchases')
          .select('commission_amount_fcfa, amount_paid_fcfa')
          .eq('status', 'completed')
          .gte('created_at', startOfMonthStr);
        if (err2) throw err2;

        if (monthPurchases) {
          platformEarnings = monthPurchases.reduce((sum, p) => sum + (p.commission_amount_fcfa || 0), 0);
          totalVolume = monthPurchases.reduce((sum, p) => sum + (p.amount_paid_fcfa || 0), 0);
        }

        // Withdrawals in pending status
        const { count: pendingWithdrawals, error: err3 } = await supabaseAdmin
          .from('withdrawals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        if (err3) throw err3;
        pendingWithdrawalsCount = pendingWithdrawals || 0;

        // Multi-Boutique KPIs calculations
        const { data: allProfiles } = await supabaseAdmin
          .from('creator_profiles')
          .select('id, user_id, username, display_name, status');
        
        const { data: allPurchases } = await supabaseAdmin
          .from('purchases')
          .select('creator_id, amount_paid_fcfa')
          .eq('status', 'completed');

        const profiles = allProfiles || [];
        const purchases = allPurchases || [];

        totalShopsCount = profiles.length;
        const uniqueUsers = new Set(profiles.map(p => p.user_id));
        uniqueUsersCount = uniqueUsers.size;
        avgShopsPerUser = uniqueUsersCount > 0 ? Number((totalShopsCount / uniqueUsersCount).toFixed(2)) : 0;

        const revenueMap: Record<string, number> = {};
        purchases.forEach(p => {
          revenueMap[p.creator_id] = (revenueMap[p.creator_id] || 0) + (p.amount_paid_fcfa || 0);
        });

        const userShops: Record<string, any[]> = {};
        profiles.forEach(p => {
          const rev = revenueMap[p.id] || 0;
          if (!userShops[p.user_id]) {
            userShops[p.user_id] = [];
          }
          userShops[p.user_id].push({
            id: p.id,
            username: p.username,
            displayName: p.display_name,
            revenue: rev
          });
        });

        Object.entries(userShops).forEach(([userId, shops]) => {
          if (shops.length > 1) {
            let maxRevShop = shops[0];
            shops.forEach(s => {
              if (s.revenue > maxRevShop.revenue) {
                maxRevShop = s;
              }
            });
            topShopsForMultiShopUsers.push({
              userId,
              displayName: maxRevShop.displayName || 'Sans Nom',
              username: maxRevShop.username,
              revenue: maxRevShop.revenue,
              totalShopsCount: shops.length
            });
          }
        });

      } catch (dbErr) {
        console.warn('[Server] Supabase query failed for KPIs, falling back to mock data:', dbErr);
        usedFallback = true;
      }
    }

    if (!supabaseAdmin || usedFallback) {
      // Demo fallback
      const creators = serverDb.getCreators();
      activeCreatorsCount = creators.filter(c => c.status === 'active').length;

      const purchases = serverDb.getPurchases();
      const monthPurchases = purchases.filter(p => p.status === 'completed' && p.createdAt >= startOfMonthStr);
      platformEarnings = monthPurchases.reduce((sum, p) => sum + (p.commissionAmount || 0), 0);
      totalVolume = monthPurchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

      const withdrawals = serverDb.getWithdrawals();
      pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;

      // Local DB multi-boutique calcs
      totalShopsCount = creators.length;
      const uniqueUsers = new Set(creators.map(c => c.user_id));
      uniqueUsersCount = uniqueUsers.size;
      avgShopsPerUser = uniqueUsersCount > 0 ? Number((totalShopsCount / uniqueUsersCount).toFixed(2)) : 0;

      const completedPurchases = purchases.filter(p => p.status === 'completed');
      const revenueMap: Record<string, number> = {};
      completedPurchases.forEach(p => {
        const cId = p.contentId === '3e1df9e1-7c23-4bf5-b8a7-c5d55be5e32a' ? 'creator_1' : 'creator_1';
        revenueMap[cId] = (revenueMap[cId] || 0) + (p.amountPaid || 0);
      });

      const userShops: Record<string, any[]> = {};
      creators.forEach(c => {
        const rev = revenueMap[c.id] || 0;
        if (!userShops[c.user_id]) {
          userShops[c.user_id] = [];
        }
        userShops[c.user_id].push({
          id: c.id,
          username: c.username,
          displayName: c.display_name,
          revenue: rev
        });
      });

      Object.entries(userShops).forEach(([userId, shops]) => {
        if (shops.length > 1) {
          let maxRevShop = shops[0];
          shops.forEach(s => {
            if (s.revenue > maxRevShop.revenue) {
              maxRevShop = s;
            }
          });
          topShopsForMultiShopUsers.push({
            userId,
            displayName: maxRevShop.displayName || 'Sans Nom',
            username: maxRevShop.username,
            revenue: maxRevShop.revenue,
            totalShopsCount: shops.length
          });
        }
      });
    }

    return res.json({
      activeCreators: activeCreatorsCount,
      platformEarnings,
      totalVolume,
      pendingWithdrawals: pendingWithdrawalsCount,
      uniqueUsersCount,
      totalShopsCount,
      avgShopsPerUser,
      topShopsForMultiShopUsers,
      isDemoMode: !supabaseAdmin || usedFallback
    });
  } catch (err: any) {
    console.error('[Server] Admin KPIs error:', err);
    return res.status(500).json({ error: 'Erreur lors du calcul des KPIs.' });
  }
});

// 3. GET /api/admin/chart -> platform commission revenue over a selectable period
// ?range=7d|30d|90d|365d|custom (default 30d), plus &start=YYYY-MM-DD&end=YYYY-MM-DD when range=custom.
// Bucket granularity auto-adapts to the period length, mirroring the creator dashboard's revenue chart.
app.get('/api/admin/chart', async (req, res) => {
  try {
    const range = (req.query.range as string) || '30d';
    const customStart = req.query.start as string;
    const customEnd = req.query.end as string;

    const now = new Date();
    now.setHours(23, 59, 59, 999);
    let startDate: Date;
    let endDate = now;

    if (range === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const daysBack = range === '7d' ? 6 : range === '30d' ? 29 : range === '90d' ? 89 : 364;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - daysBack);
      startDate.setHours(0, 0, 0, 0);
    }

    if (startDate > endDate) [startDate, endDate] = [endDate, startDate];

    const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
    const granularity: 'day' | 'week' | 'month' = totalDays <= 31 ? 'day' : totalDays <= 180 ? 'week' : 'month';

    const buckets: { date: string; bucketStart: Date; revenu: number }[] = [];

    if (granularity === 'month') {
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      while (cursor <= endDate) {
        buckets.push({
          date: cursor.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          bucketStart: new Date(cursor),
          revenu: 0
        });
        cursor.setMonth(cursor.getMonth() + 1);
      }
    } else {
      const step = granularity === 'week' ? 7 : 1;
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        buckets.push({
          date: granularity === 'week'
            ? `Sem. du ${cursor.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
            : cursor.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          bucketStart: new Date(cursor),
          revenu: 0
        });
        cursor.setDate(cursor.getDate() + step);
      }
    }

    const findBucketIndex = (d: Date) => {
      for (let idx = buckets.length - 1; idx >= 0; idx--) {
        if (d >= buckets[idx].bucketStart) return idx;
      }
      return -1;
    };

    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    let usedFallback = false;

    if (supabaseAdmin) {
      try {
        const { data: purchases, error: err1 } = await supabaseAdmin
          .from('purchases')
          .select('commission_amount_fcfa, created_at')
          .eq('status', 'completed')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);
        if (err1) throw err1;

        (purchases || []).forEach(p => {
          const idx = findBucketIndex(new Date(p.created_at));
          if (idx >= 0) buckets[idx].revenu += p.commission_amount_fcfa || 0;
        });
      } catch (dbErr) {
        console.warn('[Server] Supabase query failed for chart, falling back to mock data:', dbErr);
        usedFallback = true;
      }
    }

    if (!supabaseAdmin || usedFallback) {
      const purchases = serverDb.getPurchases();
      purchases
        .filter(p => p.status === 'completed' && p.createdAt >= startDateStr && p.createdAt <= endDateStr)
        .forEach(p => {
          const idx = findBucketIndex(new Date(p.createdAt));
          if (idx >= 0) buckets[idx].revenu += p.commissionAmount || 0;
        });
    }

    return res.json(buckets.map(b => ({ date: b.date, revenu: b.revenu })));
  } catch (err: any) {
    console.error('[Server] Admin chart error:', err);
    return res.status(500).json({ error: 'Erreur lors de la génération du graphique.' });
  }
});

// 4. GET /api/admin/creators -> creators paginated search list
app.get('/api/admin/creators', async (req, res) => {
  try {
    const search = (req.query.search as string || '').toLowerCase().trim();
    
    let resultCreators: any[] = [];
    let usedFallback = false;

    if (supabaseAdmin) {
      try {
        const { data: creators, error } = await supabaseAdmin
          .from('creator_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        resultCreators = creators || [];
      } catch (dbErr) {
        console.warn('[Server] Supabase query failed for creators, falling back to mock data:', dbErr);
        usedFallback = true;
      }
    }

    if (!supabaseAdmin || usedFallback) {
      resultCreators = [...serverDb.getCreators()].sort((a, b) => b.created_at.localeCompare(a.created_at));
    }

    // Build stats for each creator
    const creatorStatsList = await Promise.all(resultCreators.map(async (creator) => {
      // Subscriptions
      let activeSubStatus = 'none';
      let subscriptionExpiry = null;
      
      if (supabaseAdmin && !usedFallback) {
        try {
          // Fetch all boutiques of this owner
          const { data: userProfiles } = await supabaseAdmin
            .from('creator_profiles')
            .select('id, is_premium, premium_expires_at')
            .eq('user_id', creator.user_id);
          
          const profileIds = (userProfiles || []).map(p => p.id);
          
          let subs: any[] = [];
          if (profileIds.length > 0) {
            const { data } = await supabaseAdmin
              .from('subscriptions')
              .select('end_date, status')
              .in('creator_id', profileIds)
              .order('end_date', { ascending: false });
            subs = data || [];
          }

          const latestSub = subs && subs[0];
          if (latestSub) {
            const now = new Date();
            const endDate = new Date(latestSub.end_date);
            const graceLimit = now.getTime() - 3 * 24 * 60 * 60 * 1000;
            
            if (latestSub.status === 'active' && endDate.getTime() > now.getTime()) {
              activeSubStatus = 'active';
            } else if (latestSub.status === 'active' && endDate.getTime() > graceLimit) {
              activeSubStatus = 'grace';
            } else {
              activeSubStatus = 'expired';
            }
            subscriptionExpiry = latestSub.end_date;
          }

          // Override with manual premium status of any profile belonging to this user
          const anyPremiumProfile = (userProfiles || []).find(p => p.is_premium);
          if (anyPremiumProfile && activeSubStatus !== 'active') {
            activeSubStatus = 'active';
            subscriptionExpiry = anyPremiumProfile.premium_expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          }
        } catch (subErr) {
          console.warn('[Server] Subscriptions query failed for creator', creator.id, subErr);
        }
      } else {
        // Fallback local DB
        const userId = creator.user_id;
        const localUserCreators = serverDb.getCreators().filter(c => c.user_id === userId);
        let subs: any[] = [];
        localUserCreators.forEach(c => {
          subs = [...subs, ...serverDb.getCreatorSubscriptions(c.id)];
        });
        const latestSub = subs.sort((a,b) => b.endDate.localeCompare(a.endDate))[0];
        if (latestSub) {
          const now = new Date();
          const endDate = new Date(latestSub.endDate);
          const graceLimit = now.getTime() - 3 * 24 * 60 * 60 * 1000;
          
          if (latestSub.status === 'active' && endDate.getTime() > now.getTime()) {
            activeSubStatus = 'active';
          } else if (latestSub.status === 'active' && endDate.getTime() > graceLimit) {
            activeSubStatus = 'grace';
          } else {
            activeSubStatus = 'expired';
          }
          subscriptionExpiry = latestSub.endDate;
        }

        const anyPremiumLocal = localUserCreators.find(c => c.is_premium);
        if (anyPremiumLocal && activeSubStatus !== 'active') {
          activeSubStatus = 'active';
          subscriptionExpiry = anyPremiumLocal.premium_expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        }
      }

      // Published Content Count
      let contentCount = 0;
      if (supabaseAdmin && !usedFallback) {
        try {
          const { count } = await supabaseAdmin
            .from('contents')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', creator.id);
          contentCount = count || 0;
        } catch (cntErr) {
          console.warn('[Server] Contents query failed for creator', creator.id, cntErr);
        }
      } else {
        // Fallback content count (or default based on creator)
        contentCount = creator.id === 'creator_1' ? 3 : 1;
      }

      // Total generated revenue (creator_net_amount purchases completed)
      let revenueGenerated = 0;
      if (supabaseAdmin && !usedFallback) {
        try {
          const { data: contents } = await supabaseAdmin
            .from('contents')
            .select('id')
            .eq('creator_id', creator.id);
          const contentIds = (contents || []).map(c => c.id);
          if (contentIds.length > 0) {
            const { data: purchases } = await supabaseAdmin
              .from('purchases')
              .select('creator_net_amount_fcfa')
              .eq('status', 'completed')
              .in('content_id', contentIds);
            revenueGenerated = (purchases || []).reduce((sum, p) => sum + (p.creator_net_amount_fcfa || 0), 0);
          }
        } catch (revErr) {
          console.warn('[Server] Revenue query failed for creator', creator.id, revErr);
        }
      } else {
        const purchases = serverDb.getPurchases();
        const localContentCreatorMap: Record<string, string> = {
          '1': 'creator_1',
          '2': 'creator_1',
          '3': 'creator_1'
        };
        revenueGenerated = purchases
          .filter(p => p.status === 'completed' && localContentCreatorMap[p.contentId] === creator.id)
          .reduce((sum, p) => sum + (p.creatorNetAmount || 0), 0);
      }

      // Get email (or mock email)
      let creatorEmail = '';
      if (supabaseAdmin && !usedFallback) {
        try {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(creator.user_id);
          creatorEmail = userData?.user?.email || 'createur@momo.link';
        } catch (usrErr) {
          console.warn('[Server] Get user email failed for user_id', creator.user_id, usrErr);
          creatorEmail = `${creator.username || 'creator'}@momo.link`;
        }
      } else {
        creatorEmail = `${creator.username}@momo.link`;
      }

      return {
        ...creator,
        email: creatorEmail,
        contentCount,
        revenueGenerated,
        subscriptionStatus: activeSubStatus,
        subscriptionExpiry
      };
    }));

    // Filter by search query (username or email or display_name)
    const filtered = creatorStatsList.filter(c => {
      if (!search) return true;
      return (c.username || '').toLowerCase().includes(search) || 
             (c.display_name || '').toLowerCase().includes(search) || 
             (c.email || '').toLowerCase().includes(search);
    });

    return res.json(filtered);
  } catch (err: any) {
    console.error('[Server] Admin creators error:', err);
    return res.status(500).json({ error: 'Erreur lors de la récupération de la liste.' });
  }
});

// 5. POST /api/admin/creators/:id/toggle-status -> Suspend or Reactivate a creator account
app.post('/api/admin/creators/:id/toggle-status', async (req, res) => {
  const { id } = req.params;
  try {
    let currentCreator: any = null;
    
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('creator_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      currentCreator = data;
    } else {
      currentCreator = serverDb.getCreators().find(c => c.id === id);
    }

    if (!currentCreator) {
      return res.status(404).json({ error: 'Créateur introuvable.' });
    }

    const nextStatus = currentCreator.status === 'active' ? 'inactive' : 'active';

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('creator_profiles')
        .update({ status: nextStatus })
        .eq('id', id);
      if (error) throw error;
    } else {
      serverDb.updateCreator(id, { status: nextStatus });
    }

    return res.json({ success: true, status: nextStatus });
  } catch (err: any) {
    console.error('[Server] Toggle creator status error:', err);
    return res.status(500).json({ error: 'Erreur lors du changement de statut.' });
  }
});

// 5b. POST /api/admin/creators/:id/update-quota -> Update the store quota for a user (all their shops)
app.post('/api/admin/creators/:id/update-quota', async (req, res) => {
  const { id } = req.params;
  const { quota } = req.body;

  if (typeof quota !== 'number' || quota < 1) {
    return res.status(400).json({ error: 'Quota invalide.' });
  }

  try {
    let currentCreator: any = null;
    
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('creator_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      currentCreator = data;
    } else {
      currentCreator = serverDb.getCreators().find(c => c.id === id);
    }

    if (!currentCreator) {
      return res.status(404).json({ error: 'Créateur introuvable.' });
    }

    const userId = currentCreator.user_id;

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('creator_profiles')
        .update({ store_quota: quota })
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      // In mock DB, update all creators sharing the same user_id
      serverDb.getCreators().forEach(c => {
        if (c.user_id === userId) {
          serverDb.updateCreator(c.id, { store_quota: quota });
        }
      });
    }

    return res.json({ success: true, quota });
  } catch (err: any) {
    console.error('[Server] Update quota error:', err);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du quota.' });
  }
});

// 6. GET /api/admin/creators/:id/details -> drawer stats details
app.get('/api/admin/creators/:id/details', async (req, res) => {
  const { id } = req.params;
  try {
    let creator: any = null;
    
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('creator_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      creator = data;
    } else {
      creator = serverDb.getCreators().find(c => c.id === id);
    }

    if (!creator) {
      return res.status(404).json({ error: 'Créateur introuvable.' });
    }

    // Recent purchases (5)
    let recentPurchases: any[] = [];
    if (supabaseAdmin) {
      const { data: contents } = await supabaseAdmin
        .from('contents')
        .select('id, title')
        .eq('creator_id', id);
      const contentIds = (contents || []).map(c => c.id);
      
      if (contentIds.length > 0) {
        const { data: purchases } = await supabaseAdmin
          .from('purchases')
          .select('*, contents(title)')
          .in('content_id', contentIds)
          .order('created_at', { ascending: false })
          .limit(5);
        recentPurchases = (purchases || []).map(p => ({
          id: p.id,
          createdAt: p.created_at,
          buyerPhone: p.buyer_phone,
          buyerEmail: '***' + (p.buyer_phone ? p.buyer_phone.slice(-4) : '') + '@momo.link', // masked
          amountPaid: p.amount_paid_fcfa,
          commissionAmount: p.commission_amount_fcfa,
          creatorNetAmount: p.creator_net_amount_fcfa,
          status: p.status,
          contentTitle: p.contents?.title || 'Contenu exclusif'
        }));
      }
    } else {
      const purchases = serverDb.getPurchases();
      recentPurchases = purchases
        .filter(p => p.contentId === '1' || p.contentId === '2' || p.contentId === '3') // mock content IDs
        .sort((a,b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          createdAt: p.createdAt,
          buyerPhone: p.buyerPhone,
          buyerEmail: p.buyerEmail.replace(/.*(?=@)/, '***'),
          amountPaid: p.amountPaid,
          status: p.status,
          contentTitle: 'Contenu exclusif de Michella'
        }));
    }

    // Withdrawals list
    let withdrawals: any[] = [];
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('withdrawals')
        .select('*')
        .eq('creator_id', id)
        .order('requested_at', { ascending: false });
      withdrawals = data || [];
    } else {
      withdrawals = serverDb.getWithdrawals().filter(w => w.creator_id === id);
    }

    // Subscriptions list
    let subscriptions: any[] = [];
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('creator_id', id)
        .order('created_at', { ascending: false });
      subscriptions = data || [];
    } else {
      subscriptions = serverDb.getCreatorSubscriptions(id);
    }

    const balance = await getCreatorBalance(id);

    // If creator is premium, synthesize an active subscription if none exists
    if (creator.is_premium && subscriptions.length === 0) {
      subscriptions = [{
        id: 'sub_profile_premium',
        creator_id: id,
        amount_paid: 5000,
        currency: 'XOF',
        start_date: creator.created_at || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: creator.premium_expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: creator.created_at || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }];
    }

    return res.json({
      creator,
      balance,
      recentPurchases,
      withdrawals,
      subscriptions
    });
  } catch (err: any) {
    console.error('[Server] Creator details error:', err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des détails.' });
  }
});

// 7. GET /api/admin/withdrawals -> withdraw validations dashboard
app.get('/api/admin/withdrawals', async (req, res) => {
  try {
    let pendingList: any[] = [];
    let historyList: any[] = [];

    if (supabaseAdmin) {
      const { data: pending, error: ep } = await supabaseAdmin
        .from('withdrawals')
        .select('*, creator_profiles(*)')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true }); // older first for priority queue

      const { data: history, error: eh } = await supabaseAdmin
        .from('withdrawals')
        .select('*, creator_profiles(*)')
        .in('status', ['approved', 'paid', 'rejected'])
        .order('requested_at', { ascending: false }); // processed_at or requested_at DESC

      if (ep) throw ep;
      if (eh) throw eh;

      pendingList = pending || [];
      historyList = history || [];
    } else {
      // Mock Fallback
      const creatorsMap = Object.fromEntries(serverDb.getCreators().map(c => [c.id, c]));
      const withdrawals = serverDb.getWithdrawals();

      pendingList = withdrawals
        .filter(w => w.status === 'pending')
        .map(w => ({ ...w, creator_profiles: creatorsMap[w.creator_id] }))
        .sort((a,b) => a.requested_at.localeCompare(b.requested_at));

      historyList = withdrawals
        .filter(w => ['approved', 'paid', 'rejected'].includes(w.status))
        .map(w => ({ ...w, creator_profiles: creatorsMap[w.creator_id] }))
        .sort((a,b) => b.requested_at.localeCompare(a.requested_at));
    }

    // Attach real-time balances to pending withdrawals
    const pendingWithBalances = await Promise.all(pendingList.map(async (w) => {
      const balance = await getCreatorBalance(w.creator_id);
      return {
        ...w,
        available_balance: balance
      };
    }));

    return res.json({
      pending: pendingWithBalances,
      history: historyList
    });
  } catch (err: any) {
    console.error('[Server] Admin withdrawals fetch error:', err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des retraits.' });
  }
});

// 8. POST /api/admin/withdrawals/:id/pay -> payout validator
app.post('/api/admin/withdrawals/:id/pay', async (req, res) => {
  const { id } = req.params;
  try {
    let withdrawal: any = null;
    
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('withdrawals')
        .select('*, creator_profiles(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      withdrawal = data;
    } else {
      const creatorsMap = Object.fromEntries(serverDb.getCreators().map(c => [c.id, c]));
      const rawW = serverDb.getWithdrawals().find(w => w.id === id);
      if (rawW) {
        withdrawal = { ...rawW, creator_profiles: creatorsMap[rawW.creator_id] };
      }
    }

    if (!withdrawal) {
      return res.status(404).json({ error: 'Demande de retrait introuvable.' });
    }

    const nowStr = new Date().toISOString();

    if (supabaseAdmin) {
      // 1. Update status
      const { error } = await supabaseAdmin
        .from('withdrawals')
        .update({ status: 'paid', processed_at: nowStr })
        .eq('id', id);
      if (error) throw error;

      // 2. Insert notification
      if (withdrawal.creator_profiles?.user_id) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: withdrawal.creator_profiles.user_id,
            title: 'Retrait traité avec succès',
            message: `Votre demande de retrait de ${withdrawal.amount_requested.toLocaleString()} FCFA via ${withdrawal.payout_provider} (${withdrawal.payout_phone_number}) a été validée et envoyée.`,
            is_read: false
          });
      }
    } else {
      serverDb.updateWithdrawal(id, { status: 'paid', processed_at: nowStr });
      serverDb.addNotification({
        userId: withdrawal.creator_profiles?.user_id || 'user_1',
        type: 'system',
        title: 'Retrait traité avec succès',
        message: `Votre demande de retrait de ${withdrawal.amount_requested.toLocaleString()} FCFA via ${withdrawal.payout_provider} (${withdrawal.payout_phone_number}) a été validée et envoyée.`
      });
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error('[Server] Pay withdrawal error:', err);
    return res.status(500).json({ error: 'Erreur lors de la validation du paiement.' });
  }
});

// 9. POST /api/admin/withdrawals/:id/reject -> reject with obligatory reason
app.post('/api/admin/withdrawals/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'La raison du rejet est obligatoire.' });
  }

  try {
    let withdrawal: any = null;
    
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('withdrawals')
        .select('*, creator_profiles(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      withdrawal = data;
    } else {
      const creatorsMap = Object.fromEntries(serverDb.getCreators().map(c => [c.id, c]));
      const rawW = serverDb.getWithdrawals().find(w => w.id === id);
      if (rawW) {
        withdrawal = { ...rawW, creator_profiles: creatorsMap[rawW.creator_id] };
      }
    }

    if (!withdrawal) {
      return res.status(404).json({ error: 'Demande de retrait introuvable.' });
    }

    const nowStr = new Date().toISOString();

    if (supabaseAdmin) {
      // 1. Update status and notes
      const { error } = await supabaseAdmin
        .from('withdrawals')
        .update({ status: 'rejected', processed_at: nowStr, notes: reason.trim() })
        .eq('id', id);
      if (error) throw error;

      // 2. Create notification
      if (withdrawal.creator_profiles?.user_id) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: withdrawal.creator_profiles.user_id,
            title: 'Retrait rejeté',
            message: `Votre demande de retrait de ${withdrawal.amount_requested.toLocaleString()} FCFA a été rejetée. Motif : ${reason.trim()}`,
            is_read: false
          });
      }
    } else {
      serverDb.updateWithdrawal(id, { status: 'rejected', processed_at: nowStr, notes: reason.trim() });
      serverDb.addNotification({
        userId: withdrawal.creator_profiles?.user_id || 'user_1',
        type: 'system',
        title: 'Retrait rejeté',
        message: `Votre demande de retrait de ${withdrawal.amount_requested.toLocaleString()} FCFA a été rejetée. Motif : ${reason.trim()}`
      });
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error('[Server] Reject withdrawal error:', err);
    return res.status(500).json({ error: 'Erreur lors du rejet du retrait.' });
  }
});

// 10. GET /api/admin/subscriptions -> Subscriptions list
app.get('/api/admin/subscriptions', async (req, res) => {
  try {
    const filter = req.query.filter as string || 'all'; // all, active, grace, expired
    
    let creators: any[] = [];
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('creator_profiles')
        .select('*');
      if (error) throw error;
      creators = data || [];
    } else {
      creators = serverDb.getCreators();
    }

    const fullSubsList = await Promise.all(creators.map(async (creator) => {
      let subStatus = 'none';
      let expiryDateStr = null;
      let amountPaid = 0;
      let daysRemaining = 0;

      if (supabaseAdmin) {
        const { data: subs } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('creator_id', creator.id)
          .order('end_date', { ascending: false });

        const latestSub = subs && subs[0];
        if (latestSub) {
          const now = new Date();
          const endDate = new Date(latestSub.end_date);
          const graceLimit = now.getTime() - 3 * 24 * 60 * 60 * 1000;
          
          if (latestSub.status === 'active' && endDate.getTime() > now.getTime()) {
            subStatus = 'active';
          } else if (latestSub.status === 'active' && endDate.getTime() > graceLimit) {
            subStatus = 'grace';
          } else {
            subStatus = 'expired';
          }
          expiryDateStr = latestSub.end_date;
          daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Sum subscription amounts
        amountPaid = (subs || []).reduce((sum, s) => sum + (s.amount_paid || 0), 0);

        // Override with manual premium status
        if (creator.is_premium && subStatus !== 'active') {
          subStatus = 'active';
          expiryDateStr = creator.premium_expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          const endDate = new Date(expiryDateStr);
          daysRemaining = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (amountPaid === 0) {
            amountPaid = 5000;
          }
        }

      } else {
        const subs = serverDb.getCreatorSubscriptions(creator.id);
        const latestSub = subs.sort((a,b) => b.endDate.localeCompare(a.endDate))[0];
        if (latestSub) {
          const now = new Date();
          const endDate = new Date(latestSub.endDate);
          const graceLimit = now.getTime() - 3 * 24 * 60 * 60 * 1000;
          
          if (latestSub.status === 'active' && endDate.getTime() > now.getTime()) {
            subStatus = 'active';
          } else if (latestSub.status === 'active' && endDate.getTime() > graceLimit) {
            subStatus = 'grace';
          } else {
            subStatus = 'expired';
          }
          expiryDateStr = latestSub.endDate;
          daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Override with manual premium status
        if (creator.is_premium && subStatus !== 'active') {
          subStatus = 'active';
          expiryDateStr = creator.premium_expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          const endDate = new Date(expiryDateStr);
          daysRemaining = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (amountPaid === 0) {
            amountPaid = 5000;
          }
        }

        amountPaid = subs.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
      }

      return {
        id: creator.id,
        display_name: creator.display_name,
        username: creator.username,
        avatar_url: creator.avatar_url,
        status: subStatus,
        expiryDate: expiryDateStr,
        daysRemaining,
        amountPaid
      };
    }));

    // Filter list
    const filtered = fullSubsList.filter(s => {
      if (filter === 'all') return true;
      if (filter === 'active') return s.status === 'active';
      if (filter === 'grace') return s.status === 'grace';
      if (filter === 'expired') return s.status === 'expired';
      if (filter === 'expiring_soon') return s.status === 'active' && s.daysRemaining <= 5 && s.daysRemaining >= 0;
      return true;
    });

    return res.json(filtered);
  } catch (err: any) {
    console.error('[Server] Admin subscriptions list error:', err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des abonnements.' });
  }
});

// 11. GET /api/admin/transactions -> History log
app.get('/api/admin/transactions', async (req, res) => {
  try {
    const search = (req.query.search as string || '').trim().toLowerCase();
    const type = req.query.type as string || 'all'; // all, purchase, subscription
    const status = req.query.status as string || 'all'; // all, completed, pending, failed

    let fullList: any[] = [];

    if (supabaseAdmin) {
      // 1. Fetch purchases
      const { data: purchases } = await supabaseAdmin
        .from('purchases')
        .select('*, contents(title, creator_profiles(display_name, username, avatar_url))')
        .order('created_at', { ascending: false });

      const purchaseTransactions = (purchases || []).map(p => ({
        id: p.id,
        date: p.created_at,
        type: 'purchase',
        creatorName: p.contents?.creator_profiles?.display_name || 'Inconnu',
        creatorUsername: p.contents?.creator_profiles?.username || 'inconnu',
        creatorAvatar: p.contents?.creator_profiles?.avatar_url || '',
        buyerEmail: '***' + (p.buyer_phone ? p.buyer_phone.slice(-4) : '') + '@momo.link',
        amount: p.amount_paid_fcfa,
        commission: p.commission_amount_fcfa,
        status: p.status, // completed, pending, failed
        providerTxId: p.payment_reference || ''
      }));

      // 2. Fetch subscriptions
      const { data: subs } = await supabaseAdmin
        .from('subscriptions')
        .select('*, creator_profiles(display_name, username, avatar_url), transactions(provider_transaction_id)')
        .order('created_at', { ascending: false });

      const subTransactions = (subs || []).map(s => ({
        id: s.id,
        date: s.created_at,
        type: 'subscription',
        creatorName: s.creator_profiles?.display_name || 'Inconnu',
        creatorUsername: s.creator_profiles?.username || 'inconnu',
        creatorAvatar: s.creator_profiles?.avatar_url || '',
        buyerEmail: s.creator_profiles?.display_name || 'Inconnu',
        amount: s.amount_paid,
        commission: 0,
        status: s.status === 'active' ? 'completed' : 'expired',
        providerTxId: s.transactions?.provider_transaction_id || ''
      }));

      fullList = [...purchaseTransactions, ...subTransactions].sort((a,b) => b.date.localeCompare(a.date));
    } else {
      // Demo Fallback
      const creatorsMap = Object.fromEntries(serverDb.getCreators().map(c => [c.id, c]));

      const purchases = serverDb.getPurchases().map(p => {
        // Map mock content creator
        const creatorId = 'creator_1'; // Michella is owner of demo contents
        const creator = creatorsMap[creatorId];
        return {
          id: p.id,
          date: p.createdAt,
          type: 'purchase',
          creatorName: creator?.display_name || 'Michella Coaching',
          creatorUsername: creator?.username || 'michella_coaching',
          creatorAvatar: creator?.avatar_url || '',
          buyerEmail: p.buyerEmail.replace(/.*(?=@)/, '***'),
          amount: p.amountPaid,
          commission: p.commissionAmount,
          status: p.status,
          providerTxId: p.paymentReference
        };
      });

      const subs = serverDb.getSubscriptions().map(s => {
        const creator = creatorsMap[s.creatorId];
        return {
          id: s.id,
          date: s.createdAt,
          type: 'subscription',
          creatorName: creator?.display_name || 'Inconnu',
          creatorUsername: creator?.username || 'inconnu',
          creatorAvatar: creator?.avatar_url || '',
          buyerEmail: creator?.display_name || 'Inconnu',
          amount: s.amountPaid,
          commission: 0,
          status: s.status === 'active' ? 'completed' : 'expired',
          providerTxId: s.transactionId || ''
        };
      });

      fullList = [...purchases, ...subs].sort((a,b) => b.date.localeCompare(a.date));
    }

    // Apply filtering
    const filtered = fullList.filter(t => {
      const matchesSearch = !search || (t.providerTxId || '').toLowerCase().includes(search) || 
                            (t.creatorUsername || '').toLowerCase().includes(search) ||
                            (t.creatorName || '').toLowerCase().includes(search);
      const matchesType = type === 'all' || t.type === type;
      
      let matchesStatus = true;
      if (status !== 'all') {
        matchesStatus = t.status === status;
      }

      return matchesSearch && matchesType && matchesStatus;
    });

    return res.json(filtered);
  } catch (err: any) {
    console.error('[Server] Admin transactions error:', err);
    return res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique.' });
  }
});


// 12. GET /api/admin/recent-purchases -> for admin homepage (5 latest transactions)
app.get('/api/admin/recent-purchases', async (req, res) => {
  try {
    let recentPurchases: any[] = [];
    let usedFallback = false;

    if (supabaseAdmin) {
      try {
        const { data: purchases, error: err1 } = await supabaseAdmin
          .from('purchases')
          .select('*, contents(title, creator_profiles(display_name, username))')
          .order('created_at', { ascending: false })
          .limit(5);
        if (err1) throw err1;

        recentPurchases = (purchases || []).map(p => ({
          id: p.id,
          createdAt: p.created_at,
          creatorName: p.contents?.creator_profiles?.display_name || 'Inconnu',
          contentTitle: p.contents?.title || 'Contenu exclusif',
          buyerEmail: '***' + (p.buyer_phone ? p.buyer_phone.slice(-4) : '') + '@momo.link',
          amountPaid: p.amount_paid_fcfa,
          commissionAmount: p.commission_amount_fcfa,
          status: p.status
        }));
      } catch (dbErr) {
        console.warn('[Server] Supabase query failed for recent purchases, falling back to mock data:', dbErr);
        usedFallback = true;
      }
    }

    if (!supabaseAdmin || usedFallback) {
      const creatorsMap = Object.fromEntries(serverDb.getCreators().map(c => [c.id, c]));
      const purchases = serverDb.getPurchases();
      recentPurchases = purchases
        .sort((a,b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5)
        .map(p => {
          const creator = creatorsMap['creator_1'];
          return {
            id: p.id,
            createdAt: p.createdAt,
            creatorName: creator?.display_name || 'Michella Coaching',
            contentTitle: 'Pack PDF : Booster son audience TikTok',
            buyerEmail: p.buyerEmail.replace(/.*(?=@)/, '***'),
            amountPaid: p.amountPaid,
            commissionAmount: p.commissionAmount,
            status: p.status
          };
        });
    }

    return res.json(recentPurchases);
  } catch (err: any) {
    console.error('[Server] Admin recent purchases error:', err);
    return res.status(500).json({ error: 'Erreur lors du chargement des transactions récentes.' });
  }
});


// 13. GET /api/admin/contents -> list contents for moderation
app.get('/api/admin/contents', async (req, res) => {
  try {
    const search = (req.query.search as string || '').toLowerCase();
    const type = req.query.type as string || 'all';
    const status = req.query.status as string || 'all';

    let allContents: any[] = [];
    let usedFallback = false;

    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('contents')
          .select('*, creator:creator_profiles(display_name, username, avatar_url)');
        if (error) throw error;
        allContents = data || [];
      } catch (dbErr) {
        console.warn('[Server] Supabase contents select failed, falling back to mock data:', dbErr);
        usedFallback = true;
      }
    }

    if (!supabaseAdmin || usedFallback) {
      // In-memory or default mock contents
      const localContents = [
        {
          id: 'con_1',
          creator_id: 'creator_1',
          title: 'Pack PDF : Booster son audience TikTok en 30 jours',
          description: 'La méthode complète pour scaler son compte.',
          price_fcfa: 2500,
          content_type: 'pdf',
          status: 'published',
          is_published: true,
          created_at: new Date(Date.now() - 3600000 * 240).toISOString(),
          creator: { display_name: 'Michella Coaching', username: 'michella_coaching', avatar_url: null }
        },
        {
          id: 'con_2',
          creator_id: 'creator_1',
          title: 'Template Notion : Organiser ses tournages Reels & TikTok',
          description: 'Un espace de travail prêt à l\'emploi.',
          price_fcfa: 1500,
          content_type: 'pdf',
          status: 'published',
          is_published: true,
          created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
          creator: { display_name: 'Michella Coaching', username: 'michella_coaching', avatar_url: null }
        },
        {
          id: 'con_3',
          creator_id: 'creator_1',
          title: "Masterclass : Décryptage de l'Algorithme 2026 (Vidéo 20m)",
          description: 'Vidéo exclusive pour comprendre l\'algo.',
          price_fcfa: 5000,
          content_type: 'video',
          status: 'published',
          is_published: true,
          created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
          creator: { display_name: 'Michella Coaching', username: 'michella_coaching', avatar_url: null }
        }
      ];

      allContents = localContents;
    }

    // Apply filters
    const filtered = allContents.filter(c => {
      const matchesSearch = 
        !search || 
        c.title.toLowerCase().includes(search) || 
        (c.description && c.description.toLowerCase().includes(search)) ||
        (c.creator && c.creator.display_name.toLowerCase().includes(search)) ||
        (c.creator && c.creator.username.toLowerCase().includes(search));

      const matchesType = type === 'all' || c.content_type === type;
      const matchesStatus = status === 'all' || c.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });

    return res.json(filtered);
  } catch (err: any) {
    console.error('[Server] Admin contents list error:', err);
    return res.status(500).json({ error: 'Erreur lors du chargement des contenus.' });
  }
});

// 14. POST /api/admin/contents/:id/toggle-status -> Suspend, Approve or Archive a content item
app.post('/api/admin/contents/:id/toggle-status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'published' | 'draft' | 'archived' | 'removed'

  if (!status || !['published', 'draft', 'archived', 'removed'].includes(status)) {
    return res.status(400).json({ error: 'Statut de modération invalide.' });
  }

  try {
    const isPublished = status === 'published';

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('contents')
        .update({ status, is_published: isPublished })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, status: data.status, is_published: data.is_published });
    }

    return res.json({ success: true, status, is_published: isPublished });
  } catch (err: any) {
    console.error('[Server] Admin content toggle status error:', err);
    return res.status(500).json({ error: 'Erreur lors du changement de statut du contenu.' });
  }
});

// 15. DELETE /api/admin/contents/:id -> Delete content permanently
app.delete('/api/admin/contents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('contents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[Server] Admin content delete error:', err);
    return res.status(500).json({ error: 'Erreur lors de la suppression du contenu.' });
  }
});


// 16. GET /api/admin/donations -> all donations received across every creator, for moderation/support
app.get('/api/admin/donations', async (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase().trim();
  try {
    let donations: any[] = [];

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('donations')
        .select('*, creator_profiles(display_name, username, avatar_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      donations = data || [];
    }

    const filtered = search
      ? donations.filter((d: any) =>
          (d.creator_profiles?.display_name || '').toLowerCase().includes(search) ||
          (d.creator_profiles?.username || '').toLowerCase().includes(search) ||
          (d.donor_name || '').toLowerCase().includes(search)
        )
      : donations;

    return res.json(filtered);
  } catch (err: any) {
    console.error('[Server] Admin donations list error:', err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des dons.' });
  }
});

// 17. GET /api/admin/messages -> all messages + partnership proposals sent to every creator profile
app.get('/api/admin/messages', async (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase().trim();
  try {
    let messages: any[] = [];

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('profile_messages')
        .select('*, creator_profiles(display_name, username, avatar_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      messages = data || [];
    }

    const filtered = search
      ? messages.filter((m: any) =>
          (m.creator_profiles?.display_name || '').toLowerCase().includes(search) ||
          (m.creator_profiles?.username || '').toLowerCase().includes(search) ||
          (m.sender_name || '').toLowerCase().includes(search) ||
          (m.body || '').toLowerCase().includes(search)
        )
      : messages;

    return res.json(filtered);
  } catch (err: any) {
    console.error('[Server] Admin messages list error:', err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
});

// 18. POST /api/admin/creators/:id/grant-premium -> manually grant/extend a creator's premium access
app.post('/api/admin/creators/:id/grant-premium', async (req, res) => {
  const { id } = req.params;
  const days = Number(req.body?.days) || 30;

  if (!Number.isFinite(days) || days <= 0 || days > 365) {
    return res.status(400).json({ error: 'Le nombre de jours doit être compris entre 1 et 365.' });
  }

  try {
    if (supabaseAdmin) {
      const { data: creator, error: fetchErr } = await supabaseAdmin
        .from('creator_profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', id)
        .maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!creator) return res.status(404).json({ error: 'Créateur introuvable.' });

      const now = new Date();
      const currentExpiry = creator.is_premium && creator.premium_expires_at ? new Date(creator.premium_expires_at) : now;
      const base = currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
      const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

      const { error: updateErr } = await supabaseAdmin
        .from('creator_profiles')
        .update({ is_premium: true, premium_expires_at: newExpiry.toISOString() })
        .eq('id', id);
      if (updateErr) throw updateErr;

      return res.json({ success: true, premium_expires_at: newExpiry.toISOString() });
    } else {
      const creator = serverDb.getCreators().find((c: any) => c.id === id);
      if (!creator) return res.status(404).json({ error: 'Créateur introuvable.' });

      const now = new Date();
      const currentExpiry = creator.is_premium && creator.premium_expires_at ? new Date(creator.premium_expires_at) : now;
      const base = currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
      const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

      serverDb.updateCreator(id, { is_premium: true, premium_expires_at: newExpiry.toISOString() });
      return res.json({ success: true, premium_expires_at: newExpiry.toISOString() });
    }
  } catch (err: any) {
    console.error('[Server] Grant premium error:', err);
    return res.status(500).json({ error: 'Erreur lors de l\'attribution du premium.' });
  }
});


// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================


async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Mount Vite Dev Middleware
    console.log('[Server] Starting development server with Vite middleware...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static output from Vite build
    console.log('[Server] Starting production server...');
    const distPath = path.join(process.cwd(), 'dist');
    
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Full-stack application ready at http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
