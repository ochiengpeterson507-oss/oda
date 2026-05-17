import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  AlertCircle, 
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  BarChart3,
  Package,
} from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'sellers' | 'moderation'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'verified' | 'pending'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAdminData();
    
    const channel = supabase.channel('admin_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAdminData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, fetchAdminData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchAdminData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAdminData = async () => {
    const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (userData) setUsers(userData);

    const { data: compData } = await supabase.from('companies').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
    if (compData) setCompanies(compData);

    const { data: prodData } = await supabase.from('products').select('*, companies(name)').order('created_at', { ascending: false });
    if (prodData) setProducts(prodData);

    setLoading(false);
  };

  const toggleCompanyVerification = async (companyId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('companies').update({ verified: !currentStatus }).eq('id', companyId);
    if (error) {
      console.error(error);
      alert(`Failed to update company verification: ${error.message}. Please ensure you have Admin RLS policies set up in Supabase.`);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('products').update({ active: !currentStatus }).eq('id', productId);
    if (error) {
      console.error(error);
      alert(`Failed to update product status: ${error.message}. Please ensure you have Admin RLS policies set up in Supabase.`);
    }
  };

  const getFilteredData = () => {
    let data: any[] = [];
    if (activeTab === 'users') data = users;
    if (activeTab === 'sellers') data = companies;
    if (activeTab === 'moderation') data = products;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(item => {
        if (activeTab === 'users') return item.full_name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q);
        if (activeTab === 'sellers') return item.name?.toLowerCase().includes(q) || item.industry?.toLowerCase().includes(q);
        if (activeTab === 'moderation') return item.name?.toLowerCase().includes(q) || item.companies?.name?.toLowerCase().includes(q);
        return true;
      });
    }

    if (statusFilter !== 'all') {
      data = data.filter(item => {
        if (activeTab === 'sellers') {
          if (statusFilter === 'verified') return item.verified === true;
          if (statusFilter === 'pending') return item.verified !== true;
        }
        if (activeTab === 'moderation') {
          if (statusFilter === 'active') return item.active === true;
          if (statusFilter === 'inactive') return item.active !== true;
        }
        return true;
      });
    }

    return data;
  };

  const marketVolumeNumber = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
  const formattedVolume = marketVolumeNumber >= 1000000 
    ? `KSh ${(marketVolumeNumber / 1000000).toFixed(1)}M` 
    : marketVolumeNumber >= 1000 
      ? `KSh ${(marketVolumeNumber / 1000).toFixed(1)}k` 
      : `KSh ${marketVolumeNumber}`;

  const stats = [
    { label: 'Total Users', value: users.length, change: '+2', icon: Users },
    { label: 'Pending Sellers', value: companies.filter(c => !c.verified).length, change: '-1', icon: Building2 },
    { label: 'Product Reports', value: products.filter(p => !p.active).length, change: '0', icon: AlertCircle },
    { label: 'Market Volume', value: formattedVolume, change: 'Live', icon: BarChart3 },
  ];

  if (loading) return <div className="p-8">Accessing Admin Panel...</div>;

  const filteredData = getFilteredData();

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-sand/50 pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-medium text-coffee tracking-tighter">Platform Control</h1>
          <p className="text-[15px] text-stone font-medium">Global ecosystem moderation and health monitoring.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto relative">
          <div className="flex-1 md:w-72 relative group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40 group-focus-within:text-coffee transition-colors" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11 text-[13px]"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary px-3 py-3 ${showFilters ? 'bg-sand/30 border-sand text-coffee' : ''}`}
          >
            <Filter size={18} strokeWidth={1.5} />
          </button>
          
          <AnimatePresence>
            {showFilters && activeTab !== 'users' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-3 bg-white border border-sand rounded-xl shadow-lg p-3 z-20 min-w-[180px]"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone/40 mb-2 px-2">Status Filter</p>
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${statusFilter === 'all' ? 'bg-sand/30 text-coffee' : 'text-stone hover:bg-sand/10'}`}
                  >
                    All
                  </button>
                  {activeTab === 'sellers' && (
                    <>
                      <button 
                        onClick={() => setStatusFilter('verified')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${statusFilter === 'verified' ? 'bg-sand/30 text-coffee' : 'text-stone hover:bg-sand/10'}`}
                      >
                        Verified
                      </button>
                      <button 
                        onClick={() => setStatusFilter('pending')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${statusFilter === 'pending' ? 'bg-sand/30 text-coffee' : 'text-stone hover:bg-sand/10'}`}
                      >
                        Pending Validation
                      </button>
                    </>
                  )}
                  {activeTab === 'moderation' && (
                    <>
                      <button 
                        onClick={() => setStatusFilter('active')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${statusFilter === 'active' ? 'bg-sand/30 text-coffee' : 'text-stone hover:bg-sand/10'}`}
                      >
                        Active Listings
                      </button>
                      <button 
                        onClick={() => setStatusFilter('inactive')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${statusFilter === 'inactive' ? 'bg-sand/30 text-coffee' : 'text-stone hover:bg-sand/10'}`}
                      >
                        Inactive / Suspended
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Admin Stats - Airier Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pt-4">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone/40">{stat.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'text-olive bg-olive/5' : 'text-clay bg-clay/5'}`}>
                {stat.change}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-sand/30 border border-sand/50 flex items-center justify-center text-coffee/20">
                <stat.icon size={18} strokeWidth={1.5} />
              </div>
              <p className="text-4xl font-display font-semibold text-coffee tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main List Management */}
      <div className="space-y-8 pt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-4 border-b border-sand/50">
          <div className="flex gap-10 overflow-x-auto w-full sm:w-auto scrollbar-hide">
            {(['users', 'sellers', 'moderation'] as const).map((tab) => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setStatusFilter('all'); }}
                className={`text-[11px] font-bold uppercase tracking-[0.3em] pb-4 transition-all whitespace-nowrap relative ${
                  activeTab === tab ? 'text-coffee' : 'text-stone/30 hover:text-coffee'
                }`}
              >
                {tab} Management
                {activeTab === tab && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive" />}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full min-w-[800px]">
            <thead className="text-left">
              <tr>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40 w-1/3">Entity Identity</th>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40 w-1/4">Status</th>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40 w-1/4">Details</th>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40 text-right w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/30">
              {filteredData.length === 0 ? (
                <tr>
                  <td className="py-32 text-center" colSpan={4}>
                    <div className="w-12 h-12 bg-sand/20 rounded-full flex items-center justify-center mx-auto mb-6 text-stone/20">
                      <ShieldCheck size={28} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-stone/40 italic font-medium">No results found.</p>
                  </td>
                </tr>
              ) : activeTab === 'users' ? (
                filteredData.map((user, i) => (
                  <tr key={user.id || i} className="hover:bg-sand/10 transition-all group">
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-sand/30 border border-sand/50 flex items-center justify-center text-[11px] font-bold text-coffee uppercase">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-coffee">{user.full_name || 'Anonymous User'}</p>
                          <p className="text-[11px] text-stone/40 font-medium tracking-tight">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                         <span className="status-dot bg-olive" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-stone/60">{user.role || 'Member'}</span>
                      </div>
                    </td>
                    <td className="py-6 text-[11px] font-medium text-stone/60 uppercase tracking-wider">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-6 text-right">
                      <button className="p-2 text-stone/30 hover:text-coffee transition-colors">
                        <MoreVertical size={16} strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : activeTab === 'sellers' ? (
                filteredData.map((company, i) => (
                  <tr key={company.id || i} className="hover:bg-sand/10 transition-all group">
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sand/30 border border-sand/50 flex items-center justify-center text-[11px] font-bold text-coffee uppercase">
                          <Building2 size={16} className="text-stone/40" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-coffee">{company.name}</p>
                          <p className="text-[11px] text-stone/40 font-medium tracking-tight">{company.industry || 'Unknown Sector'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                        {company.verified ? (
                          <>
                            <span className="status-dot bg-olive" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-olive">Verified</span>
                          </>
                        ) : (
                          <>
                            <span className="status-dot bg-clay" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-clay">Pending</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-6">
                      <p className="text-[11px] font-medium text-stone/60">{company.profiles?.full_name}</p>
                      <p className="text-[10px] text-stone/40 tracking-wider truncate max-w-[150px]">{company.profiles?.email}</p>
                    </td>
                    <td className="py-6 text-right">
                      <button 
                        onClick={() => toggleCompanyVerification(company.id, company.verified)}
                        className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-widest transition-colors ${
                          company.verified 
                            ? 'bg-clay/10 text-clay hover:bg-clay hover:text-white' 
                            : 'bg-olive/10 text-olive hover:bg-olive hover:text-white'
                        }`}
                      >
                        {company.verified ? 'Revoke' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                filteredData.map((product, i) => (
                  <tr key={product.id || i} className="hover:bg-sand/10 transition-all group">
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sand/30 border border-sand/50 flex items-center justify-center text-[11px] font-bold text-coffee uppercase">
                          <Package size={16} className="text-stone/40" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-coffee truncate max-w-[200px]">{product.name}</p>
                          <p className="text-[11px] text-stone/40 font-medium tracking-tight">{product.companies?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                        {product.active ? (
                          <>
                            <span className="status-dot bg-olive" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone/60">Active Listing</span>
                          </>
                        ) : (
                          <>
                            <span className="status-dot bg-clay" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-clay">Suspended</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-6">
                      <p className="text-[11px] font-medium text-stone/60">{product.price_range || `$${product.price}`}</p>
                      <p className="text-[10px] text-stone/40 uppercase tracking-wider">MOQ: {product.min_order_quantity || 'N/A'}</p>
                    </td>
                    <td className="py-6 text-right">
                      <button 
                        onClick={() => toggleProductStatus(product.id, product.active)}
                        className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-widest transition-colors ${
                          product.active 
                            ? 'bg-clay/10 text-clay hover:bg-clay hover:text-white' 
                            : 'bg-olive/10 text-olive hover:bg-olive hover:text-white'
                        }`}
                      >
                        {product.active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

