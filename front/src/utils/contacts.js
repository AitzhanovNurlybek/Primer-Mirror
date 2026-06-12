export function whatsappLink(phone, text = '') {
  const digits = phone.replace(/[^\d]/g, '')
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${digits}${query}`
}
