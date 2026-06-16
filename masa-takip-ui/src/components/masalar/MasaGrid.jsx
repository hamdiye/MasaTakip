import MasaKarti from './MasaKarti'
import useMasaStore from '../../store/useMasaStore'

/**
 * Responsive grid of all table cards.
 * @param {Array} masalar - List of table objects
 */
export default function MasaGrid({ masalar, onDeleteMasa }) {
  const getMasaToplamTutar = useMasaStore((s) => s.getMasaToplamTutar)

  if (masalar.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <div className="text-5xl">🪑</div>
        <p className="text-sm font-medium">Henüz masa eklenmemiş</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4">
      {masalar.map((masa, i) => (
        <div
          key={masa.id}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          <MasaKarti
            masa={masa}
            toplamTutar={getMasaToplamTutar(masa.id)}
            onDelete={onDeleteMasa}
          />
        </div>
      ))}
    </div>
  )
}
