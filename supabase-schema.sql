-- Schema de base de donnees pour la plateforme Mobile Money Link
-- Executez ces requetes dans l'editeur SQL de votre tableau de bord Supabase.

-- 1. Table des profils de createurs
CREATE TABLE IF NOT EXISTS public.creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    bio VARCHAR(160),
    avatar_url TEXT,
    cover_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    payout_phone_number VARCHAR(30) NOT NULL,
    payout_provider VARCHAR(20) NOT NULL CHECK (payout_provider IN ('wave', 'orange', 'mtn', 'moov')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_premium BOOLEAN DEFAULT false NOT NULL,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activez Row Level Security pour la securite
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques de securite RLS
CREATE POLICY "Les profils sont publics" 
    ON public.creator_profiles FOR SELECT 
    USING (true);

CREATE POLICY "Les createurs peuvent inserer leur propre profil" 
    ON public.creator_profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les createurs peuvent modifier leur propre profil" 
    ON public.creator_profiles FOR UPDATE 
    USING (auth.uid() = user_id);


-- 2. Table des contenus
CREATE TABLE IF NOT EXISTS public.contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price_fcfa INT NOT NULL CHECK (price_fcfa >= 100),
    thumbnail_url TEXT,
    preview_url TEXT,
    file_url TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'pdf' NOT NULL CHECK (content_type IN ('video', 'image', 'pdf', 'audio')),
    status VARCHAR(20) DEFAULT 'published' NOT NULL CHECK (status IN ('published', 'draft', 'archived', 'removed')),
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les contenus publies sont visibles par tous" 
    ON public.contents FOR SELECT 
    USING (is_published = true);

CREATE POLICY "Les createurs peuvent gerer leurs propres contenus" 
    ON public.contents FOR ALL 
    USING (auth.uid() IN (
        SELECT user_id FROM public.creator_profiles WHERE id = creator_id
    ));


-- 3. Table des achats (purchases)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_phone VARCHAR(30) NOT NULL,
    content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    payment_reference VARCHAR(100) UNIQUE,
    amount_paid_fcfa INT NOT NULL,
    commission_amount_fcfa INT NOT NULL,
    creator_net_amount_fcfa INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les acheteurs peuvent voir leurs propres achats via reference ou ID" 
    ON public.purchases FOR SELECT 
    USING (true); -- Securise en pratique par requetes ciblees

CREATE POLICY "Les createurs peuvent voir les achats de leurs contenus" 
    ON public.purchases FOR SELECT 
    USING (auth.uid() IN (
        SELECT cp.user_id 
        FROM public.creator_profiles cp
        JOIN public.contents c ON c.creator_id = cp.id
        WHERE c.id = content_id
    ));

-- Index pour accelerer les requetes de jointure
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON public.creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_username ON public.creator_profiles(username);
CREATE INDEX IF NOT EXISTS idx_contents_creator_id ON public.contents(creator_id);
CREATE INDEX IF NOT EXISTS idx_purchases_content_id ON public.purchases(content_id);


-- 4. Configuration des Buckets de Stockage Supabase (Storage)
-- NOTE: Pour éviter l'erreur de privilèges "ERROR: 42501: must be owner of table objects",
-- il est fortement recommandé de créer et configurer vos buckets directement depuis le Dashboard de Supabase.
--
-- ÉTAPES DANS L'INTERFACE SUPABASE :
-- 1. Allez dans l'onglet "Storage" (icône de boîte/disque dans le menu latéral gauche de Supabase).
-- 2. Cliquez sur "New Bucket".
-- 3. Créez un bucket nommé 'previews' et activez l'option "Public bucket" (très important pour que les photos soient visibles par tous).
-- 4. Créez un autre bucket nommé 'contents' et laissez-le en PRIVÉ (ce bucket servira à stocker les contenus exclusifs payants).
-- 5. Pour chaque bucket, ajoutez des règles d'accès (Policies) pour autoriser l'insertion ("Insert") aux utilisateurs authentifiés ("authenticated").


-- 5. Table des Retraits (withdrawals) - Étape 7
-- Vous pouvez copier-coller cette partie dans votre éditeur SQL Supabase pour créer la table de retraits.

-- Ajout de la colonne de couverture de manière sécurisée si elle n'existe pas déjà
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE CASCADE NOT NULL,
    amount_requested INT NOT NULL CHECK (amount_requested >= 5000),
    payout_provider VARCHAR(30) NOT NULL,
    payout_phone_number VARCHAR(30) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Activez la RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Suppression des politiques si elles existent déjà pour éviter les erreurs de duplication
DROP POLICY IF EXISTS "Les créateurs peuvent voir leurs propres retraits" ON public.withdrawals;
DROP POLICY IF EXISTS "Les créateurs peuvent demander un retrait" ON public.withdrawals;

-- Création des nouvelles politiques
CREATE POLICY "Les créateurs peuvent voir leurs propres retraits" 
    ON public.withdrawals FOR SELECT 
    TO authenticated
    USING (auth.uid() IN (
        SELECT user_id FROM public.creator_profiles WHERE id = creator_id
    ));

CREATE POLICY "Les créateurs peuvent demander un retrait" 
    ON public.withdrawals FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM public.creator_profiles WHERE id = creator_id
    ));

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_creator_id ON public.withdrawals(creator_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_requested_at ON public.withdrawals(requested_at DESC);


-- ==========================================
-- MIGRATION POUR BASE DE DONNÉES EXISTANTE :
-- Si vos tables existent déjà et que vous obtenez des erreurs de colonnes manquantes
-- (ex: content_type ou preview_url), copiez-collez et exécutez ces requêtes dans
-- votre éditeur SQL Supabase :
-- ==========================================

-- 1. Ajout des colonnes manquantes à la table 'contents'
ALTER TABLE public.contents ADD COLUMN IF NOT EXISTS preview_url TEXT;

ALTER TABLE public.contents ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'pdf';
-- S'assurer que la contrainte CHECK existe pour content_type
ALTER TABLE public.contents DROP CONSTRAINT IF EXISTS contents_content_type_check;
ALTER TABLE public.contents ADD CONSTRAINT contents_content_type_check CHECK (content_type IN ('video', 'image', 'pdf', 'audio'));

ALTER TABLE public.contents ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';
-- S'assurer que la contrainte CHECK existe pour status
ALTER TABLE public.contents DROP CONSTRAINT IF EXISTS contents_status_check;
ALTER TABLE public.contents ADD CONSTRAINT contents_status_check CHECK (status IN ('published', 'draft', 'archived', 'removed'));

ALTER TABLE public.contents ADD COLUMN IF NOT EXISTS auto_drafted_by_subscription BOOLEAN NOT NULL DEFAULT false;


-- ==========================================
-- TABLE DES TRANSACTIONS (NÉCESSAIRE POUR LES ABONNEMENTS ET LES RETRAITS)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(30) NOT NULL,
    provider_transaction_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'subscription')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activez la RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
DROP POLICY IF EXISTS "Les transactions sont lisibles par tous" ON public.transactions;
CREATE POLICY "Les transactions sont lisibles par tous"
    ON public.transactions FOR SELECT
    USING (true);


-- ==========================================
-- ABONNEMENT CRÉATEUR (Étape 9)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id),
  amount_paid INTEGER NOT NULL DEFAULT 5000,
  currency TEXT NOT NULL DEFAULT 'XOF',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_creator ON public.subscriptions(creator_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "creators see own subscriptions" ON public.subscriptions;
CREATE POLICY "creators see own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.creator_profiles 
    WHERE id = creator_id
  ));


-- ==========================================
-- SCRIPT DE MIGRATION POUR LE PROFIL PREMIUM & AVATARS
-- (À copier-coller et exécuter dans l'éditeur SQL de Supabase)
-- ==========================================

-- 1. Ajout des colonnes premium et photo de profil à la table 'creator_profiles' s'il y a lieu
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Configuration du bucket de stockage 'avatars' (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Politiques de sécurité RLS pour le bucket de stockage 'avatars'
DROP POLICY IF EXISTS "Les avatars de profil sont publics" ON storage.objects;
CREATE POLICY "Les avatars de profil sont publics" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Les créateurs connectés peuvent uploader leur propre avatar" ON storage.objects;
CREATE POLICY "Les créateurs connectés peuvent uploader leur propre avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Les créateurs connectés peuvent modifier leur propre avatar" ON storage.objects;
CREATE POLICY "Les créateurs connectés peuvent modifier leur propre avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Les créateurs connectés peuvent supprimer leur propre avatar" ON storage.objects;
CREATE POLICY "Les créateurs connectés peuvent supprimer leur propre avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
    );




