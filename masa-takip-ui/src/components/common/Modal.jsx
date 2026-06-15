import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Reusable animated modal with backdrop blur.
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Callback to close the modal
 * @param {string} title - Modal header title
 * @param {React.ReactNode} children - Modal body content
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null)

  // Close on backdrop click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl animate-slide-up"
        style={{
          background: 'rgba(22,22,45,0.97)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
