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
  Image as ImageIcon,
} from 'lucide-react';

export default function ManageProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Burgers');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!name || !price) throw new Error('Name aur Price zaroori hai');

      const { error } = await supabase.from('products').insert([
        {
          name,
          price: parseFloat(price),
          category,
          description,
          image_url: imageUrl || '🍽️',
          is_available: true,
          restaurant_id: '11111111-1111-1111-1111-111111111111',
        },
      ]);

      if (error) throw error;

      alert('Product add ho gaya!');
      setName('');
      setPrice('');
      setDescription('');
      setImageUrl('');
      fetchProducts();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Kya aap waqai yeh product delete karna chahte hain?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (error: any) {
      alert('Error deleting: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0b0f]">
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
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 cursor-pointer">
            <Utensils size={22} />
          </div>
          <div
            onClick={() => router.push('/inventory')}
            className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
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

      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2 bg-[#18181b] rounded-xl border border-white/5 hover:bg-white/10 text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold">Menu Management</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#111115] border border-white/5 rounded-3xl p-6">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                <Plus size={20} className="text-orange-500" /> Add New Product
              </h2>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Product Name *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="e.g. Zinger Burger"
                    className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">
                      Price ($) *
                    </label>
                    <input
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      type="number"
                      step="0.01"
                      placeholder="9.99"
                      className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50 text-white"
                    >
                      <option>Burgers</option>
                      <option>Pizza</option>
                      <option>Cakes</option>
                      <option>Donuts</option>
                      <option>Hot Dogs</option>
                      <option>Drinks</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description..."
                    rows={2}
                    className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-orange-500/50 resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Image (Emoji or URL)
                  </label>
                  <div className="relative">
                    <ImageIcon
                      className="absolute left-3 top-3.5 text-gray-500"
                      size={16}
                    />
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      type="text"
                      placeholder="e.g. 🍔 or https://..."
                      className="w-full bg-[#18181b] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>

                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    'Save Product'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#111115] border border-white/5 rounded-3xl p-6">
              <h2 className="text-lg font-medium mb-6">
                All Products ({products.length})
              </h2>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-orange-500" size={32} />
                </div>
              ) : products.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  No products found. Add one from the left.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl">
                          {item.image_url || '🍽️'}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <p className="text-xs text-gray-500">
                            {item.category}
                          </p>
                          <p className="text-sm font-semibold text-orange-500 mt-1">
                            ${Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition"
                      >
                        <Trash2 size={18} />
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
