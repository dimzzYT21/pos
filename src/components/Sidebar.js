'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, History, Package, LogOut, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menu = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Kasir (POS)', href: '/admin/pos', icon: ShoppingCart },
    { name: 'Riwayat Pesanan', href: '/admin/orders', icon: History },
    { name: 'Manajemen Produk', href: '/admin/products', icon: Package },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between p-4 no-print">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-6">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold">
            P
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide">POS ADMIN</h2>
            <p className="text-xs text-slate-400">Control Panel</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Store className="w-4 h-4" /> Lihat Mode Kostumer
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-4 h-4" /> Keluar (Logout)
        </button>
      </div>
    </aside>
  )
}
