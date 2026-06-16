import { useEffect, useRef, useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '../lib/cn'
import { scrollToSection, openCalculator } from '../utils/scroll'

const NAV_SECTIONS = [
  { id: 'home', label: 'Главная' },
  { id: 'advantages', label: 'Преимущества' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'works', label: 'Работы' },
  { id: 'conditions', label: 'Условия' },
  { id: 'application', label: 'Заявка' },
]

/** Right-side anchor navigation with a scroll progress track (desktop only). */
function SideNav() {
  const [active, setActive] = useState('home')
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const hideTimer = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )

    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)

      // Reveal on any scroll movement, then auto-hide after a short idle
      setVisible(true)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setVisible(false), 1500)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  return (
    <>
      {/* Re-open handle, shown only when the user collapsed the nav */}
      <button
        type="button"
        aria-label="Показать навигацию"
        onClick={() => {
          setCollapsed(false)
          setVisible(true)
          if (hideTimer.current) clearTimeout(hideTimer.current)
          hideTimer.current = setTimeout(() => setVisible(false), 2500)
        }}
        className={cn(
          'fixed right-0 top-1/2 z-40 hidden h-12 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-white/10 bg-black/35 px-1.5 text-white/60 backdrop-blur-md transition-all duration-300 hover:text-white lg:flex',
          collapsed ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-6 opacity-0'
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <nav
        aria-label="Навигация по странице"
        onMouseEnter={() => {
          if (hideTimer.current) clearTimeout(hideTimer.current)
          setVisible(true)
        }}
        onMouseLeave={() => {
          if (hideTimer.current) clearTimeout(hideTimer.current)
          hideTimer.current = setTimeout(() => setVisible(false), 1200)
        }}
        className={cn(
          'fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex items-stretch gap-4 rounded-2xl border border-white/10 bg-black/25 py-5 pl-4 pr-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md',
          'transition-all duration-500 ease-out',
          !collapsed && visible ? 'opacity-100 translate-x-0' : 'pointer-events-none translate-x-6 opacity-0'
        )}
      >
        {/* Collapse button */}
        <button
          type="button"
          aria-label="Свернуть навигацию"
          onClick={() => setCollapsed(true)}
          className="absolute -left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/55 backdrop-blur-md transition-colors duration-200 hover:text-white"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <div className="relative w-px rounded-full bg-white/15">
        <div
          className="absolute left-0 top-0 w-full rounded-full bg-gradient-to-b from-purple-300 to-fuchsia-400 transition-[height] duration-200"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      <div className="flex flex-col items-start gap-3">
        {NAV_SECTIONS.map(({ id, label }, index) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id)}
            className={cn(
              'group flex cursor-pointer items-baseline gap-2 border-none bg-transparent p-0 text-left text-sm transition-colors duration-300',
              active === id ? 'text-white' : 'text-white/45 hover:text-white/80'
            )}
          >
            <span
              className={cn(
                'text-[10px] tabular-nums tracking-widest transition-colors duration-300',
                active === id ? 'text-purple-300' : 'text-white/30'
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={cn(active === id && 'drop-shadow-[0_0_12px_rgba(216,180,254,0.45)]')}>
              {label}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => openCalculator()}
          className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
        >
          Рассчитать
        </button>
      </div>
      </nav>
    </>
  )
}

export default SideNav
