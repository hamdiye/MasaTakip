import { useEffect } from 'react'
import {
  BarChart2,
  DollarSign,
  CreditCard,
  TrendingUp,
  RotateCw,
  ShoppingBag,
  Clock,
  User,
  Utensils,
  AlertOctagon
} from 'lucide-react'
import useMasaStore from '../store/useMasaStore'
import useAuthStore from '../store/useAuthStore'
import clsx from 'clsx'

export default function RaporPage() {
  const { raporData, loadRaporlar, isLoading } = useMasaStore()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.rol === 'Admin'

  useEffect(() => {
    if (isAdmin) {
      loadRaporlar()
    }
  }, [loadRaporlar, isAdmin])

  // Non-admin Access Denied View
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertOctagon size={28} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white mb-1">Erişim Engellendi</h1>
          <p className="text-sm text-slate-500 max-w-sm">
            Raporlama ekranını görüntülemek için yönetici yetkilerine sahip olmanız gerekmektedir.
          </p>
        </div>
      </div>
    )
  }

  // Loading/Skeleton state
  if (isLoading && !raporData) {
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-7xl mx-auto w-full pb-24 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/5" />
            <div>
              <div className="h-6 w-32 bg-white/5 rounded mb-2" />
              <div className="h-3 w-48 bg-white/5 rounded" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 h-28" />
          ))}
        </div>

        {/* Content Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-5 h-[400px]" />
          <div className="glass rounded-2xl p-5 h-[400px]" />
        </div>
      </div>
    )
  }

  const {
    bugunToplam = 0,
    buHaftaToplam = 0,
    toplamNakit = 0,
    toplamKrediKarti = 0,
    enCokSatanUrunler = [],
    sonSatislar = []
  } = raporData || {}

  // Helper to find the maximum sales count for scaling the visual progress bars
  const maxAdet = enCokSatanUrunler.length > 0 ? Math.max(...enCokSatanUrunler.map(u => u.toplamAdet)) : 1

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <BarChart2 className="text-orange-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Raporlar &amp; Analiz</h1>
            <p className="text-xs text-slate-400">Satış verileri ve işletme performans özetleri</p>
          </div>
        </div>

        <button
          onClick={loadRaporlar}
          disabled={isLoading}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-all text-slate-400 hover:text-white"
          title="Verileri Yenile"
        >
          <RotateCw size={16} className={clsx(isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 stagger animate-fade-in">
        {/* Today's Turnover */}
        <div className="glass rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp size={22} />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bugünün Cirosu</span>
            <span className="text-2xl font-black text-white mt-1 block">
              ₺{bugunToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Weekly Turnover */}
        <div className="glass rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <DollarSign size={22} />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bu Haftanın Cirosu</span>
            <span className="text-2xl font-black text-white mt-1 block">
              ₺{buHaftaToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Column 1: Top Selling Items */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <ShoppingBag className="text-orange-400" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">En Çok Satan Ürünler</h3>
          </div>

          {enCokSatanUrunler.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
              <Utensils size={32} className="mb-2 text-slate-600" />
              <p className="text-xs">Henüz tamamlanmış satış verisi bulunmuyor.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              {enCokSatanUrunler.map((item, index) => {
                const widthPercent = (item.toplamAdet / maxAdet) * 100
                return (
                  <div key={index} className="flex flex-col gap-1.5">
                    {/* Item header */}
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 text-slate-200">
                        <span className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {index + 1}
                        </span>
                        <span>{item.urunAdi}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{item.toplamAdet} adet</span>
                        <span className="font-bold text-white">₺{item.toplamTutar.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-lg bg-white/5 overflow-hidden">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className="h-full bg-gradient-to-r from-orange-500/80 to-orange-400/80 rounded-lg transition-all duration-500"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Column 2: Recent Transactions */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Clock className="text-orange-400" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Son Satışlar (Son 10)</h3>
          </div>

          {sonSatislar.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
              <Clock size={32} className="mb-2 text-slate-600" />
              <p className="text-xs">Yakın zamanda gerçekleştirilmiş bir satış bulunmuyor.</p>
            </div>
          ) : (
            <div className="flex-col overflow-y-auto max-h-[340px] pr-1 flex gap-2">
              {sonSatislar.map((satis, index) => {
                const isNakit = satis.odemeTipi === 'Nakit'
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 transition-all"
                  >
                    {/* Left: Payment Type Icon & Table details */}
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          'w-9 h-9 rounded-lg flex items-center justify-center border',
                          isNakit
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/15'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                        )}
                      >
                        {isNakit ? <DollarSign size={16} /> : <CreditCard size={16} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{satis.masaAdi}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-medium">
                          <span className="flex items-center gap-0.5">
                            <User size={10} />
                            {satis.kapatanKullanici}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(satis.kapanisTarihi).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Badge */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-black text-slate-100">
                        ₺{satis.toplamTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className={clsx(
                          'text-[8px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full',
                          isNakit
                            ? 'bg-orange-500/10 text-orange-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        )}
                      >
                        {isNakit ? 'Nakit' : 'Kart'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
