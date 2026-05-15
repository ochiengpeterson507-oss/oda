import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  BarChart3,
  Search,
  Filter
} from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'sellers' | 'moderation'>('users');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    const { data: userData } = await supabase.from('profiles').select('*').limit(10);
    if (userData) setUsers(userData);

    const { data: compData } = await supabase.from('companies').select('*').limit(10);
    if (compData) setCompanies(compData);
    setLoading(false);
  };

  const stats = [
    { label: 'Total Users', value: '4.2k', change: '+12%', icon: Users },
    { label: 'Pending Sellers', value: '18', change: '-3', icon: Building2 },
    { label: 'Product Reports', value: '5', change: '+2', icon: AlertCircle },
    { label: 'Market Volume', value: '$840k', change: '+25%', icon: BarChart3 },
  ];

  if (loading) return <div className="p-8">Accessing Admin Panel...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-sand/50 pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-medium text-coffee tracking-tighter">Platform Control</h1>
          <p className="text-[15px] text-stone font-medium">Global ecosystem moderation and health monitoring.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-72 relative group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40 group-focus-within:text-coffee transition-colors" />
            <input 
              type="text" 
              placeholder="Search across nodes..." 
              className="input-field pl-11 text-[13px]"
            />
          </div>
          <button className="btn-secondary px-3 py-3">
            <Filter size={18} strokeWidth={1.5} />
          </button>
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
            {['users', 'sellers', 'moderation'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-[11px] font-bold uppercase tracking-[0.3em] pb-4 transition-all whitespace-nowrap relative ${
                  activeTab === tab ? 'text-coffee' : 'text-stone/30 hover:text-coffee'
                }`}
              >
                {tab} Management
                {activeTab === tab && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive" />}
              </button>
            ))}
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest text-coffee/40 hover:text-coffee transition-colors">
            Batch Operations
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left">
              <tr>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40">Entity Identity</th>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40">Node Status</th>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40">Established</th>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-widest text-stone/40 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/30">
              {activeTab === 'users' ? users.map((user, i) => (
                <tr key={i} className="hover:bg-sand/10 transition-all group">
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
                       <span className="text-[10px] font-bold uppercase tracking-widest text-stone/60">Verified Member</span>
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
              )) : (
                <tr>
                  <td className="py-32 text-center" colSpan={4}>
                    <div className="w-12 h-12 bg-sand/20 rounded-full flex items-center justify-center mx-auto mb-6 text-stone/20">
                      <ShieldCheck size={28} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-stone/40 italic font-medium">Moderation queue cleared. No pending actions.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
