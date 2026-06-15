import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, CreditCard, Banknote, QrCode } from 'lucide-react'
import Modal from '../common/Modal'
import useMasaStore from '../../store/useMasaStore'
import useAuthStore from '../../store/useAuthStore'

const odemeTipleri = [
  { id: 'nakit',  label: 'Nakit',   icon: Banknote,    color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { id: 'kart',   label: 'Kart',    icon: CreditCard,  color: 'text-blue-400',    bg: 'bg-blue-500/15'    },
  { id: 'qr',     label: 'QR/Link', icon: QrCode,      color: 'text-purple-400',  bg: 'bg-purple-500/15'  },
]

/**
 * Bottom panel of the bill section showing total and checkout button.
 * @param {number} masaId - Table ID
 * @param {number} toplamTutar - Total bill amount
 */
export default function OdemePaneli({ masaId, toplamTutar }) {
  const [isOpen, setIsOpen]           = useState(false)
  const [seciliOdeme, setSeciliOdeme] = useState(null)
  const [odemeAlindi, setOdemeAlindi] = useState(false)
  const navigate = useNavigate()
  const hesabiKapat = useMasaStore((s) => s.hesabiKapat)
  const adisyonIptal = useMasaStore((s) => s.adisyonIptal)
  const { user } = useAuthStore()

  const handleOdemeOnayla = () => {
    if (!seciliOdeme) return
    setOdemeAlindi(true)
    setTimeout(async () => {
      const type = seciliOdeme === 'nakit' ? 'Nakit' : 'KrediKarti'
      const success = await hesabiKapat(masaId, type)
      if (success) {
        setIsOpen(false)
        setOdemeAlindi(false)
        setSeciliOdeme(null)
        navigate('/')
      } else {
        setOdemeAlindi(false)
        alert('Hesap kapatılamadı. Lütfen yetkilerinizi kontrol edin.')
      }
    }, 1400)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSeciliOdeme(null)
    setOdemeAlindi(false)
  }

  return (
    <>
      {/* Summary section */}
      <div className="p-4 border-t border-white/5">
        {/* Subtotal rows */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Ara Toplam</span>
          <span className="text-xs text-slate-400">₺{toplamTutar.toLocaleString('tr-TR')}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500">KDV (%8)</span>
          <span className="text-xs text-slate-400">
            ₺{(toplamTutar * 0.08).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Total */}
        <div
          className="flex items-center justify-between p-3 rounded-xl mb-4"
          style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.20)' }}
        >
          <span className="text-sm font-bold text-white">Genel Toplam</span>
          <span className="text-lg font-extrabold text-orange-400">
            ₺{(toplamTutar * 1.08).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Checkout button */}
        <button
          id="btn-hesabi-kapat"
          onClick={() => setIsOpen(true)}
          disabled={toplamTutar === 0 || user?.rol !== 'Admin'}
          className="btn btn-success w-full text-sm py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          title={user?.rol !== 'Admin' ? 'Sadece Kasa (Admin) ödeme alabilir.' : ''}
        >
          <CreditCard size={16} />
          {user?.rol !== 'Admin' ? 'Ödeme Yetkisi Yok (Sadece Kasa)' : 'Hesabı Kapat – Ödeme Al'}
        </button>

        {/* Cancel button (Admin only) */}
        {user?.rol === 'Admin' && (
          <button
            id="btn-adisyon-iptal"
            onClick={async () => {
              if (window.confirm('Bu adisyonu tamamen İPTAL etmek istediğinize emin misiniz? Masa boşaltılacaktır.')) {
                const success = await adisyonIptal(masaId)
                if (success) {
                  navigate('/')
                }
              }
            }}
            disabled={toplamTutar === 0}
            className="btn bg-red-600 hover:bg-red-700 active:bg-red-800 text-white w-full text-xs py-2 mt-2 border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 rounded-xl font-bold transition-colors"
          >
            Adisyonu İptal Et
          </button>
        )}
      </div>

      {/* Payment Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} title="Ödeme Al">
        {odemeAlindi ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center animate-scale-in">
              <CheckCircle size={36} className="text-emerald-400" />
            </div>
            <p className="text-base font-bold text-white">Ödeme Alındı!</p>
            <p className="text-sm text-slate-400">Masa kapatılıyor...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-1">Tahsil Edilecek Tutar</p>
              <p className="text-3xl font-extrabold text-orange-400">
                ₺{(toplamTutar * 1.08).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </p>
            </div>

            {/* Payment type selection */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Ödeme Tipi</p>
              <div className="grid grid-cols-3 gap-2">
                {odemeTipleri.map(({ id, label, icon: Icon, color, bg }) => (
                  <button
                    key={id}
                    id={`btn-odeme-${id}`}
                    onClick={() => setSeciliOdeme(id)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 ${
                      seciliOdeme === id
                        ? `${bg} border-current ${color} scale-105`
                        : 'border-white/8 text-slate-500 hover:border-white/15'
                    }`}
                  >
                    <Icon size={20} className={seciliOdeme === id ? color : ''} />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm button */}
            <button
              id="btn-odeme-onayla"
              onClick={handleOdemeOnayla}
              disabled={!seciliOdeme}
              className="btn btn-success w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle size={16} />
              Ödemeyi Onayla
            </button>
          </div>
        )}
      </Modal>
    </>
  )
}
