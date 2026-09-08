'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Receipt from '@/components/Receipt'
import { Eye, Search, Calendar } from 'lucide-react'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (orderData) {
      setOrders(orderData)
    }
  }

  const handleViewReceipt = async (order) => {
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    setSelectedOrder({
      ...order,
      items: items || [],
    })
  }

  const filteredOrders = orders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Riwayat Pesanan</h1>
          <p className="text-xs text-slate-500">Daftar seluruh transaksi dan cetak ulang struk</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No Order / Nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-4">Tanggal & Waktu</th>
              <th className="p-4">No. Transaksi</th>
              <th className="p-4">Pelanggan</th>
              <th className="p-4">Tipe / Meja</th>
              <th className="p-4">Metode</th>
              <th className="p-4">Total</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition">
                <td className="p-4 text-xs text-slate-500">
                  {new Date(order.created_at).toLocaleString('id-ID')}
                </td>
                <td className="p-4 font-semibold text-emerald-600">{order.order_number}</td>
                <td className="p-4 font-medium">{order.customer_name || 'Guest'}</td>
                <td className="p-4 text-xs">
                  {order.order_type} {order.table_number ? `(#${order.table_number})` : ''}
                </td>
                <td className="p-4 uppercase text-xs font-semibold">{order.payment_method}</td>
                <td className="p-4 font-bold text-slate-800">
                  Rp {Number(order.grand_total).toLocaleString('id-ID')}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleViewReceipt(order)}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detail / Struk
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <Receipt order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  )
}
