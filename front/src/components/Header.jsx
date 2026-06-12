import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Calculator } from 'lucide-react'
import ExpandableTabs from './ui/ExpandableTabs'
import { cn } from '../lib/cn'
import { scrollToSection } from '../utils/scroll'
import logo from '../assets/logo.jpeg'

const NAV_TABS = [
  { title: 'Главная', icon: Home, path: '/' },
  { title: 'Калькулятор', icon: Calculator, path: '/calculator' },
]

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!isHome) return undefined
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  const activeIndex = NAV_TABS.findIndex((tab) => tab.path === location.pathname)

  const handleCta = () => {
    if (isHome) scrollToSection('calculator')
    else navigate('/calculator')
  }

  return (
    <header
      className={cn(
        'site-header',
        isHome && 'site-header--overlay',
        isHome && scrolled && 'site-header--scrolled'
      )}
    >
      <Link to="/" className="site-header__brand">
        <img src={logo} alt="Primer Mirror" className="site-header__logo-img" />
      </Link>
      <Link to="/" className="site-header__title">
        Primer Mirror
      </Link>
      <div className="site-header__actions">
        <ExpandableTabs
          tabs={NAV_TABS}
          activeIndex={activeIndex === -1 ? 0 : activeIndex}
          onChange={(index) => navigate(NAV_TABS[index].path)}
        />
        <button type="button" className="site-header__cta" onClick={handleCta}>
          Рассчитать стоимость
        </button>
      </div>
    </header>
  )
}

export default Header
