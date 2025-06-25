
import { Button } from '@/components/ui/button';

interface LoadMoreButtonProps {
  hasMoreSpins: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export const LoadMoreButton = ({ hasMoreSpins, loadingMore, onLoadMore }: LoadMoreButtonProps) => {
  if (!hasMoreSpins) return null;

  const isEmbedMode = window.location.pathname === '/embed';

  return (
    <div className={`flex justify-center ${isEmbedMode ? 'p-4 bg-gray-900' : 'mt-4'}`}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={loadingMore}
        className={`w-full sm:w-auto ${isEmbedMode ? 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700' : ''}`}
      >
        {loadingMore ? 'Loading...' : 'Load More'}
      </Button>
    </div>
  );
};
