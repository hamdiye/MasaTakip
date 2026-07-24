import { useEffect, useState, useMemo, useCallback } from 'react'
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
  AlertOctagon,
  Trash2,
  AlertCircle,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import useMasaStore from '../store/useMasaStore'
import useAuthStore from '../store/useAuthStore'
import Modal from '../components/common/Modal'
import clsx from 'clsx'

// ─── Date helpers ────────────────────────────────────────────────────────────
const toISODate = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getPreset = (preset) => {
  const now = new Date()
  if (preset === 'bugun') {
    return { bas: toISODate(now), bitis: toISODate(now) }
  }
  if (preset === 'hafta') {
    const diff = (7 + now.getDay() - 1) % 7 // Monday
    const mon = new Date(now); mon.setDate(now.getDate() - diff)
    return { bas: toISODate(mon), bitis: toISODate(now) }
  }
  if (preset === 'ay') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    return { bas: toISODate(first), bitis: toISODate(now) }
  }
  return { bas: '', bitis: '' }
}

const formatTarih = (isoStr) => {
  const d = new Date(isoStr)
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function RaporPage() {
  const { raporData, loadRaporlar, loadSatislar, satisSilAdmin, satislar, isLoading } = useMasaStore()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.rol === 'Admin'

  // ── Filter state ──────────────────────────────────────────────────────────
  const [aktifPreset, setAktifPreset] = useState('bugun')
  const [baslangic, setBaslangic] = useState(() => getPreset('bugun').bas)
  const [bitis, setBitis] = useState(() => getPreset('bugun').bitis)

  // ── Delete modal state ────────────────────────────────────────────────────
  const [silModal, setSilModal] = useState(false)
  const [seciliSatis, setSeciliSatis] = useState(null)
  const [silError, setSilError] = useState('')
  const [silPending, setSilPending] = useState(false)

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAdmin) {
      loadRaporlar()
      loadSatislar(baslangic, bitis)
    }
  }, [isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Apply preset ──────────────────────────────────────────────────────────
  const applyPreset = useCallback((preset) => {
    const { bas, bitis: bit } = getPreset(preset)
    setAktifPreset(preset)
    setBaslangic(bas)
    setBitis(bit)
    loadSatislar(bas, bit)
  }, [loadSatislar])

  // ── Custom date apply ──────────────────────────────────────────────────────
  const handleCustomApply = () => {
    setAktifPreset('')
    loadSatislar(baslangic || null, bitis || null)
  }

  // ── Delete handlers ────────────────────────────────────────────────────────
  const handleSilClick = (satis) => {
    setSeciliSatis(satis)
    setSilError('')
    setSilModal(true)
  }

  const handleSilConfirm = async () => {
    if (!seciliSatis) return
    setSilPending(true)
    setSilError('')
    const res = await satisSilAdmin(seciliSatis.adisyonId)
    setSilPending(false)
    if (res.success) {
      setSilModal(false)
      setSeciliSatis(null)
    } else {
      setSilError(res.message || 'Satış silinemedi.')
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const {
    bugunToplam = 0,
    buHaftaToplam = 0,
    enCokSatanUrunler = [],
    sonSatislar = [],
  } = raporData || {}

  const maxAdet = enCokSatanUrunler.length > 0
    ? Math.max(...enCokSatanUrunler.map((u) => u.toplamAdet))
    : 1

  const satislarToplam = useMemo(
    () => satislar.reduce((s, a) => s + a.toplamTutar, 0),
    [satislar]
  )

  // ── Non-admin ─────────────────────────────────────────────────────────────
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

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading && !raporData) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-7xl mx-auto w-full pb-24 animate-pulse">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[1, 2].map((i) => <div key={i} className="glass rounded-2xl p-5 h-28" />)}
        </div>
        <div className="glass rounded-2xl p-5 h-[400px] mb-6" />
        <div className="glass rounded-2xl p-5 h-[500px]" />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-7xl mx-auto w-full pb-24">

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
          onClick={() => { loadRaporlar(); loadSatislar(baslangic || null, bitis || null) }}
          disabled={isLoading}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-all text-slate-400 hover:text-white"
          title="Verileri Yenile"
        >
          <RotateCw size={16} className={clsx(isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fade-in">
        {/* Today's Turnover */}
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
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
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
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

      {/* Top Selling Items */}
      <div className="glass rounded-2xl p-5 flex flex-col gap-4 mb-6 animate-fade-in">
        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
          <ShoppingBag className="text-orange-400" size={18} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">En Çok Satan Ürünler</h3>
        </div>

        {enCokSatanUrunler.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 py-8">
            <Utensils size={32} className="mb-2 text-slate-600" />
            <p className="text-xs">Henüz tamamlanmış satış verisi bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-1">
            {enCokSatanUrunler.map((item, index) => {
              const widthPercent = (item.toplamAdet / maxAdet) * 100
              return (
                <div key={index} className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2 text-slate-200">
                      <span className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center text-[10px] font-bold text-orange-400">
                        {index + 1}
                      </span>
                      <span>{item.urunAdi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{item.toplamAdet} adet</span>
                      <span className="font-bold text-white">₺{item.toplamTutar.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-lg bg-white/5 overflow-hidden">
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

      {/* ── Tüm Satışlar ─────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5 flex flex-col gap-4 animate-fade-in">
        {/* Section header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Clock className="text-orange-400" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Tüm Satışlar
            </h3>
            {satislar.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">
                {satislar.length} kayıt &nbsp;·&nbsp; ₺{satislarToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Preset buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'bugun', label: 'Günlük (Bugün)' },
              { key: 'hafta', label: 'Haftalık (Bu Hafta)' },
              { key: 'ay',    label: 'Aylık (Bu Ay)' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer',
                  aktifPreset === key
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                )}
              >
                <Calendar size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Custom date range */}
          <div className="flex items-center gap-3 flex-wrap bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">Başlangıç:</span>
              <input
                type="date"
                value={baslangic}
                onChange={(e) => { setBaslangic(e.target.value); setAktifPreset('') }}
                style={{ colorScheme: 'dark' }}
                className="bg-slate-800 text-white border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">Bitiş:</span>
              <input
                type="date"
                value={bitis}
                onChange={(e) => { setBitis(e.target.value); setAktifPreset('') }}
                style={{ colorScheme: 'dark' }}
                className="bg-slate-800 text-white border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              onClick={handleCustomApply}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight size={14} />
              Tarihe Göre Getir
            </button>
          </div>
        </div>

        {/* ── Sales list ─────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : satislar.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Clock size={32} className="mb-2 text-slate-600" />
            <p className="text-xs">Seçili tarih aralığında satış kaydı bulunamadı.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
            {satislar.map((satis) => {
              const isNakit = satis.odemeTipi === 'Nakit'
              return (
                <div
                  key={satis.adisyonId}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 transition-all group"
                >
                  {/* Left: icon + details */}
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'w-9 h-9 rounded-lg flex items-center justify-center border shrink-0',
                      isNakit
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/15'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                    )}>
                      {isNakit ? <DollarSign size={15} /> : <CreditCard size={15} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{satis.masaAdi}</span>
                        <span className={clsx(
                          'text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0',
                          isNakit ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'
                        )}>
                          {isNakit ? 'Nakit' : 'Kart'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <User size={9} />
                          {satis.kapatanKullanici}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Calendar size={9} />
                          {formatTarih(satis.kapanisTarihi)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: amount + delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-black text-slate-100">
                      ₺{satis.toplamTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => handleSilClick(satis)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 border border-white/5 bg-white/3 transition-all opacity-0 group-hover:opacity-100"
                      title="Satışı Sil"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={silModal}
        onClose={() => setSilModal(false)}
        title="Satışı Sil"
      >
        <div className="flex flex-col gap-4">
          {silError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{silError}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/3 border border-white/8 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Masa</span>
              <span className="font-bold text-white">{seciliSatis?.masaAdi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tarih</span>
              <span className="text-slate-300">{seciliSatis && formatTarih(seciliSatis.kapanisTarihi)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tutar</span>
              <span className="font-black text-white">
                ₺{seciliSatis?.toplamTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Bu satış kaydını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5 mt-1">
            <button
              type="button"
              onClick={() => setSilModal(false)}
              className="btn btn-ghost text-xs"
              disabled={silPending}
            >
              Vazgeç
            </button>
            <button
              onClick={handleSilConfirm}
              className="btn bg-red-600 hover:bg-red-700 text-white min-w-[100px] text-xs"
              disabled={silPending}
            >
              {silPending ? 'Siliniyor...' : 'Evet, Sil'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
