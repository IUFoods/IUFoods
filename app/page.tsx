'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Package,
  Settings,
  Search,
  Bell,
  MapPin,
  Clock,
  Plus,
  Minus,
  ChevronRight,
  Flame,
  Star,
  LogOut,
  ListOrdered,
  Loader2,
  X,
  Truck,
} from 'lucide-react';

export default function Dashboard() {
  const [cart, setCart] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const router = useRouter();

  const fallbackDishes = [
    {
      id: '1',
      name: 'Hamburger',
      price: 10.0,
      image_url: '🍔',
      description: 'Juicy Beef Burger',
    },
    {
      id: '2',
      name: 'Pizza',
      price: 25.0,
      image_url: '🍕',
      description: 'Cheese Lovers Pizza',
    },
    {
      id: '3',
      name: 'Sushi',
      price: 15.0,
      image_url: '🍣',
      description: 'Salmon Roll',
    },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email || 'Unknown');
        fetchProducts();
        fetchOrders();
      }
    };
    checkUser();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data && data.length > 0) setDishes(data);
      else setDishes(fallbackDishes);
    } catch (error) {
      setDishes(fallbackDishes);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const addToCart = (dish: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.name === dish.name);
      if (existingItem) {
        return prevCart.map((item) =>
          item.name === dish.name ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: dish.id,
          name: dish.name,
          desc: dish.description,
          qty: 1,
          price: dish.price,
          img: dish.image_url || '🍽️',
        },
      ];
    });
  };

  const updateQty = (id: any, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.qty > 0);
    });
  };

  const subTotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const deliveryCharge = cart.length > 0 ? 10 : 0;
  const finalTotal = subTotal + deliveryCharge;
  const totalItems = cart.reduce((total, item) => total + item.qty, 0);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_email: userEmail,
            total_amount: finalTotal,
            status: 'Pending',
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_name: item.name,
        quantity: item.qty,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      alert(`Order Confirm! Total: $${finalTotal.toFixed(2)}`);
      setCart([]);
      setIsCartOpen(false);
      fetchOrders();
    } catch (error: any) {
      alert('Error saving order: ' + error.message);
    }
  };

  const categories = [
    { name: 'Burgers', icon: '🍔' },
    { name: 'Pizza', icon: '🍕' },
    { name: 'Cakes', icon: '🎂' },
    { name: 'Donuts', icon: '🍩' },
    { name: 'Hot Dogs', icon: '🌭' },
    { name: 'Drinks', icon: '🥤' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0b0f] relative">
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      <aside className="fixed bottom-0 left-0 right-0 h-16 bg-[#111115] border-t border-white/5 flex flex-row justify-around items-center z-40 md:static md:h-full md:w-20 md:flex-col md:justify-start md:border-t-0 md:border-r md:py-6 md:gap-8">
        <div className="hidden md:flex w-12 h-12 rounded-xl bg-orange-500 items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/20 cursor-pointer">
          🍔
        </div>

        <nav className="flex flex-row md:flex-col gap-6 md:gap-6 w-full justify-around md:justify-start md:items-center md:w-auto px-2 md:px-0">
          <div
            onClick={() => router.push('/')}
            className="p-2 md:p-3 rounded-xl bg-orange-500/10 text-orange-500 cursor-pointer"
          >
            <LayoutDashboard size={22} />
          </div>
          <div
            onClick={() => router.push('/kitchen')}
            className="p-2 md:p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <ListOrdered size={22} />
          </div>
          <div
            onClick={() => router.push('/products')}
            className="p-2 md:p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <Utensils size={22} />
          </div>
          <div
            onClick={() => router.push('/inventory')}
            className="p-2 md:p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <Package size={22} />
          </div>
          <div
            onClick={() => router.push('/delivery')}
            className="p-2 md:p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <Truck size={22} />
          </div>
        </nav>

        <div className="hidden md:flex mt-auto flex-col gap-6 w-full items-center">
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

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 relative w-full">
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-orange-500/20">
              🍔
            </div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <h1 className="hidden md:block text-2xl font-semibold">Dashboard</h1>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:relative sm:block">
              <Search
                className="absolute left-3 top-2.5 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#18181b] border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500/50 w-48 lg:w-64"
              />
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="md:hidden bg-[#18181b] p-2 rounded-full border border-white/5 text-orange-500 relative"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="hidden sm:block bg-[#18181b] p-2 rounded-full border border-white/5 text-gray-400 hover:text-white">
              <Bell size={20} />
            </button>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold cursor-pointer text-sm md:text-base">
              A
            </div>
          </div>
        </header>

        <section className="mb-8 md:mb-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-base md:text-lg font-medium">Categories</h2>
              <p className="text-[10px] md:text-xs text-orange-500 mt-1">
                10+ New Categories added this week
              </p>
            </div>
            <button className="text-xs md:text-sm text-gray-400 hover:text-white flex items-center gap-1">
              View More <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-20 h-24 md:w-24 md:h-28 bg-[#18181b] rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 md:gap-3 cursor-pointer hover:border-orange-500/50 hover:bg-[#1f1f23] transition"
              >
                <span className="text-2xl md:text-3xl">{cat.icon}</span>
                <span className="text-[10px] md:text-xs text-gray-400">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 md:mb-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-base md:text-lg font-medium">
                Popular Dishes
              </h2>
              <p className="text-[10px] md:text-xs text-orange-500 mt-1">
                20+ New dishes added this week
              </p>
            </div>
            <button className="text-xs md:text-sm text-gray-400 hover:text-white flex items-center gap-1">
              View More <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {dishes.map((dish, i) => (
                <div
                  key={i}
                  className="bg-[#18181b] p-3 md:p-5 rounded-3xl border border-white/5 relative group hover:border-orange-500/30 transition flex flex-col justify-between"
                >
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => addToCart(dish)}
                      className="bg-white/10 p-1.5 rounded-full hover:bg-orange-500 text-white cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div>
                    <div className="text-4xl md:text-6xl mb-2 md:mb-4 text-center">
                      {dish.image_url || '🍽️'}
                    </div>
                    <h3 className="font-medium text-sm md:text-lg">
                      {dish.name}
                    </h3>
                    <p className="text-[10px] md:text-xs text-gray-500 mb-2 md:mb-3 line-clamp-1">
                      {dish.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-semibold text-orange-500 text-sm md:text-base">
                      ${Number(dish.price).toFixed(2)}
                    </span>
                    <div className="hidden sm:flex items-center gap-1 text-[10px] md:text-xs text-yellow-500">
                      <Star size={12} fill="currentColor" /> 4.5
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-base md:text-lg font-medium">
                Order Reports
              </h2>
              <p className="text-[10px] md:text-xs text-red-400 mt-1 flex items-center gap-1">
                <Flame size={12} /> Wow! 800+ New order got this week
              </p>
            </div>
            <button className="text-xs md:text-sm text-gray-400 hover:text-white flex items-center gap-1">
              View More <ChevronRight size={16} />
            </button>
          </div>
          <div className="bg-[#18181b] rounded-3xl border border-white/5 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="p-4 font-medium">Customer Email</th>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.02] transition"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          C
                        </div>
                        <span>{order.customer_email}</span>
                      </td>
                      <td className="p-4 text-gray-400">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 font-medium">
                        ${Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : order.status === 'Out for Delivery'
                              ? 'bg-blue-500/10 text-blue-400'
                              : order.status === 'Ready'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-orange-500/10 text-orange-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <aside
        className={`fixed md:static inset-y-0 right-0 w-full sm:w-80 md:w-96 bg-[#111115] border-l border-white/5 p-4 md:p-6 flex flex-col z-50 transform transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h3 className="text-lg font-semibold text-white">Your Cart</h3>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 hidden md:block">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
            Delivery Address
          </h3>
          <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
            <div className="flex items-start gap-3">
              <MapPin className="text-orange-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium">
                  P6, 1478, Street No. 52, West New York
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Clock size={12} /> 20 min
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart size={16} /> Cart
            </h3>
            <span className="text-xs text-gray-500">Order ID: #89299</span>
          </div>

          <div className="flex bg-[#18181b] rounded-xl p-1 mb-6 border border-white/5">
            <button className="flex-1 bg-orange-500 text-white text-sm py-2 rounded-lg font-medium shadow-md">
              Delivery
            </button>
            <button className="flex-1 text-gray-400 text-sm py-2 hover:text-white">
              Dine in
            </button>
            <button className="flex-1 text-gray-400 text-sm py-2 hover:text-white">
              Takeaway
            </button>
          </div>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <ShoppingCart
                  size={40}
                  className="mx-auto mb-3 text-gray-500"
                />
                <p className="text-sm text-gray-400">Cart khali hai.</p>
                <p className="text-xs text-gray-500">
                  Dishes par (+) dabayein.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-[#18181b] p-3 rounded-2xl border border-white/5"
                >
                  <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-2xl">
                    {item.img}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="bg-white/5 p-1 rounded-md hover:bg-white/10"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="bg-white/5 p-1 rounded-md hover:bg-white/10"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-500">
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 mt-auto">
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Promotion Code"
              className="flex-1 bg-[#18181b] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50"
            />
            <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl text-sm font-medium transition">
              TRY NEW
            </button>
          </div>

          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Sub Total</span>
              <span>${subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Delivery Charge</span>
              <span>${deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-3 border-t border-white/5">
              <span>Total</span>
              <span className="text-orange-500">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleConfirmOrder}
            disabled={cart.length === 0}
            className="w-full bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Confirm Order
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 md:hidden flex justify-between">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <Settings size={18} /> Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </div>
  );
}
