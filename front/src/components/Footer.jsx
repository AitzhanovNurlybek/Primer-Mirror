import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Phone, MessageCircle, Camera, ShoppingCart } from 'lucide-react'
import { fetchCompanyInfo } from '../api/company'
import { whatsappLink } from '../utils/contacts'
import { cn } from '../lib/cn'

function Footer() {
  const location = useLocation()
  const [company, setCompany] = useState(null)

  useEffect(() => {
    fetchCompanyInfo().then(setCompany).catch(() => setCompany(null))
  }, [])

  if (!company) {
    return null
  }

  return (
    <footer className={cn('site-footer', location.pathname === '/' && 'site-footer--dark')}>
      <div className="site-footer__name">{company.name}</div>
      <div className="site-footer__links">
        <a href={`tel:${company.phone.replace(/[^\d+]/g, '')}`}>
          <Phone size={15} /> {company.phone}
        </a>
        <a href={whatsappLink(company.whatsapp)} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={15} /> WhatsApp
        </a>
        <a href={company.instagram} target="_blank" rel="noopener noreferrer">
          <Camera size={15} /> Instagram
        </a>
        <a href={company.kaspi_shop_url} target="_blank" rel="noopener noreferrer">
          <ShoppingCart size={15} /> Kaspi Магазин
        </a>
      </div>
    </footer>
  )
}

export default Footer
