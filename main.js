import { redirect } from 'next/navigation'

export default function RootPage() {
  // Pilihan 1: Langsung alihkan ke halaman Kasir POS Admin
  redirect('/admin/pos')

  // Pilihan 2: Atau alihkan ke halaman Login jika ingin keamanan ekstra
  // redirect('/login')
}
