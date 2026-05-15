import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion } from 'motion/react';
import { ShieldCheck, FileText, Lock, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden selection:bg-olive/20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 pt-40 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-display font-medium text-coffee tracking-tighter leading-[0.95]">Terms and Conditions</h1>
            <p className="text-stone/40 font-bold uppercase tracking-[0.3em] text-[10px]">Effective as of May 15, 2026</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
            {[
              { icon: ShieldCheck, title: "Data Protection", desc: "Your corporate data is encrypted and handled with enterprise-grade security." },
              { icon: Lock, title: "Secure Access", desc: "Only verified business entities are permitted to engage in the ODA network." },
              { icon: FileText, title: "Compliance", desc: "All transactions must adhere to local and international trade regulations." },
              { icon: Scale, title: "Fair Use", desc: "Transparent bidding and procurement processes are mandated for all members." }
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-10 h-10 bg-sand/30 border border-sand rounded-lg flex items-center justify-center text-coffee/40 shrink-0">
                  <item.icon size={16} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-coffee text-sm uppercase tracking-widest">{item.title}</h3>
                  <p className="text-[13px] text-stone leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-16 text-coffee/80 font-medium leading-relaxed">
            <section className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-coffee pb-4 border-b border-sand">1. Introduction</h2>
              <p className="text-[15px]">
                Welcome to ODA. These Terms and Conditions govern your use of our platform and services. By accessing or using our marketplace, you agree to be bound by these terms. ODA is an enterprise B2B platform connecting verified suppliers with professional buyers.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-coffee pb-4 border-b border-sand">2. User Verification</h2>
              <p className="text-[15px]">
                To maintain the integrity of our network, all users must undergo a verification process. We reserve the right to request legal business documentation, tax information, and corporate credentials. Providing false information is grounds for immediate account termination.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-coffee pb-4 border-b border-sand">3. Marketplace Conduct</h2>
              <p className="text-[15px]">
                Users agree to interact in a professional manner. This includes providing accurate product descriptions, honoring procurement commitments, and maintaining transparent communication. Any attempt to circumvent platform security or engage in fraudulent activity will result in legal action.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-coffee pb-4 border-b border-sand">4. Liability</h2>
              <p className="text-[15px]">
                While ODA verifies partners, users are responsible for their own due diligence in commercial contracts. ODA acts as a facilitator and platform provider, and is not liable for disputes arising directly from trade agreements between verified parties, though we provide mediation tools.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-coffee pb-4 border-b border-sand">5. Privacy and Security</h2>
              <p className="text-[15px]">
                We value your privacy. Please review our Privacy Policy for details on how we collect and use your data. ODA employs advanced encryption to protect your corporate communications and financial transactions.
              </p>
            </section>
          </div>

          <div className="pt-16 border-t border-sand flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-xs text-stone/60 font-bold uppercase tracking-widest">legal@oda.co.ke</p>
            <button className="text-[10px] font-bold text-coffee uppercase tracking-widest border-b border-coffee/20 pb-1 hover:border-coffee transition-all">
              Download Node PDF
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
