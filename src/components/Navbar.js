'use client'
import Link from 'next/link'
import { ShoppingBag, ShieldCheck, Utensils } from 'lucide-react'

export default function Navbar({ cartCount = 0, onOpenCart }) {
  return (
    <header className="bg-white border-b sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-600">
          <Utensils className="w-6 h-6" />
          <span>RestoPos</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full hover:bg-emerald-100 transition font-medium"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Keranjang</span>
            {cartCount > 0 && (
              <span className="bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-lg text-sm font-medium border hover:border-emerald-300 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin / Kasir</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
