import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, ShoppingBag, AlertTriangle } from 'lucide-react'
import AdisyonDetayItem from './AdisyonDetayItem'
import OdemePaneli from './OdemePaneli'
import Modal from '../common/Modal'
import useMasaStore from '../../store/useMasaStore'

// Module-level constant to prevent new array reference on every render.
// Returning `[]` inline inside a Zustand selector causes an infinite re-render loop
// because Zustand uses referential equality (Object.is) to detect changes.
const EMPTY_DETAYLAR = []

/**
 * Left panel showing the current bill items and payment section.
 * Handles the "last item removal" confirmation flow: when the user tries to
 * remove the last item (by trash or minus), a confirm dialog is shown before
 * the bill is cancelled and the table is freed.
 * @param {number} masaId - Table ID
 */
export default function AdisyonListesi({ masaId }) {
  const detaylar    = useMasaStore((s) => s.adisyonlar[masaId] ?? EMPTY_DETAYLAR)
  const toplamTutar = useMasaStore((s) => {
    const det = s.adisyonlar[masaId]
    if (det !== undefined) {
      return det.reduce((sum, d) => sum + d.adet * d.anlikFiyat, 0)
    }
    const masa = s.masalar.find((m) => m.id === masaId)
    return masa?.toplamTutar ?? 0
  })

  const adisyonIptal = useMasaStore((s) => s.adisyonIptal)
  const navigate     = useNavigate()

  // Pending action that will execute if the user confirms the cancel dialog
  const [bekleyenIslem, setBekleyenIslem]   = useState(null) // () => Promise<void>
  const [iptalOnayAcik, setIptalOnayAcik]  = useState(false)
  const [isIptalEdiliyor, setIsIptalEdiliyor] = useState(false)

  /**
   * Called by AdisyonDetayItem when removing the item would empty the bill.
   * Stores the pending action and opens the confirmation modal.
   * @param {() => Promise<void>} islem - The store action to run after confirmation
   */
  const handleSonUrunSilTalebi = useCallback((islem) => {
    setBekleyenIslem(() => islem)
    setIptalOnayAcik(true)
  }, [])

  /**
   * Confirmed: cancel the bill directly via adisyonIptal so the table
   * status is also updated to 'Bos' on the backend.
   */
  const handleIptalOnayla = async () => {
    setIsIptalEdiliyor(true)
    try {
      const success = await adisyonIptal(masaId)
      setIptalOnayAcik(false)
      if (success) {
        navigate('/')
      } else {
        alert('Adisyon iptal edilemedi. Sunucu bağlantısını kontrol edin.')
      }
    } finally {
      setIsIptalEdiliyor(false)
      setBekleyenIslem(null)
    }
  }

  const handleIptalVazgec = () => {
    setIptalOnayAcik(false)
    setBekleyenIslem(null)
  }

  return (
    <>
      <div
        className="flex flex-col flex-1 min-h-0"
        style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Receipt size={14} className="text-orange-400" />
            </div>
            <span className="text-sm font-bold text-white">Adisyon</span>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg">
            {detaylar.length} kalem
          </span>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto">
          {detaylar.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600 py-12">
              <ShoppingBag size={36} className="text-slate-700" />
              <p className="text-sm font-medium">Adisyon boş</p>
              <p className="text-xs text-slate-700">Sağdan ürün seçin</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {detaylar.map((detay) => (
                <AdisyonDetayItem
                  key={detay.urunId}
                  masaId={masaId}
                  detay={detay}
                  toplamKalemSayisi={detaylar.length}
                  onSonUrunSilTalebi={handleSonUrunSilTalebi}
                />
              ))}
            </div>
          )}
        </div>

        {/* Payment panel at bottom */}
        <OdemePaneli masaId={masaId} toplamTutar={toplamTutar} />
      </div>

      {/* Adisyon iptal onay modalı */}
      <Modal isOpen={iptalOnayAcik} onClose={handleIptalVazgec} title="Adisyon İptal">
        <div className="flex flex-col items-center gap-5 py-2">
          {/* İkon */}
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-400" />
          </div>

          {/* Mesaj */}
          <div className="text-center">
            <p className="text-base font-bold text-white mb-1">Adisyon İptal Edilecek</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Adisyondaki tüm ürünler kaldırılacak ve masa boş durumuna getirilecek.
              <br />
              Bu işlem geri alınamaz.
            </p>
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 w-full">
            <button
              id="btn-iptal-vazgec"
              onClick={handleIptalVazgec}
              disabled={isIptalEdiliyor}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              Vazgeç
            </button>
            <button
              id="btn-iptal-onayla"
              onClick={handleIptalOnayla}
              disabled={isIptalEdiliyor}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isIptalEdiliyor ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  İptal Ediliyor…
                </>
              ) : (
                'Evet, İptal Et'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
