import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, Factory, BarChart3, ChevronRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="flex items-center gap-2">
              <span className="status-dot bg-olive" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-coffee/40">Network Status: Operational</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-semibold text-coffee leading-[0.95] tracking-tighter">
              Verified <br />
              <span className="text-olive">Production</span> <br />
              Nodes.
            </h1>
            <p className="text-stone text-lg md:text-xl font-medium leading-relaxed max-w-lg">
              Connecting high-growth enterprise teams with Africa's most technologically optimized manufacturing facilities.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <Link to="/signup" className="btn-primary">
                Join the Network
              </Link>
              <Link to="/marketplace" className="text-xs font-bold uppercase tracking-widest text-coffee/60 hover:text-coffee transition-colors">
                Explore Catalog
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-sand/20 border border-sand shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200" 
                alt="Industrial Supply" 
                className="w-full h-full object-cover mix-blend-multiply opacity-90"
              />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {[
            { icon: Factory, title: "Modern Facilities", desc: "Qualified manufacturers with verified production capacity." },
            { icon: UserCheck, title: "KYB Compliance", desc: "Rigorous corporate identity and ethics auditing." },
            { icon: Truck, title: "Logistics Ready", desc: "Nodes verified for regional and international trade protocols." }
          ].map((item, i) => (
            <div key={i} className="group border-t border-sand/50 pt-10 transition-colors hover:border-olive/30">
              <div className="w-10 h-10 border border-sand rounded-lg flex items-center justify-center text-coffee mb-8 group-hover:bg-coffee group-hover:text-white transition-all shadow-sm">
                <item.icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-display font-medium text-coffee mb-3">{item.title}</h3>
              <p className="text-sm text-stone/80 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-coffee p-12 md:p-20 rounded-2xl text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-medium mb-8 leading-tight">Scale your <br />industrial output.</h2>
              <p className="text-white/60 text-lg mb-12 max-w-md font-medium">Connect your facility to our verified trade ecosystem and access professional procurement teams globally.</p>
              <Link to="/signup" className="btn-secondary inline-flex items-center gap-3 px-8 py-4 uppercase tracking-widest border-none">
                Register as Supplier <ChevronRight size={16} />
              </Link>
            </div>
            <div className="flex flex-col gap-10">
              <div className="border-l border-white/10 pl-8">
                <p className="text-4xl md:text-5xl font-display font-medium text-olive mb-2">1.2k</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Verified Manufacturers</p>
              </div>
              <div className="border-l border-white/10 pl-8">
                <p className="text-4xl md:text-5xl font-display font-medium text-olive mb-2">150k</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nodes Connected</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
