
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface Station {
  id: string;
  name: string;
}

interface BasicConfigurationProps {
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
  embedMode: string;
  setEmbedMode: (value: string) => void;
  mostPlayedPeriod: string;
  setMostPlayedPeriod: (value: string) => void;
}

const BasicConfiguration = ({
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
  embedMode,
  setEmbedMode,
  mostPlayedPeriod,
  setMostPlayedPeriod,
}: BasicConfigurationProps) => {
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

      <div className="space-y-2">
        <Label htmlFor="embedMode">Widget Mode</Label>
        <Select value={embedMode} onValueChange={setEmbedMode}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="live">Live Playlist</SelectItem>
            <SelectItem value="most-played">Most Played Songs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {embedMode === 'most-played' && (
        <div className="space-y-2">
          <Label htmlFor="mostPlayedPeriod">Time Period</Label>
          <Select value={mostPlayedPeriod} onValueChange={setMostPlayedPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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
      </div>
    </div>
  );
};

export default BasicConfiguration;
