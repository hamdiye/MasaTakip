import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Receipt, BookOpen } from 'lucide-react'
import AdisyonListesi from '../components/masa-detay/AdisyonListesi'
import MenuGrid from '../components/masa-detay/MenuGrid'
import useMasaStore from '../store/useMasaStore'
import clsx from 'clsx'

const SEKMELER = [
  { id: 'adisyon', label: 'Adisyon', icon: Receipt   },
  { id: 'menu',   label: 'Menü',    icon: BookOpen   },
]

/**
 * Table detail page with split-panel layout.
 * - Mobile: tab-based (Adisyon | Menü)
 * - Tablet+: side-by-side panels
 */
export default function MasaDetayPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const masaId    = parseInt(id, 10)
  const [aktifSekme, setAktifSekme] = useState('adisyon')

  const masalar = useMasaStore((s) => s.masalar)
  const loadMasalar = useMasaStore((s) => s.loadMasalar)
  const loadUrunler = useMasaStore((s) => s.loadUrunler)
  const loadAktifAdisyon = useMasaStore((s) => s.loadAktifAdisyon)

  const masa    = masalar.find((m) => m.id === masaId)

  useEffect(() => {
    if (masalar.length === 0) {
      loadMasalar()
    }
    loadUrunler()
    loadAktifAdisyon(masaId)
  }, [masaId, loadMasalar, loadUrunler, loadAktifAdisyon, masalar.length])

  if (!masa) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-slate-500">
        <p className="text-lg font-bold">Masa bulunamadı</p>
        <button onClick={() => navigate('/')} className="btn btn-ghost">
          <ArrowLeft size={15} /> Geri Dön
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <button
          id="btn-geri"
          onClick={() => navigate('/')}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all active:scale-90"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-extrabold text-white truncate">{masa.adi}</h1>
          <p className="text-xs text-slate-500">Masa Detayı & Sipariş</p>
        </div>

        {/* Status badge */}
        <span
          className={clsx(
            'badge text-xs',
            masa.durum === 'Dolu' ? 'badge-dolu' : 'badge-bos'
          )}
        >
          <span
            className={clsx(
              'w-1.5 h-1.5 rounded-full',
              masa.durum === 'Dolu' ? 'bg-red-400' : 'bg-emerald-400'
            )}
          />
          {masa.durum === 'Dolu' ? 'Dolu' : 'Boş'}
        </span>
      </div>

      {/* ── Mobile: Tab switcher ──────────────────────────────── */}
      <div className="md:hidden flex border-b border-white/5">
        {SEKMELER.map(({ id: sekmeId, label, icon: Icon }) => {
          const isActive = aktifSekme === sekmeId
          return (
            <button
              key={sekmeId}
              id={`btn-sekme-${sekmeId}`}
              onClick={() => setAktifSekme(sekmeId)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all duration-200',
                'border-b-2',
                isActive
                  ? 'text-orange-400 border-orange-400'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Split Panel Layout ────────────────────────────────── */}
      {/* Desktop: yan yana | Mobil: sekme bazlı */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sol Panel – Adisyon Listesi */}
        <div
          className={clsx(
            'flex flex-col min-h-0 overflow-hidden',
            // Mobil: sadece 'adisyon' sekmesinde göster
            aktifSekme === 'adisyon' ? 'flex' : 'hidden',
            // Tablet+: her zaman göster, genişlik %40
            'md:flex md:w-2/5 lg:w-[38%]'
          )}
        >
          <AdisyonListesi masaId={masaId} />
        </div>

        {/* Sağ Panel – Menü Grid */}
        <div
          className={clsx(
            'flex flex-col min-h-0 overflow-hidden',
            aktifSekme === 'menu' ? 'flex w-full' : 'hidden',
            'md:flex md:flex-1'
          )}
        >
          <MenuGrid masaId={masaId} />
        </div>
      </div>
    </div>
  )
}
