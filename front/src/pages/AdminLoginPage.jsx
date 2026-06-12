import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/admin'
import { setToken } from '../auth'

function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const { access_token: token } = await login(username, password)
      setToken(token)
      navigate('/admin/pricing')
    } catch {
      setError('Неверный логин или пароль')
    }
  }

  return (
    <main className="page page--narrow">
      <header className="page__header">
        <h1>Вход в админ-панель</h1>
      </header>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Логин
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error && <p className="page__status page__status--error">{error}</p>}

        <button type="submit" className="button button--primary">
          Войти
        </button>
      </form>
    </main>
  )
}

export default AdminLoginPage
