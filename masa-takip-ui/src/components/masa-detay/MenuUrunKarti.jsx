import { useState } from 'react'
import { Plus } from 'lucide-react'
import clsx from 'clsx'
import { BASE_URL } from '../../utils/api'
/**
 * Single menu product card. Shows product image (or emoji fallback), name, price.
 * Triggers a brief scale animation on click to confirm the add action.
 * @param {{ id, adi, fiyat, emoji, gorselUrl }} urun - Product data
 * @param {function} onEkle - Callback when the card is tapped
 */
export default function MenuUrunKarti({ urun, onEkle }) {
  const [clicked, setClicked] = useState(false)

  const getGorselUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http') || path.startsWith('data:')) return path
    
    // Electron içerisinde nested routelarda (örn: /masa/1) göreceli yol (relative path) 
    // sorununu aşmak için tam bir absolute URL oluşturuyoruz:
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${cleanBase}${cleanPath}`
  }

  const gorselUrl = getGorselUrl(urun.gorselUrl)

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
        'group relative flex flex-col overflow-hidden',
        'rounded-2xl w-full aspect-square',
        'cursor-pointer select-none outline-none',
        'transition-all duration-200',
        'hover:scale-[1.04] active:scale-95',
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
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
          <Plus size={11} className="text-white" />
        </div>
      </div>

      {/* Product Image */}
      {gorselUrl && (
        <div className="relative flex-1 w-full overflow-hidden image-wrapper">
          <img
            src={gorselUrl}
            alt={urun.adi}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Hide image wrapper and show the next sibling (emoji wrapper)
              e.currentTarget.parentElement.style.display = 'none'
              e.currentTarget.parentElement.nextSibling.style.display = 'flex'
            }}
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {/* Name & Price overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
            <span className="block text-[11px] font-semibold text-white leading-tight line-clamp-2 drop-shadow">
              {urun.adi}
            </span>
            <span
              className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(249,115,22,0.80)', color: '#fff' }}
            >
              ₺{urun.fiyat}
            </span>
          </div>
        </div>
      )}

      {/* Emoji fallback layout */}
      <div 
        className={clsx(
          "flex-col items-center justify-center gap-2 flex-1 p-3 text-center emoji-wrapper",
          gorselUrl ? "hidden" : "flex"
        )}
      >
        <span className="text-2xl leading-none">{urun.emoji || '🍽️'}</span>
        <span className="text-xs font-semibold text-white leading-tight line-clamp-2">
          {urun.adi}
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c' }}
        >
          ₺{urun.fiyat}
        </span>
      </div>
    </button>
  )
}
