
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  hasMoreSpins: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export const LoadMoreButton = ({ hasMoreSpins, loadingMore, onLoadMore }: LoadMoreButtonProps) => {
  if (!hasMoreSpins) return null;

  return (
    <div className="mt-4 flex justify-center">
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={loadingMore}
        className="w-full sm:w-auto"
      >
        {loadingMore ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          'Load More'
        )}
      </Button>
    </div>
  );
};
