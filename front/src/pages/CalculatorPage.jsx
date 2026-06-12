import CalculatorWidget from '../components/CalculatorWidget'

function CalculatorPage() {
  return (
    <main className="page">
      <header className="page__header">
        <h1>Калькулятор стоимости зеркала</h1>
        <p>Двигайте ползунки — стоимость пересчитывается в реальном времени.</p>
      </header>

      <CalculatorWidget />
    </main>
  )
}

export default CalculatorPage
