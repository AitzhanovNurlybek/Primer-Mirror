import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPricing, updatePricing } from '../api/admin'
import { clearToken, getToken } from '../auth'

const FIELDS = [
  { name: 'price_per_m2', label: 'Цена за м² зеркала (3 мм), ₸' },
  { name: 'edge_processing_per_m', label: 'Обработка кромки, ₸ за п.м.' },
  { name: 'lighting_per_m', label: 'Подсветка, ₸ за п.м. периметра' },
  { name: 'frame_per_m', label: 'Алюминиевая рама, ₸ за п.м.' },
  { name: 'min_order_price', label: 'Минимальная стоимость заказа, ₸' },
]

function AdminPanelPage() {
  const [values, setValues] = useState(null)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/admin')
      return
    }
    fetchPricing(token)
      .then((data) => {
        setValues(data)
        setStatus('ready')
      })
      .catch(() => {
        clearToken()
        navigate('/admin')
      })
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('saving')
    setMessage('')
    try {
      const token = getToken()
      const updated = await updatePricing(token, values)
      setValues(updated)
      setStatus('ready')
      setMessage('Сохранено')
    } catch {
      setStatus('ready')
      setMessage('Не удалось сохранить изменения')
    }
  }

  const handleLogout = () => {
    clearToken()
    navigate('/admin')
  }

  if (status === 'loading' || !values) {
    return (
      <main className="page page--narrow">
        <p className="page__status">Загрузка...</p>
      </main>
    )
  }

  return (
    <main className="page page--narrow">
      <header className="page__header">
        <h1>Управление ценами</h1>
        <p>Эти значения используются калькулятором стоимости на сайте.</p>
      </header>

      <form className="admin-form" onSubmit={handleSubmit}>
        {FIELDS.map((field) => (
          <label key={field.name}>
            {field.label}
            <input
              type="number"
              name={field.name}
              min="0"
              step="any"
              value={values[field.name]}
              onChange={handleChange}
              required
            />
          </label>
        ))}

        {message && <p className="page__status">{message}</p>}

        <div className="admin-form__actions">
          <button type="submit" className="button button--primary" disabled={status === 'saving'}>
            {status === 'saving' ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" className="button button--secondary" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </form>
    </main>
  )
}

export default AdminPanelPage
