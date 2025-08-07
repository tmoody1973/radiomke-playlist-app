import React, { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { TopSong } from '@/hooks/useTopSongs'
import { ShareFormat, ShareOptions, buildTopSongsCaption, downloadDataUrl, generateTopSongsImage } from '@/utils/topSongsShare'

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
  const [theme, setTheme] = useState<'brand' | 'light' | 'dark'>('brand')
  const [includeSpins, setIncludeSpins] = useState(true)
  const [stationName, setStationName] = useState(stationId.toUpperCase())
  const [accent, setAccent] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const options: ShareOptions = useMemo(() => ({
    stationName,
    days,
    includeSpins,
    theme,
    accent: accent || undefined,
    format,
    analyzedCount,
    generatedAt: new Date(),
  }), [stationName, days, includeSpins, theme, accent, format, analyzedCount])

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
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent">Accent color (optional)</Label>
              <Input id="accent" type="text" placeholder="#22d3ee" value={accent} onChange={(e) => setAccent(e.target.value)} />
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
            Tip: You can post square images to Instagram and landscape images to X/Twitter.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="secondary" onClick={handleCopyCaption} type="button">Copy caption</Button>
          <Button onClick={handleDownload} disabled={isGenerating} type="button">
            {isGenerating ? 'Generating…' : 'Download PNG'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
