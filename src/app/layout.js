import './globals.css'

export const metadata = {
  title: 'POS & Ordering System',
  description: 'Sistem Kasir POS dan Pemesanan Online Terintegrasi Supabase',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
