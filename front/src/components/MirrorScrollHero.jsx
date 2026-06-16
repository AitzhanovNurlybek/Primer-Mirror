import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Images } from 'lucide-react'
import { scrollToSection, openCalculator } from '../utils/scroll'

import frame01 from '../assets/mirror-scroll/frame-01.webp'
import frame02 from '../assets/mirror-scroll/frame-02.webp'
import frame03 from '../assets/mirror-scroll/frame-03.webp'
import frame04 from '../assets/mirror-scroll/frame-04.webp'
import frame05 from '../assets/mirror-scroll/frame-05.webp'
import frame06 from '../assets/mirror-scroll/frame-06.webp'
import frame07 from '../assets/mirror-scroll/frame-07.webp'
import frame08 from '../assets/mirror-scroll/frame-08.webp'

const FRAMES = [frame01, frame02, frame03, frame04, frame05, frame06, frame07, frame08]
const FRAME_COUNT = FRAMES.length

const TRUST_ITEMS = ['8 лет опыта', 'Собственный цех', 'Бесплатный расчет', 'Индивидуальный дизайн']

const STORY = [
  {
    top: '0vh',
    kicker: 'Primer Mirror',
    title: 'Зеркало, которое меняет пространство',
    subtitle: 'Мягкий свет, глубина и премиальный акцент для вашего интерьера.',
  },
  { top: '110vh', title: 'Свет, глубина и эстетика в одном элементе' },
  { top: '220vh', title: 'Мягкая LED-подсветка раскрывает интерьер' },
  { top: '330vh', title: 'Комната становится визуально шире и теплее' },
  { top: '440vh', title: 'Подберите зеркало под свой интерьер' },
]

/** One background frame, fading in/out around its position in the scroll timeline. */
function MirrorFrame({ src, index, scrollYProgress }) {
  const step = 1 / (FRAME_COUNT - 1)
  const prev = Math.max(0, (index - 1) * step)
  const current = index * step
  const next = Math.min(1, (index + 1) * step)

  const isFirst = index === 0
  const isLast = index === FRAME_COUNT - 1

  const opacity = useTransform(
    scrollYProgress,
    isFirst ? [current, next] : isLast ? [prev, current] : [prev, current, next],
    isFirst ? [1, 0] : isLast ? [0, 1] : [0, 1, 0]
  )

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <img src={src} alt="" className="h-full w-full object-cover" />
    </motion.div>
  )
}

const revealProps = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-15% 0px -15% 0px' },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
}

/** Story caption that fades and slides up when it enters the viewport. */
function StoryBlock({ section }) {
  return (
    <div
      className="absolute left-0 flex min-h-screen w-full items-center justify-center px-6"
      style={{ top: section.top }}
    >
      <motion.div {...revealProps} className="max-w-2xl text-center">
        {section.kicker && (
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-white/50">
            {section.kicker}
          </p>
        )}
        <h2 className="font-display text-4xl font-medium tracking-wide text-white sm:text-5xl md:text-6xl">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="mt-6 text-base text-white/70 sm:text-lg">{section.subtitle}</p>
        )}
      </motion.div>
    </div>
  )
}

/** Final hero screen: headline, CTAs and trust bar over the lit mirror frame. */
function HeroFinale() {
  return (
    <div className="absolute left-0 flex min-h-screen w-full items-center justify-center px-6 py-24" style={{ top: '560vh' }}>
      <motion.div {...revealProps} className="max-w-3xl text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-purple-200/60">
          Зеркала на заказ от производителя
        </p>
        <h1 className="m-0 font-display text-4xl font-medium tracking-wide text-white sm:text-6xl md:text-7xl" style={{ letterSpacing: '0.02em' }}>
          Свет и форма, созданные для вас
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-lg">
          Изготавливаем зеркала любых размеров — под ваш интерьер, стиль и бюджет.
          Собственное производство, доставка и профессиональный монтаж.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => openCalculator()}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/40 bg-white px-9 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]"
          >
            Рассчитать стоимость
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('works')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm transition-colors duration-300 hover:border-white/50 hover:text-white"
          >
            <Images className="h-4 w-4" />
            Смотреть работы
          </button>
        </div>

        <motion.ul
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 p-0 text-xs uppercase tracking-[0.2em] text-white/55"
          style={{ listStyle: 'none' }}
        >
          {TRUST_ITEMS.map((item, index) => (
            <li key={item} className="flex items-center gap-6">
              {index > 0 && <span className="text-white/25">·</span>}
              {item}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </div>
  )
}

function MirrorScrollHero() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12])

  return (
    <section ref={containerRef} className="relative h-[700vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <motion.div style={{ scale }} className="absolute inset-0">
          {FRAMES.map((src, index) => (
            <MirrorFrame key={src} src={src} index={index} scrollYProgress={scrollYProgress} />
          ))}
        </motion.div>

        {/* Darkening overlay keeps text legible across every frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-[#2a2540]" />
      </div>

      <div className="absolute inset-0 z-10">
        {STORY.map((section) => (
          <StoryBlock key={section.title} section={section} />
        ))}
        <HeroFinale />
      </div>
    </section>
  )
}

export default MirrorScrollHero
