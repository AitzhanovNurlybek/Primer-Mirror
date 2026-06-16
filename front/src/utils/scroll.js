export function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/** Scroll to the catalog block and ask it to expand the custom-order calculator. */
export function openCalculator() {
  window.dispatchEvent(new Event('open-calculator'))
  scrollToSection('calculator')
}
