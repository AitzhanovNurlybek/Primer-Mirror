import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '../lib/cn'

/** Floating back-to-top button; sits above the mobile CTA bar on small screens. */
function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Наверх"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed right-4 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:text-white',
        'bottom-24 lg:bottom-8 lg:right-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}

export default BackToTop
