import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  Package, 
  Plus, 
  MessageSquare, 
  Users, 
  Settings, 
  ExternalLink,
  ShoppingBag,
  Bell,
  Search,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function SellerDashboard() {
  const { profile, user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSellerData();
  }, [user]);

  const fetchSellerData = async () => {
    setLoading(true);
    // Fetch company
    const { data: compData } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user?.id)
      .single();
    
    if (compData) {
      setCompany(compData);
      
      // Fetch products
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', compData.id);
      if (prodData) setProducts(prodData);

      // Fetch inquiries
      const { data: inqData } = await supabase
        .from('inquiries')
        .select('*, profiles(full_name, email)')
        .eq('product_id', prodData?.[0]?.id); // Simplification for MVP
      if (inqData) setInquiries(inqData);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="h-10 w-64 bg-white rounded-xl" />
        <div className="h-10 w-40 bg-white rounded-xl" />
      </div>
      <div className="h-96 bg-white rounded-3xl" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-sand/50 pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-medium text-coffee tracking-tighter">Seller Hub</h1>
          <p className="text-[15px] text-stone font-medium">Verified industrial supply chain node.</p>
        </div>
        <div className="flex gap-4">
          <button className="text-xs font-bold text-coffee uppercase tracking-[0.2em] px-6 py-3 bg-white border border-sand rounded-xl hover:bg-sand/10 transition-all shadow-sm">
             Market Data
          </button>
          <button className="btn-primary text-xs font-bold uppercase tracking-[0.2em] px-6 py-3 flex items-center justify-center gap-2">
            <Plus size={14} /> New Listing
          </button>
        </div>
      </div>

      {!company ? (
        <div className="py-32 px-12 text-center bg-coffee rounded-[2rem] text-cream relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-10">
            <div className="w-12 h-12 bg-olive rounded-full flex items-center justify-center mx-auto text-cream">
              <Building2 size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-5xl font-display font-medium leading-[1.1] tracking-tighter">Initialize Your <br />Digital Storefront</h2>
            <p className="text-cream/60 text-lg font-medium leading-relaxed">
              Verify your industrial node to start reaching certified buyers across the trade block.
            </p>
            <button className="bg-white text-coffee px-12 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-cream transition-all shadow-xl">
              Start Onboarding
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          <div className="lg:col-span-2 space-y-16">
            {/* Inventory Management */}
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-sand/50">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-coffee uppercase tracking-[0.3em]">Inventory Core</h3>
                  <p className="text-[10px] text-stone/40 uppercase font-black tracking-widest">Active Marketplace Node</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-coffee/40 uppercase tracking-widest">
                  Items: {products.length}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1">
                {products.length > 0 ? products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 px-0 hover:bg-sand/10 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-sand/20 border border-sand/50">
                        <img 
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-lg font-display font-medium text-coffee">{product.name}</h4>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="status-dot bg-olive" />
                            <span className="text-[10px] font-bold text-olive uppercase tracking-widest">Live</span>
                          </div>
                          <span className="text-[10px] font-bold text-stone/30 uppercase tracking-widest">REF: {product.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 text-stone/40 hover:text-coffee transition-colors">
                        <Settings size={16} strokeWidth={1.5} />
                      </button>
                      <button className="p-2.5 text-stone/40 hover:text-coffee transition-colors">
                        <ExternalLink size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-12 h-12 bg-sand/30 rounded-full flex items-center justify-center mx-auto text-stone/20">
                      <Package size={24} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-stone/60 font-medium">No active listings.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inquiry Queue */}
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-sand/50">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-coffee uppercase tracking-[0.3em]">Communication Stream</h3>
                  <p className="text-[10px] text-stone/40 uppercase font-black tracking-widest">Trade Inquiry Management</p>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-coffee/40 hover:text-coffee transition-colors">Unified Inbox</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left">
                    <tr>
                      <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40">Purchasing Entity</th>
                      <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40">Reference Node</th>
                      <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40">Protocol</th>
                      <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/30">
                    {inquiries.map((inq, i) => (
                      <tr key={i} className="hover:bg-sand/10 transition-colors group">
                        <td className="py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-sand/30 border border-sand/50 flex items-center justify-center text-[11px] font-bold text-coffee uppercase">
                              {inq.profiles?.full_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-coffee">{inq.profiles?.full_name}</p>
                              <p className="text-[11px] text-stone/40 font-medium tracking-tight">{inq.profiles?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6">
                          <span className="text-[10px] font-bold text-coffee/60 uppercase tracking-widest">ODA-INF-0{i+1}</span>
                        </td>
                        <td className="py-6">
                          <div className="flex items-center gap-2">
                             <span className={`status-dot ${inq.status === 'pending' ? 'bg-orange-400' : 'bg-olive'}`} />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-stone/60">{inq.status}</span>
                          </div>
                        </td>
                        <td className="py-6 text-right">
                          <button className="text-[10px] font-bold uppercase tracking-widest text-coffee/60 border border-sand px-4 py-2 rounded-lg hover:bg-coffee hover:text-white hover:border-coffee transition-all">Resolve</button>
                        </td>
                      </tr>
                    ))}
                    {inquiries.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                           <div className="w-10 h-10 bg-sand/30 rounded-full flex items-center justify-center mx-auto mb-4 text-stone/20">
                             <MessageSquare size={20} strokeWidth={1.5} />
                           </div>
                           <p className="text-sm text-stone/40 italic">Stream clear. No pending inquiries.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-16">
            {/* Company Card - Premium UI */}
            <div className="space-y-10">
              <div className="pb-4 border-b border-sand">
                 <h3 className="text-xs font-bold text-coffee uppercase tracking-[0.3em]">Corporate Profile</h3>
              </div>
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-24 h-24 rounded-2xl bg-coffee flex items-center justify-center text-cream text-4xl font-display font-medium overflow-hidden shadow-2xl shadow-coffee/10">
                  {company.logo_url ? <img src={company.logo_url} className="w-full h-full object-cover" /> : company.name.charAt(0)}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-medium text-coffee flex items-center justify-center gap-2">
                    {company.name} {company.verified && <ShieldCheck size={18} className="text-olive" strokeWidth={1.5} />}
                  </h3>
                  <p className="text-[11px] text-stone/50 font-bold uppercase tracking-[0.3em]">{company.industry || 'Verified Node'}</p>
                </div>
                
                <div className="grid grid-cols-2 w-full gap-8 py-8 border-y border-sand">
                  <div>
                    <p className="text-2xl font-display font-semibold text-coffee">1.2k</p>
                    <p className="text-[10px] font-bold uppercase text-stone/30 tracking-widest mt-1">Node Reach</p>
                  </div>
                  <div className="border-l border-sand">
                    <p className="text-2xl font-display font-semibold text-coffee">4.8</p>
                    <p className="text-[10px] font-bold uppercase text-stone/30 tracking-widest mt-1">Trust Score</p>
                  </div>
                </div>

                <Link to="#" className="w-full py-4 text-xs font-bold text-coffee uppercase tracking-[0.3em] bg-sand/30 rounded-xl hover:bg-sand/30 transition-all">
                  Profile Management
                </Link>
              </div>
            </div>

            {/* Seller Insights */}
            <div className="space-y-8">
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-coffee pb-4 border-b border-sand">
                Node Analysis
              </h4>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="status-dot bg-clay mt-1" />
                  <div className="space-y-1">
                    <p className="text-[13px] leading-relaxed text-coffee font-medium">Infrastructure optimization recommended.</p>
                    <p className="text-[11px] text-stone/40 uppercase font-black tracking-widest">3h ago</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="status-dot bg-olive mt-1" />
                  <div className="space-y-1">
                    <p className="text-[13px] leading-relaxed text-coffee font-medium">Compliance verification active. Node status: Verified.</p>
                    <p className="text-[11px] text-stone/40 uppercase font-black tracking-widest">12h ago</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-4 text-xs font-bold text-coffee uppercase tracking-[0.3em] border border-sand rounded-xl hover:bg-coffee hover:text-white hover:border-coffee transition-all">
                Full Metrics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
