import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Calculator, Phone, Images, Grid3x3, LogOut } from 'lucide-react'
import { fetchPricing, updatePricing } from '../api/admin'
import { fetchCompanyInfo, updateCompanyInfo } from '../api/company'
import { fetchLeads, updateLeadStatus, deleteLead } from '../api/leads'
import { fetchWorks, createWork, deleteWork } from '../api/works'
import { fetchCatalog, importCatalog, deleteCatalogItem } from '../api/catalog'
import { clearToken, getToken } from '../auth'

const TABS = [
  { id: 'leads', label: 'Заявки', icon: Inbox },
  { id: 'catalog', label: 'Каталог', icon: Grid3x3 },
  { id: 'pricing', label: 'Цены', icon: Calculator },
  { id: 'contacts', label: 'Контакты', icon: Phone },
  { id: 'works', label: 'Работы', icon: Images },
]

const PRICING_FIELDS = [
  { name: 'price_per_m2', label: 'Цена за м² зеркала (3 мм), ₸' },
  { name: 'edge_processing_per_m', label: 'Обработка кромки, ₸ за п.м.' },
  { name: 'lighting_per_m', label: 'Подсветка, ₸ за п.м. периметра' },
  { name: 'frame_per_m', label: 'Алюминиевая рама, ₸ за п.м.' },
  { name: 'min_order_price', label: 'Минимальная стоимость заказа, ₸' },
]

const CONTACT_FIELDS = [
  { name: 'name', label: 'Название компании' },
  { name: 'phone', label: 'Телефон' },
  { name: 'whatsapp', label: 'WhatsApp' },
  { name: 'instagram', label: 'Instagram (ссылка)' },
  { name: 'kaspi_shop_url', label: 'Kaspi магазин (ссылка)' },
]

const LEAD_STATUS = {
  new: { label: 'Новая', cls: 'admin-badge--new' },
  in_progress: { label: 'В работе', cls: 'admin-badge--progress' },
  done: { label: 'Закрыта', cls: 'admin-badge--done' },
}

const SHAPE_LABELS = {
  rectangle: 'Прямоугольное',
  oval: 'Овал',
  circle: 'Круг',
  arch: 'Арка',
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

function formatPrice(value) {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value).toLocaleString('ru-RU')} ₸`
}

/* ----------------------------- Leads tab ----------------------------- */
function LeadsTab({ token }) {
  const [leads, setLeads] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    fetchLeads(token)
      .then(setLeads)
      .catch(() => setError('Не удалось загрузить заявки'))
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const handleStatus = async (id, status) => {
    await updateLeadStatus(token, id, status)
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить заявку?')) return
    await deleteLead(token, id)
    load()
  }

  if (error) return <p className="page__status page__status--error">{error}</p>
  if (!leads) return <p className="page__status">Загрузка...</p>
  if (leads.length === 0) return <p className="page__status">Заявок пока нет.</p>

  return (
    <div className="admin-leads">
      {leads.map((lead) => (
        <div key={lead.id} className="admin-lead">
          <div className="admin-lead__head">
            <div>
              <strong>{lead.name}</strong>
              <a href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`} className="admin-lead__phone">
                {lead.phone}
              </a>
            </div>
            <span className={`admin-badge ${LEAD_STATUS[lead.status]?.cls || ''}`}>
              {LEAD_STATUS[lead.status]?.label || lead.status}
            </span>
          </div>

          <div className="admin-lead__meta">
            {lead.width_mm && lead.height_mm && (
              <span>
                {lead.width_mm}×{lead.height_mm} мм
                {lead.quantity ? ` · ${lead.quantity} шт` : ''}
              </span>
            )}
            {lead.shape && lead.shape !== 'rectangle' && (
              <span>{SHAPE_LABELS[lead.shape] || lead.shape}</span>
            )}
            {lead.with_lighting && <span>подсветка</span>}
            {lead.with_frame && <span>рама{lead.frame_color ? ` (${lead.frame_color})` : ''}</span>}
            <span className="admin-lead__price">{formatPrice(lead.total_price)}</span>
          </div>

          {lead.comment && <p className="admin-lead__comment">{lead.comment}</p>}

          <div className="admin-lead__foot">
            <span className="admin-lead__date">{formatDate(lead.created_at)}</span>
            <div className="admin-lead__actions">
              <select
                value={lead.status}
                onChange={(e) => handleStatus(lead.id, e.target.value)}
              >
                <option value="new">Новая</option>
                <option value="in_progress">В работе</option>
                <option value="done">Закрыта</option>
              </select>
              <button type="button" className="admin-link-danger" onClick={() => handleDelete(lead.id)}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ----------------------------- Pricing tab ----------------------------- */
function PricingTab({ token }) {
  const [values, setValues] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPricing(token).then(setValues).catch(() => setMessage('Ошибка загрузки'))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      setValues(await updatePricing(token, values))
      setMessage('Сохранено')
    } catch {
      setMessage('Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  if (!values) return <p className="page__status">Загрузка...</p>

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <p className="admin-hint">Эти значения использует калькулятор стоимости на сайте.</p>
      {PRICING_FIELDS.map((f) => (
        <label key={f.name}>
          {f.label}
          <input
            type="number"
            min="0"
            step="any"
            value={values[f.name]}
            onChange={(e) => setValues((p) => ({ ...p, [f.name]: Number(e.target.value) }))}
            required
          />
        </label>
      ))}
      {message && <p className="page__status">{message}</p>}
      <button type="submit" className="button button--primary" disabled={saving}>
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  )
}

/* ----------------------------- Contacts tab ----------------------------- */
function ContactsTab({ token }) {
  const [values, setValues] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCompanyInfo().then(setValues).catch(() => setMessage('Ошибка загрузки'))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      setValues(await updateCompanyInfo(token, values))
      setMessage('Сохранено')
    } catch {
      setMessage('Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  if (!values) return <p className="page__status">Загрузка...</p>

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <p className="admin-hint">Контакты отображаются в шапке, футере и кнопках на сайте.</p>
      {CONTACT_FIELDS.map((f) => (
        <label key={f.name}>
          {f.label}
          <input
            type="text"
            value={values[f.name] || ''}
            onChange={(e) => setValues((p) => ({ ...p, [f.name]: e.target.value }))}
            required
          />
        </label>
      ))}
      {message && <p className="page__status">{message}</p>}
      <button type="submit" className="button button--primary" disabled={saving}>
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  )
}

/* ----------------------------- Works tab ----------------------------- */
function WorksTab({ token }) {
  const [works, setWorks] = useState(null)
  const [image, setImage] = useState('')
  const [caption, setCaption] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    fetchWorks().then(setWorks).catch(() => setMessage('Ошибка загрузки'))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1.5 * 1024 * 1024) {
      setMessage('Файл больше 1.5 МБ — выберите фото поменьше')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!image) {
      setMessage('Добавьте фото или ссылку на изображение')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await createWork(token, { image, caption, sort_order: works?.length || 0 })
      setImage('')
      setCaption('')
      load()
    } catch {
      setMessage('Не удалось добавить')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить работу?')) return
    await deleteWork(token, id)
    load()
  }

  return (
    <div className="admin-works">
      <form className="admin-form" onSubmit={handleAdd}>
        <p className="admin-hint">
          Загрузите фото работ (до 1.5 МБ) или вставьте ссылку. Они появятся в секции «Работы».
        </p>
        <label>
          Фото с компьютера
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>
        <label>
          Или ссылка на изображение
          <input
            type="text"
            placeholder="https://..."
            value={image.startsWith('data:') ? '' : image}
            onChange={(e) => setImage(e.target.value)}
          />
        </label>
        {image && <img src={image} alt="" className="admin-works__preview" />}
        <label>
          Подпись
          <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </label>
        {message && <p className="page__status">{message}</p>}
        <button type="submit" className="button button--primary" disabled={saving}>
          {saving ? 'Добавление...' : 'Добавить работу'}
        </button>
      </form>

      {works && works.length > 0 && (
        <div className="admin-works__grid">
          {works.map((w) => (
            <div key={w.id} className="admin-works__item">
              <img src={w.image} alt={w.caption} />
              <div className="admin-works__item-foot">
                <span>{w.caption || '—'}</span>
                <button type="button" className="admin-link-danger" onClick={() => handleDelete(w.id)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ----------------------------- Catalog tab ----------------------------- */
function CatalogTab({ token }) {
  const [items, setItems] = useState(null)
  const [message, setMessage] = useState('')
  const [importing, setImporting] = useState(false)

  const load = useCallback(() => {
    fetchCatalog({ limit: 500, sort: 'price_asc' })
      .then(setItems)
      .catch(() => setMessage('Ошибка загрузки'))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    setImporting(true)
    setMessage('')
    try {
      const raw = JSON.parse(await file.text())
      if (!Array.isArray(raw)) throw new Error('not array')
      const result = await importCatalog(token, raw)
      setMessage(`Импортировано: ${result.imported}, пропущено: ${result.skipped}`)
      load()
    } catch {
      setMessage('Не удалось импортировать. Нужен файл products.json (массив товаров).')
    } finally {
      setImporting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар из каталога?')) return
    await deleteCatalogItem(token, id)
    load()
  }

  return (
    <div className="admin-works">
      <div className="admin-form">
        <p className="admin-hint">
          Каталог тянется из Kaspi. Чтобы обновить — загрузи свежий <b>products.json</b> (собранный
          скриптом из магазина). Импорт <b>заменит</b> весь каталог.
        </p>
        <label>
          Загрузить products.json
          <input type="file" accept="application/json,.json" onChange={handleImport} disabled={importing} />
        </label>
        {message && <p className="page__status">{message}</p>}
        <p className="admin-hint">
          Сейчас в каталоге: <b>{items ? items.length : '...'}</b> товаров.
        </p>
      </div>

      {items && items.length > 0 && (
        <div className="admin-works__grid">
          {items.slice(0, 60).map((it) => (
            <div key={it.id} className="admin-works__item">
              <img src={it.image} alt={it.name} />
              <div className="admin-works__item-foot">
                <span>
                  {it.name} · {it.width_cm}×{it.height_cm}
                </span>
                <button type="button" className="admin-link-danger" onClick={() => handleDelete(it.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {items && items.length > 60 && (
        <p className="admin-hint">Показаны первые 60 из {items.length}. Управление остальными — через импорт.</p>
      )}
    </div>
  )
}

/* ----------------------------- Page shell ----------------------------- */
function AdminPanelPage() {
  const [tab, setTab] = useState('leads')
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()
  const token = getToken()

  useEffect(() => {
    if (!token) {
      navigate('/admin')
      return
    }
    // Validate token via a lightweight authorized call
    fetchPricing(token)
      .then(() => setReady(true))
      .catch(() => {
        clearToken()
        navigate('/admin')
      })
  }, [token, navigate])

  const handleLogout = () => {
    clearToken()
    navigate('/admin')
  }

  if (!ready) {
    return (
      <main className="page">
        <p className="page__status">Загрузка...</p>
      </main>
    )
  }

  return (
    <main className="page admin-page">
      <div className="admin-topbar">
        <h1>Админ-панель</h1>
        <button type="button" className="button button--secondary" onClick={handleLogout}>
          <LogOut size={16} /> Выйти
        </button>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              className={`admin-tab ${tab === t.id ? 'admin-tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={16} />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="admin-panel">
        {tab === 'leads' && <LeadsTab token={token} />}
        {tab === 'catalog' && <CatalogTab token={token} />}
        {tab === 'pricing' && <PricingTab token={token} />}
        {tab === 'contacts' && <ContactsTab token={token} />}
        {tab === 'works' && <WorksTab token={token} />}
      </div>
    </main>
  )
}

export default AdminPanelPage
