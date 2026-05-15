import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-16 border-t border-sand px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-2 space-y-8">
            <Link to="/" className="text-3xl font-display font-bold text-coffee tracking-tighter">
              ODA<span className="text-olive">.</span>
            </Link>
            <p className="text-sm text-stone leading-relaxed max-w-sm font-medium">
              Empowering professional trade through verified identity and seamless cross-border sourcing. Join the most trusted marketplace in Enterprise Africa.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-sand/50 border border-sand rounded-xl flex items-center justify-center text-stone hover:text-coffee transition-colors cursor-pointer">
                <Globe size={18} strokeWidth={2} />
              </div>
              <div className="w-10 h-10 bg-sand/50 border border-sand rounded-xl flex items-center justify-center text-stone hover:text-coffee transition-colors cursor-pointer">
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-coffee uppercase tracking-wider mb-6">Ecosystem</h4>
            <ul className="space-y-4 text-sm text-stone font-medium">
              <li><Link to="/marketplace" className="hover:text-forest transition-colors">Marketplace</Link></li>
              <li><Link to="/suppliers" className="hover:text-forest transition-colors">Verified Nodes</Link></li>
              <li><Link to="/solutions" className="hover:text-forest transition-colors">Solutions Hub</Link></li>
              <li><Link to="/marketplace" className="hover:text-forest transition-colors">Bulk Protocols</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-coffee uppercase tracking-wider mb-6">Corporate</h4>
            <ul className="space-y-4 text-sm text-stone font-medium">
              <li><Link to="/about" className="hover:text-forest transition-colors">Our Story</Link></li>
              <li><Link to="/marketplace" className="hover:text-forest transition-colors">Help Center</Link></li>
              <li><Link to="/terms" className="hover:text-forest transition-colors">Security Node</Link></li>
              <li><Link to="/about" className="hover:text-forest transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-coffee uppercase tracking-wider">Engagement</h4>
            <div className="space-y-4">
              <p className="text-xs text-stone font-medium">Subscribe to commercial updates</p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Corporate Email" 
                  className="w-full bg-cream border border-sand pl-4 pr-12 py-3 rounded-xl text-sm font-medium placeholder:text-stone/60 outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive transition-all text-coffee" 
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-coffee text-white p-2 rounded-lg hover:bg-charcoal transition-all">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-sand flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <p className="text-xs text-stone font-semibold uppercase tracking-wider">© 2026 ODA Network – Founders: Ron Kenol.</p>
            <p className="text-[10px] text-stone font-medium uppercase tracking-wider">Nairobi • Mombasa • Kisumu • Lagos • Joburg</p>
          </div>
          <div className="flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-stone">
            <Link to="/terms" className="hover:text-coffee transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-coffee transition-colors">Terms</Link>
            <Link to="/terms" className="hover:text-coffee transition-colors">Compliance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

