import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle, role = 'buyer' }: { children: React.ReactNode, title: string, subtitle: string, role?: 'buyer' | 'seller' }) {
  const isSeller = role === 'seller';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream selection:bg-olive/20 overflow-x-hidden">
      {/* Mobile Branding (only visible on small screens) */}
      <div className="md:hidden pt-8 px-8 flex justify-center">
        <Link to="/" className="text-3xl font-display font-semibold text-coffee tracking-tighter">
          oda<span className="text-clay not-italic">.</span>
        </Link>
      </div>

      {/* Left Side - Visual */}
      <div className={`hidden md:flex flex-[1.2] p-16 lg:p-24 flex-col justify-between relative overflow-hidden transition-all duration-700 bg-coffee`}>
        {/* Dynamic Real Images */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              <img 
                src={isSeller 
                  ? "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000" 
                  : "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000"
                } 
                alt="Business Hub"
                className="absolute inset-0 w-full h-full object-cover z-0 grayscale brightness-[0.3]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-br from-coffee/40 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-30">
          <Link to="/" className="text-3xl font-display font-bold text-cream tracking-tighter">
            oda<span className="text-olive">.</span>
          </Link>
        </div>

        <div className="relative z-30">
          <motion.div
            key={`content-${role}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-5xl lg:text-7xl font-display font-medium text-cream leading-[1.1] tracking-tighter">
              {isSeller ? (
                <>Scale your <br /><span className="text-olive">enterprise</span>.</>
              ) : (
                <>Source with <br /><span className="text-olive">confidence</span>.</>
              )}
            </h2>
            <p className="text-cream/60 text-lg lg:text-xl max-w-sm font-medium leading-relaxed">
              {isSeller 
                ? "Connect with verified buyers and streamline your industrial distribution."
                : "The gateway for secure B2B procurement across the trade block."
              }
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-cream/50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(70,90,38,0.05),transparent)] pointer-events-none" />
        <div className="w-full max-w-[420px] space-y-12 relative z-10">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-5xl font-display font-medium text-coffee tracking-tighter">{title}</h1>
              <p className="text-[15px] text-stone font-medium leading-relaxed">{subtitle}</p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
