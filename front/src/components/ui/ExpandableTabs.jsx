import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/cn'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

const buttonVariants = {
  initial: { gap: 0, paddingLeft: '.5rem', paddingRight: '.5rem' },
  animate: (isSelected) => ({
    gap: isSelected ? '.5rem' : 0,
    paddingLeft: isSelected ? '1rem' : '.5rem',
    paddingRight: isSelected ? '1rem' : '.5rem',
  }),
}

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: 'auto', opacity: 1 },
  exit: { width: 0, opacity: 0 },
}

const transition = { delay: 0.1, type: 'spring', bounce: 0, duration: 0.6 }

/**
 * Pill-shaped tab bar where the active tab stays expanded with its label,
 * and other tabs collapse to icon-only. `activeIndex` is controlled by the
 * caller (e.g. the current route); `onChange` fires when a tab is clicked.
 */
export function ExpandableTabs({ tabs, activeIndex, onChange, className }) {
  const [hoverIndex, setHoverIndex] = React.useState(null)
  const containerRef = React.useRef(null)

  useOnClickOutside(containerRef, () => setHoverIndex(null))

  const expandedIndex = hoverIndex ?? activeIndex

  const handleSelect = (index) => {
    setHoverIndex(null)
    onChange?.(index)
  }

  return (
    <div
      ref={containerRef}
      className={cn('expandable-tabs', className)}
    >
      {tabs.map((tab, index) => {
        if (tab.type === 'separator') {
          return <div key={`separator-${index}`} className="expandable-tabs__separator" aria-hidden="true" />
        }

        const Icon = tab.icon
        const isExpanded = expandedIndex === index
        const isActive = activeIndex === index

        return (
          <motion.button
            key={tab.title}
            type="button"
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isExpanded}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={cn(
              'expandable-tabs__tab',
              isActive && 'expandable-tabs__tab--active',
            )}
          >
            <Icon size={18} />
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="expandable-tabs__label"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}

export default ExpandableTabs
