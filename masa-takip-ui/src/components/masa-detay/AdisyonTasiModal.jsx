import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightLeft, GitMerge, AlertCircle, CheckCircle2, Users } from 'lucide-react'
import Modal from '../common/Modal'
import useMasaStore from '../../store/useMasaStore'
import clsx from 'clsx'

const MODLAR = [
  {
    id: 'tasi',
    label: 'Taşı',
    icon: ArrowRightLeft,
    aciklama: 'Adisyonu boş bir masaya taşı',
    renk: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    borderAktif: 'border-blue-500/70',
  },
  {
    id: 'birlestir',
    label: 'Birleştir',
    icon: GitMerge,
    aciklama: 'Dolu bir masanın adisyonuyla birleştir',
    renk: 'text-purple-400',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/30',
    borderAktif: 'border-purple-500/70',
  },
]

/**
 * Modal for transferring or merging a table's bill.
 * - "Taşı" mode: lists only empty tables (target must be free).
 * - "Birleştir" mode: lists only occupied tables (target must have an open bill).
 * @param {number}   masaId  - Source table ID
 * @param {boolean}  isOpen  - Visibility flag
 * @param {function} onClose - Close callback
 */
export default function AdisyonTasiModal({ masaId, isOpen, onClose }) {
  const navigate      = useNavigate()
  const masalar       = useMasaStore((s) => s.masalar)
  const adisyonTasi   = useMasaStore((s) => s.adisyonTasi)
  const adisyonBirlestir = useMasaStore((s) => s.adisyonBirlestir)

  const [aktifMod, setAktifMod] = useState('tasi')
  const [seciliMasaId, setSeciliMasaId] = useState(null)
  const [islemYapiliyor, setIslemYapiliyor] = useState(false)
  const [hata, setHata] = useState('')

  // Filter tables based on mode, excluding the current table
  const uygunMasalar = useMemo(() => {
    return masalar.filter((m) => {
      if (m.id === masaId) return false
      return aktifMod === 'tasi' ? m.durum === 'Bos' : m.durum === 'Dolu'
    })
  }, [masalar, masaId, aktifMod])

  const handleModDegis = (mod) => {
    setAktifMod(mod)
    setSeciliMasaId(null)
    setHata('')
  }

  const handleKapat = () => {
    setSeciliMasaId(null)
    setHata('')
    setAktifMod('tasi')
    onClose()
  }

  const handleOnayla = async () => {
    if (!seciliMasaId) return
    setHata('')
    setIslemYapiliyor(true)

    try {
      const result = aktifMod === 'tasi'
        ? await adisyonTasi(masaId, seciliMasaId)
        : await adisyonBirlestir(masaId, seciliMasaId)

      if (result.success) {
        handleKapat()
        navigate('/')
      } else {
        setHata(result.message || 'İşlem gerçekleştirilemedi.')
      }
    } finally {
      setIslemYapiliyor(false)
    }
  }

  const aktifModBilgi = MODLAR.find((m) => m.id === aktifMod)

  return (
    <Modal isOpen={isOpen} onClose={handleKapat} title="Adisyon Taşı / Birleştir">
      <div className="flex flex-col gap-4">

        {/* ── Mod seçici ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          {MODLAR.map(({ id, label, icon: Icon, renk, bg, border, borderAktif }) => {
            const isAktif = aktifMod === id
            return (
              <button
                key={id}
                id={`btn-mod-${id}`}
                onClick={() => handleModDegis(id)}
                className={clsx(
                  'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200',
                  isAktif ? `${bg} ${renk} ${borderAktif} scale-[1.02]` : `border-white/10 text-slate-500 hover:border-white/20`
                )}
              >
                <Icon size={18} className={isAktif ? renk : ''} />
                <span className="text-xs font-bold">{label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Açıklama ────────────────────────────────────────── */}
        <p className="text-xs text-slate-500 text-center">{aktifModBilgi?.aciklama}</p>

        {/* ── Hata mesajı ─────────────────────────────────────── */}
        {hata && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{hata}</span>
          </div>
        )}

        {/* ── Masa listesi ────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
          {uygunMasalar.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-600">
              <Users size={28} className="text-slate-700" />
              <p className="text-xs font-medium text-center">
                {aktifMod === 'tasi'
                  ? 'Taşıma için uygun boş masa bulunamadı.'
                  : 'Birleştirme için uygun dolu masa bulunamadı.'}
              </p>
            </div>
          ) : (
            uygunMasalar.map((masa) => {
              const isSecili = seciliMasaId === masa.id
              const isDolu   = masa.durum === 'Dolu'
              return (
                <button
                  key={masa.id}
                  id={`btn-masa-sec-${masa.id}`}
                  onClick={() => setSeciliMasaId(masa.id)}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-150',
                    isSecili
                      ? aktifMod === 'tasi'
                        ? 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                        : 'bg-purple-500/15 border-purple-500/50 text-purple-300'
                      : 'border-white/8 text-slate-300 hover:border-white/20 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Durum noktası */}
                    <span
                      className={clsx(
                        'w-2 h-2 rounded-full shrink-0',
                        isDolu ? 'bg-red-400' : 'bg-emerald-400'
                      )}
                      style={{
                        boxShadow: isDolu
                          ? '0 0 6px rgba(239,68,68,0.8)'
                          : '0 0 6px rgba(34,197,94,0.8)',
                      }}
                    />
                    <span className="text-sm font-semibold">{masa.adi}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDolu && (
                      <span className="text-xs font-bold text-red-300 bg-red-500/15 px-2 py-0.5 rounded-lg">
                        ₺{masa.toplamTutar.toLocaleString('tr-TR')}
                      </span>
                    )}
                    {isSecili && (
                      <CheckCircle2 size={15} className={aktifMod === 'tasi' ? 'text-blue-400' : 'text-purple-400'} />
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* ── Aksiyon butonları ───────────────────────────────── */}
        <div className="flex gap-2 pt-2 border-t border-white/5">
          <button
            id="btn-tasi-vazgec"
            onClick={handleKapat}
            disabled={islemYapiliyor}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            Vazgeç
          </button>
          <button
            id="btn-tasi-onayla"
            onClick={handleOnayla}
            disabled={!seciliMasaId || islemYapiliyor}
            className={clsx(
              'flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2',
              aktifMod === 'tasi'
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
            )}
          >
            {islemYapiliyor ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {aktifMod === 'tasi' ? 'Taşınıyor…' : 'Birleştiriliyor…'}
              </>
            ) : (
              <>
                {aktifMod === 'tasi' ? <ArrowRightLeft size={15} /> : <GitMerge size={15} />}
                {aktifMod === 'tasi' ? 'Taşı' : 'Birleştir'}
              </>
            )}
          </button>
        </div>

      </div>
    </Modal>
  )
}
