'use client'
import React from 'react'
import { Printer } from 'lucide-react'

export default function Receipt({ order, onClose }) {
  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  const formattedDate = new Date(order.created_at || Date.now()).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Action Bar (hidden on print) */}
        <div className="p-4 bg-slate-100 border-b flex justify-between items-center no-print">
          <h3 className="font-semibold text-slate-800">Struk Pembayaran</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              <Printer className="w-4 h-4" /> Cetak
            </button>
            <button
              onClick={onClose}
              className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-300 transition"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto printable-receipt font-mono text-sm leading-relaxed text-slate-800">
          <div className="text-center mb-4 border-b border-dashed pb-3">
            <h2 className="text-xl font-bold uppercase tracking-wider text-black">RESTO POS</h2>
            <p className="text-xs text-slate-500">Jl. Merdeka No. 123, Bandung</p>
            <p className="text-xs text-slate-500">Telp: 0812-3456-7890</p>
          </div>

          <div className="mb-3 text-xs border-b border-dashed pb-3 space-y-1">
            <div className="flex justify-between">
              <span>No Order:</span>
              <span className="font-semibold">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span>{order.customer_name || 'Guest'}</span>
            </div>
            <div className="flex justify-between">
              <span>Tipe:</span>
              <span>{order.order_type} {order.table_number ? `(Meja ${order.table_number})` : ''}</span>
            </div>
          </div>

          {/* Item List */}
          <table className="w-full text-xs border-b border-dashed pb-3 mb-3">
            <thead>
              <tr className="border-b border-slate-300 text-left">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Harga</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-1.5 max-w-[120px] truncate">{item.product_name}</td>
                  <td className="py-1.5 text-center">{item.quantity}</td>
                  <td className="py-1.5 text-right">{Number(item.price).toLocaleString('id-ID')}</td>
                  <td className="py-1.5 text-right">{Number(item.subtotal).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Calculation */}
          <div className="space-y-1 text-xs border-b border-dashed pb-3 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>PPN (11%)</span>
              <span>Rp {Number(order.tax).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-black pt-1 border-t">
              <span>GRAND TOTAL</span>
              <span>Rp {Number(order.grand_total).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 pt-1">
              <span>Pembayaran</span>
              <span className="uppercase font-medium">{order.payment_method || 'CASH'}</span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 space-y-1">
            <p className="font-semibold text-slate-700">*** TERIMA KASIH ***</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
