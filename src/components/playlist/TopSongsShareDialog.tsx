import React, { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { TopSong } from '@/hooks/useTopSongs'
import { ShareFormat, ShareOptions, buildTopSongsCaption, downloadDataUrl, generateTopSongsImage, openDataUrlInNewTab, copyImageToClipboard } from '@/utils/topSongsShare'

interface TopSongsShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: TopSong[]
  days: number
  stationId: string
  analyzedCount?: number
}

export const TopSongsShareDialog: React.FC<TopSongsShareDialogProps> = ({ open, onOpenChange, items, days, stationId, analyzedCount }) => {
  const [format, setFormat] = useState<ShareFormat>('square')
  const [theme, setTheme] = useState<'brand' | 'light' | 'dark' | 'airbnb'>('airbnb')
  const [includeSpins, setIncludeSpins] = useState(true)
  const [stationName, setStationName] = useState(stationId.toUpperCase())
  const [accent, setAccent] = useState<string>('')
  const [columns, setColumns] = useState<1 | 2>(2)
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [logoPlacement, setLogoPlacement] = useState<'header' | 'watermark'>('header')
  const [isGenerating, setIsGenerating] = useState(false)
  const handleLogoUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoUrl(String(reader.result))
    reader.readAsDataURL(file)
  }


  const options: ShareOptions = useMemo(() => ({
    stationName,
    days,
    includeSpins,
    theme,
    accent: accent || undefined,
    format,
    analyzedCount,
    generatedAt: new Date(),
    columns,
    logoUrl: logoUrl || undefined,
    logoPlacement,
  }), [stationName, days, includeSpins, theme, accent, format, analyzedCount, columns, logoUrl, logoPlacement])

  const handleDownload = async () => {
    try {
      setIsGenerating(true)
      const dataUrl = await generateTopSongsImage(items, options)
      downloadDataUrl(dataUrl, `${stationName}-top20-${days}d`)
      toast.success('Image downloaded')
    } catch (e: any) {
      console.error(e)
      toast.error('Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyCaption = async () => {
    try {
      const caption = buildTopSongsCaption(items, options)
      await navigator.clipboard.writeText(caption)
      toast.success('Caption copied to clipboard')
    } catch (e) {
      toast.error('Failed to copy caption')
    }
  }

  const handleOpenInNewTab = async () => {
    try {
      setIsGenerating(true)
      const dataUrl = await generateTopSongsImage(items, options)
      openDataUrlInNewTab(dataUrl)
      toast.success('Opened image in new tab')
    } catch (e) {
      console.error(e)
      toast.error('Failed to open image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyImage = async () => {
    try {
      setIsGenerating(true)
      const dataUrl = await generateTopSongsImage(items, options)
      const rich = await copyImageToClipboard(dataUrl)
      toast.success(rich ? 'Image copied to clipboard' : 'Image URL copied to clipboard')
    } catch (e) {
      console.error(e)
      toast.error('Failed to copy image')
    } finally {
      setIsGenerating(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Top 20</DialogTitle>
          <DialogDescription>
            Create a social graphic and caption your listeners can share.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="station">Station name</Label>
              <Input id="station" value={stationName} onChange={(e) => setStationName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as ShareFormat)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Instagram (1080×1080)</SelectItem>
                  <SelectItem value="story">Story (1080×1920)</SelectItem>
                  <SelectItem value="landscape">Twitter/X (1600×900)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent">Accent color (optional)</Label>
              <Input id="accent" type="text" placeholder="#22d3ee" value={accent} onChange={(e) => setAccent(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Columns</Label>
              <Select value={String(columns)} onValueChange={(v) => setColumns(Number(v) as 1 | 2)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select columns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">One</SelectItem>
                  <SelectItem value="2">Two</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Logo placement</Label>
              <Select value={logoPlacement} onValueChange={(v) => setLogoPlacement(v as 'header' | 'watermark')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="watermark">Watermark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Station logo</Label>
            <Input id="logo" type="url" placeholder="https://example.com/logo.png" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            <div className="flex items-center gap-2">
              <Input id="logo-upload" type="file" accept="image/*" onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)} />
              {logoUrl ? (
                <Button variant="ghost" type="button" onClick={() => setLogoUrl('')}>Clear</Button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border px-4 py-2">
            <div className="space-y-0.5">
              <Label>Include spin counts</Label>
              <p className="text-xs text-muted-foreground">Adds each song's spin count under the title</p>
            </div>
            <Switch checked={includeSpins} onCheckedChange={setIncludeSpins} />
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: Square for Instagram, Story for Reels, Landscape for X.
          </p>
        </div>

        <DialogFooter className="flex flex-wrap gap-2 sm:gap-2">
          <Button variant="secondary" onClick={handleCopyCaption} type="button">Copy caption</Button>
          <Button variant="secondary" onClick={handleCopyImage} disabled={isGenerating} type="button">
            {isGenerating ? 'Copying…' : 'Copy image'}
          </Button>
          <Button variant="outline" onClick={handleOpenInNewTab} disabled={isGenerating} type="button">
            {isGenerating ? 'Opening…' : 'Open in new tab'}
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating} type="button">
            {isGenerating ? 'Generating…' : 'Download PNG'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
