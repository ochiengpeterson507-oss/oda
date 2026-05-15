import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../lib/mockData';
import { Search, Filter, ArrowRight, Star, MapPin, Layers, ShoppingBag, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchMarketplaceData();
  }, [selectedCategory, search]);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    
    // Fetch categories
    const { data: catData } = await supabase.from('categories').select('*');
    if (catData && catData.length > 0) {
      setCategories(catData);
    } else {
      setCategories(MOCK_CATEGORIES);
    }

    // Fetch products
    let query = supabase
      .from('products')
      .select('*, companies(*), categories(*)')
      .eq('active', true);

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: prodData } = await query;
    if (prodData && prodData.length > 0) {
      setProducts(prodData);
    } else {
      // Fallback to filtered mock data
      let filtered = [...MOCK_PRODUCTS];
      if (selectedCategory) {
        filtered = filtered.filter(p => p.category_id === selectedCategory);
      }
      if (search) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) || 
          p.companies.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      setProducts(filtered);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      <Navbar />

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-display font-medium text-coffee mb-4">Industrial Marketplace</h1>
            <p className="text-sm md:text-base text-stone/80 max-w-2xl font-medium">Source industrial components directly from primary manufacturing nodes across the East African trade block.</p>
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-4">
            <div className="flex-1 md:w-72 flex items-center gap-3 bg-white/70 backdrop-blur-sm px-5 py-3 rounded-xl border border-sand focus-within:border-coffee/20 focus-within:ring-4 focus-within:ring-coffee/[0.02] transition-all shadow-sm">
              <Search size={16} className="text-stone" />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                className="bg-transparent border-none outline-none w-full text-sm font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden p-3.5 bg-white border border-sand rounded-xl text-coffee shadow-sm"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Categories Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-52 space-y-12 flex-shrink-0">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-coffee/30 mb-8">Categories</h3>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left flex justify-between items-center ${!selectedCategory ? 'bg-coffee/5 text-coffee' : 'text-stone hover:text-coffee'}`}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left flex justify-between items-center ${selectedCategory === cat.id ? 'bg-coffee/5 text-coffee' : 'text-stone hover:text-coffee'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-coffee/30 mb-8">Compliance</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-sand flex items-center justify-center bg-white group-hover:border-coffee transition-colors">
                    <div className="w-2 h-2 rounded-sm bg-coffee opacity-0 group-has-[:checked]:opacity-100" />
                  </div>
                  <input type="checkbox" className="hidden" />
                  <span className="text-xs font-medium text-stone group-hover:text-coffee transition-colors">Verified Only</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-sand flex items-center justify-center bg-white group-hover:border-coffee transition-colors">
                    <div className="w-2 h-2 rounded-sm bg-coffee opacity-0 group-has-[:checked]:opacity-100" />
                  </div>
                  <input type="checkbox" className="hidden" />
                  <span className="text-xs font-medium text-stone group-hover:text-coffee transition-colors">In-Stock Nodes</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="w-full aspect-[4/5] bg-sand/20 rounded-xl mb-6" />
                    <div className="h-4 w-3/4 bg-sand/20 rounded-full mb-3" />
                    <div className="h-3 w-1/2 bg-sand/20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="flex flex-col group"
                  >
                    <Link to={`/product/${product.id}`} className="block aspect-[4/5] overflow-hidden rounded-2xl bg-sand/30 border border-sand/50 mb-6 relative">
                      <img 
                        src={product.images?.[0] || `https://images.unsplash.com/photo-1596487649116-be83a5cd9621?auto=format&fit=crop&q=80&w=800&sig=${product.id}`} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-coffee uppercase tracking-widest">{product.categories?.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="status-dot bg-olive" />
                          <span className="text-[9px] font-bold text-stone uppercase tracking-widest">Verified</span>
                        </div>
                      </div>
                      
                      <Link to={`/product/${product.id}`} className="text-lg font-display font-medium text-coffee mb-1 group-hover:text-olive transition-colors truncate">
                        {product.name}
                      </Link>
                      
                      <p className="text-xs text-stone font-medium mb-4">{product.companies?.name}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-sand/50">
                        <span className="text-sm font-bold">KSh {product.price?.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-stone uppercase tracking-widest">/ {product.unit || 'Unit'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-sand/20 shadow-sm">
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6 text-olive">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="text-2xl font-display font-semibold text-coffee mb-2">No matching products</h3>
                <p className="text-stone max-w-sm mx-auto text-sm px-6">We couldn't find items matching your search. Try broadening your criteria or clear filters.</p>
                <button 
                  onClick={() => {setSearch(''); setSelectedCategory(null);}} 
                  className="mt-8 px-8 py-3 bg-olive text-white rounded-xl font-bold hover:bg-olive/90 transition-all shadow-lg shadow-olive/10"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Bottom Sheet / Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-coffee/40 backdrop-blur-sm z-[60]"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[2.5rem] z-[70] p-8 pb-12 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-display font-semibold text-coffee">Browse Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-cream rounded-xl text-coffee">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone mb-4">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => {setSelectedCategory(null); setShowMobileFilters(false);}}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${!selectedCategory ? 'bg-olive border-olive text-white' : 'border-sand/40 text-coffee'}`}
                    >
                      All Items
                    </button>
                    {categories.map((cat) => (
                      <button 
                        key={cat.id}
                        onClick={() => {setSelectedCategory(cat.id); setShowMobileFilters(false);}}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedCategory === cat.id ? 'bg-olive border-olive text-white' : 'border-sand/40 text-coffee'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone mb-4">Options</h4>
                  <div className="flex gap-4">
                    <button className="flex-1 px-4 py-3 rounded-xl text-xs font-bold border border-sand/40 text-coffee text-center">Verified Only</button>
                    <button className="flex-1 px-4 py-3 rounded-xl text-xs font-bold border border-sand/40 text-coffee text-center">In Stock</button>
                  </div>
                </div>

                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-4 bg-coffee text-white rounded-xl font-bold uppercase tracking-widest text-xs mt-4"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
