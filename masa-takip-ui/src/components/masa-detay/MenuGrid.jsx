import { useState, useMemo } from 'react'
import { Search, BookOpen } from 'lucide-react'
import KategoriFiltre from './KategoriFiltre'
import MenuUrunKarti from './MenuUrunKarti'
import useMasaStore from '../../store/useMasaStore'

/**
 * Right panel showing the full menu with category filter and search.
 * @param {number} masaId - Table ID to add products to
 */
export default function MenuGrid({ masaId }) {
  const [aktifKategoriId, setAktifKategoriId] = useState(0) // 0 = Tümü
  const [aramaMetni, setAramaMetni]           = useState('')
  const urunEkle = useMasaStore((s) => s.urunEkle)
  const urunler = useMasaStore((s) => s.urunler)
  const kategoriler = useMasaStore((s) => s.kategoriler)

  const filtreliUrunler = useMemo(() => {
    let liste = urunler
    // Kategori filtresi (0 = Tümü)
    if (aktifKategoriId !== 0) {
      liste = liste.filter((u) => u.kategoriId === aktifKategoriId)
    }
    // Arama filtresi
    if (aramaMetni.trim()) {
      const term = aramaMetni.toLowerCase()
      liste = liste.filter((u) => u.adi.toLowerCase().includes(term))
    }
    return liste
  }, [aktifKategoriId, aramaMetni, urunler])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <BookOpen size={14} className="text-blue-400" />
        </div>
        <span className="text-sm font-bold text-white">Menü</span>
        <span className="ml-auto text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg">
          {filtreliUrunler.length} ürün
        </span>
      </div>

      {/* Search */}
      <div className="px-4 py-2.5 border-b border-white/5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            id="input-menu-ara"
            type="text"
            className="input text-xs py-2"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Ürün ara..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
          />
        </div>
      </div>

      {/* Category filter */}
      <KategoriFiltre
        kategoriler={kategoriler}
        aktifId={aktifKategoriId}
        onSelect={(id) => { setAktifKategoriId(id); setAramaMetni('') }}
      />

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtreliUrunler.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
            <Search size={28} />
            <p className="text-sm font-medium">Ürün bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filtreliUrunler.map((urun, i) => (
              <div
                key={urun.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <MenuUrunKarti
                  urun={urun}
                  onEkle={(u) => urunEkle(masaId, u)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
