import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Greeting } from '../components/Greeting';
import InquiryChat from '../components/chat/InquiryChat';
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
  TrendingUp,
  X,
  Trash2
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
  const [activeChatInquiry, setActiveChatInquiry] = useState<any>(null);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '' });
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', unit: '', category_id: '', new_category_name: '', image_url: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [quoteData, setQuoteData] = useState({ price: '', estimated_delivery: '', message: '' });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Initial fetch
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCompany(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, [user, authLoading]);

  // Realtime subscriptions - separate to avoid loops
  useEffect(() => {
    if (!user || !company?.id) return;

    const newChannel = supabase
      .channel(`seller-db-changes-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        (payload) => {
          console.log('Realtime inquiry update:', payload);
          fetchInquiries(company.id); 
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `company_id=eq.${company.id}` },
        () => {
          fetchProducts(company.id); 
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      if (newChannel) supabase.removeChannel(newChannel);
    };
  }, [user, company?.id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    setCategories(data || []);
  };

  const fetchCompany = async () => {
    const { data: compData } = await supabase
      .from('companies')
      .select('id, name, industry, verified, logo_url, owner_id')
      .eq('owner_id', user!.id)
      .single();
    
    if (compData) {
      setCompany(compData);
      fetchProducts(compData.id);
      fetchInquiries(compData.id);
    }
  };

  const fetchProducts = async (companyId: string) => {
    if (!companyId) return;
    const { data } = await supabase
      .from('products')
      .select('id, name, price_range, images, unit, created_at, category_id, categories(id, name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchInquiries = async (companyId?: string) => {
    const compId = companyId || company?.id;
    if (!compId) return; // Wait until company is loaded
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id, 
        buyer_id,
        seller_id,
        created_at, 
        status, 
        message, 
        buyer:profiles!buyer_id(id, full_name, email), 
        products(id, name, price_range, company_id)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching inquiries:', error);
      return;
    }
    
    if (data) {
      // Filter to only inquiries for this seller's company
      const receivedInquiries = data.filter(inq => {
        const prod = Array.isArray(inq.products) ? inq.products[0] : inq.products;
        return prod?.company_id === compId || inq.seller_id === user!.id;
      });
      setInquiries(receivedInquiries);
    }
  };

  const handleOpenQuoteModal = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setQuoteData({ price: inquiry.products?.price_range || '', estimated_delivery: '', message: '' });
    setShowQuoteModal(true);
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setQuoteSubmitting(true);
    
    const { error } = await supabase
      .from('inquiries')
      .update({ 
        status: 'resolved',
        quote_price: parseFloat(quoteData.price) || 0,
        quote_delivery: quoteData.estimated_delivery,
        seller_response: quoteData.message
      })
      .eq('id', selectedInquiry.id);

    if (!error) {
      await fetchInquiries(company?.id);
      setShowQuoteModal(false);
    } else {
      setErrorMsg('Error sending quote: ' + error.message);
    }
    setQuoteSubmitting(false);
  };

  const handleResolveInquiry = async (inquiryId: string) => {
    setResolvingId(inquiryId);
    const { error } = await supabase
      .from('inquiries')
      .update({ status: 'resolved' })
      .eq('id', inquiryId);

    if (!error) {
      await fetchInquiries(company?.id);
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
    
    if (newProduct.category_id === 'new' && newProduct.new_category_name) {
      const slug = newProduct.new_category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category';
      
      // First check if the category already exists
      const { data: existingCat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (existingCat) {
        finalCategoryId = existingCat.id;
        // Check if we need to add it to local state
        if (!categories.find(c => c.id === existingCat.id)) {
          setCategories(prev => [...prev, existingCat]);
        }
      } else {
        // Create new category
        const { data: newCat, error: catError } = await supabase.from('categories').insert({
          name: newProduct.new_category_name,
          slug
        }).select().single();
        
        if (catError) {
          // Handle potential race condition where category is created between our check and insert
          if (catError.message?.includes('duplicate key') || catError.message?.includes('unique constraint')) {
            const { data: retryCat } = await supabase.from('categories').select('*').eq('slug', slug).single();
            if (retryCat) {
              finalCategoryId = retryCat.id;
              if (!categories.find(c => c.id === retryCat.id)) {
                setCategories(prev => [...prev, retryCat]);
              }
            } else {
              console.error('Error creating category:', catError);
              setErrorMsg('Error creating category: ' + catError.message);
              setSubmitting(false);
              return;
            }
          } else {
            console.error('Error creating category:', catError);
            setErrorMsg('Error creating category: ' + catError.message);
            setSubmitting(false);
            return;
          }
        } else if (newCat) {
          finalCategoryId = newCat.id;
          setCategories(prev => [...prev, newCat]);
        }
      }
    }

    let imageUrl = newProduct.image_url;
    
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${company.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile);
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        setErrorMsg('Image upload failed: ' + uploadError.message + '. Please ensure you ran the storage setup SQL.');
        setSubmitting(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
        
      imageUrl = publicUrl;
    }

    const { error } = await supabase.from('products').insert({
      company_id: company.id,
      name: newProduct.name,
      description: newProduct.description,
      price_range: newProduct.price.toString(),
      category_id: finalCategoryId,
      active: true,
      images: [imageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200']
    });
    
    if (error) {
      console.error('Error inserting product:', error);
      setErrorMsg('Error publishing listing: ' + error.message);
    } else {
      setNewProduct({ name: '', description: '', price: '', unit: '', category_id: '', new_category_name: '', image_url: '' });
      setImageFile(null);
      setShowProductModal(false);
      setErrorMsg('');
      fetchProducts(company.id);
    }
    setSubmitting(false);
  };

  const handleDeleteProduct = async (productId: string, images: string[]) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    
    // Attempt to remove image from storage if it is a Supabase Storage URL
    if (images && images.length > 0) {
      for (const url of images) {
        if (url.includes('product-images')) {
          const fileName = url.split('/').pop();
          if (fileName) {
            await supabase.storage.from('product-images').remove([fileName]);
          }
        }
      }
    }

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) {
       fetchProducts(company.id);
    } else {
       alert("Error deleting product: " + error.message);
    }
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
      <Greeting />
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
          <div className="bg-white border border-sand rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-sand/80 transition-colors shadow-sm">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-forest/5 rounded-full group-hover:bg-forest/10 transition-colors pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <div className="w-10 h-10 rounded-full border border-forest/20 flex items-center justify-center text-forest bg-white">
                 <Package size={18} strokeWidth={2} />
              </div>
            </div>
            <div className="relative z-10 mt-2">
               <p className="text-4xl font-display font-medium text-coffee tracking-tight">{products.length}</p>
               <p className="text-[10px] font-bold text-stone/50 uppercase tracking-[0.2em] mt-1">Active Listings</p>
            </div>
          </div>
          <div className="bg-white border border-sand rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-sand/80 transition-colors shadow-sm">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/5 rounded-full group-hover:bg-orange-500/10 transition-colors pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <div className="w-10 h-10 rounded-full border border-orange-500/20 flex items-center justify-center text-orange-500 bg-white">
                 <MessageSquare size={18} strokeWidth={2} />
              </div>
              {inquiries.filter(i => i.status === 'pending').length > 0 && (
                <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-full border border-orange-500/20">
                  {inquiries.filter(i => i.status === 'pending').length} Action Req
                </span>
              )}
            </div>
            <div className="relative z-10 mt-2">
               <p className="text-4xl font-display font-medium text-coffee tracking-tight">{inquiries.length}</p>
               <p className="text-[10px] font-bold text-stone/50 uppercase tracking-[0.2em] mt-1">Total Inquiries</p>
            </div>
          </div>
          <div className="bg-white border border-sand rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-sand/80 transition-colors shadow-sm">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-clay/5 rounded-full group-hover:bg-clay/10 transition-colors pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <div className="w-10 h-10 rounded-full border border-clay/20 flex items-center justify-center text-clay bg-white">
                 <ShoppingBag size={18} strokeWidth={2} />
              </div>
            </div>
            <div className="relative z-10 mt-2">
               <p className="text-4xl font-display font-medium text-coffee tracking-tight">
                 {inquiries.filter(i => i.status === 'resolved').length}
               </p>
               <p className="text-[10px] font-bold text-stone/50 uppercase tracking-[0.2em] mt-1">Orders Processed</p>
            </div>
          </div>
           <div className="bg-white border border-sand rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-sand/80 transition-colors shadow-sm">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-coffee/5 rounded-full group-hover:bg-coffee/10 transition-colors pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <div className="w-10 h-10 rounded-full border border-coffee/20 flex items-center justify-center text-coffee bg-white">
                 <TrendingUp size={18} strokeWidth={2} />
              </div>
            </div>
                <div className="relative z-10 mt-2">
                   <p className="text-4xl font-display font-medium text-coffee tracking-tight">
                     <span className="text-lg text-stone/40 font-semibold align-top mr-1">KES</span>
                     {inquiries.filter(i => i.status === 'resolved').reduce((acc, inq) => {
                       const prod = Array.isArray(inq.products) ? inq.products[0] : inq.products;
                       return acc + (parseFloat(prod?.price_range) || 0);
                     }, 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                   </p>
                   <p className="text-[10px] font-bold text-stone/50 uppercase tracking-[0.2em] mt-1">Revenue YTD</p>
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
                      <button 
                        onClick={() => handleDeleteProduct(product.id, product.images)}
                        className="p-2.5 text-red-800/40 hover:text-red-600 transition-colors"
                        title="Delete Listing"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
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
            <div id="inquiries" className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-sand/50">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-coffee uppercase tracking-[0.3em]">Communication Stream</h3>
                  <p className="text-[10px] text-stone/40 uppercase font-black tracking-widest">Trade Inquiry Management</p>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-coffee/40 hover:text-coffee transition-colors">Unified Inbox</button>
              </div>
              
                <div className="bg-white border border-sand rounded-2xl shadow-sm overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto min-w-full">
                    <table className="w-full min-w-[900px] text-left">
                      <thead>
                        <tr className="border-b border-sand/50">
                          <th className="font-sans py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-stone/50 bg-stone/5">Date</th>
                          <th className="font-sans py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-stone/50 bg-stone/5">Purchasing Entity</th>
                          <th className="font-sans py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-stone/50 bg-stone/5">Reference Node</th>
                          <th className="font-sans py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-stone/50 bg-stone/5 max-w-[200px]">Message</th>
                          <th className="font-sans py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-stone/50 bg-stone/5">Protocol</th>
                          <th className="font-sans py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-stone/50 bg-stone/5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand/30">
                        {inquiries.map((inq, i) => (
                          <tr key={i} className="hover:bg-sand/5 transition-colors group">
                            <td className="py-4 px-6 text-[11px] font-medium text-stone/60 whitespace-nowrap">
                              {new Date(inq.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-sand/30 border border-sand/50 flex items-center justify-center text-[11px] font-bold text-coffee uppercase shrink-0">
                                  {inq.buyer?.full_name?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-coffee truncate">{inq.buyer?.full_name || 'Anonymous Buyer'}</p>
                                  <p className="text-[11px] text-stone/50 font-medium tracking-tight truncate">{inq.buyer?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 max-w-[200px]">
                               <div className="flex flex-col gap-1">
                                 <span className="text-[12px] font-semibold text-coffee truncate">
                                   {(() => {
                                     const prod = Array.isArray(inq.products) ? inq.products[0] : inq.products;
                                     return prod?.name || 'Unknown Product';
                                   })()}
                                 </span>
                                 <span className="font-mono text-[10px] uppercase text-stone/40">REF: {inq.id?.slice(0, 8).toUpperCase() || `ODA-INF-0${i+1}`}</span>
                               </div>
                            </td>
                            <td className="py-4 px-6 max-w-[250px]">
                              <p className="text-[12px] text-stone/60 line-clamp-2" title={inq.message}>
                                {inq.message || 'No message provided.'}
                              </p>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                 <span className={`status-dot ${inq.status === 'pending' ? 'bg-orange-400' : 'bg-olive'}`} />
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-stone/60">{inq.status || 'Pending'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setActiveChatInquiry(inq)} className="btn-outline px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-olive hover:text-white hover:border-olive transition-all active:scale-95">Chat</button>
                                {inq.status === 'pending' ? (
                                  <button onClick={() => handleOpenQuoteModal(inq)} className="btn-outline px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-coffee hover:text-white hover:border-coffee transition-all active:scale-95">Quote</button>
                                ) : (
                                  <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest self-center">Resolved</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {inquiries.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-16 text-center">
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
                              {inq.buyer?.full_name?.charAt(0) || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-coffee truncate">{inq.buyer?.full_name || 'Anonymous Buyer'}</p>
                              <p className="text-[10px] text-stone/50 font-medium tracking-tight truncate">{inq.buyer?.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="flex items-center gap-2">
                              <span className={`status-dot w-2 h-2 rounded-full ${inq.status === 'pending' ? 'bg-orange-400' : 'bg-olive'}`} />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-stone/60">{inq.status || 'Pending'}</span>
                            </div>
                            <span className="text-[9px] font-medium text-stone/40">{new Date(inq.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="bg-sand/10 rounded-lg p-3">
                          <p className="text-[11px] font-bold text-coffee uppercase tracking-wider mb-1 line-clamp-1">
                            {(() => {
                              const prod = Array.isArray(inq.products) ? inq.products[0] : inq.products;
                              return prod?.name || 'Unknown Product';
                            })()}
                          </p>
                          <p className="text-[10px] text-stone/60 truncate">{inq.message || 'No additional notes provided.'}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                           <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">REF: {inq.id?.slice(0, 8).toUpperCase() || `ODA-INF-0${i+1}`}</span>
                           <div className="flex gap-2">
                             <button onClick={() => setActiveChatInquiry(inq)} className="btn-outline px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-olive hover:text-white hover:border-olive transition-all active:scale-95">Chat</button>
                             {inq.status === 'pending' ? (
                               <button onClick={() => handleOpenQuoteModal(inq)} className="btn-outline px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-coffee hover:text-white hover:border-coffee transition-all active:scale-95">Quote</button>
                             ) : (
                               <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest self-center">Resolved</span>
                             )}
                           </div>
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

          <div className="space-y-12">
            {/* Company Card - Premium UI */}
            <div id="settings" className="bg-white border border-sand rounded-2xl overflow-hidden shadow-sm">
              <div className="h-24 bg-sand/30 w-full relative">
                <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white p-1.5 rounded-2xl shadow-sm border border-sand">
                  <div className="w-full h-full rounded-xl bg-coffee flex items-center justify-center text-cream text-2xl font-display font-medium overflow-hidden">
                    {company.logo_url ? <img src={company.logo_url} className="w-full h-full object-cover" /> : company.name.charAt(0)}
                  </div>
                </div>
              </div>
              <div className="pt-14 pb-8 px-6">
                <div className="space-y-1 mb-8">
                  <h3 className="text-xl font-display font-semibold text-coffee flex items-center gap-2">
                    {company.name} {company.verified && <ShieldCheck size={16} className="text-olive" strokeWidth={2} />}
                  </h3>
                  <p className="text-[11px] text-stone/50 font-bold uppercase tracking-[0.2em]">{company.industry || 'Verified Node'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-sand/10 rounded-xl p-4 border border-sand/50">
                     <p className="text-xl font-display font-semibold text-coffee">{products.length}</p>
                     <p className="text-[9px] font-bold text-stone/40 uppercase tracking-[0.2em] mt-1">Active Nodes</p>
                   </div>
                   <div className="bg-sand/10 rounded-xl p-4 border border-sand/50">
                     <p className="text-xl font-display font-semibold text-coffee">{inquiries.filter(i => i.status === 'pending').length}</p>
                     <p className="text-[9px] font-bold text-stone/40 uppercase tracking-[0.2em] mt-1">Pending Deals</p>
                   </div>
                </div>

                <Link to="#" className="btn-outline w-full py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-white hover:bg-stone/5 flex items-center justify-center">
                   Profile Management
                </Link>
              </div>
            </div>

            {/* Seller Insights */}
            <div className="bg-white border border-sand rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-sand mb-6">
                 <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-coffee">
                   Node Activity
                 </h4>
              </div>
              <div className="space-y-6">
                {inquiries.slice(0, 4).map((inq, i) => (
                  <div key={`activity-${inq.id}`} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-sand/20 border border-sand flex items-center justify-center shrink-0 text-stone">
                      {inq.status === 'pending' ? <MessageSquare size={12} /> : <CheckCircle2 size={12} />}
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[12px] leading-relaxed text-coffee/80">
                        {(() => {
                          const prod = Array.isArray(inq.products) ? inq.products[0] : inq.products;
                          const productName = prod?.name || 'a product';
                          return (
                            <>
                              {inq.status === 'pending' ? 'New Request received from' : 'Transaction resolved with'} <span className="font-semibold text-coffee">{inq.buyer?.full_name || 'an entity'}</span> for <span className="font-medium text-coffee italic">{productName}</span>.
                            </>
                          );
                        })()}
                      </p>
                      <p className="text-[9px] text-stone/40 font-bold uppercase tracking-widest">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {inquiries.length === 0 && (
                  <p className="text-[12px] text-stone/60">No recent activity on your trade node yet.</p>
                )}
              </div>
              {inquiries.length > 0 && (
                <button className="btn-outline border-none bg-sand/10 w-full mt-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center hover:bg-sand/20">
                  Full Metrics
                </button>
              )}
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
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Unit</label>
                  <select 
                    required
                    className="input-field w-full px-4 py-3 text-sm bg-white"
                    value={newProduct.unit}
                    onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                  >
                    <option value="" disabled>Select Unit</option>
                    <option value="KG">Kilogram (KG)</option>
                    <option value="Litre">Litre (L)</option>
                    <option value="Piece">Piece (Pcs)</option>
                    <option value="Ton">Ton (T)</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setImageFile(file);
                  }}
                  className="w-full text-sm text-stone file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.2em] file:bg-sand/30 file:text-coffee hover:file:bg-sand/50 transition-colors cursor-pointer"
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
      {showQuoteModal && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sand/80 backdrop-blur-sm">
          <div className="card w-full max-w-md p-8 relative">
            <button 
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-4 right-4 text-stone/40 hover:text-coffee transition-colors"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
            <h3 className="text-xl font-display font-medium text-coffee mb-6">Respond to Inquiry</h3>
            <p className="text-sm font-medium text-stone/60 mb-6">
              Product: <span className="font-bold text-coffee">{selectedInquiry.products?.name}</span>
            </p>
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSendQuote} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Quote Price (KES)</label>
                <input 
                  type="number" 
                  required
                  className="input-field w-full px-4 py-3 text-sm"
                  placeholder="e.g. 50000"
                  value={quoteData.price}
                  onChange={e => setQuoteData({...quoteData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Estimated Delivery</label>
                <input 
                  type="text" 
                  required
                  className="input-field w-full px-4 py-3 text-sm"
                  placeholder="e.g. 3-5 Business Days"
                  value={quoteData.estimated_delivery}
                  onChange={e => setQuoteData({...quoteData, estimated_delivery: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone/60 mb-2">Message to Buyer</label>
                <textarea 
                  required
                  rows={4}
                  className="input-field w-full px-4 py-3 text-sm resize-none"
                  placeholder="Add any terms, conditions, or greetings..."
                  value={quoteData.message}
                  onChange={e => setQuoteData({...quoteData, message: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                disabled={quoteSubmitting}
                className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {quoteSubmitting ? 'Sending Request...' : 'Send Quote'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {activeChatInquiry && (
        <InquiryChat inquiry={activeChatInquiry} onClose={() => setActiveChatInquiry(null)} />
      )}
    </motion.div>
  );
}
