'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Edit, Package } from 'lucide-react'

export default function ProductManagement() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: pData } = await supabase.from('products').select('*')
    const { data: cData } = await supabase.from('categories').select('*')
    if (pData) setProducts(pData)
    if (cData) setCategories(cData)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('products').insert([
      {
        name,
        category_id: categoryId ? Number(categoryId) : null,
        price: Number(price),
        image_url: imageUrl || 'https://via.placeholder.com/300?text=No+Image',
      },
    ])

    if (error) alert('Gagal menambah produk: ' + error.message)
    else {
      fetchData()
      setIsModalOpen(false)
      setName('')
      setPrice('')
      setImageUrl('')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      await supabase.from('products').delete().eq('id', id)
      fetchData()
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Produk</h1>
          <p className="text-xs text-slate-500">Kelola menu makanan, harga, dan gambar</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-4">Produk</th>
              <th className="p-4">Harga</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 flex items-center gap-3">
                  <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                  <span className="font-semibold text-slate-800">{p.name}</span>
                </td>
                <td className="p-4 font-bold">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-slate-800 mb-4">Tambah Produk Baru</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none mt-1 bg-white"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">URL Gambar</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
