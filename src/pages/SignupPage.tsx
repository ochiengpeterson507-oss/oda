import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import AuthLayout from '../components/layout/AuthLayout';
import { UserPlus, Mail, Lock, User, AlertCircle, Briefcase, Factory, Building2 } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'placeholder';
    if (supabaseUrl.includes('placeholder')) {
      setError("Please connect your Supabase database first.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Typically show a verification message or redirect
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'placeholder';
    if (supabaseUrl.includes('placeholder')) {
      setError("Please connect your Supabase database first to use Google Sign-in.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) setError(error.message);
  };

  return (
    <AuthLayout 
      role={role}
      title="Create Account" 
      subtitle="Register your business to access the ODA trade infrastructure."
    >
      <form onSubmit={handleSignup} className="space-y-10">
        {error && (
          <div className="p-4 bg-clay/5 border border-clay/20 rounded-xl flex items-center gap-3 text-clay text-[11px] font-medium">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => setRole('buyer')}
            className={`p-6 rounded-xl border transition-all flex flex-col gap-4 text-left relative overflow-hidden ${role === 'buyer' ? 'border-coffee bg-coffee/5 shadow-sm' : 'border-sand hover:border-coffee/20 bg-white/70 backdrop-blur-sm'}`}
          >
            <Briefcase size={20} className={role === 'buyer' ? 'text-coffee' : 'text-stone/40'} />
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-widest block mb-1 ${role === 'buyer' ? 'text-coffee' : 'text-stone/40'}`}>Procurement</span>
              <span className="text-sm font-display font-medium text-coffee">Buyer</span>
            </div>
          </button>
          
          <button 
            type="button"
            onClick={() => setRole('seller')}
            className={`p-6 rounded-xl border transition-all flex flex-col gap-4 text-left relative overflow-hidden ${role === 'seller' ? 'border-olive bg-olive/5 shadow-sm' : 'border-sand hover:border-olive/20 bg-white/70 backdrop-blur-sm'}`}
          >
            <Factory size={20} className={role === 'seller' ? 'text-olive' : 'text-stone/40'} />
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-widest block mb-1 ${role === 'seller' ? 'text-olive' : 'text-stone/40'}`}>Manufacturing</span>
              <span className="text-sm font-display font-medium text-coffee">Seller</span>
            </div>
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-coffee/50">Full Name</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40 group-focus-within:text-coffee transition-colors">
                <User size={16} strokeWidth={1.5} />
              </div>
              <input 
                type="text" 
                required
                className="input-field pl-12"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {role === 'seller' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-coffee/50">Company Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40 group-focus-within:text-coffee transition-colors">
                    <Building2 size={16} strokeWidth={1.5} />
                  </div>
                  <input 
                    type="text" 
                    required
                    className="input-field pl-12"
                    placeholder="Registered Entity Name"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-coffee/50">Business Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40 group-focus-within:text-coffee transition-colors">
                <Mail size={16} strokeWidth={1.5} />
              </div>
              <input 
                type="email" 
                required
                className="input-field pl-12"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-coffee/50">Set Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40 group-focus-within:text-coffee transition-colors">
                <Lock size={16} strokeWidth={1.5} />
              </div>
              <input 
                type="password" 
                required
                className="input-field pl-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 text-xs uppercase tracking-[0.3em] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-sand"></div>
            <span className="flex-shrink mx-4 text-[9px] font-bold text-stone/30 uppercase tracking-[0.4em]">SSO GATEWAY</span>
            <div className="flex-grow border-t border-sand"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="btn-secondary w-full py-4 flex items-center justify-center gap-4 group"
          >
            <svg className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-coffee/60">Continue with Google</span>
          </button>
        </div>
      </form>

      <div className="pt-12 text-center">
        <p className="text-[11px] font-medium text-stone/40 mb-4">
          Existing Corporate Profile?
        </p>
        <Link to="/login" className="text-xs font-bold text-coffee uppercase tracking-[0.2em] hover:text-olive transition-colors">
          Connect to Account
        </Link>
      </div>
    </AuthLayout>
  );
}
