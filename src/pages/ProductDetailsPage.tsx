import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  MessageSquare, 
  Share2, 
  Heart, 
  CheckCircle2,
  Globe,
  Mail,
  Send,
  Loader2,
  Star,
  Info,
  Calendar,
  Box,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProductDetails();

    const newChannel = supabase
      .channel('product-details-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `id=eq.${id}` },
        (payload) => {
          fetchProductDetails(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, companies(*, profiles(*)), categories(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching product details:", error);
    }
    
    if (data) {
        setProduct(data);
    }
    setLoading(false);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    
    setInquiryLoading(true);
    setInquiryError(null);
    const { error } = await supabase.from('inquiries').insert({
      buyer_id: user.id,
      product_id: product.id,
      seller_id: product.companies?.owner_id,
      message: inquiryMessage,
      status: 'pending',
      subject: `Quotation Request for ${product.name}`
    });

    if (!error) {
      setInquirySent(true);
      setInquiryMessage('');
      
      // Send email notification via our backend
      try {
        // Send email to buyer
        const emailRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email, // Sending confirmation to the buyer
            subject: `Inquiry Sent: ${product.name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2>Inquiry Confirmation</h2>
                <p>Hello ${user.user_metadata?.full_name || 'Buyer'},</p>
                <p>Your inquiry for <strong>${product.name}</strong> has been successfully sent to the seller.</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Your Message:</strong></p>
                  <p style="white-space: pre-wrap;">${inquiryMessage}</p>
                </div>
                <p>The seller will review your request and get back to you soon.</p>
                <br/>
                <p>Best regards,<br/>B2B Node Team</p>
              </div>
            `
          })
        });
        
        const emailData = await emailRes.json();
        if (!emailRes.ok) {
          throw new Error(emailData.error || 'Failed to send buyer email');
        }

        // Send email to seller
        const sellerEmail = product.companies?.profiles?.email;
        if (sellerEmail) {
          const sellerRes = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: sellerEmail,
              subject: `New Inquiry Received: ${product.name}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                  <h2>New Inquiry</h2>
                  <p>Hello ${product.companies?.profiles?.full_name || 'Seller'},</p>
                  <p>You have received a new inquiry for your product <strong>${product.name}</strong> from <strong>${user.user_metadata?.full_name || 'a buyer'}</strong>.</p>
                  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Buyer's Message:</strong></p>
                    <p style="white-space: pre-wrap;">${inquiryMessage}</p>
                  </div>
                  <p>Please log in to your Seller Dashboard to view and respond to this inquiry.</p>
                  <br/>
                  <p>Best regards,<br/>B2B Node Team</p>
                </div>
              `
            })
          });

          if (!sellerRes.ok) {
            console.error("Failed to send seller email.");
          }
        }
        console.log("Emails sent successfully.");
      } catch (emailErr: any) {
        console.error("Failed to send notification email:", emailErr);
        alert(`Inquiry saved, but failed to send email notification: ${emailErr.message}`);
      }
    } else {
      console.error(error);
      setInquiryError('Error sending inquiry: ' + error.message);
    }
    setInquiryLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cream gap-4">
      <Loader2 className="animate-spin text-olive" size={40} />
      <p className="text-sm font-bold uppercase tracking-widest text-coffee/40">Syncing with Node...</p>
    </div>
  );
  
  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cream p-8 text-center">
      <div className="w-20 h-20 bg-clay/10 text-clay rounded-full flex items-center justify-center mb-6">
        <Info size={40} />
      </div>
      <h1 className="text-3xl font-display font-semibold text-coffee mb-4">Product Not Found</h1>
      <p className="text-stone mb-8 max-w-sm">The item you're looking for might have been removed or moved to a different sector.</p>
      <Link to="/marketplace" className="btn-primary px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">Return to Market</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream pb-20 overflow-x-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-28 md:pt-40">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-stone/40 mb-10 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
          <Link to="/marketplace" className="hover:text-olive transition-colors shrink-0">Marketplace</Link>
          <ChevronRight size={10} className="shrink-0" />
          <span className="hover:text-olive cursor-pointer shrink-0">{product.categories?.name}</span>
          <ChevronRight size={10} className="shrink-0" />
          <span className="text-coffee/60 truncate shrink-0 max-w-[150px] md:max-w-none">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-start">
          {/* Left Side: Images & Logistics */}
          <div className="lg:col-span-7 space-y-12 md:space-y-20">
            <div className="space-y-6 md:space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl overflow-hidden border border-sand bg-sand/20 aspect-[4/3] md:aspect-square group relative"
              >
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={product.images?.[activeImage] || `https://images.unsplash.com/photo-1596487649116-be83a5cd9621?auto=format&fit=crop&q=80&w=1200&sig=${product.id}`} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <button className="absolute top-6 right-6 p-3 bg-white border border-sand rounded-full shadow-sm text-coffee hover:bg-coffee hover:text-white transition-all active:scale-95">
                  <Heart size={18} className="transition-colors" />
                </button>
              </motion.div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {[0, 1, 2, 3].map(i => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square w-20 md:w-24 rounded-lg overflow-hidden border transition-all flex-shrink-0 snap-center ${activeImage === i ? 'border-coffee shadow-sm' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <img 
                      src={`https://images.unsplash.com/photo-1596487649116-be83a5cd9621?auto=format&fit=crop&q=80&w=400&sig=${i + 13}`} 
                      className="w-full h-full object-cover" 
                      alt="Product preview"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:block space-y-10">
              <h3 className="text-sm font-bold text-coffee uppercase tracking-[0.3em] pb-6 border-b border-sand/50">Logistics & Protocol</h3>
              <div className="grid grid-cols-2 gap-16 text-sm">
                <div className="space-y-6">
                  <div className="flex flex-col gap-1 border-b border-sand/30 pb-6">
                    <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">Min. Order (MOQ)</span> 
                    <span className="text-xl font-display font-medium text-coffee">100 - 500 Units</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">Lead Time</span> 
                    <span className="text-xl font-display font-medium text-coffee">15 - 30 Days</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex flex-col gap-1 border-b border-sand/30 pb-6">
                    <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">Supply Capacity</span> 
                    <span className="text-xl font-display font-medium text-coffee">5k Units / Mo</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">Verification Node</span> 
                    <div className="flex items-center gap-2 pt-1">
                      <span className="status-dot bg-olive" />
                      <span className="text-xs font-bold text-olive uppercase tracking-[0.1em]">ODA Certified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Details & Inquiry */}
          <div className="lg:col-span-5 space-y-12 md:space-y-16">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-white/50 border border-sand text-coffee text-[10px] font-bold uppercase tracking-widest rounded-full">{product.categories?.name}</span>
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-coffee/40 border border-sand px-3 py-1 rounded-full">Global Active</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-medium text-coffee leading-[1.05] tracking-tighter">{product.name}</h1>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-orange-400">
                    {[1, 2, 3, 4].map(i => <Star key={i} className="fill-orange-400" size={12} />)}
                    <Star className="text-orange-200" size={12} />
                  </div>
                  <span className="text-[11px] font-bold text-coffee uppercase tracking-widest">4.8 Market Rating</span>
                </div>
                <p className="text-[28px] md:text-[32px] font-display font-medium text-olive tracking-tight">KSh {parseFloat(product.price_range || 0).toLocaleString()} <span className="text-xs font-bold text-stone/40 uppercase tracking-[0.2em] ml-2">per unit</span></p>
              </div>
            </div>

            <div className="space-y-6 pt-12 border-t border-sand/50">
              <h3 className="text-xs font-bold text-coffee uppercase tracking-[0.3em]">Technical Narrative</h3>
              <p className="text-[17px] text-stone leading-relaxed font-medium">
                {product.description || 'Verified industrial grade infrastructure optimized for high-capacity output and enterprise durability. Rigorously tested for geological and climatic resilience across the trade block.'}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-6">
                {[
                  { icon: ShieldCheck, label: 'Quality Verified' },
                  { icon: Calendar, label: 'Full Warranty' },
                  { icon: Box, label: 'In Stock' },
                  { icon: Globe, label: 'Global Export' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon size={14} className="text-olive" />
                    <span className="text-[11px] font-bold text-coffee/60 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Profile */}
            <div className="pt-12 border-t border-sand/50 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-coffee flex items-center justify-center text-xl font-display font-medium text-cream overflow-hidden">
                  {product.companies?.logo_url ? <img src={product.companies.logo_url} className="w-full h-full object-cover" /> : product.companies?.name?.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-display font-medium text-coffee flex items-center gap-2">
                    {product.companies?.name} {product.companies?.verified && <ShieldCheck size={16} className="text-olive" strokeWidth={1.5} />}
                  </h4>
                  <p className="text-[10px] text-stone/40 font-bold uppercase tracking-widest">{product.companies?.industry || 'Industrial Hub'}</p>
                </div>
              </div>
              <button className="text-[10px] font-bold text-coffee uppercase tracking-[0.2em] border-b border-sand pb-1 hover:border-coffee transition-all">Node Info</button>
            </div>

            {/* Inquiry Hub */}
            <div className="pt-16">
              <div className="space-y-10">
                <div className="pb-4 border-b border-sand/50">
                  <h3 className="text-xs font-bold text-coffee uppercase tracking-[0.3em]">Direct Quotation Request</h3>
                </div>
                
                {inquirySent ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-12 px-8 bg-sand/10 rounded-2xl text-center space-y-6 border border-sand"
                  >
                    <div className="w-12 h-12 bg-olive text-cream rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={24} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-display font-medium text-olive">Request Dispatched</h4>
                      <p className="text-sm text-olive/60 font-medium">Your inquiry has been routed to the vendor for prioritization.</p>
                    </div>
                    <div className="space-y-4">
                      <button onClick={() => setInquirySent(false)} className="text-[10px] font-bold text-stone/40 uppercase tracking-widest hover:text-olive transition-colors block mx-auto mb-2">Initialize New Flow</button>
                      <Link to="/buyer" className="btn-primary w-full max-w-[200px] py-4 text-[10px] font-bold uppercase tracking-widest inline-block border border-olive shadow-md hover:shadow-lg transition-all active:scale-95 text-[#fdfbfe]">
                        Go To Dashboard
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSendInquiry} className="space-y-8">
                    {inquiryError && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                        {inquiryError}
                      </div>
                    )}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone/40 ml-1">Specifications & Context</label>
                      <textarea 
                        required
                        placeholder="Detail your required volume, delivery timeline, and technical modifications..."
                        className="input-field p-6 min-h-[160px]"
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        type="submit" 
                        disabled={inquiryLoading}
                        className={`btn-primary flex-1 py-4 text-xs font-bold uppercase tracking-[0.3em] transition-all duration-200 active:scale-95 ${inquiryLoading ? 'opacity-70 cursor-not-allowed text-white/50' : ''}`}
                      >
                        {inquiryLoading ? 'Dispatching...' : 'Send Inquiry Request'}
                      </button>
                      <button type="button" className="btn-outline flex-1 py-4 text-xs font-bold uppercase tracking-[0.3em]">
                        Channel Support
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
