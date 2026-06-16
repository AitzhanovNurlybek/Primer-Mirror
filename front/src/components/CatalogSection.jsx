import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles, X, Ruler, ChevronDown } from 'lucide-react'
import { fetchCatalog, fetchCatalogBrands } from '../api/catalog'
import CalculatorWidget from './CalculatorWidget'
import { cn } from '../lib/cn'

const SIZE_PRESETS = [
  [50, 70],
  [60, 60],
  [60, 80],
  [70, 70],
  [80, 80],
  [80, 60],
  [100, 80],
]

const SORTS = [
  { id: 'price_asc', label: 'Сначала дешевле' },
  { id: 'price_desc', label: 'Сначала дороже' },
  { id: 'size_asc', label: 'Меньше размер' },
  { id: 'size_desc', label: 'Больше размер' },
]

const PAGE = 15

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px -10% 0px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
}

function formatPrice(value) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₸`
}

function CatalogSection() {
  const [items, setItems] = useState([])
  const [brands, setBrands] = useState([])
  const [status, setStatus] = useState('loading') // loading | ok | error

  const [size, setSize] = useState(null) // [w, h] | null
  const [smart, setSmart] = useState(false)
  const [brand, setBrand] = useState('')
  const [sort, setSort] = useState('price_asc')
  const [visible, setVisible] = useState(PAGE)

  const [showCustom, setShowCustom] = useState(false)
  const customRef = useRef(null)

  useEffect(() => {
    fetchCatalogBrands().then(setBrands).catch(() => setBrands([]))
  }, [])

  // External CTAs ("Рассчитать стоимость") ask us to reveal the custom calculator
  useEffect(() => {
    const open = () => {
      setShowCustom(true)
      requestAnimationFrame(() =>
        customRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      )
    }
    window.addEventListener('open-calculator', open)
    return () => window.removeEventListener('open-calculator', open)
  }, [])

  useEffect(() => {
    let active = true

    const load = async () => {
      setStatus('loading')
      setVisible(PAGE)
      const params = { sort }
      if (size) {
        params.width_cm = size[0]
        params.height_cm = size[1]
        params.tolerance = 4
      }
      if (smart) params.is_smart = true
      if (brand) params.brand = brand

      try {
        const data = await fetchCatalog(params)
        if (!active) return
        setItems(data)
        setStatus('ok')
      } catch {
        if (!active) return
        setItems([])
        setStatus('error')
      }
    }

    load()
    return () => {
      active = false
    }
  }, [size, smart, brand, sort])

  const hasFilters = size || smart || brand
  const shown = useMemo(() => items.slice(0, visible), [items, visible])

  const resetFilters = () => {
    setSize(null)
    setSmart(false)
    setBrand('')
  }

  return (
    <section id="catalog" className="relative px-4 py-24 sm:px-6 sm:py-32" style={{ scrollMarginTop: '88px' }}>
      <div className="mx-auto max-w-6xl">
        <motion.div {...reveal} className="text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-purple-300/70">
            Каталог
          </p>
          <h2 className="m-0 font-display text-3xl font-medium tracking-wide text-white sm:text-4xl md:text-5xl">
            Выберите размер — покажем зеркала
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Более 200 готовых моделей. Покупка на Kaspi в один клик.
          </p>
        </motion.div>

        {/* Filter bar (compact) */}
        <motion.div
          {...reveal}
          className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 inline-flex items-center gap-1 text-xs text-white/45">
              <Ruler className="h-3.5 w-3.5" />
            </span>
            <button
              type="button"
              onClick={() => setSize(null)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[13px] transition-colors',
                !size ? 'bg-white text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
              )}
            >
              Все
            </button>
            {SIZE_PRESETS.map(([w, h]) => {
              const active = size && size[0] === w && size[1] === h
              return (
                <button
                  key={`${w}x${h}`}
                  type="button"
                  onClick={() => setSize(active ? null : [w, h])}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[13px] transition-colors',
                    active ? 'bg-white text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
                  )}
                >
                  {w}×{h}
                </button>
              )
            })}

            <span className="mx-1 h-4 w-px bg-white/10" />

            <button
              type="button"
              onClick={() => setSmart((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[13px] transition-colors',
                smart ? 'bg-purple-400/25 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              )}
            >
              <Sparkles className="h-3 w-3" />LED
            </button>

            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="rounded-md bg-white/5 px-2 py-1 text-[13px] text-white/80 outline-none [&>option]:text-black"
            >
              <option value="">Бренд</option>
              {brands.map((b) => (
                <option key={b.brand} value={b.brand}>
                  {b.brand} ({b.count})
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-md bg-white/5 px-2 py-1 text-[13px] text-white/80 outline-none [&>option]:text-black"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[13px] text-white/50 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            <span className="ml-auto text-xs text-white/40">
              {status === 'loading' ? '…' : status === 'error' ? '' : `${items.length} шт`}
            </span>
          </div>
        </motion.div>

        {/* Grid / states */}
        {status === 'error' ? (
          <p className="mt-12 text-center text-white/50">
            Не удалось загрузить каталог. Проверьте, запущен ли сервер, и обновите страницу.
          </p>
        ) : status === 'ok' && items.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-white/55">Готовых зеркал такого размера нет.</p>
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="mt-4 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-7 py-3 text-sm font-semibold text-white"
            >
              Рассчитать на заказ
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {shown.map((item) => (
              <a
                key={item.id}
                href={item.kaspi_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-xl bg-white/[0.04] no-underline transition-all duration-300 hover:bg-white/[0.08] hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-white">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.is_smart && (
                    <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-purple-200">
                      <Sparkles className="h-2.5 w-2.5" /> LED
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1 p-2.5">
                  <p className="line-clamp-2 text-xs text-white/75">
                    {item.name} {item.width_cm}×{item.height_cm}
                  </p>
                  <p className="mt-auto pt-1 text-base font-bold text-white">{formatPrice(item.price)}</p>
                  <span className="mt-1 inline-flex items-center justify-center gap-1 rounded-md bg-gradient-to-r from-purple-500 to-fuchsia-500 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                    <ShoppingCart className="h-3 w-3" /> Kaspi
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {visible < items.length && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE)}
              className="rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-medium uppercase tracking-[0.15em] text-white/85 transition-colors duration-300 hover:border-white/40 hover:text-white"
            >
              Показать ещё ({items.length - visible})
            </button>
          </div>
        )}

        {/* Custom-order calculator (collapsible) */}
        <div id="calculator" ref={customRef} className="mt-14" style={{ scrollMarginTop: '88px' }}>
          {!showCustom ? (
            <motion.button
              {...reveal}
              type="button"
              onClick={() => setShowCustom(true)}
              className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-5 text-center backdrop-blur-sm transition-colors duration-300 hover:border-white/30"
            >
              <Ruler className="h-5 w-5 text-purple-300" />
              <span className="text-sm text-white/85 sm:text-base">
                Не нашли нужный размер? <b className="text-white">Изготовим на заказ</b> — рассчитать за 1 минуту
              </span>
              <ChevronDown className="h-5 w-5 text-white/50" />
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="dark-scope relative mx-auto max-w-4xl rounded-3xl border border-white/12 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_60px_rgba(168,85,247,0.08)] backdrop-blur-md sm:p-10"
            >
              <button
                type="button"
                aria-label="Свернуть"
                onClick={() => setShowCustom(false)}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition-colors duration-200 hover:border-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-6 text-center">
                <h3 className="m-0 font-display text-2xl font-medium tracking-wide text-white sm:text-3xl">
                  Зеркало на заказ по вашим размерам
                </h3>
                <p className="mt-2 text-sm text-white/60">
                  Укажите параметры — рассчитаем стоимость и свяжемся с вами.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCustom(false)}
                  className="mt-3 text-xs uppercase tracking-[0.15em] text-white/45 underline-offset-4 hover:text-white/80 hover:underline"
                >
                  Свернуть
                </button>
              </div>
              <CalculatorWidget enableLead />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CatalogSection
