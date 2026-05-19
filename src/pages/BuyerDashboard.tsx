import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  MessageSquare, 
  ShoppingBag, 
  Heart, 
  ArrowRight, 
  Eye, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Greeting } from '../components/Greeting';

export default function BuyerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activity: '+0%',
    openInquiries: 0,
    sourcingList: 0,
    savedPartners: 0,
  });
  
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchBuyerData(true);

    const newChannel = supabase
      .channel(`buyer-dashboard-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries', filter: `buyer_id=eq.${user.id}` },
        (payload) => {
          console.log('Buyer inquiry update:', payload);
          fetchBuyerData(false); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [user, authLoading]);

  const fetchBuyerData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      // Fetch inquiries for the buyer with minimal necessary fields
      const { data: inqData } = await supabase
        .from('inquiries')
        .select(`
          id, 
          created_at, 
          status, 
          product_id, 
          products:product_id (id, name, company_id)
        `)
        .eq('buyer_id', user!.id)
        .order('created_at', { ascending: false });

      if (inqData) {
        setInquiries(inqData);
        
        const open = inqData.filter(i => i.status === 'pending').length;
        const uniqueProducts = new Set(inqData.map(i => i.product_id)).size;
        const uniqueCompanies = new Set(inqData.map(i => {
          const prod = i.products as any;
          return Array.isArray(prod) ? prod[0]?.company_id : prod?.company_id;
        })).size;
        
        setStats({
          activity: inqData.length > 0 ? '+12.5%' : '0%', // Mocked trend
          openInquiries: open,
          sourcingList: uniqueProducts,
          savedPartners: uniqueCompanies,
        });

        // Generate chart data for the last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({length: 7}).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            name: days[d.getDay()],
            active: 0,
            date: d.toDateString()
          };
        });

        inqData.forEach(inq => {
          const inqDate = new Date(inq.created_at).toDateString();
          const dayData = last7Days.find(d => d.date === inqDate);
          if (dayData) {
            dayData.active += 1;
          }
        });

        setChartData(last7Days);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Market Activity', value: stats.activity, icon: TrendingUp, color: 'text-olive', bg: 'bg-olive/10' },
    { title: 'Open Inquiries', value: stats.openInquiries.toString(), icon: MessageSquare, color: 'text-clay', bg: 'bg-clay/10' },
    { title: 'Sourcing List', value: stats.sourcingList.toString(), icon: ShoppingBag, color: 'text-coffee', bg: 'bg-sand/20' },
    { title: 'Saved Partners', value: stats.savedPartners.toString(), icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  if (loading || authLoading) return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl" />)}
      </div>
      <div className="h-[500px] bg-white rounded-3xl" />
    </div>
  );

  return (
    <div className="space-y-12 pb-16">
      <Greeting />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-sand/50 pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-medium text-coffee tracking-tighter">Market Overview</h1>
          <p className="text-[15px] text-stone font-medium">Verified procurement and network activity.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-sand shadow-sm">
            <span className="status-dot bg-olive" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-coffee/60">Network Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Minimalized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        {statCards.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone/50 uppercase tracking-[0.2em]">{stat.title}</span>
              <stat.icon size={14} className="text-coffee/20" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-semibold text-coffee">{stat.value}</span>
              <span className="text-[10px] font-bold text-olive uppercase tracking-widest">Live</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pt-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-16">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-medium text-coffee">Sourcing Engagement</h3>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold text-coffee uppercase tracking-widest pb-1 border-b-2 border-olive">7 Days</span>
                <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest pb-1 border-b-2 border-transparent hover:text-coffee transition-colors cursor-pointer">30 Days</span>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#556B2F" stopOpacity={0.08}/>
                      <stop offset="95%" stopColor="#556B2F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#2d2420" strokeOpacity={0.05} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 500}} dy={15} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#3E2C23', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ opacity: 0.4, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="active" stroke="#556B2F" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-sand/50">
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-full bg-olive/5 border border-olive/10 flex items-center justify-center text-olive">
                <ShieldCheck size={20} strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-display font-medium text-coffee">Verified Supplier Network</h4>
              <p className="text-[14px] text-stone leading-relaxed font-medium">ODA verified members maintain a 98.4% fulfillment rate. Prioritize verified nodes for mission-critical procurement.</p>
              <button className="text-xs font-bold text-coffee uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all">
                Access Vetting Standards <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-full bg-sand/30 flex items-center justify-center text-coffee">
                <ShoppingBag size={20} strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-display font-medium text-coffee">Direct RFQ Protocol</h4>
              <p className="text-[14px] text-stone leading-relaxed font-medium">Initialize custom sourcing requests to all manufacturing nodes simultaneously.</p>
              <button className="text-xs font-bold text-olive uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all">
                Publish New RFQ <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-16">
          <div id="inquiries" className="space-y-10">
            <div className="flex items-center justify-between pb-4 border-b border-sand/50">
              <h3 className="text-xs font-bold text-coffee uppercase tracking-[0.3em]">Market Activity</h3>
              <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">Recent First</span>
            </div>
            <div className="space-y-10">
              {inquiries.slice(0, 5).map((inq, idx) => (
                <div key={inq.id || idx} className="group relative">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 status-dot ${
                      inq.status === 'pending' ? 'bg-orange-400' : 'bg-olive'
                    }`} />
                    <div className="space-y-2">
                      <p className={`text-sm leading-tight font-medium ${inq.status === 'pending' ? 'text-coffee' : 'text-stone/80'}`}>
                        Inquiry for {inq.products?.name || 'Product'} {inq.status === 'pending' ? 'sent' : 'resolved'}.
                      </p>
                      <p className="text-[10px] text-stone/40 uppercase font-black tracking-widest">{new Date(inq.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {inquiries.length === 0 && (
                <p className="text-sm text-stone/60">No recent market activity.</p>
              )}
            </div>
            <button className="btn-outline w-full py-4 text-xs uppercase tracking-[0.2em] border-none bg-sand/30 hover:bg-sand/40">
              Activity Archive
            </button>
          </div>

          <div id="settings" className="space-y-8">
            <h3 className="text-xs font-bold text-coffee uppercase tracking-[0.3em] pb-4 border-b border-sand/50">Portal Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { icon: ShoppingBag, label: 'Order History' },
                { icon: Eye, label: 'Market Watchlist' },
                { icon: MessageSquare, label: 'Trade Desk Support' },
                { icon: Settings, label: 'Security Settings' }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-sand/30 transition-all group text-left"
                >
                  <item.icon size={16} className="text-stone/40 group-hover:text-coffee transition-colors" />
                  <span className="text-[11px] font-bold text-stone/60 group-hover:text-coffee uppercase tracking-widest transition-colors">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
