import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/layout/DashboardLayout';
import { AlertCircle, Database, Shield, User } from 'lucide-react';

export default function DiagnosticPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDiagnostics = async () => {
      setLoading(true);
      try {
        // 1. Check current session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (!session?.user) {
          setError("No active session found. Please log in.");
          setLoading(false);
          return;
        }

        // 2. Fetch Profile
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profData);

        // 3. Fetch Company
        const { data: compData } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', session.user.id);
        const activeCompany = compData?.[0] || null;
        setCompany(activeCompany);

        // 4. Fetch Products
        if (activeCompany) {
          const { data: prodData } = await supabase
            .from('products')
            .select('*')
            .eq('company_id', activeCompany.id);
          setProducts(prodData || []);
        }

        // 5. Fetch ALL inquiries this user has access to
        const { data, error: inqError } = await supabase
          .from('inquiries')
          .select(`
            *,
            products:product_id (id, name, company_id),
            buyer:buyer_id (id, full_name)
          `);

        if (inqError) throw inqError;
        setInquiries(data || []);
      } catch (err: any) {
        console.error("Diagnostic error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkDiagnostics();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* User & Node Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-sand rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-olive">
              <User size={18} />
              <h3 className="font-display font-semibold text-coffee">Identity</h3>
            </div>
            {profile ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-coffee">{profile.full_name}</p>
                <p className="text-[10px] font-bold uppercase text-stone/40">Role: {profile.role}</p>
                <code className="text-[9px] block bg-sand/20 p-1 truncate">{profile.id}</code>
              </div>
            ) : <p className="text-xs text-clay">No Profile Record Found</p>}
          </div>

          <div className="bg-white border border-sand rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-olive">
              <Database size={18} />
              <h3 className="font-display font-semibold text-coffee">Commercial Node</h3>
            </div>
            {company ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-coffee">{company.name}</p>
                <p className="text-[10px] font-bold uppercase text-stone/40">ID: {company.id.slice(0,8)}</p>
                <p className="text-[9px] font-medium text-stone/60">Owner ID: {company.owner_id.slice(0,8)}...</p>
              </div>
            ) : <p className="text-xs text-stone/40">No Company Initialized</p>}
          </div>

          <div className="bg-white border border-sand rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-olive">
              <Shield size={18} />
              <h3 className="font-display font-semibold text-coffee">Active Inventory</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-coffee">{products.length} Products</p>
              <div className="max-h-[60px] overflow-y-auto">
                {products.map(p => (
                   <div key={p.id} className="text-[9px] text-stone/60 border-b border-sand/30 py-1">
                     {p.name.slice(0, 20)}... (ID: {p.id.slice(0,4)})
                   </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inquiries Data */}
        <div className="bg-white border border-sand rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-sand flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="text-olive" size={20} />
              <h3 className="font-display font-semibold text-coffee">Raw Inquiry Data ({inquiries.length})</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full">
              <Shield size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">RLS Active</span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-olive border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-stone/40">Querying database...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-clay">
              <AlertCircle size={32} className="mx-auto mb-4" />
              <p className="font-medium">{error}</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="p-12 text-center text-stone/40">
              <p>No inquiry records found in your scope.</p>
              <p className="text-xs mt-2 italic">If you are a seller, ensure you have products and that buyers have messaged you.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sand/5">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone/50">Created</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone/50">Product</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone/50">Seller ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone/50">Buyer Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone/50">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-sand/5 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-stone/60">
                        {new Date(inq.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-coffee">
                        {Array.isArray(inq.products) ? inq.products[0]?.name : inq.products?.name || 'Deleted Product'}
                        <div className="text-[10px] text-stone/40 mt-1">ID: {inq.product_id?.slice(0,8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] bg-sand/30 px-1 py-0.5 rounded">{inq.seller_id?.slice(0,8)}...</code>
                        {inq.seller_id === user?.id && <span className="ml-2 text-[9px] font-bold uppercase text-olive bg-olive/10 px-1.5 py-0.5 rounded-full">YOU</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-stone/60">
                        {inq.buyer?.full_name || 'System User'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          inq.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {inq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* JSON Inspector */}
        {inquiries.length > 0 && (
          <div className="bg-stone/90 rounded-2xl p-6 overflow-hidden">
            <h3 className="font-mono text-xs font-bold text-cream/40 uppercase mb-4 tracking-widest">Full JSON Payload</h3>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <pre className="text-[10px] font-mono text-cream/90 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(inquiries, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
