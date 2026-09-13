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
  Loader2,
  ArrowLeft,
  Flame,
  Clock,
  ChefHat,
  CheckCircle2,
} from 'lucide-react';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (*)
        `
        )
        .neq('status', 'Delivered')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error: any) {
      alert('Error updating status: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Preparing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Cooking':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Ready':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Pending':
        return 'Preparing';
      case 'Preparing':
        return 'Cooking';
      case 'Cooking':
        return 'Ready';
      case 'Ready':
        return 'Delivered';
      default:
        return null;
    }
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
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 cursor-pointer">
            <ListOrdered size={22} />
          </div>
          <div
            onClick={() => router.push('/products')}
            className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
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

      <main className="flex-1 overflow-y-auto p-6 md:p-8 w-full bg-[#0b0b0f]">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 bg-[#18181b] rounded-xl border border-white/5 hover:bg-white/10 text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <ChefHat className="text-orange-500" /> Kitchen Display System
            </h1>
          </div>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>{' '}
            Auto-refreshing every 10s
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-orange-500" size={40} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-[#111115] rounded-3xl border border-white/5">
            <CheckCircle2
              size={48}
              className="mx-auto mb-4 text-emerald-500/50"
            />
            <p className="text-xl">All caught up!</p>
            <p className="text-sm">
              No pending orders in the kitchen right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#111115] border border-white/5 rounded-3xl p-5 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />{' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                  {order.order_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-300">
                        <span className="font-bold text-orange-500 mr-2">
                          {item.quantity}x
                        </span>{' '}
                        {item.product_name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 mt-auto">
                  <p className="text-xs text-gray-500 mb-2">
                    Customer: {order.customer_email}
                  </p>
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() =>
                        updateStatus(
                          order.id,
                          getNextStatus(order.status) as string
                        )
                      }
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        order.status === 'Pending'
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : order.status === 'Preparing'
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : order.status === 'Cooking'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      <Flame size={16} /> Mark as {getNextStatus(order.status)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
