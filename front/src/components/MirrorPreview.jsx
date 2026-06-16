/** Live SVG preview of the configured mirror: shape, proportions, frame, lighting. */
function MirrorPreview({ shape, widthMm, heightMm, withFrame, frameColor, withLighting }) {
  const BOX = 150
  const PAD = 18

  // Fit the proportions into the preview box. Clamp the ratio so extreme
  // sizes still render as a sensible mirror (orientation kept, no thin sliver).
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
  const ratio = clamp(widthMm / heightMm, 0.45, 2.2)
  let w = BOX - PAD * 2
  let h = BOX - PAD * 2
  if (ratio >= 1) h = w / ratio
  else w = h * ratio

  // Circle uses a single diameter
  if (shape === 'circle') {
    const d = Math.min(w, h)
    w = d
    h = d
  }

  const x = (BOX - w) / 2
  const y = (BOX - h) / 2

  const FRAME_HEX = {
    silver: '#c0c0c0',
    black: '#1a1a1a',
    white: '#e8e8e8',
    gold: '#d4af37',
    bronze: '#8c6a3f',
    graphite: '#5a5a60',
  }
  const stroke = withFrame ? FRAME_HEX[frameColor] || '#c0c0c0' : 'rgba(255,255,255,0.25)'
  const strokeWidth = withFrame ? 5 : 1.5

  const common = {
    fill: 'url(#mirrorGlass)',
    stroke,
    strokeWidth,
    filter: withLighting ? 'url(#ledGlow)' : undefined,
  }

  let figure
  if (shape === 'oval' || shape === 'circle') {
    figure = <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />
  } else if (shape === 'arch') {
    // Curved top as an elliptical arc whose height never exceeds the figure,
    // with straight sides below. Valid for any aspect ratio.
    const curve = Math.min(w / 2, h)
    const topY = y + curve
    const d =
      `M ${x} ${y + h} ` +
      `L ${x} ${topY} ` +
      `A ${w / 2} ${curve} 0 0 1 ${x + w} ${topY} ` +
      `L ${x + w} ${y + h} Z`
    figure = <path d={d} {...common} />
  } else {
    figure = <rect x={x} y={y} width={w} height={h} rx={6} {...common} />
  }

  return (
    <svg viewBox={`0 0 ${BOX} ${BOX}`} width="100%" height="100%" role="img" aria-label="Превью зеркала">
      <defs>
        <linearGradient id="mirrorGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cdd6e3" />
          <stop offset="45%" stopColor="#9aa7ba" />
          <stop offset="55%" stopColor="#aeb9c9" />
          <stop offset="100%" stopColor="#7d8a9c" />
        </linearGradient>
        <filter id="ledGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#d8b4fe" floodOpacity="0.9" />
        </filter>
      </defs>
      {figure}
      {/* subtle diagonal reflection streak */}
      <line
        x1={x + w * 0.2}
        y1={y + h * 0.1}
        x2={x + w * 0.45}
        y2={y + h * 0.9}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default MirrorPreview
