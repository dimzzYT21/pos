
/** @type {import('next').NextConfig} */
import { redirect } from 'next/navigation'

const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
}
export default function RootPage() {
  // Langsung alihkan pengguna ke halaman aplikasi/kasir
  redirect('/admin/pos')
}

module.exports = nextConfig
