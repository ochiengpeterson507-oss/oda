import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion } from 'motion/react';
import { LayoutGrid, Database, Zap, Briefcase, ChevronRight, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-40 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 mb-32"
        >
          <span className="text-[11px] font-bold text-coffee/40 uppercase tracking-[0.4em]">Future of Commerce</span>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-medium text-coffee tracking-tighter leading-[0.95]">Tools for Enterprise.</h1>
          <p className="text-stone text-[19px] font-medium max-w-2xl mx-auto leading-relaxed">
            From smart procurement to verified communications, we provide the infrastructure businesses need to thrive in a global economy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
          {[
            { icon: LayoutGrid, title: "Supply Intelligence", desc: "Predictive sourcing and automated inventory replenishment platforms for heavy industry." },
            { icon: Database, title: "Verification Nodes", desc: "Decentralized corporate identity verification for high-value contract security." },
            { icon: Zap, title: "Frictionless Bidding", desc: "Direct, real-time negotiation pipelines between procurement leads and managers." },
            { icon: Briefcase, title: "Resource Orchestration", desc: "Optimize logistics and asset allocation with unified supply chain data." }
          ].map((solution, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-sand/30 border border-sand rounded-xl flex items-center justify-center text-coffee/60 group-hover:bg-coffee group-hover:text-cream transition-all duration-300">
                  <solution.icon size={20} strokeWidth={1.5} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-display font-medium text-coffee">{solution.title}</h3>
                  <p className="text-sm text-stone font-medium leading-relaxed">{solution.desc}</p>
                </div>
                <div className="pt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-coffee/30 group-hover:text-coffee transition-colors">
                  Explore Capacity <ChevronRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1">
            <div className="space-y-12">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-medium text-coffee leading-[0.95] tracking-tighter">Integrated Trade <br />Infrastructure.</h2>
              <div className="space-y-10">
                {[
                  { title: "Unified Communication", desc: "Direct, encrypted messaging pipelines between corporate buyers and suppliers." },
                  { title: "Verified Sourcing", desc: "Every product listed undergoes a strict review process to ensure quality standards." },
                  { title: "Risk Mitigation", desc: "Advanced protocols to identify and flag inconsistencies in trade patterns." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-1 h-12 bg-sand/30 rounded-full flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-coffee text-sm uppercase tracking-widest">{item.title}</h4>
                      <p className="text-[15px] text-stone leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/signup" className="btn-primary inline-flex items-center gap-4 px-10 py-5 text-xs font-bold uppercase tracking-[0.3em]">
                Get Started <Zap size={14} />
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="rounded-[3rem] overflow-hidden group relative">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" 
                alt="Architecture" 
                className="w-full h-[500px] md:h-[650px] object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-coffee/10 mix-blend-overlay" />
              <div className="absolute top-12 left-12 p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl flex items-center gap-6">
                <div className="p-4 bg-coffee text-cream rounded-xl">
                  <Globe2 size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone/40 uppercase tracking-widest mb-1">Global Coverage</p>
                  <p className="text-xl font-display font-medium text-coffee">24 Regions Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
