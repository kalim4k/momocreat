/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { 
  Smartphone, 
  Sun, 
  Moon, 
  ArrowRight, 
  UploadCloud, 
  Share2, 
  Coins, 
  Sparkles, 
  Lock, 
  Check, 
  HelpCircle,
  Eye,
  Instagram,
  X,
  CreditCard,
  QrCode,
  Zap,
  Download,
  Facebook,
  Linkedin,
  Globe,
  Quote,
  Youtube,
  ShoppingBag,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LockedContentCard from './components/LockedContentCard';
import PlatformImpact from './components/PlatformImpact';
import { Content } from './types';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CreatorPublicProfile from './pages/CreatorPublicProfile';
import PaymentConfirm from './pages/PaymentConfirm';
import SubscriptionConfirm from './pages/SubscriptionConfirm';
import ContentView from './pages/ContentView';
import BuyerPortal from './pages/BuyerPortal';
import BuyerPurchases from './pages/BuyerPurchases';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminCreators from './pages/admin/AdminCreators';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminContents from './pages/admin/AdminContents';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cgv from './pages/Cgv';
import Pay from './pages/Pay';
import PayConfirm from './pages/PayConfirm';
import Congrat from './pages/Congrat';

// Route Guards
function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#14120F] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
      </div>
    );
  }
  
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'bigardlamine@gmail.com';
  
  if (!user || user.email !== adminEmail) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
      </div>
    );
  }
  
  if (user) {
    if (profile) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Pages (Redirect to dashboard if already logged in) */}
            <Route path="/auth/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/auth/signup" element={<AuthRoute><Signup /></AuthRoute>} />
            
            {/* Protected Creator Pages */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/content" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/sales" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/withdrawals" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/subscription" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Protected Admin Console Pages */}
            <Route path="/admin" element={<AdminRoute><AdminLayout><AdminOverview /></AdminLayout></AdminRoute>} />
            <Route path="/admin/creators" element={<AdminRoute><AdminLayout><AdminCreators /></AdminLayout></AdminRoute>} />
            <Route path="/admin/contents" element={<AdminRoute><AdminLayout><AdminContents /></AdminLayout></AdminRoute>} />
            <Route path="/admin/withdrawals" element={<AdminRoute><AdminLayout><AdminWithdrawals /></AdminLayout></AdminRoute>} />
            <Route path="/admin/subscriptions" element={<AdminRoute><AdminLayout><AdminSubscriptions /></AdminLayout></AdminRoute>} />
            <Route path="/admin/transactions" element={<AdminRoute><AdminLayout><AdminTransactions /></AdminLayout></AdminRoute>} />
            
            {/* Maketou payment return confirmation */}
            <Route path="/payment/confirm" element={<PaymentConfirm />} />
            <Route path="/subscription/confirm" element={<SubscriptionConfirm />} />

            {/* Anonymous payment routes */}
            <Route path="/pay" element={<Pay />} />
            <Route path="/pay/confirm" element={<PayConfirm />} />
            <Route path="/congrat" element={<Congrat />} />

            {/* Legal Pages */}
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/sales" element={<Cgv />} />
            <Route path="/legal/privacy" element={<Privacy />} />

            {/* Secured Content view page */}
            <Route path="/content/:contentId" element={<ContentView />} />

            {/* Buyer Portal */}
            <Route path="/portal" element={<BuyerPortal />} />
            <Route path="/portal/purchases" element={<BuyerPurchases />} />

            {/* Dynamic Public Creator Profile */}
            <Route path="/:username" element={<CreatorPublicProfile />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export function LandingPage() {
  const { isDarkMode, setIsDarkMode, styles } = useTheme();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [activeDemoContent, setActiveDemoContent] = useState<Content | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'loading' | 'success'>('details');

  // States for embedded interactive checkout widget
  const [demoPaymentMethod, setDemoPaymentMethod] = useState<'wave' | 'orange' | 'carte'>('carte');
  const [demoPaymentState, setDemoPaymentState] = useState<'idle' | 'paying' | 'success'>('idle');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoCardNumber, setDemoCardNumber] = useState('4242 4242 4242 4242');

  // States for text animator in Hero and Accordion in FAQ
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const words = ["PDF 📄", "Formations 🎓", "Vidéos 🎥", "Photos 📸", "Audios 🎵"];
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIdx((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const faqData = [
    {
      q: "Comment mes abonnés paient-ils ?",
      a: "Vos abonnés paient directement en utilisant leur compte Mobile Money local (Wave, Orange Money, MTN, Moov). Le processus prend moins de 10 secondes, s'effectue en monnaie locale (FCFA) et ne nécessite aucune création de compte pour l'acheteur."
    },
    {
      q: "Quels sont les frais de MomoLink ?",
      a: "L'inscription est 100% gratuite. Nous prélevons uniquement une commission de 10% sur chaque transaction réussie. Il n'y a aucun abonnement mensuel, aucun frais caché ni frais de retrait sur vos comptes."
    },
    {
      q: "Dans quels pays le service est-il disponible ?",
      a: "MomoLink est disponible et optimisé pour le Togo, la Côte d'Ivoire, le Sénégal et le Cameroun. Nous supportons toutes les intégrations Mobile Money majeures de ces régions."
    },
    {
      q: "Comment puis-je retirer mes gains ?",
      a: "Vous pouvez demander un retrait vers votre numéro Mobile Money (Wave, Orange, MTN ou Moov) à tout moment depuis votre tableau de bord. Les demandes sont traitées en moins de 24h ouvrées."
    },
    {
      q: "La livraison des fichiers est-elle sécurisée ?",
      a: "Oui, à chaque achat, nous générons un lien d'accès sécurisé et temporaire lié à l'email de l'acheteur. Le lien expire automatiquement après 1 heure, protégeant vos contenus contre la redistribution non autorisée."
    }
  ];

  // Exemples de contenus fictifs de démonstration
  const demoContents: Content[] = [
    {
      id: '1',
      creator_id: 'creator_1',
      title: 'Pack PDF : Booster son audience TikTok en 30 jours',
      description: "Ma méthode exacte, mes scripts prêts à l'emploi et mon calendrier éditorial pour passer de 0 à 10 000 abonnés rapidement.",
      price_fcfa: 2500,
      thumbnail_url: null,
      file_url: 'https://example.com/secured/guide-tiktok.pdf',
      content_type: 'pdf',
      status: 'published',
      is_published: true,
      created_at: new Date().toISOString(),
      creator: {
        id: 'creator_1',
        user_id: 'user_1',
        username: 'michella_coaching',
        display_name: 'Michella Coaching',
        bio: 'Experte en croissance organique et stratégies de contenu.',
        avatar_url: null,
        social_links: { tiktok: '@michella_coaching' },
        payout_phone_number: '+22890123456',
        payout_provider: 'wave',
        created_at: new Date().toISOString(),
      }
    },
    {
      id: '2',
      creator_id: 'creator_1',
      title: 'Template Notion : Organiser ses tournages Reels & TikTok',
      description: "Le template complet que j'utilise au quotidien pour planifier mes tournages, rédiger mes accroches et suivre mes métriques.",
      price_fcfa: 1500,
      thumbnail_url: null,
      file_url: 'https://example.com/secured/notion-template.zip',
      content_type: 'pdf',
      status: 'published',
      is_published: true,
      created_at: new Date().toISOString(),
      creator: {
        id: 'creator_1',
        user_id: 'user_1',
        username: 'michella_coaching',
        display_name: 'Michella Coaching',
        bio: 'Experte en croissance organique et stratégies de contenu.',
        avatar_url: null,
        social_links: { tiktok: '@michella_coaching' },
        payout_phone_number: '+22890123456',
        payout_provider: 'wave',
        created_at: new Date().toISOString(),
      }
    },
    {
      id: '3',
      creator_id: 'creator_1',
      title: 'Masterclass : Décryptage de l\'Algorithme 2026 (Vidéo 20m)',
      description: "Une vidéo exclusive de 20 minutes où je vous montre les coulisses de l'algorithme actuel, et comment maximiser le taux de rétention.",
      price_fcfa: 5000,
      thumbnail_url: null,
      file_url: 'https://example.com/secured/masterclass-algo.mp4',
      content_type: 'video',
      status: 'published',
      is_published: true,
      created_at: new Date().toISOString(),
      creator: {
        id: 'creator_1',
        user_id: 'user_1',
        username: 'michella_coaching',
        display_name: 'Michella Coaching',
        bio: 'Experte en croissance organique et stratégies de contenu.',
        avatar_url: null,
        social_links: { tiktok: '@michella_coaching' },
        payout_phone_number: '+22890123456',
        payout_provider: 'wave',
        created_at: new Date().toISOString(),
      }
    }
  ];

  const handleUnlockClick = (content: Content) => {
    setActiveDemoContent(content);
    setPaymentPhone('');
    setPaymentStep('details');
    setIsPaymentModalOpen(true);
  };

  const startMockPayment = () => {
    if (!paymentPhone) return;
    setPaymentStep('loading');
    setIsPaying(true);

    setTimeout(() => {
      setPaymentStep('success');
      setIsPaying(false);
      if (activeDemoContent) {
        setUnlockedIds(prev => [...prev, activeDemoContent.id]);
      }
    }, 2000);
  };

  const floatingLogos = [
    {
      url: "https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/eac30152-d08a-4b2d-8b21-6bb36eed4d16.png",
      position: "left-[1%] md:left-[2%] lg:left-[4%] top-[12%]",
      delay: 0,
      duration: 5,
    },
    {
      url: "https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/b32e99dd-45d8-409a-b1a4-382b27c2d0f5.jpg",
      position: "left-[5%] md:left-[8%] lg:left-[12%] top-[44%]",
      delay: 1.5,
      duration: 6,
    },
    {
      url: "https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/1eb16b59-0a1c-44bb-b97b-c7cd0bf23ec3.jpg",
      position: "left-[2%] md:left-[3%] lg:left-[6%] top-[74%]",
      delay: 0.8,
      duration: 5.5,
    },
    {
      url: "https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/2ae62ee0-65e9-41c8-92cc-585fd4f0cfef.png",
      position: "right-[1%] md:right-[2%] lg:right-[4%] top-[15%]",
      delay: 0.5,
      duration: 5.2,
    },
    {
      url: "https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/e5138f48-879a-47b8-b5ed-1d361151def9.png",
      position: "right-[5%] md:right-[8%] lg:right-[12%] top-[48%]",
      delay: 2,
      duration: 6.4,
    },
    {
      url: "https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/db10a3b5-4d71-4372-98d3-09cf1f5152dc.png",
      position: "right-[2%] md:right-[3%] lg:right-[6%] top-[76%]",
      delay: 1.2,
      duration: 4.8,
    }
  ];

  const handleScrollToDemo = () => {
    document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const marqueeItems = [
    { name: 'FACEBOOK', icon: <Facebook size={14} className="text-[#1877F2]" /> },
    { 
      name: 'TIKTOK', 
      icon: (
        <svg className="w-3.5 h-3.5 fill-current text-neutral-900 dark:text-white" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.97 1.2 2.27 2.05 3.71 2.45v3.98c-1.8-.12-3.51-.83-4.88-2.02-.19-.17-.37-.36-.54-.56V15c.09 1.41-.33 2.82-1.19 3.94-.85 1.12-2.12 1.88-3.53 2.13-1.41.25-2.88-.04-4.08-.82-1.2-.78-2.06-2.02-2.39-3.44-.33-1.41-.12-2.91.59-4.17.7-1.26 1.88-2.17 3.26-2.53 1.09-.28 2.24-.2 3.28.23V5.51c0-1.83.02-3.66.02-5.49z"/>
        </svg>
      )
    },
    { 
      name: 'BEHANCE', 
      icon: (
        <svg className="w-3.5 h-3.5 fill-current text-[#0057ff]" viewBox="0 0 24 24">
          <path d="M8.2 2c-2.4 0-4.4.9-5.6 2.5C1.4 6 1 8.2 1 10.9c0 2.7.4 4.9 1.2 6.5 1.2 1.6 3.2 2.5 5.6 2.5 1.8 0 3.3-.5 4.4-1.6 1.1-1.1 1.6-2.6 1.6-4.5 0-1.7-.5-3.1-1.4-4.1-.9-1-2.1-1.5-3.7-1.5H5.8V8.1h3c1.2 0 2.1-.2 2.7-.7.6-.5.9-1.2.9-2.1 0-.9-.3-1.6-.9-2.1-.6-.5-1.5-.7-2.7-.7l-.6-.5zm0 13c0 .8-.2 1.4-.7 1.8-.5.4-1.2.6-2.1.6H5.8v-4.8h2.6c.9 0 1.6.2 2.1.6.5.4.7 1 .7 1.8zm11-13.8c-2.2 0-3.9.7-4.9 2C13.3 4.5 12.8 6.4 12.8 9c0 2.5.5 4.5 1.5 5.8s2.7 2 4.9 2c1.7 0 3.1-.4 4-1.2.9-.8 1.4-1.9 1.6-3.3h-3.2c-.1.5-.4.9-.8 1.2-.4.3-.9.4-1.6.4-1 0-1.7-.3-2.1-.9-.4-.6-.6-1.5-.6-2.7h8.2V9c0-2.5-.5-4.4-1.5-5.7s-2.6-2.1-4.8-2.1zm0 2.8c1 0 1.6.3 2 .9.4.6.5 1.4.5 2.5H15.9c0-1.1.2-1.9.6-2.5.4-.6 1.1-.9 2.1-.9zM15 1v1h7V1h-7z"/>
        </svg>
      )
    },
    { name: 'LINKEDIN', icon: <Linkedin size={14} className="text-[#0A66C2]" /> },
    { name: 'VOTRE SITE', icon: <Globe size={14} className="text-emerald-600" /> },
    { name: 'CITATIONS', icon: <Quote size={14} className="text-rose-500" /> },
    { name: 'YOUTUBE', icon: <Youtube size={14} className="text-[#FF0000]" /> },
    { name: 'PRODUITS', icon: <ShoppingBag size={14} className="text-purple-600" /> },
    { name: 'X.COM', icon: <X size={14} className="text-neutral-900 dark:text-white" /> },
    { name: 'INSTAGRAM', icon: <Instagram size={14} className="text-pink-600" /> }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${styles.bg} ${styles.textPrimary} font-sans`}>
      {/* Header */}
      <header id="app-header" className={`border-b ${styles.border} py-4 px-6 sticky top-0 backdrop-blur-md z-40 bg-opacity-80`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/d0bc935c-5e3d-48cd-a9c6-dae266ebffdc.png" 
              alt="MomoLink Logo" 
              className="h-8 w-8 object-contain rounded-lg"
              id="app-logo"
            />
            <h1 className="font-display text-2xl font-medium tracking-tight">MomoLink</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              id="header-cta"
              to="/auth/signup"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-accent-corail text-white hover:bg-accent-corail-hover transition-all cursor-pointer text-center whitespace-nowrap"
            >
              Devenir créateur
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Relative and Overflow-Visible for absolute floating elements */}
      <section id="hero" className="relative max-w-6xl w-full mx-auto px-4 md:px-12 pt-20 pb-16 flex flex-col items-center text-center gap-6 overflow-visible">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10 opacity-80" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[320px] h-[320px] sm:w-[450px] sm:h-[450px] rounded-full bg-accent-corail/8 blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-40 left-1/3 w-[200px] h-[200px] rounded-full bg-purple-500/6 blur-[80px] pointer-events-none -z-10" />

        {/* Absolute Floating Badges (Visible on desktop and tablets for dynamic styling) */}
        {floatingLogos.map((logo, idx) => (
          <motion.div
            key={idx}
            className={`absolute ${logo.position} hidden md:flex items-center justify-center bg-white p-2 rounded-[14px] border border-border-custom/60 shadow-lg hover:scale-110 hover:shadow-xl hover:border-accent-corail/30 transition-all duration-300 z-10 w-12 h-12 lg:w-16 lg:h-16`}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: logo.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: logo.delay,
            }}
          >
            <img
              src={logo.url}
              alt={`Paiement floating ${idx + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-[10px]"
            />
          </motion.div>
        ))}

        {/* Animated Hero Text Content */}
        <motion.div
          className="flex flex-col items-center text-center gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
              }
            }
          }}
        >
          {/* Badge */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
            }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-linear-to-r from-accent-corail/8 to-purple-600/8 text-accent-corail text-xs font-bold border border-accent-corail/15 shadow-[0_4px_15px_rgba(225,79,48,0.04)] backdrop-blur-md relative overflow-hidden group select-none shrink-0"
          >
            {/* Glossy reflection shimmer */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full animate-[shimmer_3.5s_infinite_ease-out] pointer-events-none" />
            
            {/* Live Indicator pulse */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-corail opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-corail"></span>
            </span>

            <span>Pour les créateurs sur TikTok, Instagram, YouTube & Snapchat</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
            }}
            className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl text-text-primary"
          >
            Vendez vos{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-accent-corail via-pink-500 to-purple-600 relative inline-flex justify-center h-[48px] sm:h-[80px] min-w-[130px] sm:min-w-[280px] overflow-hidden align-bottom pb-1 font-extrabold">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeWordIdx}
                  initial={{ y: 35, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -35, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="absolute left-0 right-0 text-center font-extrabold"
                >
                  {words[activeWordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            avec le Mobile Money
          </motion.h1>

          {/* Paragraph */}
          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
            className="text-base sm:text-xl text-text-secondary max-w-2xl leading-relaxed font-normal"
          >
            Vendez vos guides, formations, photos ou vidéos exclusifs directement à vos abonnés au Togo, en Côte d’Ivoire, au Sénégal et au Cameroun. Vos fans paient en un clic via <strong>Wave, Orange, MTN ou Moov</strong>.
          </motion.p>

          {/* Inline payment row - Only displayed on mobile screen viewports */}
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            id="payment-logos-showcase" 
            className="flex flex-col items-center justify-center gap-2.5 mt-2 md:hidden"
          >
            <span className={`text-[10px] font-bold ${styles.textSecondary} opacity-80 uppercase tracking-widest`}>
              Paiements Mobile Money acceptés
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {floatingLogos.map((logo, idx) => (
                <img
                  key={idx}
                  src={logo.url}
                  alt={`Méthode de paiement ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="h-8 w-auto object-contain rounded-md border border-border-custom/50 bg-white p-1"
                />
              ))}
            </div>
          </motion.div>

          {/* Call to action */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
            }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center animate-fade-in"
          >
            {/* Primary button */}
            <Link
              id="hero-primary-cta"
              to="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-bold bg-accent-corail text-white hover:bg-accent-corail-hover hover:scale-105 hover:shadow-[0_0_24px_rgba(225,79,48,0.35)] transition-all duration-200 cursor-pointer shadow-lg shadow-accent-corail/25 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Devenir créateur (Gratuit)</span>
              <ArrowRight size={16} />
            </Link>

            {/* Secondary button */}
            <a
              href="#live-demo"
              className={`w-full sm:w-auto px-8 py-4 rounded-full text-sm font-bold border ${styles.border} ${isDarkMode ? 'bg-neutral-900/40 text-white hover:bg-neutral-800' : 'bg-white text-text-primary hover:bg-gray-50'} hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-xs`}
            >
              <span>Voir la démo</span>
              <Play size={14} className="shrink-0 animate-pulse" />
            </a>
          </motion.div>

          {/* Active Users Social Proof Badge */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, delay: 0.2 } }
            }}
            className="flex items-center gap-3 mt-1"
          >
            <div className="flex -space-x-2.5">
              <img className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80" alt="Créateur 1" />
              <img className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 object-cover shadow-sm" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" alt="Créateur 2" />
              <img className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 object-cover shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" alt="Créateur 3" />
              <img className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 object-cover shadow-sm" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" alt="Créateur 4" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <div className="flex items-center text-amber-500 text-xs">
                ★ ★ ★ ★ ★
              </div>
              <span className={`text-[11px] font-bold ${styles.textPrimary}`}>
                +500 créateurs actifs
              </span>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delay: 0.6, duration: 0.5 } }
            }}
            className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs mt-4 opacity-80"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Check size={14} className="text-success-gold shrink-0" /> Sans abonnement, sans frais cachés
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Check size={14} className="text-success-gold shrink-0" /> Retraits directs en 24h
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Check size={14} className="text-success-gold shrink-0" /> Sécurité maximale (liens signés)
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Infinite Scrolling Marquee of Social Networks */}
      <section className={`py-8 border-b ${styles.border} overflow-hidden bg-bg-surface`}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${styles.textSecondary} opacity-70`}>
            NOTRE WIDGET
          </span>
          
          <div className="relative w-full overflow-hidden mask-fade-edges">
            {/* Infinite Horizontal Scroll */}
            <div className="animate-marquee-infinite flex items-center gap-8 py-2">
              {/* First loop */}
              {marqueeItems.map((item, idx) => (
                <div key={`m1-${idx}`} className={`flex items-center gap-2.5 px-4 py-2 rounded-full border ${styles.border} ${styles.surface} shadow-sm shrink-0`}>
                  {item.icon}
                  <span className={`text-[10px] font-bold tracking-wider ${styles.textPrimary}`}>{item.name}</span>
                </div>
              ))}
              {/* Second loop (duplicate for seamless scrolling) */}
              {marqueeItems.map((item, idx) => (
                <div key={`m2-${idx}`} className={`flex items-center gap-2.5 px-4 py-2 rounded-full border ${styles.border} ${styles.surface} shadow-sm shrink-0`}>
                  {item.icon}
                  <span className={`text-[10px] font-bold tracking-wider ${styles.textPrimary}`}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section "Comment ça marche ?" */}
      <section id="how-it-works" className={`border-t border-b ${styles.border} py-20 px-4 ${isDarkMode ? 'bg-bg-surface/30' : 'bg-gray-50/50'} relative overflow-hidden`}>
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-accent-corail/4 blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto flex flex-col gap-14">
          <div className="text-center flex flex-col gap-3">
            <span className="text-[10px] font-bold text-accent-corail uppercase tracking-widest">Processus simplifié</span>
            <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight">Comment ça marche ?</h2>
            <p className={`text-sm ${styles.textSecondary} max-w-lg mx-auto`}>
              Trois étapes simples pour transformer vos vues sur les réseaux sociaux en revenus réels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className={`p-7 rounded-[20px] border ${styles.surface} flex flex-col gap-5 relative overflow-hidden group hover:shadow-lg hover:border-accent-corail/20 transition-all duration-300`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-accent-corail to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="p-3.5 rounded-xl bg-accent-corail/10 text-accent-corail w-fit group-hover:bg-accent-corail group-hover:text-white transition-all duration-300">
                <UploadCloud size={24} />
              </div>
              <div className="absolute top-5 right-6 text-6xl font-display font-extrabold bg-clip-text text-transparent bg-linear-to-br from-accent-corail/10 to-pink-500/10 select-none">1</div>
              <h3 className="font-display text-lg font-medium">1. Créez & fixez votre prix</h3>
              <p className={`text-sm ${styles.textSecondary} leading-relaxed`}>
                Importez votre PDF, vidéo ou document confidentiel. Fixez un prix unique en FCFA (ex: 2 500 FCFA). Nous générons un lien sécurisé.
              </p>
            </div>

            {/* Step 2 */}
            <div className={`p-7 rounded-[20px] border ${styles.surface} flex flex-col gap-5 relative overflow-hidden group hover:shadow-lg hover:border-accent-corail/20 transition-all duration-300`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="p-3.5 rounded-xl bg-accent-corail/10 text-accent-corail w-fit group-hover:bg-accent-corail group-hover:text-white transition-all duration-300">
                <Share2 size={24} />
              </div>
              <div className="absolute top-5 right-6 text-6xl font-display font-extrabold bg-clip-text text-transparent bg-linear-to-br from-pink-500/10 to-purple-500/10 select-none">2</div>
              <h3 className="font-display text-lg font-medium">2. Partagez votre lien</h3>
              <p className={`text-sm ${styles.textSecondary} leading-relaxed`}>
                Ajoutez le lien dans votre bio TikTok, Instagram ou envoyez-le sur Snapchat. Vos fans accèdent directement à votre page sans inscription.
              </p>
            </div>

            {/* Step 3 */}
            <div className={`p-7 rounded-[20px] border ${styles.surface} flex flex-col gap-5 relative overflow-hidden group hover:shadow-lg hover:border-accent-corail/20 transition-all duration-300`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="p-3.5 rounded-xl bg-accent-corail/10 text-accent-corail w-fit group-hover:bg-accent-corail group-hover:text-white transition-all duration-300">
                <Coins size={24} />
              </div>
              <div className="absolute top-5 right-6 text-6xl font-display font-extrabold bg-clip-text text-transparent bg-linear-to-br from-purple-500/10 to-emerald-500/10 select-none">3</div>
              <h3 className="font-display text-lg font-medium">3. Encaissez directement</h3>
              <p className={`text-sm ${styles.textSecondary} leading-relaxed`}>
                Les acheteurs paient en Mobile Money. Vos fonds s'accumulent instantanément. Demandez vos retraits en Wave, Orange ou MTN à tout moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section id="live-demo" className="max-w-6xl w-full mx-auto px-4 py-16 flex flex-col items-center gap-12 select-none">
        
        {/* Top Circle Badge - 0% FRICTION */}
        <div className="flex flex-col items-center relative mt-4">
          <div className="relative w-36 h-36 rounded-full bg-light-bg-surface flex flex-col items-center justify-center shadow-sm border border-border-custom">
            {/* SVG Arc representing 0% with subtle indicator */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="44" 
                className="stroke-gray-100 fill-none" 
                strokeWidth="4" 
              />
              {/* Highlight dot or segment for 0% aesthetic */}
              <circle 
                cx="50" 
                cy="50" 
                r="44" 
                className="stroke-accent-corail fill-none" 
                strokeWidth="4" 
                strokeDasharray="276"
                strokeDashoffset="271"
                strokeLinecap="round"
              />
            </svg>

            {/* Lightning yellow circle at top right */}
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-success-gold border-2 border-white flex items-center justify-center text-white shadow-md animate-pulse">
              <Zap size={14} className="fill-current text-white" />
            </div>

            {/* Text inside */}
            <div className="flex items-baseline justify-center">
              <span className="font-display text-5xl font-semibold text-text-primary tracking-tighter">0</span>
              <span className="text-xl font-medium text-text-secondary ml-0.5">%</span>
            </div>
          </div>
          
          {/* Pill Badge overlapping at bottom */}
          <div className="absolute -bottom-3 px-4 py-1.5 rounded-full bg-text-primary text-white text-[10px] font-bold tracking-widest uppercase shadow-md border border-border-custom">
            Friction
          </div>
        </div>

        {/* Text Headers */}
        <div className="text-center flex flex-col gap-4 mt-4">
          <h2 className="font-display text-4xl sm:text-5xl font-medium text-text-primary tracking-tight leading-tight">
            Vos fans achètent. Vous encaissez.
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Acceptez <strong className="text-text-primary font-semibold">Wave</strong>, <strong className="text-text-primary font-semibold">Orange Money</strong> et les <strong className="text-text-primary font-semibold">Cartes Bancaires</strong> en un clic. Vos revenus arrivent directement sur votre solde. <span className="text-accent-corail font-semibold whitespace-nowrap">Zéro barrière technique.</span>
          </p>
        </div>

        {/* Big White Card Layout with two columns */}
        <div className="w-full max-w-5xl bg-light-bg-surface border border-border-custom rounded-[24px] sm:rounded-[32px] p-6 sm:p-12 lg:p-16 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Interactive Simulation Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[360px] bg-white rounded-[20px] border border-border-custom shadow-sm p-6 relative flex flex-col gap-5 overflow-hidden transition-all duration-300 hover:shadow-md min-h-[460px] justify-between">
              
              {demoPaymentState === 'idle' && (
                <>
                  {/* Content Info */}
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-accent-corail/10 text-accent-corail flex items-center justify-center shrink-0">
                      <Download size={20} />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-sm text-text-primary leading-tight">Guide : Booster sa Communauté</h4>
                      <span className="text-xs text-text-secondary mt-1">Par Awa Ndiaye</span>
                    </div>
                  </div>

                  {/* Big Price */}
                  <div className="text-center py-2">
                    <span className="text-3xl font-medium font-display text-text-primary tracking-tight">2 500 FCFA</span>
                  </div>

                  <div className="h-[1px] bg-border-custom w-full" />

                  {/* Payment Method Selector */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-text-secondary tracking-widest text-center uppercase">
                      Moyen de paiement
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => setDemoPaymentMethod('wave')}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          demoPaymentMethod === 'wave' 
                            ? 'border-[#1D9BF0] bg-[#E6F4FE] text-[#1D9BF0]' 
                            : 'border-border-custom bg-light-bg-primary text-text-secondary hover:bg-gray-100'
                        }`}
                      >
                        Wave
                      </button>
                      <button 
                        onClick={() => setDemoPaymentMethod('orange')}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          demoPaymentMethod === 'orange' 
                            ? 'border-[#FF6600] bg-[#FFF2E6] text-[#FF6600]' 
                            : 'border-border-custom bg-light-bg-primary text-text-secondary hover:bg-gray-100'
                        }`}
                      >
                        Orange
                      </button>
                      <button 
                        onClick={() => setDemoPaymentMethod('carte')}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          demoPaymentMethod === 'carte' 
                            ? 'border-accent-corail bg-accent-corail/10 text-accent-corail' 
                            : 'border-border-custom bg-light-bg-primary text-text-secondary hover:bg-gray-100'
                        }`}
                      >
                        Carte
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Form Area */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
                      {demoPaymentMethod === 'carte' ? 'Numéro de carte' : 'Numéro de téléphone'}
                    </span>
                    
                    <div className="w-full bg-light-bg-primary border border-border-custom rounded-xl px-4 py-3.5 flex items-center gap-3 text-sm text-text-primary focus-within:border-accent-corail focus-within:bg-white transition-all">
                      {demoPaymentMethod === 'carte' ? (
                        <>
                          <CreditCard size={18} className="text-text-secondary shrink-0" />
                          <input 
                            type="text" 
                            placeholder="4242 •••• •••• 4242" 
                            value={demoCardNumber}
                            onChange={(e) => setDemoCardNumber(e.target.value)}
                            className="bg-transparent border-none outline-none p-0 w-full text-sm placeholder-gray-300 tracking-wide font-medium"
                            maxLength={19}
                          />
                        </>
                      ) : (
                        <>
                          <Smartphone size={18} className="text-text-secondary shrink-0" />
                          <input 
                            type="tel" 
                            placeholder={demoPaymentMethod === 'wave' ? '+221 77 123 45 67' : '+225 07 123 456 78'} 
                            value={demoPhone}
                            onChange={(e) => setDemoPhone(e.target.value)}
                            className="bg-transparent border-none outline-none p-0 w-full text-sm placeholder-gray-300 tracking-wide font-medium"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Big Action Button */}
                  <button 
                    onClick={() => {
                      setDemoPaymentState('paying');
                      setTimeout(() => {
                        setDemoPaymentState('success');
                      }, 1800);
                    }}
                    className="w-full bg-accent-corail text-white hover:bg-accent-corail-hover transition-all duration-200 font-semibold rounded-xl py-3.5 text-center text-sm shadow-lg shadow-accent-corail/15 mt-2 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    Payer 2 500 FCFA
                  </button>
                </>
              )}

              {demoPaymentState === 'paying' && (
                <div className="flex flex-col items-center justify-center my-auto gap-5 py-8">
                  <div className="relative flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-accent-corail"></div>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5 px-4 animate-pulse">
                    <h5 className="font-semibold text-sm text-text-primary">
                      {demoPaymentMethod === 'carte' ? 'Validation 3D Secure...' : 'Envoi de la demande de paiement...'}
                    </h5>
                    <p className="text-xs text-text-secondary">
                      {demoPaymentMethod === 'carte' 
                        ? 'Vérification en cours avec votre établissement bancaire.' 
                        : 'Confirmez la transaction via le menu ou la notification de votre opérateur.'}
                    </p>
                  </div>
                </div>
              )}

              {demoPaymentState === 'success' && (
                <div className="flex flex-col items-center justify-between h-full py-2">
                  <div className="flex flex-col items-center text-center my-auto gap-4 px-2">
                    {/* Pulsing check icon */}
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-md animate-bounce">
                      <Check size={32} className="stroke-[3]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-lg font-medium font-display text-text-primary">Paiement réussi !</h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Le guide <span className="font-semibold text-text-primary">"Booster sa Communauté"</span> a été déverrouillé avec succès.
                      </p>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob(["Félicitations pour votre achat fictif sur MomoLink !"], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = "guide-booster-communaute-demo.txt";
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="w-full bg-text-primary text-white hover:bg-text-primary/95 transition-all font-semibold rounded-xl py-3 text-center text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <Download size={14} />
                      Télécharger le Guide
                    </button>
                    
                    <button 
                      onClick={() => {
                        setDemoPaymentState('idle');
                        setDemoPhone('');
                        setDemoCardNumber('4242 4242 4242 4242');
                      }}
                      className="text-xs text-text-secondary hover:text-accent-corail hover:underline transition-all text-center cursor-pointer font-medium"
                    >
                      Recommencer la démonstration
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Promotional Bullet points */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <h3 className="font-display text-3xl sm:text-4xl font-medium text-text-primary tracking-tight leading-tight">
              Transformez chaque clic en encaissement direct.
            </h3>
            
            <div className="flex flex-col gap-6">
              {/* Point 1 */}
              <div className="flex gap-4 items-start">
                <div className="p-3.5 rounded-2xl bg-accent-corail/10 border border-border-custom shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-accent-corail flex items-center justify-center shrink-0 w-12 h-12">
                  <Smartphone size={22} />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-semibold text-text-primary text-base mb-1">
                    Mobile Money Intégré
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Proposez Wave, Orange Money, MTN ou Moov. Vos acheteurs paient directement depuis leur téléphone au Sénégal, en Côte d’Ivoire, au Togo ou au Cameroun sans friction.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex gap-4 items-start">
                <div className="p-3.5 rounded-2xl bg-accent-corail/10 border border-border-custom shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-accent-corail flex items-center justify-center shrink-0 w-12 h-12">
                  <CreditCard size={22} />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-semibold text-text-primary text-base mb-1">
                    Cartes Bancaires pour la Diaspora
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Ne ratez aucun fan international. Vos abonnés résidant en Europe ou en Amérique paient instantanément et en toute sécurité par Visa ou Mastercard.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex gap-4 items-start">
                <div className="p-3.5 rounded-2xl bg-accent-corail/10 border border-border-custom shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-accent-corail flex items-center justify-center shrink-0 w-12 h-12">
                  <Zap size={22} />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-semibold text-text-primary text-base mb-1">
                    Livraison 100% Automatisée
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    MomoLink livre le fichier instantanément après validation du paiement. Pas d'envoi manuel fastidieux, tout s'exécute automatiquement pendant que vous dormez.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Platform Impact Section */}
      <PlatformImpact />

      {/* Trust & Features Section */}
      <section id="trust" className={`border-t ${styles.border} py-16 px-4 bg-opacity-30 ${isDarkMode ? 'bg-bg-surface/25' : 'bg-gray-50/25'}`}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-3xl font-medium tracking-tight">Une technologie pensée pour l'Afrique francophone</h2>
            <p className={`text-sm ${styles.textSecondary} leading-relaxed`}>
              La majorité des outils de monétisation actuels imposent d'avoir un compte Stripe ou Paypal, inaccessibles ou très limités pour la plupart des créateurs de contenu en Afrique de l'Ouest et Centrale.
            </p>
            <p className={`text-sm ${styles.textSecondary} leading-relaxed`}>
              <strong>MomoLink</strong> résout cela en se branchant directement sur les services que vos abonnés et vous-même utilisez déjà tous les jours : <strong>Wave, Orange Money, MTN MoMo, Moov Money</strong>.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex items-start gap-2">
                <Check size={16} className="text-success-gold mt-0.5 shrink-0" />
                <span className="text-xs font-semibold">Taux de conversion imbattable</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-success-gold mt-0.5 shrink-0" />
                <span className="text-xs font-semibold">Support réactif 24/7</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-success-gold mt-0.5 shrink-0" />
                <span className="text-xs font-semibold">Sécurisation contre le partage</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-success-gold mt-0.5 shrink-0" />
                <span className="text-xs font-semibold">Zéro frais d'installation</span>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[24px] border ${styles.surface} flex flex-col gap-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-corail/5 rounded-full blur-3xl" />
            <h3 className="font-display text-xl font-medium">Prêt pour le grand saut ?</h3>
            
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex gap-3">
                <span className="p-2 h-fit rounded-lg bg-accent-corail/10 text-accent-corail shrink-0">
                  <Smartphone size={16} />
                </span>
                <div>
                  <h4 className="font-semibold text-sm mb-0.5">Compatible avec 100% des smartphones</h4>
                  <p className={styles.textSecondary}>Achetez sur n'importe quel mobile sans aucune application externe requise.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="p-2 h-fit rounded-lg bg-accent-corail/10 text-accent-corail shrink-0">
                  <Coins size={16} />
                </span>
                <div>
                  <h4 className="font-semibold text-sm mb-0.5">Retraits instantanés de vos fonds</h4>
                  <p className={styles.textSecondary}>Votre argent est transféré vers votre compte Mobile Money dès que vous en faites la demande.</p>
                </div>
              </div>
            </div>

            <Link
              to="/auth/signup"
              className="w-full py-3 rounded-full text-xs font-semibold bg-accent-corail text-white hover:bg-accent-corail-hover transition-all cursor-pointer text-center mt-2 block"
            >
              Commencer maintenant (Création en 2 min)
            </Link>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section id="faq" className={`py-20 px-4 border-t ${styles.border}`}>
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          <div className="text-center flex flex-col gap-2">
            <span className="text-[10px] font-bold text-accent-corail uppercase tracking-widest">Questions Fréquentes</span>
            <h2 className={`font-display text-3xl font-medium tracking-tight ${styles.textPrimary}`}>
              Tout ce que vous devez savoir
            </h2>
            <p className={`text-xs ${styles.textSecondary} max-w-md mx-auto`}>
              Vous avez des questions sur le fonctionnement de MomoLink ? Nous avons réuni les réponses les plus fréquentes pour vous aider.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faqData.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className={`border ${styles.border} ${styles.surface} rounded-2xl overflow-hidden transition-all duration-200 shadow-sm`}
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className={`text-xs font-semibold ${styles.textPrimary}`}>
                      {faq.q}
                    </span>
                    <span className={`text-xs font-bold transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-accent-corail' : 'text-gray-400'}`}>
                      ▼
                    </span>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isOpen ? "auto" : 0, 
                      opacity: isOpen ? 1 : 0 
                    }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className={`px-6 pb-4 pt-1 border-t ${styles.border} bg-neutral-50/50 dark:bg-neutral-900/20`}>
                      <p className={`text-xs leading-relaxed ${styles.textSecondary}`}>
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Final CTA */}
      <section id="final-cta" className="max-w-5xl w-full mx-auto px-4 py-24 flex flex-col items-center text-center gap-8">
        <div className="w-full rounded-[28px] bg-linear-to-br from-accent-corail via-pink-500 to-purple-600 p-10 sm:p-16 flex flex-col items-center gap-8 relative overflow-hidden shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-white/10 blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[150px] h-[150px] rounded-full bg-white/10 blur-[50px] pointer-events-none" />
          
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-2xl relative z-10">
            Rejoignez la révolution de la monétisation en Afrique
          </h2>
          <p className="text-base text-white/80 max-w-lg mx-auto relative z-10">
            Inscrivez-vous dès aujourd'hui et commencez à vendre votre savoir, vos conseils et vos créations de manière professionnelle.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md relative z-10">
            <Link
              to="/auth/signup"
              className="w-full sm:w-auto px-10 py-4 rounded-full text-sm font-bold bg-white text-accent-corail hover:bg-gray-50 hover:scale-105 hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Créer mon compte créateur</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] uppercase tracking-wider font-bold text-white/70 mt-2 relative z-10">
            <span>🇹🇬 Togo</span>
            <span>🇨🇮 Côte d'Ivoire</span>
            <span>🇸🇳 Sénégal</span>
            <span>🇨🇲 Cameroun</span>
          </div>
        </div>
      </section>

      {/* Redesigned Premium Footer */}
      <footer className={`border-t ${styles.border} ${styles.surface} py-16 px-6 text-xs transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2">
              <img 
                src="https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/d0bc935c-5e3d-48cd-a9c6-dae266ebffdc.png" 
                alt="MomoLink Logo" 
                className="h-7 w-7 object-contain rounded-md"
              />
              <span className={`font-display font-bold text-base tracking-tight ${styles.textPrimary}`}>
                MomoLink <span className="text-accent-corail text-xs font-semibold">Pro</span>
              </span>
            </div>
            <p className={`leading-relaxed ${styles.textSecondary}`}>
              La plateforme leader pour monétiser vos contenus exclusifs en Afrique de l'Ouest et Centrale avec le Mobile Money.
            </p>
            <div className={`text-[10px] ${styles.textSecondary} opacity-70`}>
              © {new Date().getFullYear()} MomoLink Inc. Tous droits réservés.
            </div>
          </div>

          {/* Useful Links */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className={`font-bold uppercase tracking-wider text-[10px] ${styles.textPrimary}`}>
              Ressources
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/auth/signup" className={`hover:text-accent-corail transition-colors ${styles.textSecondary}`}>Devenir Créateur</Link>
              <Link to="/portal" className={`hover:text-accent-corail transition-colors ${styles.textSecondary}`}>Espace Client / Achats</Link>
              <a href="#how-it-works" className={`hover:text-accent-corail transition-colors ${styles.textSecondary}`}>Comment ça marche</a>
              <a href="#live-demo" className={`hover:text-accent-corail transition-colors ${styles.textSecondary}`}>Démonstration Live</a>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className={`font-bold uppercase tracking-wider text-[10px] ${styles.textPrimary}`}>
              Légal
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/legal/terms" className={`hover:text-accent-corail transition-colors ${styles.textSecondary}`}>Conditions d’utilisation</Link>
              <Link to="/legal/sales" className={`hover:text-accent-corail transition-colors ${styles.textSecondary}`}>Conditions de vente (CGV)</Link>
              <Link to="/legal/privacy" className={`hover:text-accent-corail transition-colors ${styles.textSecondary}`}>Politique de confidentialité</Link>
            </div>
          </div>

          {/* Regions and Support */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className={`font-bold uppercase tracking-wider text-[10px] ${styles.textPrimary}`}>
              Disponibilité & Support
            </h4>
            <p className={`leading-relaxed ${styles.textSecondary}`}>
              Support disponible 24/7 par email : <a href="mailto:support@momolink.pro" className="text-accent-corail hover:underline">support@momolink.pro</a>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`px-2.5 py-1 rounded bg-bg-primary text-[10px] font-semibold border ${styles.border}`}>🇨🇮 CI</span>
              <span className={`px-2.5 py-1 rounded bg-bg-primary text-[10px] font-semibold border ${styles.border}`}>🇸🇳 SN</span>
              <span className={`px-2.5 py-1 rounded bg-bg-primary text-[10px] font-semibold border ${styles.border}`}>🇹🇬 TG</span>
              <span className={`px-2.5 py-1 rounded bg-bg-primary text-[10px] font-semibold border ${styles.border}`}>🇨🇲 CM</span>
            </div>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE MOCK PAYMENT MODAL (Aesthetic Highlight for Step 1) */}
      <AnimatePresence>
        {isPaymentModalOpen && activeDemoContent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-[20px] border ${styles.surface} relative shadow-2xl flex flex-col gap-5`}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full border ${styles.border} ${styles.hoverBg} transition-all cursor-pointer`}
              >
                <X size={16} />
              </button>

              {/* Title & Product Info */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-accent-corail uppercase tracking-widest">
                  Paiement Mobile Money Sécurisé
                </span>
                <h3 className="font-display text-lg font-medium">Débloquer le contenu</h3>
                <div className={`p-3 rounded-xl border ${styles.border} mt-2 flex items-start gap-3`}>
                  <div className="p-2 bg-accent-corail/10 text-accent-corail rounded-lg shrink-0">
                    <Lock size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-text-primary line-clamp-1">{activeDemoContent.title}</h4>
                    <span className="text-xs text-accent-corail font-bold mt-1 block">
                      {activeDemoContent.price_fcfa.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Step Content */}
              {paymentStep === 'details' && (
                <div className="flex flex-col gap-4">
                  {/* Select Operator */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider">Sélectionnez votre opérateur</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'wave', label: 'Wave', color: 'bg-blue-500/10 border-blue-500/40 text-blue-500' },
                        { id: 'orange', label: 'Orange', color: 'bg-orange-500/10 border-orange-500/40 text-orange-500' },
                        { id: 'mtn', label: 'MTN', color: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500' },
                        { id: 'moov', label: 'Moov', color: 'bg-blue-600/10 border-blue-600/40 text-blue-600' }
                      ].map((prov) => (
                        <button
                          key={prov.id}
                          onClick={() => setSelectedProvider(prov.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            selectedProvider === prov.id 
                              ? prov.color + ' border-2 font-bold ring-2 ring-accent-corail/10' 
                              : `border-border-custom hover:bg-bg-surface-hover ${styles.textSecondary}`
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase">{prov.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Phone number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider">Numéro Mobile Money</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                      <input
                        type="tel"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder="Ex: 90 12 34 56"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${styles.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-accent-corail/50 focus:border-accent-corail transition-all`}
                        required
                      />
                    </div>
                    <span className="text-[10px] opacity-75">
                      Entrez un numéro fictif pour tester la démo.
                    </span>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={startMockPayment}
                    disabled={!paymentPhone}
                    className={`w-full py-3.5 rounded-xl text-xs font-semibold text-white bg-accent-corail hover:bg-accent-corail-hover transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                      !paymentPhone && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span>Valider et payer {activeDemoContent.price_fcfa.toLocaleString('fr-FR')} FCFA</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {paymentStep === 'loading' && (
                <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-4 border-accent-corail/20 animate-ping" />
                    <span className="w-10 h-10 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Paiement en cours...</h4>
                    <p className={`text-xs ${styles.textSecondary} mt-1 max-w-[240px]`}>
                      Veuillez valider la transaction fictive sur votre téléphone.
                    </p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-6 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="p-4 bg-green-500/10 text-success-gold rounded-full border border-green-500/30 animate-bounce">
                    <Check size={32} />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-medium text-text-primary">Félicitations !</h4>
                    <p className={`text-xs ${styles.textSecondary} mt-1 max-w-[280px]`}>
                      Le paiement de <strong>{activeDemoContent.price_fcfa.toLocaleString('fr-FR')} FCFA</strong> a été validé. Le contenu est maintenant débloqué !
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="mt-2 px-6 py-2.5 rounded-full bg-accent-corail text-white text-xs font-semibold hover:bg-accent-corail-hover transition-all cursor-pointer"
                  >
                    Voir le contenu
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
