import { useEffect, useState } from 'react'
import { cn } from '../lib/cn'
import { scrollToSection } from '../utils/scroll'

/** Sticky bottom CTA on mobile; hides while the calculator or the request
 * section is on screen so it never covers the form. */
function MobileCtaBar() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const targets = ['calculator', 'application']
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (!targets.length) return undefined

    const visible = new Set()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        })
        setHidden(visible.size > 0)
      },
      { threshold: 0.1 }
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-x-4 z-40 transition-all duration-300 lg:hidden',
        hidden ? 'pointer-events-none translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
      )}
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
    >
      <button
        type="button"
        onClick={() => scrollToSection('calculator')}
        className="w-full cursor-pointer rounded-full border border-white/20 bg-gradient-to-r from-purple-500 to-fuchsia-500 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-[0_8px_30px_rgba(168,85,247,0.45)] backdrop-blur-sm transition-transform duration-200 active:scale-[0.98]"
      >
        Рассчитать стоимость
      </button>
    </div>
  )
}

export default MobileCtaBar
