
import { Button } from '@/components/ui/button';

interface LoadMoreButtonProps {
  hasMoreSpins: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export const LoadMoreButton = ({ hasMoreSpins, loadingMore, onLoadMore }: LoadMoreButtonProps) => {
  const isEmbedMode = window.location.pathname === '/embed';

  // Don't show button if no more spins and not loading
  if (!hasMoreSpins && !loadingMore) {
    return null;
  }

  return (
    <div className={`flex justify-center py-4 ${isEmbedMode ? 'px-4' : 'mt-4'}`}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={loadingMore}
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
        ) : (
          'Load More'
        )}
      </Button>
    </div>
  );
};
