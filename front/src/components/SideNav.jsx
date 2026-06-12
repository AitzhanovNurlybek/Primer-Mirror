import { useEffect, useState } from 'react'
import { cn } from '../lib/cn'
import { scrollToSection } from '../utils/scroll'

const NAV_SECTIONS = [
  { id: 'home', label: 'Главная' },
  { id: 'advantages', label: 'Преимущества' },
  { id: 'calculator', label: 'Калькулятор' },
  { id: 'works', label: 'Работы' },
  { id: 'conditions', label: 'Условия' },
  { id: 'application', label: 'Заявка' },
]

/** Right-side anchor navigation with a scroll progress track (desktop only). */
function SideNav() {
  const [active, setActive] = useState('home')
  const [progress, setProgress] = useState(0)

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
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      aria-label="Навигация по странице"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex items-stretch gap-4 rounded-2xl border border-white/10 bg-black/25 py-5 pl-4 pr-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
    >
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
          onClick={() => scrollToSection('calculator')}
          className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
        >
          Рассчитать
        </button>
      </div>
    </nav>
  )
}

export default SideNav
