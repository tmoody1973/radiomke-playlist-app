import { Canvas as FabricCanvas, Rect, Textbox, Image as FabricImage } from 'fabric'
import { TopSong } from '@/hooks/useTopSongs'

export type ShareFormat = 'square' | 'story' | 'landscape'

export interface ShareOptions {
  stationName: string
  days: number
  includeSpins?: boolean
  theme?: 'brand' | 'light' | 'dark' | 'airbnb'
  accent?: string
  format?: ShareFormat
  analyzedCount?: number
  generatedAt?: Date
  columns?: 1 | 2
  logoUrl?: string
  logoPlacement?: 'header' | 'watermark'
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
  airbnb: {
    bg: '#ffffff',
    panel: '#f7f7f7',
    text: '#222222',
    subtext: '#6b7280', // gray-500
    accent: '#ff5a5f', // Airbnb coral
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

  const subtitle = new Textbox(
    `Last ${opts.days} days • ${new Date(opts.generatedAt ?? Date.now()).toLocaleDateString()}`,
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

  // Optional station logo in header
  if (opts.logoUrl && (opts.logoPlacement ?? 'header') === 'header') {
    try {
      const logo = await FabricImage.fromURL(opts.logoUrl, { crossOrigin: 'anonymous' } as any)
      const maxH = Math.max(48, headerHeight - 32)
      const maxW = Math.min(width * 0.22, 260)
      const scale = Math.min(maxH / logo.height!, maxW / logo.width!)
      logo.scaleX = scale
      logo.scaleY = scale
      logo.left = width - 64 - logo.width! * scale
      logo.top = 32
      canvas.add(logo)
    } catch (e) {
      // ignore logo load failures
    }
  }

  // List area with optional two-column layout
  const paddingX = 64
  const topY = headerHeight + 36
  const columns = (opts.columns ?? (format === 'story' ? 1 : 2)) as 1 | 2
  const gutter = 48
  const colWidth = columns === 2 ? Math.floor((width - paddingX * 2 - gutter) / 2) : width - paddingX * 2

  const fontSize = format === 'story' ? 36 : 32
  const spinSize = format === 'story' ? 28 : 22
  const badge = format === 'story' ? 36 : 30
  const lineGap = includeSpins ? 10 : 4
  const rowHeight = includeSpins ? fontSize + spinSize + 16 : fontSize + 10

  const toDraw = items.slice(0, 20)
  const perCol = columns === 2 ? Math.ceil(toDraw.length / 2) : toDraw.length

  for (let i = 0; i < toDraw.length; i++) {
    const item = toDraw[i]
    const colIndex = columns === 2 ? Math.floor(i / perCol) : 0
    const rowIndex = columns === 2 ? i % perCol : i

    const baseX = paddingX + colIndex * (colWidth + (columns === 2 ? gutter : 0))
    const baseY = topY + rowIndex * (rowHeight + lineGap)

    // Rank badge
    const rankBg = new Rect({
      left: baseX,
      top: baseY + 2,
      width: badge,
      height: badge,
      rx: badge / 2,
      ry: badge / 2,
      fill: accent,
    })
    canvas.add(rankBg)

    const rankFont = Math.round(badge * 0.6)
    const rankText = new Textbox(String(i + 1), {
      left: baseX,
      top: baseY + 2 + (badge - rankFont) / 2 - 2,
      width: badge,
      height: badge,
      fontSize: rankFont,
      fontWeight: 'bold',
      fill: '#ffffff',
      textAlign: 'center' as any,
      fontFamily: 'system-ui',
    })
    canvas.add(rankText)

    // Title line
    const textLeft = baseX + badge + 12
    const textWidth = colWidth - badge - 12
    const lineText = `${item.artist} — ${item.song}`
    const line = new Textbox(lineText, {
      left: textLeft,
      top: baseY,
      width: textWidth,
      fontSize,
      fill: t.text,
      fontFamily: 'system-ui',
      splitByGrapheme: true,
    })
    canvas.add(line)

    if (includeSpins) {
      const spins = new Textbox(`${item.spins} spins`, {
        left: textLeft,
        top: baseY + fontSize + 6,
        width: textWidth,
        fontSize: spinSize,
        fill: t.subtext,
      })
      canvas.add(spins)
    }
  }

  // Optional watermark logo
  if (opts.logoUrl && (opts.logoPlacement ?? 'header') === 'watermark') {
    try {
      const mark = await FabricImage.fromURL(opts.logoUrl, { crossOrigin: 'anonymous' } as any)
      const maxW = Math.min(width * 0.25, 240)
      const scale = Math.min(maxW / mark.width!, (height * 0.15) / mark.height!)
      mark.scaleX = scale
      mark.scaleY = scale
      mark.opacity = 0.1
      mark.left = width - 64 - mark.width! * scale
      mark.top = height - 96 - mark.height! * scale
      canvas.add(mark)
    } catch (e) {
      // ignore logo load failures
    }
  }

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
