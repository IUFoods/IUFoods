"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Utensils, Settings, LogOut, ListOrdered, Package, 
  Loader2, ArrowLeft, Plus, Trash2, ChefHat
} from 'lucide-react';

export default function RecipesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedInventory, setSelectedInventory] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, invRes, recRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('inventory').select('*'),
        supabase.from('recipes').select('*, products(name), inventory(name, unit)')
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (invRes.data) setInventory(invRes.data);
      if (recRes.data) setRecipes(recRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!selectedProduct || !selectedInventory || !quantity) throw new Error("Saari fields bharna zaroori hai");

      const { error } = await supabase.from('recipes').insert([
        {
          product_id: selectedProduct,
          inventory_id: selectedInventory,
          quantity_required: parseFloat(quantity)
        }
      ]);

      if (error) throw error;

      alert('Recipe add ho gayi!');
      setSelectedProduct('');
      setSelectedInventory('');
      setQuantity('');
      fetchData();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Kya aap yeh recipe delete karna chahte hain?')) return;
    try {
      await supabase.from('recipes').delete().eq('id', id);
      fetchData();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0b0f]">
      <aside className="w-20 bg-[#111115] border-r border-white/5 flex flex-col items-center py-6 gap-8 z-20">
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/20 cursor-pointer">🍔</div>
        <nav className="flex flex-col gap-6 w-full items-center overflow-y-auto">
          <div onClick={() => router.push('/')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><LayoutDashboard size={22} /></div>
          <div onClick={() => router.push('/kitchen')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><ListOrdered size={22} /></div>
          <div onClick={() => router.push('/products')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><Utensils size={22} /></div>
          <div onClick={() => router.push('/inventory')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><Package size={22} /></div>
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 cursor-pointer"><ChefHat size={22} /></div>
        </nav>
        <div className="mt-auto flex flex-col gap-6 w-full items-center">
          <div onClick={() => router.push('/profile')} className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"><Settings size={22} /></div>
          <div onClick={handleLogout} className="p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"><LogOut size={22} /></div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/')} className="p-2 bg-[#18181b] rounded-xl border border-white/5 hover:bg-white/10 text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><ChefHat className="text-orange-500" /> Recipe Management</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-[#111115] border border-white/5 rounded-3xl p-6">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2"><Plus size={20} className="text-orange-500"/> Link Product to Inventory</h2>
              
              <form onSubmit={handleAddRecipe} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Select Product *</label>
                  <select required value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50 text-white">
                    <option value="">-- Choose Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Select Raw Material *</label>
                  <select required value={selectedInventory} onChange={e => setSelectedInventory(e.target.value)} className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50 text-white">
                    <option value="">-- Choose Material --</option>
                    {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Quantity Required *</label>
                  <input required value={quantity} onChange={e => setQuantity(e.target.value)} type="number" step="0.01" placeholder="e.g. 1" className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50" />
                </div>

                <button disabled={submitting} type="submit" className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Recipe'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
             <div className="bg-[#111115] border border-white/5 rounded-3xl p-6">
                <h2 className="text-lg font-medium mb-6">Active Recipes ({recipes.length})</h2>
                
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
                ) : recipes.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">No recipes found.</p>
                ) : (
                  <div className="space-y-3">
                    {recipes.map((rec) => (
                      <div key={rec.id} className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="bg-orange-500/10 text-orange-500 px-3 py-2 rounded-xl text-sm font-medium">{rec.products?.name}</div>
                           <div className="text-gray-400 text-sm">requires</div>
                           <div className="bg-blue-500/10 text-blue-400 px-3 py-2 rounded-xl text-sm font-medium">
                              {rec.quantity_required} x {rec.inventory?.name} ({rec.inventory?.unit})
                           </div>
                        </div>
                        <button onClick={() => handleDelete(rec.id)} className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition">
                           <Trash2 size={16} />
                        </button>
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