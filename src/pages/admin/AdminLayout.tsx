import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Vue d\'ensemble', href: '/admin', icon: LayoutDashboard },
    { name: 'Créateurs', href: '/admin/creators', icon: Users },
    { name: 'Retraits', href: '/admin/withdrawals', icon: Wallet },
    { name: 'Abonnements', href: '/admin/subscriptions', icon: Calendar },
    { name: 'Transactions', href: '/admin/transactions', icon: History },
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
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-bg-surface border-b border-border-custom px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
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
        fixed inset-y-0 left-0 z-30 w-64 bg-bg-surface border-r border-border-custom flex flex-col transition-transform duration-300 transform
        md:translate-x-0 md:static md:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="hidden md:flex items-center justify-between px-6 py-5 border-b border-border-custom">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-text-primary">Momo<span className="text-accent-corail">Link</span></span>
            <span className="bg-[#FF5252] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">Admin</span>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-border-custom bg-bg-primary/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent-corail/10 flex items-center justify-center text-accent-corail border border-accent-corail/20">
            <User size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-text-secondary truncate">Super Admin</p>
            <p className="text-sm font-medium text-text-primary truncate" title={user?.email || ''}>{user?.email || 'admin@momolink'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${active 
                    ? 'bg-bg-primary text-accent-corail border-l-2 border-accent-corail pl-3.5' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary/40'
                  }
                `}
                id={`nav-${item.href.replace('/admin', 'admin')}`}
              >
                <item.icon size={18} className={active ? 'text-accent-corail' : 'text-text-secondary'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-custom">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-primary/40 border border-transparent hover:border-border-custom transition-all"
            id="admin-logout-btn"
          >
            <LogOut size={16} />
            Déconnexion
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
  );
}
