"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import { 
  LayoutDashboard, Utensils, Settings, LogOut, ListOrdered, Package, 
  Loader2, ArrowLeft, Map as MapIcon, Truck
} from 'lucide-react';

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-[#18181b]"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
});

export default function TrackingPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchLocations();
    // Auto refresh every 5 seconds
    const interval = setInterval(fetchLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLocations = async () => {
    try {
      // Only fetch locations updated in the last 5 minutes
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .gte('updated_at', fiveMinsAgo);

      if (error) throw error;
      if (data) setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
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
          <div onClick={() => router.push('/delivery')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><Truck size={22} /></div>
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 cursor-pointer"><MapIcon size={22} /></div>
        </nav>
        <div className="mt-auto flex flex-col gap-6 w-full items-center">
          <div onClick={() => router.push('/profile')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><Settings size={22} /></div>
          <div onClick={handleLogout} className="p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"><LogOut size={22} /></div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 bg-[#18181b] rounded-xl border border-white/5 hover:bg-white/10 text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-semibold flex items-center gap-2"><MapIcon className="text-orange-500" /> Live Delivery Tracking</h1>
          </div>
          <div className="text-sm text-gray-400 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live Updates
          </div>
        </header>

        <div className="bg-[#111115] border border-white/5 rounded-3xl p-2 flex-1 relative min-h-[500px]">
           {loading ? (
              <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
           ) : locations.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                 <MapIcon size={48} className="mb-4 opacity-50" />
                 <p className="text-xl">No Active Delivery Boys</p>
                 <p className="text-sm">Waiting for delivery boys to share their location...</p>
              </div>
           ) : (
              <Map locations={locations} />
           )}
        </div>
      </main>
    </div>
  );
}