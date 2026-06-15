import clsx from 'clsx'

/**
 * Horizontal scrollable category filter buttons.
 * @param {Array} kategoriler - List of category objects { id, adi }
 * @param {number} aktifId - Currently selected category ID
 * @param {function} onSelect - Callback when category button is clicked
 */
export default function KategoriFiltre({ kategoriler, aktifId, onSelect }) {
  return (
    <div className="scroll-x-hidden flex gap-2 px-4 py-3 border-b border-white/5">
      {kategoriler.map(({ id, adi }) => {
        const isActive = aktifId === id
        return (
          <button
            key={id}
            id={`btn-kategori-${id}`}
            onClick={() => onSelect(id)}
            className={clsx(
              'shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95',
              isActive
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/8',
              'border',
              isActive ? 'border-orange-500/50' : 'border-white/5'
            )}
          >
            {adi}
          </button>
        )
      })}
    </div>
  )
}
