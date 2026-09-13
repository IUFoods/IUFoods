"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Utensils, Settings, LogOut, ListOrdered, Package, 
  Loader2, ArrowLeft, User, Save, Truck, Shield
} from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
          setRole(data.role || 'customer');
        } else {
          // If no profile exists, show basic info
          setProfile({ id: session.user.id, role: 'customer' });
          setRole('customer');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: fullName,
          phone: phone,
          role: role // In a real app, don't let users change their own role!
        });

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert("Error updating profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#0b0b0f]"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0b0f]">
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-20 bg-[#111115] border-r border-white/5 flex flex-col items-center py-6 gap-8 z-20">
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/20 cursor-pointer">🍔</div>
        
        <nav className="flex flex-col gap-6 w-full items-center overflow-y-auto">
          {/* Admin/Manager links */}
          {(role === 'admin' || role === 'manager') && (
            <>
              <div onClick={() => router.push('/')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer" title="Dashboard"><LayoutDashboard size={22} /></div>
              <div onClick={() => router.push('/kitchen')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer" title="Kitchen"><ListOrdered size={22} /></div>
              <div onClick={() => router.push('/products')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer" title="Menu"><Utensils size={22} /></div>
              <div onClick={() => router.push('/inventory')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer" title="Inventory"><Package size={22} /></div>
              <div onClick={() => router.push('/delivery')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer" title="Delivery"><Truck size={22} /></div>
            </>
          )}
          {/* Kitchen Staff links */}
          {role === 'kitchen' && (
            <div onClick={() => router.push('/kitchen')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer" title="Kitchen"><ListOrdered size={22} /></div>
          )}
          {/* Delivery Boy links */}
          {role === 'delivery' && (
            <div onClick={() => router.push('/delivery')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer" title="Delivery"><Truck size={22} /></div>
          )}
          {/* Customer links */}
          {role === 'customer' && (
            <div onClick={() => router.push('/')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer" title="Dashboard"><LayoutDashboard size={22} /></div>
          )}
        </nav>
        
        <div className="mt-auto flex flex-col gap-6 w-full items-center">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 cursor-pointer"><Shield size={22} /></div>
          <div onClick={handleLogout} className="p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"><LogOut size={22} /></div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/')} className="p-2 bg-[#18181b] rounded-xl border border-white/5 hover:bg-white/10 text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold">My Profile & Settings</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Profile Info Card */}
          <div className="bg-[#111115] border border-white/5 rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 flex items-center justify-center text-3xl font-bold text-white">
                {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{fullName || 'User'}</h2>
                <p className="text-sm text-gray-500">{profile?.id?.slice(0, 8)}...</p>
                <span className="inline-block mt-2 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-medium border border-orange-500/20 uppercase tracking-wider">
                  {role}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><User size={20} className="text-orange-500"/> Edit Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} type="text" placeholder="John Doe" className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} type="text" placeholder="+1 234 567 890" className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Role (Read Only in real app)</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50 text-white">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="kitchen">Kitchen Staff</option>
                  <option value="delivery">Delivery Boy</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <button onClick={handleSave} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2 mt-4">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </div>

          {/* Settings Explanation */}
          <div className="bg-[#111115] border border-white/5 rounded-3xl p-6">
             <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Shield size={20} className="text-orange-500"/> Role Permissions</h3>
             <p className="text-sm text-gray-400 mb-6">Yeh roles app ki security aur access control ke liye hain. Aap apna role change kar ke test kar sakte hain ke har role ko kya dikhta hai.</p>
             
             <div className="space-y-4">
                <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                  <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400 mt-1"><Shield size={18} /></div>
                  <div>
                    <h4 className="font-medium text-sm text-white">Admin / Manager</h4>
                    <p className="text-xs text-gray-500 mt-1">Full access. Dashboard, Kitchen, Menu, Inventory, aur Delivery sab kuch dikhta hai.</p>
                  </div>
                </div>

                <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mt-1"><ListOrdered size={18} /></div>
                  <div>
                    <h4 className="font-medium text-sm text-white">Kitchen Staff</h4>
                    <p className="text-xs text-gray-500 mt-1">Sirf Kitchen Display System (KDS) dikhta hai. Orders ko cook karna aur ready mark karna.</p>
                  </div>
                </div>

                <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 mt-1"><Truck size={18} /></div>
                  <div>
                    <h4 className="font-medium text-sm text-white">Delivery Boy</h4>
                    <p className="text-xs text-gray-500 mt-1">Sirf Delivery Dashboard dikhta hai. Ready orders ko accept karna aur deliver karna.</p>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}