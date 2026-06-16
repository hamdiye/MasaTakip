import { useState, useEffect, useRef } from 'react'
import {
  BookOpen,
  Plus,
  FolderPlus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  Layers,
  Tag,
  AlertCircle
} from 'lucide-react'
import useMasaStore from '../store/useMasaStore'
import useAuthStore from '../store/useAuthStore'
import clsx from 'clsx'

export default function MenuYonetimPage() {
  const {
    urunler,
    kategoriler,
    loadUrunler,
    loadKategoriler,
    kategoriEkleAdmin,
    urunEkleAdmin,
    urunGuncelleAdmin,
    urunSilAdmin,
    isLoading
  } = useMasaStore()

  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.rol === 'Admin'

  // Filter and search state
  const [aktifKategoriId, setAktifKategoriId] = useState(0) // 0 is "Tümü"
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [isUrunModalOpen, setIsUrunModalOpen] = useState(false)
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'

  // Selected entities for edit/delete
  const [selectedUrun, setSelectedUrun] = useState(null)

  // Form states
  const [urunForm, setUrunForm] = useState({
    adi: '',
    fiyat: '',
    kategoriId: ''
  })
  const [gorselDosya, setGorselDosya] = useState(null)
  const [gorselOnizleme, setGorselOnizleme] = useState('')
  const [kategoriAdi, setKategoriAdi] = useState('')

  // Form error and pending states
  const [formError, setFormError] = useState('')
  const [isSubmitPending, setIsSubmitPending] = useState(false)

  const fileInputRef = useRef(null)

  // Load products and categories on mount
  useEffect(() => {
    loadUrunler()
    loadKategoriler()
  }, [loadUrunler, loadKategoriler])

  // Reset category dropdown default when categories load or change
  useEffect(() => {
    const validCats = kategoriler.filter(c => c.id !== 0)
    if (validCats.length > 0 && !urunForm.kategoriId) {
      setUrunForm(prev => ({ ...prev, kategoriId: validCats[0].id }))
    }
  }, [kategoriler, urunForm.kategoriId])

  // Get image URL helper
  const getGorselUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http') || path.startsWith('data:')) return path
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5115'
    return `${base}${path}`
  }

  // Handle product edit initiation
  const handleEditInit = (urun) => {
    setModalMode('edit')
    setSelectedUrun(urun)
    setUrunForm({
      adi: urun.adi,
      fiyat: urun.fiyat.toString(),
      kategoriId: urun.kategoriId
    })
    setGorselDosya(null)
    setGorselOnizleme(getGorselUrl(urun.gorselUrl) || '')
    setFormError('')
    setIsUrunModalOpen(true)
  }

  // Handle product add initiation
  const handleAddInit = () => {
    setModalMode('add')
    setSelectedUrun(null)
    const validCats = kategoriler.filter(c => c.id !== 0)
    setUrunForm({
      adi: '',
      fiyat: '',
      kategoriId: validCats.length > 0 ? validCats[0].id : ''
    })
    setGorselDosya(null)
    setGorselOnizleme('')
    setFormError('')
    setIsUrunModalOpen(true)
  }

  // Handle category add initiation
  const handleKategoriInit = () => {
    setKategoriAdi('')
    setFormError('')
    setIsKategoriModalOpen(true)
  }

  // Handle product delete initiation
  const handleDeleteInit = (urun) => {
    setSelectedUrun(urun)
    setIsDeleteModalOpen(true)
  }

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Görsel boyutu 5 MB\'tan büyük olamaz.')
      return
    }

    setGorselDosya(file)
    setFormError('')

    const reader = new FileReader()
    reader.onloadend = () => {
      setGorselOnizleme(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Product submit handler
  const handleUrunSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!urunForm.adi.trim()) {
      setFormError('Lütfen ürün adını giriniz.')
      return
    }

    const fiyatValue = parseFloat(urunForm.fiyat)
    if (isNaN(fiyatValue) || fiyatValue <= 0) {
      setFormError('Lütfen geçerli bir fiyat giriniz (0\'dan büyük).')
      return
    }

    if (!urunForm.kategoriId) {
      setFormError('Lütfen bir kategori seçiniz.')
      return
    }

    setIsSubmitPending(true)

    const requestData = {
      adi: urunForm.adi.trim(),
      fiyat: fiyatValue,
      kategoriId: parseInt(urunForm.kategoriId)
    }

    let result
    if (modalMode === 'add') {
      result = await urunEkleAdmin(requestData, gorselDosya)
    } else {
      result = await urunGuncelleAdmin(selectedUrun.id, requestData, gorselDosya)
    }

    setIsSubmitPending(false)

    if (result.success) {
      if (result.warning) {
        alert(result.warning)
      }
      setIsUrunModalOpen(false)
    } else {
      setFormError(result.message)
    }
  }

  // Category submit handler
  const handleKategoriSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!kategoriAdi.trim()) {
      setFormError('Lütfen kategori adını giriniz.')
      return
    }

    setIsSubmitPending(true)
    const result = await kategoriEkleAdmin(kategoriAdi.trim())
    setIsSubmitPending(false)

    if (result.success) {
      setIsKategoriModalOpen(false)
    } else {
      setFormError(result.message)
    }
  }

  // Product delete handler
  const handleUrunDelete = async () => {
    if (!selectedUrun) return
    setIsSubmitPending(true)
    const result = await urunSilAdmin(selectedUrun.id)
    setIsSubmitPending(false)

    if (result.success) {
      setIsDeleteModalOpen(false)
      setSelectedUrun(null)
    } else {
      alert(result.message)
    }
  }

  // Filter logic
  const filtrelenmisUrunler = urunler.filter((u) => {
    const matchKategori = aktifKategoriId === 0 || u.kategoriId === aktifKategoriId
    const matchSearch = u.adi.toLowerCase().includes(searchQuery.toLowerCase())
    return matchKategori && matchSearch
  })

  // Calculate statistics
  const toplamUrun = urunler.length
  const toplamKategori = kategoriler.filter(c => c.id !== 0).length
  const ortalamaFiyat =
    toplamUrun > 0
      ? (urunler.reduce((sum, u) => sum + u.fiyat, 0) / toplamUrun).toFixed(2)
      : '0.00'

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <BookOpen className="text-orange-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Menü Yönetimi</h1>
            <p className="text-xs text-slate-400">Restoran menüsünü ve kategorilerini düzenleyin</p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleKategoriInit}
              className="btn btn-ghost text-xs md:text-sm"
            >
              <FolderPlus size={16} />
              Kategori Ekle
            </button>
            <button
              type="button"
              onClick={handleAddInit}
              className="btn btn-primary text-xs md:text-sm"
            >
              <Plus size={16} />
              Yeni Ürün Ekle
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 stagger animate-fade-in">
        <div className="glass rounded-2xl p-3 md:p-4 flex flex-col justify-between">
          <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Toplam Ürün</span>
          <span className="text-lg md:text-2xl font-black text-white mt-1">{toplamUrun}</span>
        </div>
        <div className="glass rounded-2xl p-3 md:p-4 flex flex-col justify-between">
          <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Kategori</span>
          <span className="text-lg md:text-2xl font-black text-orange-400 mt-1">{toplamKategori}</span>
        </div>
        <div className="glass rounded-2xl p-3 md:p-4 flex flex-col justify-between">
          <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Ort. Fiyat</span>
          <span className="text-lg md:text-2xl font-black text-emerald-400 mt-1">₺{ortalamaFiyat}</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 mb-6 animate-fade-in">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
          <input
            type="text"
            placeholder="Ürün adı ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.5rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto scroll-x-hidden pb-1 stagger">
          {kategoriler.map((kat) => {
            const isAktif = aktifKategoriId === kat.id
            return (
              <button
                key={kat.id}
                onClick={() => setAktifKategoriId(kat.id)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border',
                  isAktif
                    ? 'bg-orange-500/15 border-orange-500/40 text-orange-400 shadow-md shadow-orange-500/5'
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/8'
                )}
              >
                {kat.adi}
              </button>
            )
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filtrelenmisUrunler.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center flex flex-col items-center justify-center animate-fade-in min-h-[300px]">
          <BookOpen className="text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-white mb-1">Ürün Bulunamadı</h3>
          <p className="text-sm text-slate-400 max-w-sm">
            {searchQuery || aktifKategoriId !== 1
              ? 'Arama kriterlerinize veya kategori filtresine uygun bir menü ürünü bulunamadı.'
              : 'Menüde henüz hiç ürün bulunmamaktadır. Eklemek için admin hesabı kullanabilirsiniz.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {filtrelenmisUrunler.map((urun) => (
            <div
              key={urun.id}
              className="glass rounded-2xl overflow-hidden flex flex-col hover:border-white/15 transition-all duration-300 group"
            >
              {/* Product Image */}
              <div className="aspect-[4/3] bg-white/5 relative flex items-center justify-center overflow-hidden border-b border-white/5">
                {urun.gorselUrl ? (
                  <img
                    src={getGorselUrl(urun.gorselUrl)}
                    alt={urun.adi}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // fallback to placeholder icon if image fails to load
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className={clsx(
                    'w-full h-full flex items-center justify-center text-4xl select-none',
                    urun.gorselUrl ? 'hidden' : 'flex'
                  )}
                >
                  {urun.emoji || '🍽️'}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/15">
                      {urun.kategoriAdi}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 line-clamp-2 leading-snug">
                    {urun.adi}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-base font-black text-white">
                    ₺{urun.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditInit(urun)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                        title="Düzenle"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteInit(urun)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── MODAL: Add / Edit Product ────────────────────────────── */}
      {isUrunModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsUrunModalOpen(false)
          }}
        >
          <div className="glass-strong rounded-2xl w-full max-w-md overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Tag size={16} className="text-orange-400" />
                {modalMode === 'add' ? 'Yeni Ürün Ekle' : 'Ürünü Düzenle'}
              </h3>
              <button
                onClick={() => setIsUrunModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUrunSubmit} className="p-5 flex flex-col gap-4">
              {formError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ürün Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Izgara Tavuk"
                  value={urunForm.adi}
                  onChange={(e) => setUrunForm({ ...urunForm, adi: e.target.value })}
                  className="input"
                  disabled={isSubmitPending}
                />
              </div>

              {/* Product Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fiyat (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={urunForm.fiyat}
                    onChange={(e) => setUrunForm({ ...urunForm, fiyat: e.target.value })}
                    className="input"
                    disabled={isSubmitPending}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kategori</label>
                  <select
                    value={urunForm.kategoriId}
                    onChange={(e) => setUrunForm({ ...urunForm, kategoriId: e.target.value })}
                    className="input"
                    disabled={isSubmitPending}
                  >
                    {kategoriler
                      .filter((c) => c.id !== 0)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                          {cat.adi}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ürün Görseli</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {gorselOnizleme ? (
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                    <img src={gorselOnizleme} alt="Onizleme" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="btn btn-ghost text-xs py-1.5 px-3"
                      >
                        Değiştir
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGorselDosya(null)
                          setGorselOnizleme('')
                        }}
                        className="btn btn-danger text-xs py-1.5 px-3"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="aspect-[16/9] rounded-xl border-2 border-dashed border-white/10 hover:border-orange-500/40 hover:bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                  >
                    <ImageIcon className="text-slate-500" size={28} />
                    <span className="text-xs text-slate-400 font-semibold">Görsel seçmek için tıklayın</span>
                    <span className="text-[10px] text-slate-500 font-medium">JPEG, PNG veya WEBP (Maks: 5 MB)</span>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsUrunModalOpen(false)}
                  className="btn btn-ghost"
                  disabled={isSubmitPending}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary min-w-[100px]"
                  disabled={isSubmitPending}
                >
                  {isSubmitPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Add Category ────────────────────────────── */}
      {isKategoriModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsKategoriModalOpen(false)
          }}
        >
          <div className="glass-strong rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers size={16} className="text-orange-400" />
                Yeni Kategori Ekle
              </h3>
              <button
                onClick={() => setIsKategoriModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleKategoriSubmit} className="p-5 flex flex-col gap-4">
              {formError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kategori Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Salatalar"
                  value={kategoriAdi}
                  onChange={(e) => setKategoriAdi(e.target.value)}
                  className="input"
                  disabled={isSubmitPending}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsKategoriModalOpen(false)}
                  className="btn btn-ghost"
                  disabled={isSubmitPending}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary min-w-[100px]"
                  disabled={isSubmitPending}
                >
                  {isSubmitPending ? 'Ekleniyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Delete Product Confirmation ──────────────── */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsDeleteModalOpen(false)
          }}
        >
          <div className="glass-strong rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="p-5 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Ürünü Sil</h3>
              <p className="text-sm text-slate-400 mb-6">
                <strong>&quot;{selectedUrun?.adi}&quot;</strong> ürününü menüden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>

              <div className="flex items-center justify-center gap-2 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="btn btn-ghost flex-1"
                  disabled={isSubmitPending}
                >
                  İptal
                </button>
                <button
                  onClick={handleUrunDelete}
                  className="btn btn-danger flex-1"
                  disabled={isSubmitPending}
                >
                  {isSubmitPending ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
