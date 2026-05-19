import { motion } from 'motion/react';
import { ShieldCheck, Truck, CreditCard, ChevronRight, CheckCircle2, TrendingUp, Package, MapPin, Store, Building2, Wallet, Users, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col pt-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full flex-grow min-h-[75vh] flex flex-col items-center justify-center pt-24 pb-16 -mt-20 overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?auto=format&fit=crop&q=80&w=2000")' }}
        >
          {/* Light overlay to ensure text readability without hiding the picture */}
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/10 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center mt-12">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-display font-bold text-white tracking-tighter leading-none drop-shadow-2xl mb-4"
          >
            ODA
          </motion.h1>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-4xl font-display font-medium text-sand mb-8 max-w-3xl mx-auto"
          >
            One Trusted Marketplace.<br className="hidden md:block" /> Endless Opportunities.
          </motion.h2>

          <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.5 }}
             className="text-lg text-cream/90 max-w-2xl mx-auto font-medium mb-12"
          >
            Connect with verified suppliers across Africa through secure payments and reliable delivery.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-6"
          >
            <Link to="/marketplace" className="btn-primary py-4 px-12 text-sm">
              Enter Marketplace
            </Link>
            <Link to="/signup" className="btn-secondary py-4 px-12 text-sm">
              Apply for Access
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Footer Bar mimicking image bottom */}
      <section className="bg-white border-b border-sand py-6 px-6 relative z-10 w-full">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 md:gap-12 items-center text-coffee">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-olive" size={20} />
            <span className="font-display font-medium text-sm md:text-base">Trusted by Suppliers</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-clay" size={20} />
            <span className="font-display font-medium text-sm md:text-base">Verified Sellers</span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="text-forest" size={20} />
            <span className="font-display font-medium text-sm md:text-base">Reliable Delivery</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-sand"></div>
          <span className="font-display font-semibold text-base md:text-lg text-forest italic tracking-tight">Your Business. Our Priority.</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
