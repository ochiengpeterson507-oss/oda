import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Store, 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: profile?.role === 'buyer' ? '/dashboard/overview' : '/dashboard/overview', icon: LayoutDashboard },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Seller Center', href: '/dashboard/seller', icon: Store, role: 'seller' },
    { name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldAlert, role: 'admin' },
    { name: 'Inquiries', href: '#inquiries', icon: MessageSquare },
    { name: 'Settings', href: '#settings', icon: Settings },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.role || profile?.role === item.role || profile?.role === 'admin'
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-coffee/40 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-sand/30 p-6 z-[70] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="text-3xl font-display font-semibold text-coffee tracking-tighter">
              oda<span className="text-olive">.</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-coffee/40 hover:bg-cream rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-1.5">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href.startsWith('#') ? '#' : item.href}
                  onClick={(e) => {
                    setSidebarOpen(false);
                    if (item.href.startsWith('#')) {
                      e.preventDefault();
                      const targetId = item.href.substring(1);
                      const element = document.getElementById(targetId);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-olive text-white shadow-lg shadow-olive/20 font-bold' 
                      : 'text-stone hover:bg-cream hover:text-coffee'}
                  `}
                >
                  <item.icon size={20} className={`${isActive ? 'text-white' : 'text-stone group-hover:text-olive'}`} />
                  <span className="text-sm">{item.name}</span>
                  {isActive && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-sand/20">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-stone hover:bg-clay/5 hover:text-clay transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="text-sm font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-sand/20 px-4 md:px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-[50]">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 text-olive bg-olive/10 rounded-xl hover:bg-olive/20 transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden sm:flex items-center gap-3 bg-cream/50 px-4 py-2.5 rounded-xl border border-sand/20 w-full max-w-md focus-within:ring-2 focus-within:ring-olive/10 transition-all">
              <Search size={16} className="text-stone" />
              <input 
                type="text" 
                placeholder="Find orders, suppliers, or materials..." 
                className="bg-transparent border-none focus:ring-0 outline-none w-full text-xs font-medium placeholder:text-stone/60"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 ml-4">
            <button className="relative p-2.5 text-coffee hover:bg-cream rounded-xl transition-colors group">
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-clay rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-sand/20">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-coffee leading-tight truncate max-w-[120px]">{profile?.full_name}</p>
                <p className="text-[10px] text-stone font-bold uppercase tracking-wider mt-0.5">{profile?.role}</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-olive text-white flex items-center justify-center font-bold shadow-lg shadow-olive/10">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Global Banner for Mobile Search if needed */}
        <div className="sm:hidden px-4 pt-4">
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-sand/20 shadow-sm">
             <Search size={14} className="text-stone" />
             <input type="text" placeholder="Search..." className="bg-transparent border-none focus:ring-0 outline-none text-xs w-full" />
           </div>
        </div>

        {/* Content Explorer Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-10 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
