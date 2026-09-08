'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    todaySales: 0,
    todayOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (orders) {
      const totalS = orders.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0)
      const totalO = orders.length

      const todayStr = new Date().toISOString().split('T')[0]
      const todayFilter = orders.filter((o) => o.created_at?.startsWith(todayStr))
      const todayS = todayFilter.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0)

      setStats({
        totalSales: totalS,
        totalOrders: totalO,
        todaySales: todayS,
        todayOrders: todayFilter.length,
      })

      setRecentOrders(orders.slice(0, 5))
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Ringkasan</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold uppercase">Penjualan Hari Ini</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800">
            Rp {stats.todaySales.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{stats.todayOrders} Pesanan Hari Ini</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Akumulasi</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800">
            Rp {stats.totalSales.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Keseluruhan Omset</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Transaksi</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800">{stats.totalOrders}</h3>
          <p className="text-xs text-slate-400 mt-1">Transaksi Berhasil</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold uppercase">Status Server</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-emerald-600">Terhubung</h3>
          <p className="text-xs text-slate-400 mt-1">Supabase DB Active</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-bold text-slate-800 text-lg mb-4">Transaksi Terakhir</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="p-3">No Order</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Tipe</th>
                <th className="p-3">Total</th>
                <th className="p-3">Metode</th>
                <th className="p-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-emerald-600">{order.order_number}</td>
                  <td className="p-3">{order.customer_name || 'Guest'}</td>
                  <td className="p-3">{order.order_type}</td>
                  <td className="p-3 font-bold">Rp {Number(order.grand_total).toLocaleString('id-ID')}</td>
                  <td className="p-3 uppercase text-xs">{order.payment_method}</td>
                  <td className="p-3 text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
