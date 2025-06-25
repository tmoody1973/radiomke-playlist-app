
import { Button } from '@/components/ui/button';

interface LoadMoreButtonProps {
  hasMoreSpins: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export const LoadMoreButton = ({ hasMoreSpins, loadingMore, onLoadMore }: LoadMoreButtonProps) => {
  const isEmbedMode = window.location.pathname === '/embed';

  // Always show the button if there are more spins, even during loading
  if (!hasMoreSpins && !loadingMore) return null;

  return (
    <div className={`flex justify-center ${isEmbedMode ? 'p-4 bg-transparent border-t border-gray-200' : 'mt-4'}`}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={loadingMore || !hasMoreSpins}
        className={`w-full sm:w-auto transition-all duration-200 ${
          isEmbedMode 
            ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400' 
            : ''
        }`}
      >
        {loadingMore ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </span>
        ) : hasMoreSpins ? (
          'Load More'
        ) : (
          'No more songs'
        )}
      </Button>
    </div>
  );
};
