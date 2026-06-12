import { useEffect, useState } from 'react'
import { estimatePrice } from '../api/calculator'
import { AnimateNumber } from './ui/AnimatedNumber'

const FRAME_COLORS = [
  { value: 'silver', label: 'Серебристый' },
  { value: 'black', label: 'Черный' },
  { value: 'white', label: 'Белый' },
  { value: 'gold', label: 'Золотой' },
]

const SIZE_LIMITS = { min: 300, max: 3000, step: 10 }

const initialForm = {
  width_mm: 1000,
  height_mm: 1000,
  quantity: 1,
  with_lighting: false,
  with_frame: false,
  frame_color: FRAME_COLORS[0].value,
}

function CalculatorWidget({ resultFooter }) {
  const [form, setForm] = useState(initialForm)
  const [price, setPrice] = useState(null)
  const [status, setStatus] = useState('idle')

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' || type === 'range' ? Number(value) : value,
    }))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('loading')
      const payload = {
        ...form,
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

  return (
    <div className="calculator">
      <div className="calculator-form">
        <div className="slider-field">
          <div className="slider-field__head">
            <label htmlFor="width_mm">Ширина</label>
            <span className="slider-field__value">{form.width_mm} мм</span>
          </div>
          <input
            type="range"
            id="width_mm"
            name="width_mm"
            min={SIZE_LIMITS.min}
            max={SIZE_LIMITS.max}
            step={SIZE_LIMITS.step}
            value={form.width_mm}
            onChange={handleChange}
          />
        </div>

        <div className="slider-field">
          <div className="slider-field__head">
            <label htmlFor="height_mm">Высота</label>
            <span className="slider-field__value">{form.height_mm} мм</span>
          </div>
          <input
            type="range"
            id="height_mm"
            name="height_mm"
            min={SIZE_LIMITS.min}
            max={SIZE_LIMITS.max}
            step={SIZE_LIMITS.step}
            value={form.height_mm}
            onChange={handleChange}
          />
        </div>

        <label>
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

        <label className="calculator-form__checkbox">
          <input
            type="checkbox"
            name="with_lighting"
            checked={form.with_lighting}
            onChange={handleChange}
          />
          Зеркало с подсветкой
        </label>

        <label className="calculator-form__checkbox">
          <input
            type="checkbox"
            name="with_frame"
            checked={form.with_frame}
            onChange={handleChange}
          />
          Алюминиевая рама
        </label>

        {form.with_frame && (
          <label>
            Цвет рамы
            <select name="frame_color" value={form.frame_color} onChange={handleChange}>
              {FRAME_COLORS.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="calculator-result">
        <span className="calculator-result__label">Стоимость</span>
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
        {resultFooter}
      </div>
    </div>
  )
}

export default CalculatorWidget
