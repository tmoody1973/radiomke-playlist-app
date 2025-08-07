import { Canvas as FabricCanvas, Rect, Textbox } from 'fabric'
import { TopSong } from '@/hooks/useTopSongs'

export type ShareFormat = 'square' | 'story' | 'landscape'

export interface ShareOptions {
  stationName: string
  days: number
  includeSpins?: boolean
  theme?: 'brand' | 'light' | 'dark'
  accent?: string
  format?: ShareFormat
  analyzedCount?: number
  generatedAt?: Date
}

const formatSizes: Record<ShareFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1600, height: 900 },
}

const themes = {
  brand: {
    bg: '#0f172a', // slate-900
    panel: '#0b1220',
    text: '#e2e8f0', // slate-200
    subtext: '#94a3b8', // slate-400
    accent: '#38bdf8', // sky-400
  },
  light: {
    bg: '#ffffff',
    panel: '#f8fafc', // slate-50
    text: '#0f172a', // slate-900
    subtext: '#475569', // slate-600
    accent: '#0ea5e9', // sky-500
  },
  dark: {
    bg: '#0b0f19',
    panel: '#0f1525',
    text: '#f1f5f9',
    subtext: '#94a3b8',
    accent: '#22d3ee', // cyan-400
  },
}

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
}

export async function generateTopSongsImage(
  items: TopSong[],
  opts: ShareOptions
): Promise<string> {
  const format: ShareFormat = opts.format ?? 'square'
  const themeKey = opts.theme ?? 'brand'
  const t = themes[themeKey]
  const accent = opts.accent || t.accent
  const includeSpins = opts.includeSpins ?? true
  const { width, height } = formatSizes[format]

  const canvasEl = document.createElement('canvas')
  canvasEl.width = width
  canvasEl.height = height

  const canvas = new FabricCanvas(canvasEl, {
    width,
    height,
    backgroundColor: t.bg,
  })

  // Header panel
  const headerHeight = Math.floor(height * 0.18)
  const header = new Rect({ left: 0, top: 0, width, height: headerHeight, fill: t.panel })
  canvas.add(header)

  const title = new Textbox(`${opts.stationName} • Top 20`, {
    left: 64,
    top: 48,
    width: width - 128,
    fontSize: format === 'story' ? 64 : 56,
    fontWeight: 'bold',
    fill: t.text,
  })
  canvas.add(title)

  const subtitle = new Textbox(`Last ${opts.days} days • ${new Date(opts.generatedAt ?? Date.now()).toLocaleDateString()}`,
    {
      left: 64,
      top: title.top! + title.height! + 8,
      width: width - 128,
      fontSize: 28,
      fill: t.subtext,
    }
  )
  canvas.add(subtitle)

  // Accent bar
  const accentBar = new Rect({ left: 0, top: headerHeight - 6, width, height: 6, fill: accent })
  canvas.add(accentBar)

  // List area
  const paddingX = 64
  let y = headerHeight + 36

  const lineHeight = format === 'story' ? 64 : 46
  const rankWidth = 56
  const textWidth = width - paddingX * 2 - rankWidth

  const fontSize = format === 'story' ? 36 : 32
  const spinSize = format === 'story' ? 28 : 24

  items.slice(0, 20).forEach((item, index) => {
    const rank = new Textbox(String(index + 1).padStart(2, ' '), {
      left: paddingX,
      top: y,
      width: rankWidth,
      fontSize,
      fill: t.subtext,
      fontFamily: 'system-ui',
    })
    canvas.add(rank)

    const lineText = `${item.artist} — ${item.song}`
    const line = new Textbox(lineText, {
      left: paddingX + rankWidth,
      top: y,
      width: textWidth,
      fontSize,
      fill: t.text,
      fontFamily: 'system-ui',
      splitByGrapheme: true,
    })
    canvas.add(line)

    if (includeSpins) {
      const spins = new Textbox(`${item.spins} spins`, {
        left: paddingX + rankWidth,
        top: y + fontSize + 6,
        width: textWidth,
        fontSize: spinSize,
        fill: t.subtext,
      })
      canvas.add(spins)
    }

    y += includeSpins ? lineHeight + 10 : lineHeight

    // Stop if we overflow
    if (y > height - 100) return
  })

  // Footer note
  const analyzed = opts.analyzedCount ? ` • Analyzed ${opts.analyzedCount.toLocaleString()} spins` : ''
  const footer = new Textbox(`Generated with ${opts.stationName} playlist${analyzed}`, {
    left: paddingX,
    top: height - 64,
    width: width - paddingX * 2,
    fontSize: 20,
    fill: t.subtext,
  })
  canvas.add(footer)

  canvas.renderAll()
  const dataUrl = canvas.toDataURL({ multiplier: 1, format: 'png' })
  canvas.dispose()
  return dataUrl
}

export function buildTopSongsCaption(items: TopSong[], opts: ShareOptions) {
  const header = `${opts.stationName} Top 20 — Last ${opts.days} days`
  const lines = items
    .slice(0, 20)
    .map((it, i) => `${i + 1}. ${it.artist} — ${it.song}${opts.includeSpins ? ` (${it.spins})` : ''}`)
  const analyzed = opts.analyzedCount ? `\nAnalyzed ${opts.analyzedCount.toLocaleString()} spins` : ''
  return [header, '', ...lines, analyzed].join('\n')
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${sanitizeFilename(filename)}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
