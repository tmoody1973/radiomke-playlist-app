
interface PlaylistDebugInfoProps {
  hasActiveFilters: boolean;
  dataUpdatedAt: number;
  onManualRefresh: () => void;
}

export const PlaylistDebugInfo = ({ 
  hasActiveFilters, 
  dataUpdatedAt, 
  onManualRefresh 
}: PlaylistDebugInfoProps) => {
  if (process.env.NODE_ENV !== 'development' || hasActiveFilters) {
    return null;
  }

  return (
    <div className="text-xs text-muted-foreground mb-2 flex justify-between items-center">
      <span>Last update: {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
      <button 
        onClick={onManualRefresh}
        className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
      >
        Refresh
      </button>
    </div>
  );
};
