"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Utensils, Settings, LogOut, ListOrdered, Package, 
  Loader2, ArrowLeft, Plus, Trash2, Store, CheckCircle2, XCircle
} from 'lucide-react';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setRestaurants(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!name) throw new Error("Restaurant ka naam zaroori hai");

      const { error } = await supabase.from('restaurants').insert([
        {
          name,
          address,
          owner_email: ownerEmail,
          phone,
          logo: logo || '🏪',
          is_active: true
        }
      ]);

      if (error) throw error;

      alert('Restaurant add ho gaya!');
      setName('');
      setAddress('');
      setOwnerEmail('');
      setPhone('');
      setLogo('');
      fetchRestaurants();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchRestaurants();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === '11111111-1111-1111-1111-111111111111') {
      alert("Main restaurant ko delete nahi kar sakte.");
      return;
    }
    if (!confirm('Kya aap waqai yeh restaurant delete karna chahte hain?')) return;
    
    try {
      const { error } = await supabase.from('restaurants').delete().eq('id', id);
      if (error) throw error;
      fetchRestaurants();
    } catch (error: any) {
      alert("Error deleting: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0b0f]">
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-20 bg-[#111115] border-r border-white/5 flex flex-col items-center py-6 gap-8 z-20">
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/20 cursor-pointer">🍔</div>
        <nav className="flex flex-col gap-6 w-full items-center overflow-y-auto">
          <div onClick={() => router.push('/')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><LayoutDashboard size={22} /></div>
          <div onClick={() => router.push('/kitchen')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><ListOrdered size={22} /></div>
          <div onClick={() => router.push('/products')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><Utensils size={22} /></div>
          <div onClick={() => router.push('/inventory')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><Package size={22} /></div>
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 cursor-pointer"><Store size={22} /></div>
        </nav>
        <div className="mt-auto flex flex-col gap-6 w-full items-center">
          <div onClick={() => router.push('/profile')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><Settings size={22} /></div>
          <div onClick={handleLogout} className="p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"><LogOut size={22} /></div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/')} className="p-2 bg-[#18181b] rounded-xl border border-white/5 hover:bg-white/10 text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Store className="text-orange-500" /> Multi-Restaurant Management</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Restaurant Form */}
          <div className="lg:col-span-1">
            <div className="bg-[#111115] border border-white/5 rounded-3xl p-6">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2"><Plus size={20} className="text-orange-500"/> Add New Restaurant</h2>
              
              <form onSubmit={handleAddRestaurant} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Restaurant Name *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Burger King" className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50" />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Owner Email</label>
                  <input value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} type="email" placeholder="owner@restaurant.com" className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50" />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} type="text" placeholder="+92 300 1234567" className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50" />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Address</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Full address..." className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50 resize-none"></textarea>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Logo (Emoji)</label>
                  <input value={logo} onChange={e => setLogo(e.target.value)} type="text" placeholder="e.g. 🍕" className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50" />
                </div>

                <button disabled={submitting} type="submit" className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Add Restaurant'}
                </button>
              </form>
            </div>
          </div>

          {/* Restaurants List */}
          <div className="lg:col-span-2">
             <div className="bg-[#111115] border border-white/5 rounded-3xl p-6">
                <h2 className="text-lg font-medium mb-6">All Restaurants ({restaurants.length})</h2>
                
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
                ) : restaurants.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">No restaurants found.</p>
                ) : (
                  <div className="space-y-3">
                    {restaurants.map((rest) => (
                      <div key={rest.id} className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-3xl">{rest.logo || '🏪'}</div>
                          <div>
                            <h3 className="font-medium text-base text-white">{rest.name}</h3>
                            <p className="text-xs text-gray-500">{rest.address || 'No address'}</p>
                            <p className="text-xs text-gray-500">{rest.owner_email || 'No email'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleActive(rest.id, rest.is_active)}
                            className={`p-2 rounded-xl transition ${rest.is_active ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                            title={rest.is_active ? 'Active' : 'Inactive'}
                          >
                            {rest.is_active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                          </button>
                          <button onClick={() => handleDelete(rest.id)} className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}