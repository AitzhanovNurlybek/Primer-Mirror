import { useEffect, useState } from 'react'
import { motion, MotionConfig } from 'framer-motion'
import {
  ArrowRight,
  Boxes,
  Building2,
  CreditCard,
  Factory,
  FileCheck,
  FileSignature,
  FileText,
  Handshake,
  Landmark,
  Layers,
  Lightbulb,
  MessageCircle,
  Palette,
  Phone,
  Receipt,
  Ruler,
  ShoppingCart,
  Truck,
  User,
  Wrench,
} from 'lucide-react'

import { fetchCompanyInfo } from '../api/company'
import { fetchWorks } from '../api/works'
import { whatsappLink } from '../utils/contacts'
import { scrollToSection } from '../utils/scroll'
import MirrorScrollHero from '../components/MirrorScrollHero'
import CalculatorWidget from '../components/CalculatorWidget'
import SideNav from '../components/SideNav'
import MobileCtaBar from '../components/MobileCtaBar'
import BackToTop from '../components/BackToTop'

import workImg1 from '../assets/mirror-scroll/frame-02.webp'
import workImg2 from '../assets/mirror-scroll/frame-05.webp'
import workImg3 from '../assets/mirror-scroll/frame-07.webp'
import workImg4 from '../assets/mirror-scroll/frame-08.webp'

const MAIN_USP = [
  { icon: Factory, text: 'Собственное производство' },
  { icon: Layers, text: 'Зеркало высокого качества толщиной 3 мм' },
  { icon: Ruler, text: 'Изготовление по индивидуальным размерам' },
  { icon: Lightbulb, text: 'Зеркала с подсветкой и без подсветки' },
  { icon: Palette, text: 'Алюминиевые рамы различных цветов' },
  { icon: Truck, text: 'Доставка и монтаж' },
  { icon: CreditCard, text: 'Оплата через Kaspi' },
  { icon: MessageCircle, text: 'Консультация через WhatsApp' },
]

const CORPORATE_CONDITIONS = [
  { icon: User, text: 'Работаем с физическими лицами (ФЛ)' },
  { icon: Building2, text: 'Работаем с юридическими лицами (ТОО, ИП)' },
  { icon: Receipt, text: 'Работаем с НДС и без НДС' },
  { icon: FileCheck, text: 'Полный пакет бухгалтерских документов' },
  { icon: FileSignature, text: 'Договор, счет на оплату, акт выполненных работ' },
  { icon: Landmark, text: 'Участие в тендерах и государственных закупках' },
  { icon: Boxes, text: 'Выполнение крупных проектов и больших объемов' },
  { icon: Handshake, text: 'Индивидуальные условия для оптовых заказчиков' },
]

const EXTRA_USP = [
  { icon: Factory, text: 'Собственное производство' },
  { icon: Ruler, text: 'Индивидуальные размеры' },
  { icon: Building2, text: 'Крупные корпоративные проекты' },
  { icon: FileText, text: 'Работа по договору' },
  { icon: CreditCard, text: 'НДС / без НДС' },
  { icon: Truck, text: 'Доставка по Казахстану' },
  { icon: Wrench, text: 'Профессиональный монтаж' },
  { icon: Phone, text: 'Быстрый расчет через WhatsApp' },
]

const PARTNERS = [
  'Строительными компаниями',
  'Дизайнерами интерьера',
  'Мебельными производствами',
  'Салонами красоты',
  'Фитнес-центрами',
  'Гостиницами',
  'Ресторанами и кафе',
  'Государственными учреждениями',
]

const WORKS = [
  { src: workImg1, caption: 'Интерьерное зеркало в гостиной' },
  { src: workImg2, caption: 'Зеркало с мягкой LED-подсветкой' },
  { src: workImg3, caption: 'Световой акцент в темном интерьере' },
  { src: workImg4, caption: 'Премиальная композиция с подсветкой' },
]

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px -10% 0px' },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
}

/** Section shell: anchor id, centered heading block, shared spacing. */
function Section({ id, kicker, title, subtitle, children }) {
  return (
    <section id={id} className="relative px-6 py-24 sm:py-32" style={{ scrollMarginTop: '88px' }}>
      <div className="mx-auto max-w-6xl">
        <motion.div {...reveal} className="text-center">
          {kicker && (
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-purple-300/70">
              {kicker}
            </p>
          )}
          <h2 className="m-0 font-display text-3xl font-medium tracking-wide text-white sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {subtitle && <p className="mx-auto mt-5 max-w-2xl text-white/65">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  )
}

/** Glass card with icon and numeric badge, used across the USP grids. */
function FeatureCard({ icon: Icon, text, index }) {
  return (
    <motion.div
      {...reveal}
      transition={{ ...reveal.transition, delay: (index % 4) * 0.08 }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07] hover:shadow-[0_12px_40px_rgba(168,85,247,0.15)]"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-purple-400/20 to-fuchsia-400/10 text-purple-200">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-xs tabular-nums tracking-widest text-white/25">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-white/80 sm:text-base">{text}</p>
    </motion.div>
  )
}

function CtaRow({ company, compact }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${compact ? 'mt-10' : 'mt-12'}`}>
      <button
        type="button"
        onClick={() => scrollToSection('calculator')}
        className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_36px_rgba(255,255,255,0.22)]"
      >
        Рассчитать стоимость
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
      {company && (
        <>
          <a
            href={whatsappLink(company.whatsapp, 'Здравствуйте! Хочу узнать стоимость зеркала.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white/85 no-underline backdrop-blur-sm transition-colors duration-300 hover:border-white/45 hover:text-white"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={company.kaspi_shop_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white/85 no-underline backdrop-blur-sm transition-colors duration-300 hover:border-white/45 hover:text-white"
          >
            <ShoppingCart className="h-4 w-4" />
            Kaspi
          </a>
        </>
      )}
    </div>
  )
}

function HomePage() {
  const [company, setCompany] = useState(null)
  const [works, setWorks] = useState(WORKS)

  useEffect(() => {
    fetchCompanyInfo().then(setCompany).catch(() => setCompany(null))
    fetchWorks()
      .then((items) => {
        if (items.length > 0) {
          setWorks(items.map((w) => ({ src: w.image, caption: w.caption })))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative w-full bg-[#2a2540] text-white">
        <SideNav />
        <MobileCtaBar />
        <BackToTop />

        <div id="home">
          <MirrorScrollHero />
        </div>

        {/* Soft radial glows keep one continuous deep backdrop under all sections */}
        <div className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(900px 500px at 15% 5%, rgba(192,132,252,0.20), transparent 60%),' +
                'radial-gradient(800px 480px at 85% 30%, rgba(232,121,249,0.15), transparent 60%),' +
                'radial-gradient(1000px 560px at 50% 62%, rgba(192,132,252,0.18), transparent 65%),' +
                'radial-gradient(900px 520px at 50% 96%, rgba(232,121,249,0.18), transparent 60%)',
            }}
          />

          <div className="relative">
            <Section
              id="advantages"
              kicker="Преимущества"
              title="Почему выбирают нас"
              subtitle="Производим зеркала под размер, стиль и бюджет — от частных интерьеров до крупных коммерческих проектов."
            >
              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {MAIN_USP.map((item, index) => (
                  <FeatureCard key={item.text} {...item} index={index} />
                ))}
              </div>
            </Section>

            <Section
              id="calculator"
              kicker="Калькулятор"
              title="Рассчитайте стоимость зеркала за 1 минуту"
              subtitle="Укажите параметры — мы подготовим предварительный расчет и свяжемся с вами."
            >
              <motion.div
                {...reveal}
                className="dark-scope relative mx-auto mt-12 max-w-4xl rounded-3xl border border-white/12 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_60px_rgba(168,85,247,0.08)] backdrop-blur-md sm:p-10"
              >
                <CalculatorWidget enableLead />
                {company && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-8">
                    <a
                      href={whatsappLink(
                        company.whatsapp,
                        'Здравствуйте! Хочу заказать зеркало, помогите с расчетом.'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white no-underline shadow-[0_8px_30px_rgba(168,85,247,0.4)] transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Или напишите в WhatsApp
                    </a>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                      Бесплатный расчет · Ответ в течение дня
                    </span>
                  </div>
                )}
              </motion.div>
            </Section>

            <Section
              id="works"
              kicker="Работы"
              title="Зеркала в реальных интерьерах"
              subtitle="Каждый проект — индивидуальный размер, форма и сценарий подсветки."
            >
              <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {works.map(({ src, caption }, index) => (
                  <motion.figure
                    key={`${caption}-${index}`}
                    {...reveal}
                    transition={{ ...reveal.transition, delay: (index % 2) * 0.1 }}
                    className="group relative m-0 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10"
                  >
                    <img
                      src={src}
                      alt={caption}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-4 pt-12 text-sm text-white/85">
                      {caption}
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
              <CtaRow company={company} compact />
            </Section>

            <Section
              id="conditions"
              kicker="Условия"
              title="Работаем с частными и корпоративными заказами"
              subtitle="Изготавливаем зеркала для квартир, домов, бизнес-центров, фитнес-клубов, гостиниц, салонов красоты и коммерческих объектов. Предоставляем полный пакет документов и гарантируем соблюдение сроков производства."
            >
              <motion.div {...reveal} className="mt-10 flex flex-wrap justify-center gap-3">
                {PARTNERS.map((partner) => (
                  <span
                    key={partner}
                    className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm text-white/70 backdrop-blur-sm transition-colors duration-300 hover:border-white/30 hover:text-white"
                  >
                    {partner}
                  </span>
                ))}
              </motion.div>

              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {CORPORATE_CONDITIONS.map(({ icon: Icon, text }, index) => (
                  <motion.div
                    key={text}
                    {...reveal}
                    transition={{ ...reveal.transition, delay: (index % 2) * 0.08 }}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left backdrop-blur-sm transition-colors duration-300 hover:border-white/25"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-purple-400/10 text-purple-200">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm text-white/80 sm:text-base">{text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.h3
                {...reveal}
                className="mt-16 text-center font-display text-2xl font-medium tracking-wide text-white sm:text-3xl"
              >
                Дополнительные преимущества
              </motion.h3>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {EXTRA_USP.map(({ icon: Icon, text }, index) => (
                  <motion.div
                    key={text}
                    {...reveal}
                    transition={{ ...reveal.transition, delay: (index % 4) * 0.06 }}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center backdrop-blur-sm transition-colors duration-300 hover:border-white/25"
                  >
                    <Icon className="h-5 w-5 text-purple-200/80" />
                    <span className="text-xs text-white/70 sm:text-sm">{text}</span>
                  </motion.div>
                ))}
              </div>
            </Section>

            <Section
              id="application"
              kicker="Заявка"
              title="Оставьте заявку — подберем зеркало под ваш интерьер"
              subtitle="Бесплатный предварительный расчет, индивидуальный дизайн и проекты любой сложности. Ответим в WhatsApp в течение рабочего дня."
            >
              <motion.div
                {...reveal}
                className="relative mx-auto mt-12 max-w-3xl rounded-3xl border border-white/12 bg-white/[0.04] px-6 py-12 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_70px_rgba(168,85,247,0.10)] backdrop-blur-md sm:px-12"
              >
                <p className="mx-auto max-w-xl text-white/70">
                  Укажите параметры в калькуляторе или напишите нам напрямую — поможем выбрать
                  размер, раму и подсветку.
                </p>
                <CtaRow company={company} compact />
                {company && (
                  <p className="mt-8 text-xs uppercase tracking-[0.2em] text-white/40">
                    <a
                      href={`tel:${company.phone.replace(/[^\d+]/g, '')}`}
                      className="text-white/60 no-underline transition-colors hover:text-white"
                    >
                      {company.phone}
                    </a>
                  </p>
                )}
              </motion.div>
            </Section>
          </div>
        </div>
      </main>
    </MotionConfig>
  )
}

export default HomePage
