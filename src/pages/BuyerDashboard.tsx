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

const data = [
  { name: 'Mon', active: 400 },
  { name: 'Tue', active: 300 },
  { name: 'Wed', active: 600 },
  { name: 'Thu', active: 800 },
  { name: 'Fri', active: 500 },
  { name: 'Sat', active: 900 },
  { name: 'Sun', active: 700 },
];

export default function BuyerDashboard() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const stats = [
    { title: 'Market Activity', value: '+12.5%', icon: TrendingUp, color: 'text-olive', bg: 'bg-olive/10' },
    { title: 'Open Inquiries', value: '4', icon: MessageSquare, color: 'text-clay', bg: 'bg-clay/10' },
    { title: 'Sourcing List', value: '12', icon: ShoppingBag, color: 'text-coffee', bg: 'bg-sand/20' },
    { title: 'Saved Partners', value: '28', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const activities = [
    { type: 'inquiry', title: 'New quotation from TechSync Industrial', time: '2 hours ago', status: 'unread' },
    { type: 'product', title: 'Industrial Lathe v2.0 restocked', time: '5 hours ago', status: 'read' },
    { type: 'verification', title: 'Your profile has been verified', time: '1 day ago', status: 'verified' },
  ];

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl" />)}
      </div>
      <div className="h-[500px] bg-white rounded-3xl" />
    </div>
  );

  return (
    <div className="space-y-12 pb-16">
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
        {stats.map((stat, idx) => (
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
                <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
          <div className="space-y-10">
            <div className="flex items-center justify-between pb-4 border-b border-sand/50">
              <h3 className="text-xs font-bold text-coffee uppercase tracking-[0.3em]">Market Activity</h3>
              <span className="text-[10px] font-bold text-stone/40 uppercase tracking-widest">Recent First</span>
            </div>
            <div className="space-y-10">
              {activities.map((act, idx) => (
                <div key={idx} className="group relative">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 status-dot ${
                      act.status === 'unread' ? 'bg-olive' : 
                      act.status === 'verified' ? 'bg-coffee' : 'bg-stone/20'
                    }`} />
                    <div className="space-y-2">
                      <p className={`text-sm leading-tight font-medium ${act.status === 'unread' ? 'text-coffee' : 'text-stone/80'}`}>
                        {act.title}
                      </p>
                      <p className="text-[10px] text-stone/40 uppercase font-black tracking-widest">{act.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full text-xs font-bold text-coffee uppercase tracking-[0.2em] py-4 bg-sand/30 rounded-xl hover:bg-sand/30 transition-all">
              Activity Archive
            </button>
          </div>

          <div className="space-y-8">
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
