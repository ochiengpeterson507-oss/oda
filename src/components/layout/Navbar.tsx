import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Suppliers', path: '/suppliers' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Our Story', path: '/about' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 h-16 flex items-center ${
        scrolled ? 'bg-white/80 backdrop-blur-md border-b border-sand' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="text-2xl font-display font-medium tracking-tighter text-coffee">
          oda<span className="text-olive">.</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10 text-[13px] font-medium text-stone">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              className={`transition-colors relative py-1 ${
                location.pathname === link.path 
                ? 'text-coffee' 
                : 'hover:text-coffee'
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-coffee"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary flex items-center gap-2">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold uppercase tracking-widest text-coffee/60 hover:text-coffee transition-colors px-4">Login</Link>
                <Link to="/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-coffee hover:bg-sand/20 rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-0 right-0 bg-white border-b border-sand shadow-2xl lg:hidden overflow-hidden z-40"
          >
            <div className="p-8 space-y-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-xl font-display font-semibold text-coffee hover:text-olive transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 space-y-4">
                {!user ? (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="block text-center py-4 text-sm font-bold uppercase tracking-widest text-coffee/60"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setIsOpen(false)}
                      className="block text-center py-4 bg-coffee text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-coffee/10"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className="block text-center py-4 bg-coffee text-white rounded-xl text-sm font-bold uppercase tracking-widest"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
