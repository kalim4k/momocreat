import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Calendar,
  History,
  LogOut,
  Menu,
  X,
  User,
  FileText,
  Heart,
  PanelLeftClose,
  PanelLeftOpen,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ToastProvider } from '../../components/admin/Toast';
import { LOGO_URL } from '../../lib/brand';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminSidebarCollapsed, setIsAdminSidebarCollapsed] = useState(() => {
    return localStorage.getItem('momo_admin_sidebar_collapsed') === 'true';
  });
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        let token = '';
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          token = session?.access_token || '';
        }
        if (!token && user) token = user.email || '';

        const res = await fetch('/api/admin/withdrawals', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Admin-Email': user?.email || ''
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        setPendingWithdrawalsCount((data.pending || []).length);
      } catch (err) {
        console.error('[AdminLayout] Error fetching pending withdrawals count:', err);
      }
    };

    if (user) {
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]);

  const navigation = [
    { name: 'Vue d\'ensemble', href: '/admin', icon: LayoutDashboard, section: null as string | null },
    { name: 'Créateurs', href: '/admin/creators', icon: Users, section: 'Modération' },
    { name: 'Comptes Test', href: '/admin/test-accounts', icon: FlaskConical, section: 'Modération' },
    { name: 'Contenus', href: '/admin/contents', icon: FileText, section: 'Modération' },
    { name: 'Dons & Messages', href: '/admin/donations-messages', icon: Heart, section: 'Modération' },
    { name: 'Retraits', href: '/admin/withdrawals', icon: Wallet, badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : undefined, section: 'Finances' },
    { name: 'Transactions', href: '/admin/transactions', icon: History, section: 'Finances' },
    { name: 'Abonnements', href: '/admin/subscriptions', icon: Calendar, section: 'Finances' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <ToastProvider>
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-bg-surface border-b border-border-custom px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img 
            src={LOGO_URL}
            alt="MomoLink Logo"
            className="h-7 w-7 object-contain rounded-lg"
          />
          <span className="font-bold text-xl tracking-tight text-text-primary">Momo<span className="text-accent-corail">Link</span></span>
          <span className="bg-[#FF5252] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-text-secondary hover:text-text-primary p-1"
          id="mobile-menu-toggle"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 bg-bg-surface border-r border-border-custom flex flex-col transition-all duration-300 transform
        md:translate-x-0 md:static md:h-screen
        ${isAdminSidebarCollapsed ? 'w-20' : 'w-64'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className={`hidden md:flex items-center ${isAdminSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-6'} py-5 border-b border-border-custom`}>
          <div className={`flex items-center ${isAdminSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <img 
              src={LOGO_URL}
              alt="MomoLink Logo"
              className="h-7 w-7 object-contain rounded-lg shadow-sm shrink-0"
            />
            {!isAdminSidebarCollapsed && (
              <>
                <span className="font-bold text-xl tracking-tight text-text-primary">Momo<span className="text-accent-corail">Link</span></span>
                <span className="bg-[#FF5252] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">Admin</span>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className={`px-6 py-4 border-b border-border-custom bg-bg-primary/50 flex items-center gap-3 ${isAdminSidebarCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-accent-corail/10 flex items-center justify-center text-accent-corail border border-accent-corail/20 shrink-0">
            <User size={18} />
          </div>
          {!isAdminSidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-text-primary truncate">Super Admin</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item, idx) => {
            const active = isActive(item.href);
            const prevSection = idx > 0 ? navigation[idx - 1].section : null;
            const showSectionHeader = !!item.section && item.section !== prevSection;
            return (
              <React.Fragment key={item.name}>
              {showSectionHeader && !isAdminSidebarCollapsed && (
                <span className="block px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-50">
                  {item.section}
                </span>
              )}
              <Link
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isAdminSidebarCollapsed ? item.name : undefined}
                className={`
                  flex items-center rounded-lg text-sm font-medium transition-all duration-200
                  ${isAdminSidebarCollapsed ? 'justify-center p-3' : 'justify-between gap-3 px-4 py-3'}
                  ${active
                    ? 'bg-bg-primary text-accent-corail border-l-2 border-accent-corail pl-3.5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary/40'
                  }
                `}
                id={`nav-${item.href.replace('/admin', 'admin')}`}
              >
                <div className="flex items-center gap-3 relative">
                  <item.icon size={18} className={active ? 'text-accent-corail shrink-0' : 'text-text-secondary shrink-0'} />
                  {!isAdminSidebarCollapsed && <span>{item.name}</span>}
                  {isAdminSidebarCollapsed && !!item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>
                {!isAdminSidebarCollapsed && !!item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-custom space-y-1">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title={isAdminSidebarCollapsed ? "Déconnexion" : undefined}
            className={`w-full flex items-center rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-primary/40 transition-all duration-200 ${isAdminSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            id="admin-logout-btn"
          >
            <LogOut size={18} className="shrink-0" />
            {!isAdminSidebarCollapsed && <span>Déconnexion</span>}
          </button>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => {
              setIsAdminSidebarCollapsed(prev => {
                const newVal = !prev;
                localStorage.setItem('momo_admin_sidebar_collapsed', String(newVal));
                return newVal;
              });
            }}
            className={`w-full flex items-center rounded-lg text-xs font-semibold text-text-secondary hover:text-accent-corail hover:bg-bg-primary/40 transition-all duration-200 cursor-pointer ${isAdminSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            title={isAdminSidebarCollapsed ? "Développer le menu" : "Réduire le menu"}
          >
            {isAdminSidebarCollapsed ? (
              <PanelLeftOpen size={18} className="shrink-0" />
            ) : (
              <>
                <PanelLeftClose size={18} className="shrink-0" />
                <span>Réduire le menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen overflow-y-auto bg-bg-primary">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>

      {/* Backdrop for mobile sidebar */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
    </div>
    </ToastProvider>
  );
}
