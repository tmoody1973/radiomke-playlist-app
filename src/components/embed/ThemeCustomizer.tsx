
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, RotateCcw } from 'lucide-react';

interface CustomColors {
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  linkColor: string;
  borderColor: string;
}

interface ThemeCustomizerProps {
  customColors?: CustomColors;
  onColorsChange: (colors: CustomColors | undefined) => void;
}

const ThemeCustomizer = ({ customColors, onColorsChange }: ThemeCustomizerProps) => {
  const defaultLightColors = {
    backgroundColor: '#ffffff',
    textColor: '#6b7280',
    headingColor: '#1f2937',
    linkColor: '#ea580c',
    borderColor: '#e5e7eb'
  };

  const defaultDarkColors = {
    backgroundColor: '#1f2937',
    textColor: '#d1d5db',
    headingColor: '#f9fafb',
    linkColor: '#fb923c',
    borderColor: '#374151'
  };

  const handleColorChange = (colorKey: keyof CustomColors, value: string) => {
    const newColors = {
      ...customColors,
      [colorKey]: value
    } as CustomColors;
    onColorsChange(newColors);
  };

  const resetToDefaults = (isDark: boolean = false) => {
    onColorsChange(isDark ? defaultDarkColors : defaultLightColors);
  };

  const clearCustomColors = () => {
    onColorsChange(undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Theme Customizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={customColors?.backgroundColor || '#ffffff'}
                onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={customColors?.backgroundColor || '#ffffff'}
                onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                className="flex-1"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={customColors?.textColor || '#6b7280'}
                onChange={(e) => handleColorChange('textColor', e.target.value)}
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={customColors?.textColor || '#6b7280'}
                onChange={(e) => handleColorChange('textColor', e.target.value)}
                className="flex-1"
                placeholder="#6b7280"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headingColor">Heading Color</Label>
            <div className="flex gap-2">
              <Input
                id="headingColor"
                type="color"
                value={customColors?.headingColor || '#1f2937'}
                onChange={(e) => handleColorChange('headingColor', e.target.value)}
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={customColors?.headingColor || '#1f2937'}
                onChange={(e) => handleColorChange('headingColor', e.target.value)}
                className="flex-1"
                placeholder="#1f2937"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkColor">Link Color</Label>
            <div className="flex gap-2">
              <Input
                id="linkColor"
                type="color"
                value={customColors?.linkColor || '#ea580c'}
                onChange={(e) => handleColorChange('linkColor', e.target.value)}
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={customColors?.linkColor || '#ea580c'}
                onChange={(e) => handleColorChange('linkColor', e.target.value)}
                className="flex-1"
                placeholder="#ea580c"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borderColor">Border Color</Label>
            <div className="flex gap-2">
              <Input
                id="borderColor"
                type="color"
                value={customColors?.borderColor || '#e5e7eb'}
                onChange={(e) => handleColorChange('borderColor', e.target.value)}
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={customColors?.borderColor || '#e5e7eb'}
                onChange={(e) => handleColorChange('borderColor', e.target.value)}
                className="flex-1"
                placeholder="#e5e7eb"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetToDefaults(false)}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Light Preset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetToDefaults(true)}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Dark Preset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCustomColors}
            className="flex-1"
          >
            Use Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeCustomizer;
