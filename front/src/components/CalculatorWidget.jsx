import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { estimatePrice } from '../api/calculator'
import { submitLead } from '../api/leads'
import { fetchCatalogStats, fetchCatalog } from '../api/catalog'
import { AnimateNumber } from './ui/AnimatedNumber'
import MirrorPreview from './MirrorPreview'

const SHAPES = [
  { value: 'rectangle', label: 'Прямоуг.' },
  { value: 'oval', label: 'Овал' },
  { value: 'circle', label: 'Круг' },
  { value: 'arch', label: 'Арка' },
]

const FRAME_COLORS = [
  { value: 'silver', label: 'Серебро', swatch: '#c0c0c0' },
  { value: 'black', label: 'Чёрный', swatch: '#1a1a1a' },
  { value: 'white', label: 'Белый', swatch: '#f5f5f5' },
  { value: 'gold', label: 'Золото', swatch: '#d4af37' },
  { value: 'bronze', label: 'Бронза', swatch: '#8c6a3f' },
  { value: 'graphite', label: 'Графит', swatch: '#4a4a4f' },
]

// Sizes are in centimetres (matches the catalog)
const SIZE_LIMITS = { min: 30, max: 200, step: 1 }

const initialForm = {
  width_cm: 100,
  height_cm: 100,
  quantity: 1,
  shape: 'rectangle',
  with_lighting: false,
  with_frame: false,
  frame_color: FRAME_COLORS[0].value,
}

function CalculatorWidget({ resultFooter, enableLead = false }) {
  const [form, setForm] = useState(initialForm)
  const [price, setPrice] = useState(null)
  const [status, setStatus] = useState('idle')

  const [lead, setLead] = useState({ name: '', phone: '', comment: '' })
  const [leadStatus, setLeadStatus] = useState('idle') // idle | sending | sent | error
  const [marketStats, setMarketStats] = useState(null)
  const [showModels, setShowModels] = useState(false)
  const [models, setModels] = useState([])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' || type === 'range' ? Number(value) : value,
    }))
  }

  const handleLeadChange = (event) => {
    const { name, value } = event.target
    setLead((prev) => ({ ...prev, [name]: value }))
  }

  const handleLeadSubmit = async (event) => {
    event.preventDefault()
    setLeadStatus('sending')
    try {
      await submitLead({
        name: lead.name.trim(),
        phone: lead.phone.trim(),
        comment: lead.comment.trim() || null,
        width_mm: form.width_cm * 10,
        height_mm: form.height_cm * 10,
        quantity: form.quantity,
        shape: form.shape,
        with_lighting: form.with_lighting,
        with_frame: form.with_frame,
        frame_color: form.with_frame ? form.frame_color : null,
        total_price: price,
      })
      setLeadStatus('sent')
      setLead({ name: '', phone: '', comment: '' })
    } catch {
      setLeadStatus('error')
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('loading')
      const payload = {
        width_mm: form.width_cm * 10,
        height_mm: form.height_cm * 10,
        quantity: form.quantity,
        shape: form.shape,
        with_lighting: form.with_lighting,
        with_frame: form.with_frame,
        frame_color: form.with_frame ? form.frame_color : null,
      }
      estimatePrice(payload)
        .then((data) => {
          setPrice(data.total_price)
          setStatus('ready')
        })
        .catch(() => setStatus('error'))
    }, 250)

    return () => clearTimeout(timer)
  }, [form])

  // Market reference: prices of ready catalog mirrors of a similar size
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModels(false)
      fetchCatalogStats({
        width_cm: form.width_cm,
        height_cm: form.height_cm,
        tolerance: 10,
      })
        .then(setMarketStats)
        .catch(() => setMarketStats(null))
    }, 300)

    return () => clearTimeout(timer)
  }, [form.width_cm, form.height_cm])

  const handleShowModels = async () => {
    if (showModels) {
      setShowModels(false)
      return
    }
    try {
      const data = await fetchCatalog({
        width_cm: form.width_cm,
        height_cm: form.height_cm,
        tolerance: 10,
        sort: 'price_asc',
        limit: 8,
      })
      setModels(data)
      setShowModels(true)
    } catch {
      setModels([])
    }
  }

  return (
    <div className="calculator">
      <div className="calculator-form">
        <div className="slider-field">
          <div className="slider-field__head">
            <label htmlFor="width_cm">Ширина</label>
            <span className="slider-field__value">{form.width_cm} см</span>
          </div>
          <input
            type="range"
            id="width_cm"
            name="width_cm"
            min={SIZE_LIMITS.min}
            max={SIZE_LIMITS.max}
            step={SIZE_LIMITS.step}
            value={form.width_cm}
            onChange={handleChange}
          />
        </div>

        <div className="slider-field">
          <div className="slider-field__head">
            <label htmlFor="height_cm">Высота</label>
            <span className="slider-field__value">{form.height_cm} см</span>
          </div>
          <input
            type="range"
            id="height_cm"
            name="height_cm"
            min={SIZE_LIMITS.min}
            max={SIZE_LIMITS.max}
            step={SIZE_LIMITS.step}
            value={form.height_cm}
            onChange={handleChange}
          />
        </div>

        <div className="seg-field">
          <span className="seg-field__label">Форма</span>
          <div className="seg">
            {SHAPES.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`seg__btn${form.shape === s.value ? ' seg__btn--active' : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, shape: s.value }))}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <label className="qty-field">
          Количество, шт
          <input
            type="number"
            name="quantity"
            min="1"
            max="1000"
            value={form.quantity}
            onChange={handleChange}
          />
        </label>

        <div className="chip-row">
          <button
            type="button"
            className={`chip-toggle${form.with_lighting ? ' chip-toggle--active' : ''}`}
            onClick={() => setForm((p) => ({ ...p, with_lighting: !p.with_lighting }))}
          >
            С подсветкой
          </button>
          <button
            type="button"
            className={`chip-toggle${form.with_frame ? ' chip-toggle--active' : ''}`}
            onClick={() => setForm((p) => ({ ...p, with_frame: !p.with_frame }))}
          >
            Алюминиевая рама
          </button>
        </div>

        {form.with_frame && (
          <div className="seg-field">
            <span className="seg-field__label">Цвет рамы</span>
            <div className="swatches">
              {FRAME_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  aria-label={color.label}
                  className={`swatch${form.frame_color === color.value ? ' swatch--active' : ''}`}
                  style={{ background: color.swatch }}
                  onClick={() => setForm((p) => ({ ...p, frame_color: color.value }))}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="calculator-result">
        <div className="mirror-preview">
          <MirrorPreview
            shape={form.shape}
            widthMm={form.width_cm}
            heightMm={form.height_cm}
            withFrame={form.with_frame}
            frameColor={form.frame_color}
            withLighting={form.with_lighting}
          />
        </div>

        <span className="calculator-result__label">Стоимость на заказ</span>
        {price !== null ? (
          <AnimateNumber
            value={price}
            suffix=" ₸"
            format={{ maximumFractionDigits: 0 }}
            className="calculator-result__value"
          />
        ) : (
          <span className="calculator-result__value">—</span>
        )}
        {status === 'error' && (
          <p className="page__status page__status--error">
            Не удалось рассчитать стоимость. Попробуйте позже.
          </p>
        )}

        {marketStats && marketStats.count > 0 && (
          <div className="market-ref">
            <span className="market-ref__label">Готовые ~такого размера в каталоге</span>
            <span className="market-ref__range">
              {Math.round(marketStats.min_price).toLocaleString('ru-RU')}–
              {Math.round(marketStats.max_price).toLocaleString('ru-RU')} ₸
            </span>
            <button type="button" className="market-ref__toggle" onClick={handleShowModels}>
              {showModels ? 'Скрыть' : `Показать ${marketStats.count} моделей`}
            </button>

            {showModels && (
              <div className="market-models">
                {models.map((m) => (
                  <a
                    key={m.id}
                    href={m.kaspi_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="market-model"
                  >
                    <img src={m.image} alt={m.name} loading="lazy" />
                    <span className="market-model__info">
                      <span className="market-model__size">
                        {m.width_cm}×{m.height_cm} см
                      </span>
                      <span className="market-model__price">
                        {Math.round(m.price).toLocaleString('ru-RU')} ₸
                      </span>
                    </span>
                    <ShoppingCart className="market-model__cart" size={14} />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {resultFooter}

        {enableLead && (
          <form className="lead-form" onSubmit={handleLeadSubmit}>
            {leadStatus === 'sent' ? (
              <p className="lead-form__success">
                Заявка отправлена! Мы свяжемся с вами в ближайшее время.
              </p>
            ) : (
              <>
                <p className="lead-form__title">Оставьте заявку с этим расчетом</p>
                <input
                  type="text"
                  name="name"
                  placeholder="Ваше имя"
                  value={lead.name}
                  onChange={handleLeadChange}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Телефон"
                  value={lead.phone}
                  onChange={handleLeadChange}
                  required
                />
                <input
                  type="text"
                  name="comment"
                  placeholder="Комментарий (необязательно)"
                  value={lead.comment}
                  onChange={handleLeadChange}
                />
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={leadStatus === 'sending'}
                >
                  {leadStatus === 'sending' ? 'Отправка...' : 'Отправить заявку'}
                </button>
                {leadStatus === 'error' && (
                  <p className="page__status page__status--error">
                    Не удалось отправить. Попробуйте позже.
                  </p>
                )}
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default CalculatorWidget
