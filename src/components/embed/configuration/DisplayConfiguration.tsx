
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface DisplayConfigurationProps {
  height: string;
  setHeight: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
  layout: string;
  setLayout: (value: string) => void;
  showHeader: boolean;
  setShowHeader: (value: boolean) => void;
  showLoadMore: boolean;
  setShowLoadMore: (value: boolean) => void;
}

const DisplayConfiguration = ({
  height,
  setHeight,
  theme,
  setTheme,
  layout,
  setLayout,
  showHeader,
  setShowHeader,
  showLoadMore,
  setShowLoadMore,
}: DisplayConfigurationProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="height">Height (px)</Label>
        <Input
          id="height"
          type="number"
          min="300"
          max="1000"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="layout">Layout Style</Label>
        <Select value={layout} onValueChange={setLayout}>
          <SelectTrigger>
            <SelectValue placeholder="Select layout style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">List View</SelectItem>
            <SelectItem value="grid">Grid View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="theme">Dark Theme</Label>
        <Switch
          id="theme"
          checked={theme === 'dark'}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showHeader">Show Header</Label>
        <Switch
          id="showHeader"
          checked={showHeader}
          onCheckedChange={setShowHeader}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showLoadMore">Show Load More Button</Label>
        <Switch
          id="showLoadMore"
          checked={showLoadMore}
          onCheckedChange={setShowLoadMore}
        />
      </div>
    </div>
  );
};

export default DisplayConfiguration;
