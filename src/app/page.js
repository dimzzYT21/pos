'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Receipt from '@/components/Receipt'
import { supabase } from '@/lib/supabase'
import { Plus, Minus, Trash2, ShoppingCart, CheckCircle, Utensils, Coffee, AlertCircle } from 'lucide-react'

export default function CustomerFrontend() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Checkout Form State
  const [customerName, setCustomerName] = useState('')
  const [orderType, setOrderType] = useState('Dine-In')
  const [tableNumber, setTableNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').eq('is_available', true)
    if (data) setProducts(data)
  }

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.11
  const grandTotal = subtotal + tax

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((p) => p.category_id === Number(selectedCategory))

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (cart.length === 0) return alert('Keranjang belanja kosong!')
    if (!customerName) return alert('Mohon isi nama pemesan!')

    setIsSubmitting(true)
    const orderNum = 'ORD-' + Math.floor(100000 + Math.random() * 900000)

    try {
      // 1. Insert Order Header
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNum,
            customer_name: customerName,
            order_type: orderType,
            table_number: tableNumber || null,
            total_amount: subtotal,
            tax: tax,
            grand_total: grandTotal,
            payment_method: paymentMethod,
            status: 'completed',
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Insert Order Items
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      setCompletedOrder({
        ...orderData,
        items: orderItems,
      })

      setCart([])
      setIsCartOpen(false)
      setCustomerName('')
      setTableNumber('')
    } catch (err) {
      alert('Gagal membuat pesanan: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar cartCount={cart.reduce((a, b) => a + b.quantity, 0)} onOpenCart={() => setIsCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Banner Welcome */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-10 text-white mb-8 shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Selamat Datang di RestoPOS</h1>
          <p className="text-emerald-100 max-w-xl text-sm sm:text-base">
            Pilih menu favorit Anda, pesan secara mandiri, dan nikmati hidangan lezat kami.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 border hover:bg-slate-100'
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                <img
                  src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg mb-1">{product.name}</h3>
                  <p className="text-emerald-600 font-bold text-base mb-4">
                    Rp {Number(product.price).toLocaleString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" /> Tambah Ke Keranjang
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                Keranjang Pesanan
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>Keranjang Anda masih kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{item.name}</h4>
                      <p className="text-xs text-slate-500">
                        Rp {Number(item.price).toLocaleString('id-ID')} x {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-emerald-600 mt-1">
                        Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-white rounded transition text-slate-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-sm px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-white rounded transition text-slate-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="p-4 border-t bg-slate-50 space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>PPN (11%)</span>
                    <span>Rp {tax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-slate-900 pt-1 border-t">
                    <span>Total</span>
                    <span className="text-emerald-600">Rp {grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Nama Pemesan *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="Dine-In">Dine-In (Makan di tempat)</option>
                      <option value="Takeaway">Takeaway (Bawa Pulang)</option>
                    </select>
                    {orderType === 'Dine-In' && (
                      <input
                        type="text"
                        placeholder="No. Meja"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                      />
                    )}
                  </div>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Cash">Tunai (Cash)</option>
                    <option value="QRIS">QRIS / E-Wallet</option>
                    <option value="Transfer">Transfer Bank</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Konfirmasi & Bayar'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Receipt setelah pemesanan */}
      {completedOrder && (
        <Receipt order={completedOrder} onClose={() => setCompletedOrder(null)} />
      )}
    </div>
  )
}
