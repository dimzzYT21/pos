
/** @type {import('next').NextConfig} */
// import { redirect } from 'next/navigation'

const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
}
// export default function RootPage() {
//   // Langsung alihkan pengguna ke halaman aplikasi/kasir
//   redirect('/src/app')
// }

module.exports = nextConfig
