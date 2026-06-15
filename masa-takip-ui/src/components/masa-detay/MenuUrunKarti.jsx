import { useState } from 'react'
import { Plus } from 'lucide-react'
import clsx from 'clsx'

/**
 * Single menu product card. Shows emoji, name, price.
 * Triggers a brief scale animation on click to confirm the add action.
 * @param {{ id, adi, fiyat, emoji }} urun - Product data
 * @param {function} onEkle - Callback when the card is tapped
 */
export default function MenuUrunKarti({ urun, onEkle }) {
  const [clicked, setClicked] = useState(false)

  const handleClick = () => {
    onEkle(urun)
    setClicked(true)
    setTimeout(() => setClicked(false), 350)
  }

  return (
    <button
      id={`btn-urun-${urun.id}`}
      onClick={handleClick}
      className={clsx(
        'group relative flex flex-col items-center justify-center gap-2',
        'rounded-2xl p-3 aspect-square w-full',
        'cursor-pointer select-none outline-none',
        'transition-all duration-200',
        'hover:scale-[1.04] active:scale-95',
        'text-center',
        clicked ? 'animate-pulse-ring' : '',
      )}
      style={{
        background: clicked
          ? 'rgba(249,115,22,0.15)'
          : 'rgba(255,255,255,0.04)',
        border: clicked
          ? '1px solid rgba(249,115,22,0.40)'
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: clicked
          ? '0 0 0 3px rgba(249,115,22,0.18)'
          : '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Add indicator (top-right corner on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
          <Plus size={11} className="text-white" />
        </div>
      </div>

      {/* Emoji */}
      <span className="text-2xl leading-none">{urun.emoji || '🍽️'}</span>

      {/* Name */}
      <span className="text-xs font-semibold text-white leading-tight line-clamp-2">
        {urun.adi}
      </span>

      {/* Price */}
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-lg"
        style={{
          background: 'rgba(249,115,22,0.15)',
          color: '#fb923c',
        }}
      >
        ₺{urun.fiyat}
      </span>
    </button>
  )
}
