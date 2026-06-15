import { Receipt, ShoppingBag } from 'lucide-react'
import AdisyonDetayItem from './AdisyonDetayItem'
import OdemePaneli from './OdemePaneli'
import useMasaStore from '../../store/useMasaStore'

/**
 * Left panel showing the current bill items and payment section.
 * @param {number} masaId - Table ID
 */
export default function AdisyonListesi({ masaId }) {
  const getMasaAdisyonu     = useMasaStore((s) => s.getMasaAdisyonu)
  const getMasaToplamTutar  = useMasaStore((s) => s.getMasaToplamTutar)

  const detaylar    = getMasaAdisyonu(masaId)
  const toplamTutar = getMasaToplamTutar(masaId)

  return (
    <div
      className="flex flex-col h-full"
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment panel at bottom */}
      <OdemePaneli masaId={masaId} toplamTutar={toplamTutar} />
    </div>
  )
}
