import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion } from 'motion/react';
import { Quote, Target, Heart, Scale } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-40 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
               <span className="text-[11px] font-bold text-coffee/40 uppercase tracking-[0.4em]">Our Philosophy</span>
               <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-medium text-coffee leading-[0.95] tracking-tighter">
                 Redefining <br />
                 Corporate <br />
                 <span className="text-olive">Connection.</span>
               </h1>
            </div>
            
            <p className="text-stone text-[19px] font-medium leading-relaxed max-w-lg">
              ODA was founded with a singular focus: to modernize the industrial supply chains of the continent. By leveraging verified identity nodes and transparent data, we empower manufacturers to scale without borders.
            </p>

            <div className="pt-10 border-t border-sand space-y-8">
              <p className="text-[17px] text-coffee/60 font-medium leading-relaxed italic max-w-md">
                "Our mission is to create a frictionless marketplace where quality and verified identity are the standard, not the exception."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sand/30 border border-sand rounded-full flex items-center justify-center font-display font-medium text-coffee">
                  RK
                </div>
                <div>
                  <p className="text-sm font-bold text-coffee uppercase tracking-widest">Ron Kenol</p>
                  <p className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">Founder, ODA Network</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl skew-y-1 relative group">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                alt="Office Studio" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-coffee/10 mix-blend-overlay" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-40">
          {[
            { icon: Target, title: "Our Mission", desc: "To empower African manufacturers and procurement teams through verified digital infrastructure." },
            { icon: Scale, title: "Our Ethics", desc: "Integrity is at the heart of our vetting process. We maintain the highest standards of corporate transparency." },
            { icon: Heart, title: "Our Community", desc: "We are more than a platform; we are a network of professionals dedicated to mutual growth." }
          ].map((val, i) => (
            <div key={i} className="space-y-8">
              <div className="w-12 h-12 bg-sand/30 border border-sand text-coffee rounded-xl flex items-center justify-center">
                <val.icon size={20} strokeWidth={1.5} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-display font-medium text-coffee">{val.title}</h3>
                <p className="text-stone font-medium leading-relaxed">{val.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-32 bg-sand/30 border border-sand rounded-[3rem] space-y-12">
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-medium text-coffee max-w-3xl mx-auto leading-[0.95] tracking-tighter px-6">Ready to join the next generation of verified trade?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="btn-primary px-12 py-5 text-xs font-bold uppercase tracking-[0.3em]">
              Establish Your Profile
            </button>
            <button className="text-xs font-bold text-coffee/40 uppercase tracking-[0.3em] hover:text-coffee transition-colors">
              Explore Network
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
