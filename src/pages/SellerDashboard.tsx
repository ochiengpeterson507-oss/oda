import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_CATEGORIES } from '../lib/mockData';
import { RealtimeChannel } from '@supabase/supabase-js';
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
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export default function SellerDashboard() {
  const { profile, user, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '' });
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category_id: '', new_category_name: '', image_url: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchSellerData();
    fetchCategories();

    const newChannel = supabase
      .channel(`seller-db-changes-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        (payload) => {
          console.log('Realtime inquiry update:', payload);
          fetchSellerData(true); 
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          fetchSellerData(true); 
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      if (newChannel) supabase.removeChannel(newChannel);
    };
  }, [user, authLoading]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data && data.length > 0) {
      setCategories(data);
    } else {
      setCategories(MOCK_CATEGORIES);
    }
  };

  const fetchSellerData = async (isRealtimeUpdate = false) => {
    try {
      if (!isRealtimeUpdate) setLoading(true);
      // Fetch company
      const { data: compData, error: compError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user!.id)
        .single();
      
      if (compData) {
        setCompany(compData);
        
        // Fetch products
        const { data: prodData } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('company_id', compData.id);
          
        if (prodData) {
          setProducts(prodData);
          
          if (prodData.length > 0) {
            const productIds = prodData.map((p: any) => p.id);
            const { data: inqData } = await supabase
              .from('inquiries')
              .select('*, profiles(full_name, email), products(name, price_range)')
              .in('product_id', productIds)
              .order('created_at', { ascending: false });
            if (inqData) setInquiries(inqData);
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (!isRealtimeUpdate) setLoading(false);
    }
  };

  const handleResolveInquiry = async (inquiryId: string) => {
    setResolvingId(inquiryId);
    const { error } = await supabase
      .from('inquiries')
      .update({ status: 'resolved' })
      .eq('id', inquiryId);

    if (!error) {
      await fetchSellerData(true);
    }
    setResolvingId(null);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { data, error } = await supabase.from('companies').insert({
      owner_id: user.id,
      name: newCompany.name,
      industry: newCompany.industry,
      verified: false
    }).select().single();
    
    if (error) {
      console.error('Error creating company:', error);
      setErrorMsg('Error initializing storefront: ' + error.message);
    } else if (data) {
      setCompany(data);
      setShowCompanyModal(false);
      setErrorMsg('');
    }
    setSubmitting(false);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSubmitting(true);
    
    let finalCategoryId = newProduct.category_id || (categories.length > 0 ? categories[0].id : null);
    
    // If it's a mock category UUID, we need to create it in the database first to avoid foreign key errors
    const mockCategory = MOCK_CATEGORIES.find(c => c.id === finalCategoryId);
    if (mockCategory) {
      const { data: newCat } = await supabase.from('categories').insert({
        name: mockCategory.name,
        slug: mockCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }).select().single();
      
      if (newCat) {
        finalCategoryId = newCat.id;
        // update local list
        setCategories([...categories.filter(c => !MOCK_CATEGORIES.map(m => m.id).includes(c.id)), newCat]);
      } else {
        finalCategoryId = null; // fallback to null if insert fails
      }
    } else if (newProduct.category_id === 'new' && newProduct.new_category_name) {
      const { data: newCat } = await supabase.from('categories').insert({
        name: newProduct.new_category_name,
        slug: newProduct.new_category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }).select().single();
      
      if (newCat) {
        finalCategoryId = newCat.id;
        setCategories([...categories, newCat]);
      }
    }

    const { error } = await supabase.from('products').insert({
      company_id: company.id,
      name: newProduct.name,
      description: newProduct.description,
      price_range: newProduct.price.toString(),
      category_id: finalCategoryId,
      images: [newProduct.image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200']
    });
    
    if (error) {
      console.error('Error inserting product:', error);
      setErrorMsg('Error publishing listing: ' + error.message);
    } else {
      setNewProduct({ name: '', description: '', price: '', category_id: '', new_category_name: '', image_url: '' });
      setShowProductModal(false);
      setErrorMsg('');
      fetchSellerData(true);
    }
    setSubmitting(false);
  };

  if (loading || authLoading) return (
    <div className="space-y-12 pb-20 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-sand/50 pb-10">
        <div className="space-y-4">
          <div className="h-10 w-64 bg-sand/30 rounded-xl" />
          <div className="h-4 w-40 bg-sand/30 rounded-lg" />
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-32 bg-sand/30 rounded-xl" />
          <div className="h-12 w-32 bg-sand/30 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-40 bg-sand/20 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
        <div className="lg:col-span-2 space-y-16">
          <div className="h-96 bg-sand/20 rounded-3xl" />
          <div className="h-96 bg-sand/20 rounded-3xl" />
        </div>
        <div className="h-[600px] bg-sand/20 rounded-3xl" />
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-sand/50 pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-medium text-coffee tracking-tighter">Seller Hub</h1>
          <p className="text-[15px] text-stone font-medium">Verified industrial supply chain node.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-secondary px-6 py-3 text-xs uppercase tracking-[0.2em] shadow-sm">
             Market Data
          </button>
          <button className="btn-primary text-xs uppercase tracking-[0.2em] px-6 py-3 flex items-center justify-center gap-2" onClick={() => { setErrorMsg(''); setShowProductModal(true); }}>
            <Plus size={14} /> New Listing
          </button>
        </div>
      </div>

      {company && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center text-olive">
                 <Package size={20} strokeWidth={1.5} />
              </div>
            </div>
            <div>
               <p className="text-3xl font-display font-semibold text-coffee">{products.length}</p>
               <p className="text-[11px] font-bold text-stone/40 uppercase tracking-widest mt-1">Active Listings</p>
            </div>
          </div>
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest">
                 <MessageSquare size={20} strokeWidth={1.5} />
              </div>
              {inquiries.filter(i => i.status === 'pending').length > 0 && (
                <span className="text-[10px] font-bold text-forest uppercase tracking-widest bg-forest/10 px-2 py-1 rounded-full">
                  {inquiries.filter(i => i.status === 'pending').length} New
                </span>
              )}
            </div>
            <div>
               <p className="text-3xl font-display font-semibold text-coffee">{inquiries.length}</p>
               <p className="text-[11px] font-bold text-stone/40 uppercase tracking-widest mt-1">Total Inquiries</p>
            </div>
          </div>
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-clay/10 flex items-center justify-center text-clay">
                 <ShoppingBag size={20} strokeWidth={1.5} />
              </div>
            </div>
            <div>
               <p className="text-3xl font-display font-semibold text-coffee">
                 {inquiries.filter(i => i.status === 'resolved').length}
               </p>
               <p className="text-[11px] font-bold text-stone/40 uppercase tracking-widest mt-1">Orders Processed</p>
            </div>
          </div>
           <div className="card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-coffee/10 flex items-center justify-center text-coffee">
                 <TrendingUp size={20} strokeWidth={1.5} />
              </div>
            </div>
            <div>
               <p className="text-3xl font-display font-semibold text-coffee">
                 KES {inquiries.filter(i => i.status === 'resolved').reduce((acc, inq) => acc + (parseFloat(inq.products?.price_range) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </p>
               <p className="text-[11px] font-bold text-stone/40 uppercase tracking-widest mt-1">Revenue YTD</p>
            </div>
          </div>
        </div>
      )}

      {!company ? (
        <div className="py-24 px-6 md:px-12 text-center bg-white border border-sand rounded-[2rem] relative overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="w-16 h-16 bg-sand/30 border border-sand rounded-2xl flex items-center justify-center mx-auto text-coffee">
              <Building2 size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-medium leading-[1.1] text-coffee tracking-tighter">Initialize Your <br />Digital Storefront</h2>
            <p className="text-stone font-medium leading-relaxed max-w-lg mx-auto">
              Verify your industrial node to start reaching certified buyers across the trade block. Get your profile in front of professional procurement teams globally.
            </p>
            <button className="btn-primary px-12 py-4 text-xs uppercase tracking-widest mx-auto block mt-4" onClick={() => { setErrorMsg(''); setShowCompanyModal(true); }}>
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

              <div className="grid grid-cols-1 gap-4">
                {products.length > 0 ? products.map((product) => (
                  <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-sand rounded-xl hover:shadow-md transition-all group gap-4">
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-sand/20 border border-sand/50 shrink-0">
                        <img 
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <h4 className="text-base sm:text-lg font-display font-medium text-coffee truncate">{product.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="status-dot bg-olive" />
                            <span className="text-[10px] font-bold text-olive uppercase tracking-widest">Live</span>
                          </div>
                          <span className="text-[10px] font-bold text-stone/30 uppercase tracking-widest">REF: {product.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end w-full sm:w-auto gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity border-t border-sand/50 sm:border-0 pt-3 sm:pt-0">
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
              
                <div className="bg-white border border-sand rounded-xl shadow-sm overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto min-w-full">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-sand/10 border-b border-sand/50">
                        <tr>
                          <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-stone/60">Purchasing Entity</th>
                          <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-stone/60">Reference Node</th>
                          <th className="py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-stone/60">Protocol</th>
                          <th className="py-4 px-6 text-right text-[11px] font-bold uppercase tracking-widest text-stone/60">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand/30">
                        {inquiries.map((inq, i) => (
                          <tr key={i} className="hover:bg-sand/5 transition-colors group">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-sand/30 border border-sand/50 flex items-center justify-center text-[11px] font-bold text-coffee uppercase shrink-0">
                                  {inq.profiles?.full_name?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-coffee truncate">{inq.profiles?.full_name || 'Anonymous Buyer'}</p>
                                  <p className="text-[11px] text-stone/50 font-medium tracking-tight truncate">{inq.profiles?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 max-w-[200px]">
                              <div className="flex flex-col gap-1">
                                <span className="text-[12px] font-bold text-coffee uppercase tracking-wider truncate">{inq.products?.name}</span>
                                <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">REF: {inq.id?.slice(0, 8).toUpperCase() || `ODA-INF-0${i+1}`}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                 <span className={`status-dot ${inq.status === 'pending' ? 'bg-orange-400' : 'bg-olive'}`} />
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-stone/60">{inq.status || 'Pending'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              {inq.status === 'pending' ? (
                                <button disabled={resolvingId === inq.id} onClick={() => handleResolveInquiry(inq.id)} className={`btn-outline px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${resolvingId === inq.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-coffee hover:text-white hover:border-coffee active:scale-95'}`}>{resolvingId === inq.id ? 'Resolving...' : 'Resolve'}</button>
                              ) : (
                                <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">Resolved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {inquiries.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-16 text-center">
                               <div className="w-12 h-12 bg-sand/20 rounded-full flex items-center justify-center mx-auto mb-4 text-stone/30">
                                 <MessageSquare size={20} strokeWidth={1.5} />
                               </div>
                               <p className="text-sm font-medium text-stone/60">Stream clear.</p>
                               <p className="text-xs text-stone/40 mt-1">No pending inquiries at this moment.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-sand/30">
                    {inquiries.map((inq, i) => (
                      <div key={i} className="p-4 space-y-4 hover:bg-sand/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-sand/30 border border-sand/50 flex items-center justify-center text-[10px] font-bold text-coffee uppercase shrink-0">
                              {inq.profiles?.full_name?.charAt(0) || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-coffee truncate">{inq.profiles?.full_name || 'Anonymous Buyer'}</p>
                              <p className="text-[10px] text-stone/50 font-medium tracking-tight truncate">{inq.profiles?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`status-dot ${inq.status === 'pending' ? 'bg-orange-400' : 'bg-olive'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone/60">{inq.status || 'Pending'}</span>
                          </div>
                        </div>
                        <div className="bg-sand/10 rounded-lg p-3">
                          <p className="text-[11px] font-bold text-coffee uppercase tracking-wider mb-1 line-clamp-1">{inq.products?.name}</p>
                          <p className="text-[10px] text-stone/60 truncate">{inq.message || 'No additional notes provided.'}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                           <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">REF: {inq.id?.slice(0, 8).toUpperCase() || `ODA-INF-0${i+1}`}</span>
                           {inq.status === 'pending' ? (
                             <button disabled={resolvingId === inq.id} onClick={() => handleResolveInquiry(inq.id)} className={`btn-outline px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${resolvingId === inq.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-coffee hover:text-white hover:border-coffee active:scale-95'}`}>{resolvingId === inq.id ? 'Wait...' : 'Resolve'}</button>
                           ) : (
                             <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">Resolved</span>
                           )}
                        </div>
                      </div>
                    ))}
                    {inquiries.length === 0 && (
                      <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-sand/20 rounded-full flex items-center justify-center mx-auto mb-4 text-stone/30">
                          <MessageSquare size={20} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium text-stone/60">Stream clear.</p>
                        <p className="text-xs text-stone/40 mt-1">No pending inquiries at this moment.</p>
                      </div>
                    )}
                  </div>
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
                    <p className="text-2xl font-display font-semibold text-coffee">{products.length}</p>
                    <p className="text-[10px] font-bold uppercase text-stone/30 tracking-widest mt-1">Active Nodes</p>
                  </div>
                  <div className="border-l border-sand">
                    <p className="text-2xl font-display font-semibold text-coffee">{inquiries.filter(i => i.status === 'pending').length}</p>
                    <p className="text-[10px] font-bold uppercase text-stone/30 tracking-widest mt-1">Pending Deals</p>
                  </div>
                </div>

                <Link to="#" className="btn-outline w-full py-4 text-xs font-bold uppercase tracking-[0.3em] bg-sand/30 hover:bg-sand/40 border-none flex items-center justify-center">
                  Profile Management
                </Link>
              </div>
            </div>

            {/* Seller Insights */}
            <div className="space-y-8">
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-coffee pb-4 border-b border-sand">
                Node Activity
              </h4>
              <div className="space-y-8">
                {inquiries.slice(0, 3).map((inq, i) => (
                  <div key={`activity-${inq.id}`} className="flex gap-4">
                    <div className={`status-dot mt-1 ${inq.status === 'pending' ? 'bg-orange-400' : 'bg-olive'}`} />
                    <div className="space-y-1">
                      <p className="text-[13px] leading-relaxed text-coffee font-medium">
                        {inq.status === 'pending' ? 'New deal request initiated by' : 'Transaction resolved with'} {inq.profiles?.full_name || 'an entity'} for {inq.products?.name}.
                      </p>
                      <p className="text-[11px] text-stone/40 uppercase font-black tracking-widest">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {inquiries.length === 0 && (
                  <p className="text-[13px] text-stone/60">No recent activity on your trade node yet.</p>
                )}
              </div>
              <button className="btn-outline w-full py-4 text-xs uppercase tracking-[0.3em] flex items-center justify-center">
                Full Metrics
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-sand shadow-2xl relative">
            <button onClick={() => setShowCompanyModal(false)} className="absolute top-6 right-6 text-stone hover:text-coffee">
              <span className="sr-only">Close</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="text-2xl font-display font-medium text-coffee mb-6">Initialize Storefront</h2>
            {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{errorMsg}</div>}
            <form onSubmit={handleCreateCompany} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Company Name</label>
                <input 
                  type="text" 
                  required
                  className="input-field w-full px-4 py-3 text-sm"
                  value={newCompany.name}
                  onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Industry / Sector</label>
                <input 
                  type="text" 
                  required
                  className="input-field w-full px-4 py-3 text-sm"
                  value={newCompany.industry}
                  onChange={e => setNewCompany({...newCompany, industry: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? 'Initializing...' : 'Create Storefront'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-sand shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowProductModal(false)} className="absolute top-6 right-6 text-stone hover:text-coffee">
              <span className="sr-only">Close</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="text-2xl font-display font-medium text-coffee mb-6">New Product Listing</h2>
            {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{errorMsg}</div>}
            <form onSubmit={handleCreateProduct} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Product Name</label>
                <input 
                  type="text" 
                  required
                  className="input-field w-full px-4 py-3 text-sm"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Description</label>
                <textarea 
                  required
                  className="input-field w-full px-4 py-3 text-sm h-32 resize-none"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Category</label>
                <select
                  required
                  className="input-field w-full px-4 py-3 text-sm mb-2"
                  value={newProduct.category_id}
                  onChange={e => setNewProduct({...newProduct, category_id: e.target.value})}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  <option value="new">+ Add New Category</option>
                </select>
                {newProduct.category_id === 'new' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter new category name"
                    className="input-field w-full px-4 py-3 text-sm mt-2"
                    value={newProduct.new_category_name}
                    onChange={e => setNewProduct({...newProduct, new_category_name: e.target.value})}
                  />
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Base Price (KES)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    className="input-field w-full px-4 py-3 text-sm"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Product Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/image.jpg"
                  className="input-field w-full px-4 py-3 text-sm"
                  value={newProduct.image_url}
                  onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? 'Publishing...' : 'Publish Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
