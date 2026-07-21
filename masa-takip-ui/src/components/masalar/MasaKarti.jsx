import { useNavigate } from 'react-router-dom'
import { Users, ArrowRight, Trash2 } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'
import clsx from 'clsx'

/**
 * Single table card showing table name, status, and current bill total.
 * @param {{ id, adi, durum }} masa - Table data
 * @param {number} toplamTutar - Current bill total (0 if empty)
 * @param {function} onDelete - Callback when table is deleted
 */
export default function MasaKarti({ masa, toplamTutar, onDelete }) {
  const navigate = useNavigate()
  const isDolu = masa.durum === 'Dolu'
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.rol === 'Admin'

  return (
    <button
      onClick={() => navigate(`/masa/${masa.id}`)}
      className={clsx(
        'group relative flex flex-col items-center justify-center gap-2',
        'rounded-2xl p-4 aspect-square w-full',
        'transition-all duration-250 hover:scale-105 active:scale-95',
        'cursor-pointer select-none outline-none',
        isDolu ? 'masa-dolu' : 'masa-bos'
      )}
      style={{
        boxShadow: isDolu
          ? '0 8px 32px rgba(239,68,68,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 8px 32px rgba(34,197,94,0.14), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Glow effect on hover */}
      <div
        className={clsx(
          'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        )}
        style={{
          background: isDolu
            ? 'radial-gradient(circle at center, rgba(239,68,68,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(34,197,94,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Status indicator dot */}
      <div className="absolute top-3.5 left-3.5">
        <span
          className={clsx(
            'block w-2.5 h-2.5 rounded-full',
            isDolu ? 'bg-red-400' : 'bg-emerald-400'
          )}
          style={{
            boxShadow: isDolu
              ? '0 0 8px rgba(239,68,68,0.8)'
              : '0 0 8px rgba(34,197,94,0.8)',
          }}
        />
      </div>

      {/* Delete button: visible to Admin, absolute top-2 right-2 */}
      {isAdmin && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (!isDolu) onDelete(masa)
          }}
          className={clsx(
            'absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center border border-white/5 transition-all z-20',
            isDolu
              ? 'text-slate-600 bg-white/5 cursor-not-allowed opacity-40'
              : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 bg-white/5 cursor-pointer'
          )}
          title={isDolu ? 'Masada aktif sipariş var, silinemez' : 'Masayı Sil'}
        >
          <Trash2 size={12} />
        </div>
      )}

      {/* Icon */}
      <div className={clsx(
        'w-10 h-10 rounded-xl flex items-center justify-center mb-1',
        isDolu
          ? 'bg-red-500/20 text-red-300'
          : 'bg-emerald-500/20 text-emerald-300'
      )}>
        <Users size={20} />
      </div>

      {/* Table name */}
      <span className="text-sm font-bold text-white leading-tight text-center z-10">
        {masa.adi}
      </span>

      {/* Bill total OR status text */}
      {isDolu ? (
        <span className="text-xs font-bold text-red-200 bg-red-500/20 px-2 py-0.5 rounded-lg z-10">
          ₺{toplamTutar.toLocaleString('tr-TR')}
        </span>
      ) : (
        <span className="text-xs font-medium text-emerald-300/70 z-10">Boş</span>
      )}

      {/* Arrow hint on hover */}
      <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <ArrowRight size={14} className={isDolu ? 'text-red-300' : 'text-emerald-300'} />
      </div>
    </button>
  )
}
