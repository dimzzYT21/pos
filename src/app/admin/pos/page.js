'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Receipt from '@/components/Receipt'
import { Plus, Minus, Trash2, ShoppingCart, CreditCard } from 'lucide-react'

export default function CashierPOS() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('Pelanggan Langsung')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [completedOrder, setCompletedOrder] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

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

  const handleProcessOrder = async () => {
    if (cart.length === 0) return alert('Pilih produk terlebih dahulu!')

    const orderNum = 'POS-' + Math.floor(100000 + Math.random() * 900000)

    const { data: orderData, error } = await supabase
      .from('orders')
      .insert([
        {
          order_number: orderNum,
          customer_name: customerName,
          order_type: 'Dine-In',
          total_amount: subtotal,
          tax: tax,
          grand_total: grandTotal,
          payment_method: paymentMethod,
          status: 'completed',
        },
      ])
      .select()
      .single()

    if (error) return alert('Gagal memproses transaksi')

    const orderItems = cart.map((item) => ({
      order_id: orderData.id,
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    await supabase.from('order_items').insert(orderItems)

    setCompletedOrder({
      ...orderData,
      items: orderItems,
    })

    setCart([])
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Product Catalog Left */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Interface Kasir (POS)</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white border rounded-2xl p-3 text-left hover:border-emerald-500 hover:shadow-md transition group flex flex-col justify-between h-40"
            >
              <div>
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">{p.name}</h3>
              </div>
              <div>
                <p className="text-emerald-600 font-bold text-sm">
                  Rp {Number(p.price).toLocaleString('id-ID')}
                </p>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full mt-1 inline-block">
                  Klik untuk tambah
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar Right */}
      <div className="w-96 bg-white border-l flex flex-col justify-between shadow-lg">
        <div className="p-4 border-b bg-slate-50">
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" /> Transaksi Baru
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <h4 className="font-medium text-slate-800 text-sm">{item.name}</h4>
                <p className="text-xs text-slate-400">
                  Rp {Number(item.price).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1 border rounded hover:bg-slate-100"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1 border rounded hover:bg-slate-100"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-slate-50 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>PPN 11%</span>
              <span>Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-extrabold text-lg text-slate-800 pt-2 border-t">
              <span>Total</span>
              <span className="text-emerald-600">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama Pelanggan"
              className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
            >
              <option value="Cash font-semibold">Tunai (Cash)</option>
              <option value="QRIS">QRIS</option>
              <option value="Debit / Kartu">Debit / Kartu</option>
            </select>
            <button
              onClick={handleProcessOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <CreditCard className="w-4 h-4" /> Bayar & Cetak Struk
            </button>
          </div>
        </div>
      </div>

      {completedOrder && (
        <Receipt order={completedOrder} onClose={() => setCompletedOrder(null)} />
      )}
    </div>
  )
}
