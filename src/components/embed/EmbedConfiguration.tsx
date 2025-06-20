import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface Station {
  id: string;
  name: string;
}

interface EmbedConfigurationProps {
  stations: Station[];
  selectedStation: string;
  setSelectedStation: (value: string) => void;
  autoUpdate: boolean;
  setAutoUpdate: (value: boolean) => void;
  showSearch: boolean;
  setShowSearch: (value: boolean) => void;
  maxItems: number;
  setMaxItems: (value: number) => void;
  unlimitedSongs: boolean;
  setUnlimitedSongs: (value: boolean) => void;
  compact: boolean;
  setCompact: (value: boolean) => void;
  height: string;
  setHeight: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
  layout: string;
  setLayout: (value: string) => void;
  enableDateSearch: boolean;
  setEnableDateSearch: (value: boolean) => void;
  startDate?: Date;
  setStartDate: (value: Date | undefined) => void;
  endDate?: Date;
  setEndDate: (value: Date | undefined) => void;
  scrollSpeed?: number;
  setScrollSpeed?: (value: number) => void;
}

const EmbedConfiguration = ({
  stations,
  selectedStation,
  setSelectedStation,
  autoUpdate,
  setAutoUpdate,
  showSearch,
  setShowSearch,
  maxItems,
  setMaxItems,
  unlimitedSongs,
  setUnlimitedSongs,
  compact,
  setCompact,
  height,
  setHeight,
  theme,
  setTheme,
  layout,
  setLayout,
  enableDateSearch,
  setEnableDateSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  scrollSpeed = 60,
  setScrollSpeed,
}: EmbedConfigurationProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="station">Radio Station</Label>
        <Select value={selectedStation} onValueChange={setSelectedStation}>
          <SelectTrigger>
            <SelectValue placeholder="Select a radio station" />
          </SelectTrigger>
          <SelectContent>
            {stations.map((station) => (
              <SelectItem key={station.id} value={station.id}>
                {station.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="unlimitedSongs">Unlimited Songs</Label>
          <Switch
            id="unlimitedSongs"
            checked={unlimitedSongs}
            onCheckedChange={setUnlimitedSongs}
          />
        </div>

        {!unlimitedSongs && (
          <div className="space-y-2">
            <Label htmlFor="maxItems">Max Songs</Label>
            <Input
              id="maxItems"
              type="number"
              min="5"
              max="500"
              value={maxItems}
              onChange={(e) => setMaxItems(parseInt(e.target.value) || 20)}
            />
          </div>
        )}

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
            <SelectItem value="ticker">Ticker Bar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {layout === 'ticker' && setScrollSpeed && (
        <div className="space-y-2">
          <Label htmlFor="scrollSpeed">Scroll Speed (seconds)</Label>
          <div className="px-3">
            <Slider
              id="scrollSpeed"
              min={20}
              max={120}
              step={10}
              value={[scrollSpeed]}
              onValueChange={(value) => setScrollSpeed(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Fast (20s)</span>
              <span>{scrollSpeed}s</span>
              <span>Slow (120s)</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="autoUpdate">Auto Update</Label>
          <Switch
            id="autoUpdate"
            checked={autoUpdate}
            onCheckedChange={setAutoUpdate}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showSearch">Show Search</Label>
          <Switch
            id="showSearch"
            checked={showSearch}
            onCheckedChange={setShowSearch}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="compact">Compact Mode</Label>
          <Switch
            id="compact"
            checked={compact}
            onCheckedChange={setCompact}
          />
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
          <Label htmlFor="enableDateSearch">Enable Date Search</Label>
          <Switch
            id="enableDateSearch"
            checked={enableDateSearch}
            onCheckedChange={setEnableDateSearch}
          />
        </div>
      </div>

      {enableDateSearch && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium">Date Range Filter</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setStartDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
                setEndDate(today);
              }}
            >
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setStartDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
                setEndDate(today);
              }}
            >
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbedConfiguration;
