'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Utensils,
  Settings,
  LogOut,
  ListOrdered,
  Package,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Save,
} from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [cost, setCost] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setInventory(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!name || !quantity) throw new Error('Name aur Quantity zaroori hai');

      const { error } = await supabase.from('inventory').insert([
        {
          name,
          quantity: parseFloat(quantity),
          unit,
          cost_per_unit: parseFloat(cost) || 0,
          restaurant_id: '11111111-1111-1111-1111-111111111111',
        },
      ]);

      if (error) throw error;

      alert('Item add ho gaya!');
      setName('');
      setQuantity('');
      setCost('');
      fetchInventory();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Kya aap waqai yeh item delete karna chahte hain?')) return;

    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error;
      fetchInventory();
    } catch (error: any) {
      alert('Error deleting: ' + error.message);
    }
  };

  const handleUpdateStock = async (id: string, currentQty: number) => {
    const newQty = prompt('Enter new stock quantity:', currentQty.toString());
    if (newQty === null || newQty === '') return;

    try {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: parseFloat(newQty) })
        .eq('id', id);
      if (error) throw error;
      fetchInventory();
    } catch (error: any) {
      alert('Error updating stock: ' + error.message);
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
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/20 cursor-pointer">
          🍔
        </div>
        <nav className="flex flex-col gap-6 w-full items-center">
          <div
            onClick={() => router.push('/')}
            className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <LayoutDashboard size={22} />
          </div>
          <div
            onClick={() => router.push('/kitchen')}
            className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <ListOrdered size={22} />
          </div>
          <div
            onClick={() => router.push('/products')}
            className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <Utensils size={22} />
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 cursor-pointer">
            <Package size={22} />
          </div>
        </nav>
        <div className="mt-auto flex flex-col gap-6 w-full items-center">
          <div className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer">
            <Settings size={22} />
          </div>
          <div
            onClick={handleLogout}
            className="p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
          >
            <LogOut size={22} />
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2 bg-[#18181b] rounded-xl border border-white/5 hover:bg-white/10 text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold">Inventory Management</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- ADD INVENTORY FORM --- */}
          <div className="lg:col-span-1">
            <div className="bg-[#111115] border border-white/5 rounded-3xl p-6">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                <Plus size={20} className="text-orange-500" /> Add Raw Material
              </h2>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Item Name *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="e.g. Beef Patty"
                    className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">
                      Quantity *
                    </label>
                    <input
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      type="number"
                      step="0.01"
                      placeholder="100"
                      className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">
                      Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50 text-white"
                    >
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="liters">liters</option>
                      <option value="grams">grams</option>
                      <option value="packets">packets</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Cost Per Unit ($)
                  </label>
                  <input
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="1.50"
                    className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    'Save Item'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* --- INVENTORY LIST --- */}
          <div className="lg:col-span-2">
            <div className="bg-[#111115] border border-white/5 rounded-3xl p-6">
              <h2 className="text-lg font-medium mb-6">
                Current Stock ({inventory.length})
              </h2>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-orange-500" size={32} />
                </div>
              ) : inventory.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  No items in inventory. Add one from the left.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-medium text-sm text-white">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Cost: ${Number(item.cost_per_unit).toFixed(2)}
                        </p>
                        <p className="text-sm font-semibold text-emerald-400 mt-1">
                          Stock: {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStock(item.id, item.quantity)
                          }
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition"
                          title="Update Stock"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition"
                          title="Delete Item"
                        >
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
